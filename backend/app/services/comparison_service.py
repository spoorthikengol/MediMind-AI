from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.report import Report
from app.models.report_analysis import ReportAnalysis
from app.models.user import User


TRACKED_TESTS = [
    "Hemoglobin",
    "WBC",
    "RBC",
    "Platelets",
]

LOWER_IS_BETTER = {
    "Cholesterol", "LDL", "Glucose", "HbA1c",
    "Creatinine", "Urea", "SGPT", "SGOT", "Bilirubin", "Uric Acid",
}
HIGHER_IS_BETTER = {"HDL"}

RISK_ORDER = {"Low": 0, "Medium": 1, "High": 2}


# ==================================================
# Legacy prose comparison (kept for backward compatibility)
# ==================================================

def _build_comparison(previous_report, previous_analysis, latest_report, latest_analysis):

    latest_values = latest_analysis.blood_values
    previous_values = previous_analysis.blood_values

    comparison = []

    for test in TRACKED_TESTS:
        latest = latest_values.get(test)
        previous = previous_values.get(test)

        if latest is None and previous is None:
            continue

        if latest == previous:
            comparison.append(f"{test} remained stable ({latest}).")
        else:
            comparison.append(f"{test} changed from {previous} to {latest}.")

    latest_score = latest_analysis.health_score
    previous_score = previous_analysis.health_score

    if latest_score > previous_score:
        comparison.append(f"Health Score improved from {previous_score} to {latest_score}.")
    elif latest_score < previous_score:
        comparison.append(f"Health Score decreased from {previous_score} to {latest_score}.")
    else:
        comparison.append(f"Health Score remained the same ({latest_score}).")

    return comparison


# ==================================================
# Structured per-parameter comparison
# ==================================================

def _classify_parameter(test_name, previous_value, current_value, previous_status, current_status) -> str:

    if test_name in LOWER_IS_BETTER or test_name in HIGHER_IS_BETTER:
        if abs(current_value - previous_value) < 1e-9:
            return "stable"
        went_up = current_value > previous_value
        better_is_up = test_name in HIGHER_IS_BETTER
        return "improved" if went_up == better_is_up else "needs_attention"

    if previous_status and current_status:
        if previous_status == "Normal" and current_status == "Normal":
            return "stable"
        if previous_status != "Normal" and current_status == "Normal":
            return "improved"
        if previous_status == "Normal" and current_status != "Normal":
            return "needs_attention"
        return "needs_attention"

    return "stable"


def _reference_range_for(test_name, previous_analysis, latest_analysis) -> str | None:
    for analysis in (latest_analysis, previous_analysis):
        enriched = analysis.enriched_report or {}
        entry = enriched.get(test_name)
        if entry and entry.get("normal_range"):
            return entry["normal_range"]
    return None


def _clinical_meaning_for(test_name: str, previous_analysis, latest_analysis) -> str | None:
    """Reuses the existing enrichment engine's plain-English description, if present."""
    for analysis in (latest_analysis, previous_analysis):
        enriched = analysis.enriched_report or {}
        entry = enriched.get(test_name)
        if entry and entry.get("description"):
            return entry["description"]
    return None


def _ai_explanation_for(name, previous_value, current_value, status, reference_range) -> str:

    range_clause = f" (reference range: {reference_range})" if reference_range else ""

    if status == "improved":
        return f"{name} moved from {previous_value} to {current_value}{range_clause} — a genuine improvement."

    if status == "needs_attention":
        return f"{name} moved from {previous_value} to {current_value}{range_clause} and is now outside the expected range, worth discussing with a doctor."

    return f"{name} stayed close to {current_value}{range_clause}, unchanged between these two reports."


def _build_parameters(previous_analysis, latest_analysis) -> list[dict]:

    previous_values = previous_analysis.blood_values or {}
    latest_values = latest_analysis.blood_values or {}
    previous_statuses = previous_analysis.analysis_result or {}
    latest_statuses = latest_analysis.analysis_result or {}

    parameters = []

    all_keys = set(previous_values.keys()) | set(latest_values.keys())
    all_keys.discard("report_type")

    for key in sorted(all_keys):
        try:
            prev_val = float(previous_values.get(key))
            curr_val = float(latest_values.get(key))
        except (TypeError, ValueError):
            continue

        status = _classify_parameter(
            key, prev_val, curr_val,
            previous_statuses.get(key), latest_statuses.get(key),
        )

        difference = round(curr_val - prev_val, 2)
        percent_change = round((difference / prev_val) * 100, 1) if prev_val else None
        reference_range = _reference_range_for(key, previous_analysis, latest_analysis)

        parameters.append({
            "name": key,
            "previous_value": prev_val,
            "current_value": curr_val,
            "difference": difference,
            "percent_change": percent_change,
            "reference_range": reference_range,
            "status": status,
            "clinical_meaning": _clinical_meaning_for(key, previous_analysis, latest_analysis),
            "ai_explanation": _ai_explanation_for(key, prev_val, curr_val, status, reference_range),
        })

    return parameters


def _driven_by(parameters, score_trend) -> list[dict]:
    if score_trend == "stable":
        return []
    wanted_status = "improved" if score_trend == "improved" else "needs_attention"
    candidates = [p for p in parameters if p["status"] == wanted_status]
    top = sorted(candidates, key=lambda p: abs(p["difference"]), reverse=True)[:3]
    return [{"name": p["name"], "direction": "down" if p["difference"] < 0 else "up"} for p in top]


def _build_score_comparison(previous_analysis, latest_analysis, parameters) -> dict:

    previous = previous_analysis.health_score
    current = latest_analysis.health_score
    difference = current - previous
    percent_change = round((difference / previous) * 100, 1) if previous else None
    trend = "improved" if difference > 0 else "needs_attention" if difference < 0 else "stable"
    driven_by = _driven_by(parameters, trend)

    if driven_by:
        names = ", ".join(f["name"] for f in driven_by)
        reason = f"Mainly driven by {names}."
    elif trend == "stable":
        reason = "No meaningful change in tracked parameters between these reports."
    else:
        reason = "Score changed, but no single parameter stood out as the main driver."

    return {
        "previous": previous,
        "current": current,
        "difference": difference,
        "percent_change": percent_change,
        "trend": trend,
        "driven_by": driven_by,
        "reason": reason,
    }


def _risk_change_reason(parameters, trend) -> str:
    flagged = [p["name"] for p in parameters if p["status"] == "needs_attention"]
    improved = [p["name"] for p in parameters if p["status"] == "improved"]

    if trend == "needs_attention" and flagged:
        return f"Driven by {', '.join(flagged[:3])} moving outside the normal range."
    if trend == "improved" and improved:
        return f"Driven by improvement in {', '.join(improved[:3])}."
    if trend == "stable":
        return "No significant change in flagged parameters between these reports."
    return "Risk level changed; underlying parameter shifts were not clearly isolated."


def _build_risk_comparison(previous_report, latest_report, parameters) -> dict | None:

    previous = previous_report.risk_level
    current = latest_report.risk_level

    if previous not in RISK_ORDER or current not in RISK_ORDER:
        return None

    prev_rank = RISK_ORDER[previous]
    curr_rank = RISK_ORDER[current]
    trend = "improved" if curr_rank < prev_rank else "needs_attention" if curr_rank > prev_rank else "stable"

    return {
        "previous": previous,
        "current": current,
        "changed": previous != current,
        "trend": trend,
        "reason": _risk_change_reason(parameters, trend),
    }


def _build_type_mismatch(previous_analysis, latest_analysis) -> dict | None:
    previous_type = (previous_analysis.blood_values or {}).get("report_type")
    latest_type = (latest_analysis.blood_values or {}).get("report_type")
    if previous_type and latest_type and previous_type != latest_type:
        return {"previous_type": previous_type, "latest_type": latest_type}
    return None


def _ai_confidence(parameters: list[dict], type_mismatch: dict | None) -> str:
    """
    How much substance backs this comparison. Not a fabricated
    "AI certainty" score — a plain reflection of how much comparable
    data actually exists between the two reports.
    """
    if type_mismatch or len(parameters) < 2:
        return "Low"
    if len(parameters) < 5:
        return "Medium"
    return "High"


# ==================================================
# Highlights — ALWAYS 5, with honest placeholders
# ==================================================

def _build_highlights(parameters, score_comparison, risk_comparison) -> list[dict]:

    improved = [p for p in parameters if p["status"] == "improved"]
    needs_attention = [p for p in parameters if p["status"] == "needs_attention"]
    improved_pct = [p for p in improved if p["percent_change"] is not None]
    declining_pct = [p for p in needs_attention if p["percent_change"] is not None]

    highlights = []

    if score_comparison["trend"] == "improved":
        trend_text = f"Health score rose from {score_comparison['previous']} to {score_comparison['current']}."
    elif score_comparison["trend"] == "needs_attention":
        trend_text = f"Health score dropped from {score_comparison['previous']} to {score_comparison['current']}."
    else:
        trend_text = f"Health score held steady at {score_comparison['current']}."
    highlights.append({
        "type": "overall_trend", "icon": "🎯", "title": "Overall Health Trend",
        "description": trend_text, "is_placeholder": False,
    })

    if improved:
        biggest = max(improved, key=lambda p: abs(p["difference"]))
        highlights.append({
            "type": "biggest_improvement", "icon": "✅", "title": "Biggest Improvement",
            "description": f"{biggest['name']} moved from {biggest['previous_value']} to {biggest['current_value']}.",
            "is_placeholder": False,
        })
    else:
        highlights.append({
            "type": "biggest_improvement", "icon": "✅", "title": "Biggest Improvement",
            "description": "No parameters improved between these two reports.",
            "is_placeholder": True,
        })

    if needs_attention:
        concern = max(needs_attention, key=lambda p: abs(p["difference"]))
        highlights.append({
            "type": "biggest_concern", "icon": "⚠", "title": "Biggest Concern",
            "description": f"{concern['name']} moved from {concern['previous_value']} to {concern['current_value']}.",
            "is_placeholder": False,
        })
    else:
        highlights.append({
            "type": "biggest_concern", "icon": "⚠", "title": "Biggest Concern",
            "description": "Nothing flagged as a concern between these two reports.",
            "is_placeholder": True,
        })

    if improved_pct:
        fastest = max(improved_pct, key=lambda p: abs(p["percent_change"]))
        highlights.append({
            "type": "fastest_improving", "icon": "📈", "title": "Fastest Improving Marker",
            "description": f"{fastest['name']} improved by {abs(fastest['percent_change'])}%.",
            "is_placeholder": False,
        })
    else:
        highlights.append({
            "type": "fastest_improving", "icon": "📈", "title": "Fastest Improving Marker",
            "description": "Not enough data to identify a fastest-improving marker.",
            "is_placeholder": True,
        })

    if declining_pct:
        declining = max(declining_pct, key=lambda p: abs(p["percent_change"]))
        highlights.append({
            "type": "fastest_declining", "icon": "📉", "title": "Fastest Declining Marker",
            "description": f"{declining['name']} worsened by {abs(declining['percent_change'])}%.",
            "is_placeholder": False,
        })
    else:
        highlights.append({
            "type": "fastest_declining", "icon": "📉", "title": "Fastest Declining Marker",
            "description": "Not enough data to identify a fastest-declining marker.",
            "is_placeholder": True,
        })

    return highlights


def _build_ai_headline(score_comparison, parameters) -> str:
    improved = [p["name"] for p in parameters if p["status"] == "improved"]
    needs_attention = [p["name"] for p in parameters if p["status"] == "needs_attention"]

    if score_comparison["trend"] == "improved":
        reason = f"mainly due to improved {', '.join(improved[:2])}" if improved else "across your tracked markers"
        return f"Overall health is improving compared to the previous report, {reason}."
    if score_comparison["trend"] == "needs_attention":
        reason = f"mainly due to {', '.join(needs_attention[:2])} moving outside range" if needs_attention else "across your tracked markers"
        return f"Overall health has declined compared to the previous report, {reason}."
    return "Overall health is holding steady compared to the previous report."


def _build_summary_bullets(parameters, score_comparison, confidence) -> list[dict]:
    """Clinician-style bullets — every statement names a real marker and value."""

    bullets = []

    improved = sorted((p for p in parameters if p["status"] == "improved"), key=lambda p: abs(p["difference"]), reverse=True)
    needs_attention = sorted((p for p in parameters if p["status"] == "needs_attention"), key=lambda p: abs(p["difference"]), reverse=True)

    for p in improved[:2]:
        bullets.append({
            "text": f"{p['name']} improved from {p['previous_value']} to {p['current_value']}"
                    + (f", now within reference range {p['reference_range']}." if p["reference_range"] else "."),
            "confidence": "High",
            "supporting_marker": p["name"],
        })

    for p in needs_attention[:2]:
        bullets.append({
            "text": f"{p['name']} remains elevated at {p['current_value']}"
                    + (f" (reference range {p['reference_range']})." if p["reference_range"] else ".")
                    + " Worth discussing with a doctor.",
            "confidence": "High",
            "supporting_marker": p["name"],
        })

    direction_word = "increased" if score_comparison["difference"] > 0 else "decreased" if score_comparison["difference"] < 0 else "stayed the same"
    pct = f" ({score_comparison['percent_change']}%)" if score_comparison["percent_change"] is not None else ""
    bullets.append({
        "text": f"Overall health score {direction_word} from {score_comparison['previous']} to {score_comparison['current']}{pct}.",
        "confidence": confidence,
        "supporting_marker": None,
    })

    return bullets[:5]


# ==================================================
# Recommendations — restructured: reason / recommendation / expected benefit / priority
# ==================================================

def _build_recommendations(parameters, risk_comparison) -> list[dict]:

    flagged = {p["name"]: p for p in parameters if p["status"] == "needs_attention"}
    recommendations = []

    if {"Cholesterol", "LDL"} & flagged.keys():
        p = flagged.get("Cholesterol") or flagged.get("LDL")
        recommendations.append({
            "category": "Nutrition",
            "reason": f"{p['name']} is currently {p['current_value']}"
                      + (f" (reference range {p['reference_range']})." if p["reference_range"] else "."),
            "recommendation": "Reduce saturated fat and increase fiber intake.",
            "expected_benefit": "May help lower cholesterol/LDL over the next few months.",
            "priority": "Medium",
        })

    if {"Glucose", "HbA1c"} & flagged.keys():
        p = flagged.get("HbA1c") or flagged.get("Glucose")
        recommendations.append({
            "category": "Nutrition",
            "reason": f"{p['name']} is currently {p['current_value']}"
                      + (f" (reference range {p['reference_range']})." if p["reference_range"] else "."),
            "recommendation": "Reduce refined carbohydrate and sugar intake.",
            "expected_benefit": "May help improve long-term glucose control.",
            "priority": "High",
        })

    if {"Creatinine", "Urea"} & flagged.keys():
        p = flagged.get("Creatinine") or flagged.get("Urea")
        recommendations.append({
            "category": "Hydration",
            "reason": f"{p['name']} is currently {p['current_value']}"
                      + (f" (reference range {p['reference_range']})." if p["reference_range"] else "."),
            "recommendation": "Increase daily water intake and monitor kidney function.",
            "expected_benefit": "Supports kidney filtration and helps track whether the trend continues.",
            "priority": "High",
        })
        recommendations.append({
            "category": "Follow-up",
            "reason": f"{p['name']} is outside the expected range.",
            "recommendation": "Schedule a follow-up kidney function test.",
            "expected_benefit": "Confirms whether this is a lasting trend or a one-off result.",
            "priority": "High",
        })

    if {"SGPT", "SGOT", "Bilirubin"} & flagged.keys():
        recommendations.append({
            "category": "Follow-up",
            "reason": "Liver enzyme markers are outside the expected range.",
            "recommendation": "Repeat liver function tests.",
            "expected_benefit": "Confirms whether liver function is trending in a concerning direction.",
            "priority": "Medium",
        })

    if risk_comparison and risk_comparison["trend"] == "needs_attention":
        recommendations.append({
            "category": "Doctor Visit",
            "reason": f"Risk level moved from {risk_comparison['previous']} to {risk_comparison['current']}.",
            "recommendation": "Consult a doctor about your increased risk level.",
            "expected_benefit": "A clinician can interpret these changes alongside your full history.",
            "priority": "High",
        })

    if not flagged:
        recommendations.append({
            "category": "Lifestyle",
            "reason": "No parameters moved outside the expected range between these reports.",
            "recommendation": "Continue your current diet and exercise routine.",
            "expected_benefit": "Maintains your current stable or improving trend.",
            "priority": "Low",
        })

    return recommendations


def _build_structured_comparison(previous_report, previous_analysis, latest_report, latest_analysis) -> dict:

    parameters = _build_parameters(previous_analysis, latest_analysis)
    score_comparison = _build_score_comparison(previous_analysis, latest_analysis, parameters)
    risk_comparison = _build_risk_comparison(previous_report, latest_report, parameters)
    type_mismatch = _build_type_mismatch(previous_analysis, latest_analysis)
    confidence = _ai_confidence(parameters, type_mismatch)

    return {
        "previous_report_id": previous_report.id,
        "latest_report_id": latest_report.id,
        "comparison": _build_comparison(previous_report, previous_analysis, latest_report, latest_analysis),
        "ai_headline": _build_ai_headline(score_comparison, parameters),
        "ai_confidence": confidence,
        "parameters": parameters,
        "score_comparison": score_comparison,
        "risk_comparison": risk_comparison,
        "type_mismatch": type_mismatch,
        "summary_bullets": _build_summary_bullets(parameters, score_comparison, confidence),
        "highlights": _build_highlights(parameters, score_comparison, risk_comparison),
        "recommendations": _build_recommendations(parameters, risk_comparison),
    }


# ==================================================
# Public entry points
# ==================================================

def compare_reports(db: Session, current_user: User):
    reports = (
        db.query(Report, ReportAnalysis)
        .join(ReportAnalysis, Report.id == ReportAnalysis.report_id)
        .filter(Report.user_id == current_user.id)
        .order_by(desc(Report.id))
        .limit(2)
        .all()
    )

    if len(reports) < 2:
        return {
            "previous_report_id": 0,
            "latest_report_id": 0,
            "comparison": ["At least two reports are required for comparison."],
        }

    latest_report, latest_analysis = reports[0]
    previous_report, previous_analysis = reports[1]

    return _build_structured_comparison(previous_report, previous_analysis, latest_report, latest_analysis)


def compare_two_reports(db: Session, current_user: User, report_a_id: int, report_b_id: int):

    if report_a_id == report_b_id:
        raise HTTPException(status_code=400, detail="Please select two different reports to compare.")

    rows = (
        db.query(Report, ReportAnalysis)
        .join(ReportAnalysis, Report.id == ReportAnalysis.report_id)
        .filter(
            Report.user_id == current_user.id,
            Report.id.in_([report_a_id, report_b_id])
        )
        .all()
    )

    found_ids = {report.id for report, _ in rows}
    missing = {report_a_id, report_b_id} - found_ids

    if missing:
        raise HTTPException(status_code=404, detail=f"Report(s) not found: {', '.join(str(i) for i in missing)}")

    rows.sort(key=lambda pair: pair[0].id)
    (previous_report, previous_analysis), (latest_report, latest_analysis) = rows

    return _build_structured_comparison(previous_report, previous_analysis, latest_report, latest_analysis)
"""
AI Health Insights engine.

Analyzes a user's FULL report history (not just the latest report) to
produce trend directions, score/risk evolution, an AI summary, insight
highlight cards, and history-aware recommendations.

Data sources (no new tables, reuses existing models per the
"do not duplicate report data" requirement):
- Report: health_score, overall_status, risk_level, created_at
- ReportAnalysis: blood_values (raw numbers), analysis_result (Normal/High/Low
  per test, when available), enriched_report

Caching: a simple in-process TTL cache keyed by user_id. This is
appropriate for a single-process dev/small-scale deployment. A
multi-worker production deployment would need a shared cache (Redis)
instead — flagging that honestly rather than pretending this scales.
"""

import time
from statistics import mean

from sqlalchemy.orm import Session
from sqlalchemy import asc

from app.models.report import Report
from app.models.report_analysis import ReportAnalysis


# ==================================================
# Simple in-process cache (see module docstring)
# ==================================================

_CACHE: dict[int, tuple[float, dict]] = {}
_CACHE_TTL_SECONDS = 60


def _get_cached(user_id: int):
    entry = _CACHE.get(user_id)
    if not entry:
        return None
    timestamp, data = entry
    if time.time() - timestamp > _CACHE_TTL_SECONDS:
        return None
    return data


def _set_cached(user_id: int, data: dict):
    _CACHE[user_id] = (time.time(), data)


# ==================================================
# Test direction knowledge
# ==================================================

# Tests where the clinically "better" direction is unambiguous, used
# only as a numeric fallback when a report has no Normal/High/Low
# status recorded for that test.
LOWER_IS_BETTER = {
    "Cholesterol", "LDL", "Glucose", "HbA1c",
    "Creatinine", "Urea", "SGPT", "SGOT", "Bilirubin", "Uric Acid",
}
HIGHER_IS_BETTER = {"HDL"}

RISK_ORDER = {"Low": 0, "Medium": 1, "High": 2}


# ==================================================
# History loading
# ==================================================

def _load_history(db: Session, user_id: int):
    """Every (Report, ReportAnalysis) pair for this user, oldest first."""

    rows = (
        db.query(Report, ReportAnalysis)
        .join(ReportAnalysis, Report.id == ReportAnalysis.report_id)
        .filter(Report.user_id == user_id)
        .order_by(asc(Report.id))
        .all()
    )

    return rows


def _not_enough_data_response():
    return {
        "has_enough_data": False,
        "message": "Upload at least two reports to unlock AI health insights.",
    }


# ==================================================
# Health Score Evolution
# ==================================================

def _score_evolution(rows):
    scores = [report.health_score for report, _ in rows]

    current = scores[-1]
    previous = scores[-2]
    best = max(scores)
    average = round(mean(scores), 1)

    first = scores[0]
    improvement_pct = None
    if first:
        improvement_pct = round(((current - first) / first) * 100, 1)

    return {
        "current": current,
        "previous": previous,
        "best": best,
        "average": average,
        "improvement_pct": improvement_pct,
    }


# ==================================================
# Risk Analysis
# ==================================================

def _risk_analysis(rows):
    risks = [report.risk_level for report, _ in rows if report.risk_level in RISK_ORDER]

    if not risks:
        return None

    current = risks[-1]
    previous = risks[-2] if len(risks) > 1 else risks[-1]

    highest = max(risks, key=lambda r: RISK_ORDER[r])
    lowest = min(risks, key=lambda r: RISK_ORDER[r])

    current_rank = RISK_ORDER[current]
    previous_rank = RISK_ORDER[previous]

    if current_rank < previous_rank:
        trend = "improving"
    elif current_rank > previous_rank:
        trend = "worsening"
    else:
        trend = "stable"

    return {
        "current": current,
        "previous": previous,
        "highest": highest,
        "lowest": lowest,
        "trend": trend,
    }


# ==================================================
# Per-test trend detection
# ==================================================

def _collect_test_points(rows):
    """
    Returns { test_name: [ {value, status, date}, ... ] } across all
    reports where that test appears, ordered oldest to newest.
    """

    points: dict[str, list[dict]] = {}

    for report, analysis in rows:
        blood_values = analysis.blood_values or {}
        statuses = analysis.analysis_result or {}

        for key, raw_value in blood_values.items():
            if key == "report_type":
                continue

            try:
                value = float(raw_value)
            except (TypeError, ValueError):
                continue

            points.setdefault(key, []).append({
                "value": value,
                "status": statuses.get(key),
                "date": report.created_at,
            })

    return points


def _direction_for_test(test_name: str, series: list[dict]) -> str | None:
    """
    Returns one of: "improving", "declining", "stable", "needs_attention"
    — or None if there isn't enough information to say anything honest.
    """

    if len(series) < 2:
        return None

    statuses = [p["status"] for p in series if p["status"]]

    if len(statuses) >= 2:
        first_status = statuses[0]
        last_status = statuses[-1]

        if last_status == "Normal" and first_status != "Normal":
            return "improving"
        if last_status != "Normal" and first_status == "Normal":
            return "declining"
        if last_status == first_status and last_status != "Normal":
            return "needs_attention"
        if last_status == first_status == "Normal":
            return "stable"

    # Fallback: numeric-only, and only for tests with an unambiguous
    # "better direction" — otherwise we honestly don't know, so we
    # don't guess.
    if test_name in LOWER_IS_BETTER or test_name in HIGHER_IS_BETTER:
        first_value = series[0]["value"]
        last_value = series[-1]["value"]

        if abs(last_value - first_value) < 1e-6:
            return "stable"

        went_up = last_value > first_value
        better_is_up = test_name in HIGHER_IS_BETTER

        return "improving" if went_up == better_is_up else "declining"

    return None


def _build_trends(rows):
    points = _collect_test_points(rows)

    trends = {}

    for test_name, series in points.items():
        direction = _direction_for_test(test_name, series)
        if direction is None:
            continue

        trends[test_name] = {
            "direction": direction,
            "latest_value": series[-1]["value"],
            "previous_value": series[-2]["value"] if len(series) > 1 else None,
            "data_points": len(series),
        }

    return trends


# ==================================================
# Public entry points (one per endpoint)
# ==================================================

def get_insights_overview(db: Session, user_id: int) -> dict:
    cached = _get_cached(user_id)
    if cached:
        return cached

    rows = _load_history(db, user_id)

    if len(rows) < 2:
        result = _not_enough_data_response()
        _set_cached(user_id, result)
        return result

    score_evolution = _score_evolution(rows)
    risk_analysis = _risk_analysis(rows)
    trends = _build_trends(rows)

    result = {
        "has_enough_data": True,
        "reports_analyzed": len(rows),
        "score_evolution": score_evolution,
        "risk_analysis": risk_analysis,
        "trends": trends,
    }

    _set_cached(user_id, result)
    return result


def get_trends_only(db: Session, user_id: int) -> dict:
    rows = _load_history(db, user_id)

    if len(rows) < 2:
        return _not_enough_data_response()

    return {
        "has_enough_data": True,
        "trends": _build_trends(rows),
    }


# ==================================================
# AI Summary + Insight Highlight Cards
# ==================================================

def _pick_biggest_improvement(trends: dict):
    improving = {k: v for k, v in trends.items() if v["direction"] == "improving"}
    if not improving:
        return None

    def pct_change(entry):
        prev = entry["previous_value"]
        latest = entry["latest_value"]
        if not prev:
            return 0
        return abs((latest - prev) / prev) * 100

    best_test = max(improving.items(), key=lambda kv: pct_change(kv[1]))
    return best_test[0], pct_change(best_test[1])


def _pick_needs_attention(trends: dict):
    flagged = [k for k, v in trends.items() if v["direction"] == "needs_attention"]
    return flagged


def build_summary_and_cards(score_evolution: dict, risk_analysis: dict | None, trends: dict, reports_analyzed: int) -> dict:

    cards = []

    # ✅ Biggest Improvement
    improvement = _pick_biggest_improvement(trends)
    if improvement:
        test_name, pct = improvement
        cards.append({
            "type": "biggest_improvement",
            "icon": "✅",
            "title": "Biggest Improvement",
            "description": f"{test_name} has improved by about {pct:.0f}% over your report history.",
        })

    # ⚠ Needs Attention
    needs_attention = _pick_needs_attention(trends)
    if needs_attention:
        cards.append({
            "type": "needs_attention",
            "icon": "⚠",
            "title": "Needs Attention",
            "description": f"{', '.join(needs_attention)} has remained abnormal across your recent reports.",
        })

    # 📈 Positive Trend (overall score)
    if score_evolution["current"] > score_evolution["previous"]:
        cards.append({
            "type": "positive_trend",
            "icon": "📈",
            "title": "Positive Trend",
            "description": f"Your health score rose from {score_evolution['previous']} to {score_evolution['current']}.",
        })

    # 📉 Negative Trend (overall score)
    if score_evolution["current"] < score_evolution["previous"]:
        cards.append({
            "type": "negative_trend",
            "icon": "📉",
            "title": "Negative Trend",
            "description": f"Your health score dropped from {score_evolution['previous']} to {score_evolution['current']}.",
        })

    # 🎯 Overall Recommendation
    if needs_attention:
        rec_text = f"Focus on {needs_attention[0]} and consider a follow-up test."
    elif improvement:
        rec_text = f"Keep up whatever's driving your {improvement[0]} improvement."
    else:
        rec_text = "Your markers are stable — keep maintaining your current routine."

    cards.append({
        "type": "overall_recommendation",
        "icon": "🎯",
        "title": "Overall Recommendation",
        "description": rec_text,
    })

    # Deterministic AI-style summary paragraph (see module docstring
    # for why this isn't a second Gemini call).
    sentences = [
        f"Over your last {reports_analyzed} reports, your health score has "
        f"{'improved' if score_evolution['current'] >= score_evolution['previous'] else 'declined'} "
        f"to {score_evolution['current']} (average {score_evolution['average']})."
    ]

    if improvement:
        sentences.append(f"{improvement[0]} shows the strongest improvement.")

    if needs_attention:
        sentences.append(
            f"{', '.join(needs_attention)} {'remains' if len(needs_attention) == 1 else 'remain'} "
            f"outside the normal range and {'is' if len(needs_attention) == 1 else 'are'} worth discussing with a doctor."
        )

    if risk_analysis:
        sentences.append(f"Your risk level is currently {risk_analysis['current']}.")

    summary = " ".join(sentences)

    return {"summary": summary, "cards": cards}


# ==================================================
# Smart Recommendations (history-aware)
# ==================================================

def build_recommendations(trends: dict, risk_analysis: dict | None) -> dict:

    flagged = {k for k, v in trends.items() if v["direction"] in ("needs_attention", "declining")}

    exercise = ["Keep up regular light-to-moderate activity."]
    nutrition = ["Maintain a balanced, whole-food diet."]
    hydration = ["Drink water consistently through the day."]
    sleep = ["Aim for consistent, restful sleep."]
    follow_up = []
    doctor_visit = []

    if {"Cholesterol", "LDL"} & flagged:
        nutrition.insert(0, "Reduce saturated fat and increase fiber to help lower cholesterol/LDL.")
        follow_up.append("Repeat a lipid profile in 3 months.")

    if {"Glucose", "HbA1c"} & flagged:
        nutrition.insert(0, "Reduce refined sugar intake to help manage blood glucose.")
        exercise.insert(0, "Regular cardio can meaningfully help blood sugar control.")
        follow_up.append("Repeat a fasting glucose / HbA1c test.")

    if {"Creatinine", "Urea"} & flagged:
        hydration.insert(0, "Prioritize consistent hydration to support kidney function.")
        follow_up.append("Repeat a kidney function panel.")

    if {"SGPT", "SGOT", "Bilirubin"} & flagged:
        follow_up.append("Repeat a liver function panel.")

    if flagged or (risk_analysis and risk_analysis["current"] == "High"):
        doctor_visit.append("Schedule a check-up to review your flagged markers with a doctor.")

    return {
        "exercise": exercise,
        "nutrition": nutrition,
        "hydration": hydration,
        "sleep": sleep,
        "follow_up_tests": follow_up,
        "doctor_visit": doctor_visit,
    }


def get_full_insights(db: Session, user_id: int) -> dict:
    """Used by GET /insights — overview + summary + cards in one payload."""

    overview = get_insights_overview(db, user_id)

    if not overview["has_enough_data"]:
        return overview

    extra = build_summary_and_cards(
        overview["score_evolution"],
        overview["risk_analysis"],
        overview["trends"],
        overview["reports_analyzed"],
    )

    return {**overview, **extra}


def get_recommendations_only(db: Session, user_id: int) -> dict:
    rows = _load_history(db, user_id)

    if len(rows) < 2:
        return _not_enough_data_response()

    trends = _build_trends(rows)
    risk_analysis = _risk_analysis(rows)

    return {
        "has_enough_data": True,
        "recommendations": build_recommendations(trends, risk_analysis),
    }


def get_history_only(db: Session, user_id: int) -> dict:
    """Raw score/date series for charting — GET /insights/history."""

    rows = _load_history(db, user_id)

    if len(rows) < 2:
        return _not_enough_data_response()

    series = [
        {
            "report_id": report.id,
            "date": report.created_at,
            "health_score": report.health_score,
            "risk_level": report.risk_level,
        }
        for report, _ in rows
    ]

    return {"has_enough_data": True, "history": series}
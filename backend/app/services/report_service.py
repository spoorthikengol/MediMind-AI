from app.services.pdf_service import extract_text_from_pdf
from app.services.report_parser import parse_blood_report
from app.services.health_analyzer import analyze_blood_report
from app.services.health_score import calculate_health_score
from app.services.medical_insights import generate_medical_insights
from app.services.health_trends import calculate_health_trend
from app.services.recommendation_service import generate_recommendations
from app.services.gemini_service import generate_gemini_summary
from app.services.medical_engine import enrich_report
from app.services.critical_alerts import generate_critical_alerts


def analyze_report(pdf_path: str, previous_score=None):

    # ==========================================
    # STEP 1 : Extract Text
    # ==========================================

    extracted_text = extract_text_from_pdf(pdf_path)

    # ==========================================
    # STEP 2 : Parse Report
    # ==========================================

    blood_values = parse_blood_report(extracted_text)

    analysis = analyze_blood_report(blood_values)

    report_type = blood_values.get(
        "report_type",
        "Blood Report"
    )

    # ==========================================
    # STEP 3 : Health Score
    # ==========================================

    health = calculate_health_score(analysis)

    # ==========================================
    # STEP 4 : Medical Insights
    # ==========================================

    medical_insights = generate_medical_insights(
        blood_values,
        analysis
    )

    # ==========================================
    # STEP 5 : Medical Engine
    # ==========================================

    enriched_report = enrich_report(
        blood_values,
        analysis
    )

    # ==========================================
    # STEP 6 : Critical Alerts
    # ==========================================

    critical_alerts = generate_critical_alerts(
        enriched_report
    )

    # ==========================================
    # STEP 7 : Health Trend
    # ==========================================

    trend = calculate_health_trend(
        health["health_score"],
        previous_score
    )

    # ==========================================
    # STEP 8 : Recommendations
    # ==========================================

    recommendations = generate_recommendations(
        blood_values,
        analysis
    )

    # ==========================================
    # STEP 9 : AI Summary
    # ==========================================
    #
    # Send only the structured laboratory data
    # instead of the entire extracted PDF text.
    # This reduces Gemini input size and latency.
    #

    compact_report = []

    for name, item in enriched_report.items():

        if not isinstance(item, dict):
            continue

        value = item.get("value")
        unit = item.get("unit")
        normal_range = item.get("normal_range")
        status = item.get("status")

        compact_report.append(
            f"{name}: {value} {unit or ''} | "
            f"Reference: {normal_range or 'Not provided'} | "
            f"Status: {status or 'Unknown'}"
        )

    compact_report_text = "\n".join(compact_report)

    medical_summary = generate_gemini_summary(
        compact_report_text
    )

    # ==========================================
    # FINAL RESULT
    # ==========================================

    return {

        "report_type": report_type,

        "extracted_text": extracted_text,

        # Same structured, status-computed text already sent to
        # generate_gemini_summary() above. Exposing it here lets
        # the chatbot be fed the identical data source instead of
        # raw OCR text, so both features can't disagree about a
        # parameter's status.
        "compact_report_text": compact_report_text,

        "blood_values": blood_values,

        "analysis": analysis,

        "enriched_report": enriched_report,

        "critical_alerts": critical_alerts,

        "health_score": health["health_score"],

        "overall_status": health["overall_status"],

        "risk_level": health["risk_level"],

        "recommendations": recommendations,

        "possible_conditions": medical_insights,

        "health_trend": trend,

        "medical_summary": medical_summary,

    }
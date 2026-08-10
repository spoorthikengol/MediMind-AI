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

    print("\n===================================")
    print("STARTING REPORT ANALYSIS")
    print("===================================\n")

    # ==========================================
    # STEP 1 : Extract Text
    # ==========================================

    extracted_text = extract_text_from_pdf(pdf_path)

    print("\n===== STEP 1 : EXTRACTED TEXT =====")
    print(extracted_text)

    # ==========================================
    # STEP 2 : Parse Report (Regex Parser)
    # ==========================================

    print("\nUsing Regex Medical Parser...\n")

    blood_values = parse_blood_report(extracted_text)

    analysis = analyze_blood_report(blood_values)

    report_type = blood_values.get(
        "report_type",
        "Blood Report"
    )

    print("\n===== STEP 2 : REPORT TYPE =====")
    print(report_type)

    print("\n===== STEP 3 : BLOOD VALUES =====")
    print(blood_values)

    print("\n===== STEP 4 : ANALYSIS =====")
    print(analysis)

    # ==========================================
    # STEP 3 : Health Score
    # ==========================================

    health = calculate_health_score(analysis)

    print("\n===== STEP 5 : HEALTH SCORE =====")
    print(health)

    # ==========================================
    # STEP 4 : Medical Insights
    # ==========================================

    medical_insights = generate_medical_insights(
        blood_values,
        analysis
    )

    print("\n===== STEP 6 : MEDICAL INSIGHTS =====")
    print(medical_insights)

    # ==========================================
    # STEP 5 : Medical Engine
    # ==========================================

    enriched_report = enrich_report(
        blood_values,
        analysis
    )

    print("\n===== STEP 7 : ENRICHED REPORT =====")
    print(enriched_report)

    # ==========================================
    # STEP 6 : Critical Alerts
    # ==========================================

    critical_alerts = generate_critical_alerts(
        enriched_report
    )

    print("\n===== STEP 8 : CRITICAL ALERTS =====")
    print(critical_alerts)

    # ==========================================
    # STEP 7 : Health Trend
    # ==========================================

    trend = calculate_health_trend(
        health["health_score"],
        previous_score
    )

    print("\n===== STEP 9 : HEALTH TREND =====")
    print(trend)

    # ==========================================
    # STEP 8 : Hugging Face AI Summary
    # ==========================================

    medical_summary = generate_gemini_summary(
        extracted_text
    )

    print("\n===== STEP 10 : AI SUMMARY =====")
    print(medical_summary)

    # ==========================================
    # STEP 9 : Recommendations
    # ==========================================

    recommendations = generate_recommendations(
        blood_values,
        analysis
    )

    print("\n===== STEP 11 : RECOMMENDATIONS =====")
    print(recommendations)

    print("\n===================================")
    print("REPORT ANALYSIS FINISHED")
    print("===================================\n")

    return {

        "report_type": report_type,

        "extracted_text": extracted_text,

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
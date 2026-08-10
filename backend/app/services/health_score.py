def calculate_health_score(analysis: dict):

    score = 100

    abnormal = 0

    for value in analysis.values():

        if value in ["Low", "High", "Borderline"]:

            abnormal += 1
            score -= 10

        elif value == "Prediabetes":

            abnormal += 1
            score -= 15

        elif value == "Diabetes":

            abnormal += 1
            score -= 25

    if score < 0:
        score = 0

    # Overall Status

    if score >= 90:
        overall = "Healthy"

    elif score >= 70:
        overall = "Needs Attention"

    else:
        overall = "Critical"

    # Risk Level

    if abnormal == 0:
        risk = "Low"

    elif abnormal <= 2:
        risk = "Medium"

    else:
        risk = "High"

    return {
        "health_score": score,
        "overall_status": overall,
        "risk_level": risk,
    }
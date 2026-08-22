def generate_critical_alerts(enriched_report):

    alerts = []

    for name, item in enriched_report.items():

        status = item.get("status", "")

        if status != "High":
            continue

        # Kidney
        if name == "Creatinine":

            alerts.append({
                "title": "Elevated Creatinine",
                "severity": "warning",
                "message": (
                    "Creatinine is above the stated reference range. "
                    "Please discuss this result with a qualified healthcare "
                    "professional for appropriate follow-up."
                )
            })

        # Potassium
        elif name == "Potassium":

            alerts.append({
                "title": "High Potassium",
                "severity": "critical",
                "message": (
                    "High potassium can affect heart rhythm. "
                    "Immediate medical consultation is advised."
                )
            })

        # Troponin
        elif name == "Troponin":

            alerts.append({
                "title": "Possible Heart Damage",
                "severity": "critical",
                "message": (
                    "High troponin may indicate heart muscle injury."
                )
            })

        # Glucose
        elif name == "Glucose":

            alerts.append({
                "title": "High Blood Sugar",
                "severity": "warning",
                "message": (
                    "High glucose may indicate diabetes."
                )
            })

        # WBC
        elif name == "WBC":

            alerts.append({
                "title": "Possible Infection",
                "severity": "warning",
                "message": (
                    "High white blood cell count may indicate infection."
                )
            })

        # Platelets
        elif name == "Platelets":

            alerts.append({
                "title": "High Platelet Count",
                "severity": "warning",
                "message": (
                    "High platelets may increase blood clotting risk."
                )
            })

    if len(alerts) == 0:

        alerts.append({
            "title": "Healthy Report",
            "severity": "good",
            "message": "No critical abnormalities detected."
        })

    return alerts
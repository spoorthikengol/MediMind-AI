def generate_medical_summary(analysis_result, health_score):
    """
    Generate an easy-to-read medical summary.
    """

    normal = []
    abnormal = []

    for test, status in analysis_result.items():

        if status == "Normal":
            normal.append(test)
        else:
            abnormal.append(test)

    if len(abnormal) == 0:

        summary = (
            f"Your blood report appears healthy. "
            f"The following parameters are within the normal range: "
            f"{', '.join(normal)}. "
            f"Your overall health score is {health_score}/100, "
            f"which indicates a low health risk. "
            f"Maintain a balanced diet, regular exercise, adequate hydration, "
            f"and regular health checkups."
        )

    else:

        summary = (
            f"Some blood parameters require attention: "
            f"{', '.join(abnormal)}. "
            f"Your health score is {health_score}/100. "
            f"Please consult a healthcare professional for further evaluation "
            f"if symptoms persist."
        )

    return summary
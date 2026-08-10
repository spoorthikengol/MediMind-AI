def generate_recommendations(blood_values, analysis):

    recommendations = {
        "diet": [],
        "exercise": [],
        "hydration": [],
        "sleep": [],
        "medical": []
    }

    # -----------------------
    # Hemoglobin
    # -----------------------

    if analysis.get("Hemoglobin") == "Low":

        recommendations["diet"].extend([
            "Increase iron-rich foods (spinach, beetroot, dates)",
            "Eat foods rich in Vitamin C",
            "Include eggs and lean meat"
        ])

        recommendations["medical"].append(
            "Consult a doctor for possible anemia."
        )

    elif analysis.get("Hemoglobin") == "High":

        recommendations["hydration"].append(
            "Increase water intake."
        )

        recommendations["medical"].append(
            "Consult a physician if levels remain high."
        )

    else:

        recommendations["diet"].append(
            "Maintain a balanced diet."
        )

    # -----------------------
    # WBC
    # -----------------------

    if analysis.get("WBC") == "High":

        recommendations["medical"].append(
            "Possible infection detected. Medical evaluation is recommended."
        )

    elif analysis.get("WBC") == "Low":

        recommendations["diet"].append(
            "Increase protein-rich foods."
        )

        recommendations["medical"].append(
            "Consult your doctor if symptoms persist."
        )

    # -----------------------
    # RBC
    # -----------------------

    if analysis.get("RBC") == "Low":

        recommendations["diet"].append(
            "Increase iron and Vitamin B12 intake."
        )

    # -----------------------
    # Platelets
    # -----------------------

    if analysis.get("Platelets") == "Low":

        recommendations["diet"].append(
            "Eat foods rich in folate and Vitamin K."
        )

        recommendations["medical"].append(
            "Avoid activities that may cause bleeding."
        )

    # -----------------------
    # General Health
    # -----------------------

    recommendations["exercise"].append(
        "Walk for at least 30 minutes daily."
    )

    recommendations["hydration"].append(
        "Drink 2–3 liters of water every day."
    )

    recommendations["sleep"].append(
        "Sleep for 7–8 hours every night."
    )

    return recommendations
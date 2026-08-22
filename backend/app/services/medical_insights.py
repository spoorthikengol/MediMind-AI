def generate_medical_insights(blood_values, analysis):

    possible_conditions = []

    # ===========================
    # Hemoglobin
    # ===========================

    if analysis.get("Hemoglobin") == "Low":
        possible_conditions.append(
            "Possible Iron Deficiency Anemia"
        )

    elif analysis.get("Hemoglobin") == "High":
        possible_conditions.append(
            "Possible Polycythemia or Dehydration"
        )

    # ===========================
    # RBC
    # ===========================

    if analysis.get("RBC") == "Low":
        possible_conditions.append(
            "Possible Anemia"
        )

    elif analysis.get("RBC") == "High":
        possible_conditions.append(
            "Possible Dehydration"
        )

    # ===========================
    # WBC
    # ===========================

    if analysis.get("WBC") == "High":
        possible_conditions.append(
            "Possible Infection or Inflammation"
        )

    elif analysis.get("WBC") == "Low":
        possible_conditions.append(
            "Possible Low White Blood Cell Count"
        )

    # ===========================
    # Platelets
    # ===========================

    if analysis.get("Platelets") == "Low":
        possible_conditions.append(
            "Possible Low Platelet Count"
        )

    elif analysis.get("Platelets") == "High":
        possible_conditions.append(
            "Possible High Platelet Count"
        )

    # ===========================
    # Diabetes
    # ===========================

    if analysis.get("Glucose") == "High":
        possible_conditions.append(
            "Elevated Blood Glucose — Further Evaluation Recommended"
        )

    if analysis.get("HbA1c") == "Prediabetes":
        possible_conditions.append(
            "Prediabetes Range"
        )

    elif analysis.get("HbA1c") == "Diabetes":
        possible_conditions.append(
            "Diabetes Range — Medical Evaluation Recommended"
        )

    # ===========================
    # Kidney
    # ===========================

    if analysis.get("Creatinine") == "High":
        possible_conditions.append(
            "Elevated Creatinine — Further Evaluation Recommended"
        )

    if analysis.get("Urea") == "High":
        possible_conditions.append(
            "Elevated Urea — Further Evaluation Recommended"
        )

    if analysis.get("Uric Acid") == "High":
        possible_conditions.append(
            "Elevated Uric Acid — Further Evaluation Recommended"
        )

    # ===========================
    # Thyroid
    # ===========================

    if analysis.get("TSH") == "High":
        possible_conditions.append(
            "Possible Thyroid Function Abnormality"
        )

    elif analysis.get("TSH") == "Low":
        possible_conditions.append(
            "Possible Thyroid Function Abnormality"
        )

    # ===========================
    # Cholesterol
    # ===========================

    if analysis.get("Cholesterol") == "High":
        possible_conditions.append(
            "High Cholesterol"
        )

    if analysis.get("LDL") == "High":
        possible_conditions.append(
            "Elevated LDL Cholesterol — Cardiovascular Risk Assessment Recommended"
        )

    if analysis.get("HDL") == "Low":
        possible_conditions.append(
            "Low HDL Cholesterol"
        )

    # ===========================
    # Liver
    # ===========================

    if analysis.get("SGPT") == "High":
        possible_conditions.append(
            "Elevated SGPT — Further Evaluation Recommended"
        )

    if analysis.get("SGOT") == "High":
        possible_conditions.append(
            "Elevated SGOT — Further Evaluation Recommended"
        )

    # ===========================
    # Electrolytes
    # ===========================

    if analysis.get("Potassium") == "High":
        possible_conditions.append(
            "High Potassium — Medical Evaluation Recommended"
        )

    if analysis.get("Sodium") == "Low":
        possible_conditions.append(
            "Low Sodium — Medical Evaluation Recommended"
        )

    # ===========================
    # Vitamin D
    # ===========================

    if analysis.get("Vitamin D") == "Low":
        possible_conditions.append(
            "Vitamin D Deficiency Range"
        )

    # ===========================
    # Final
    # ===========================

    if len(possible_conditions) == 0:
        possible_conditions.append(
            "No major abnormalities detected."
        )

    return list(dict.fromkeys(possible_conditions))
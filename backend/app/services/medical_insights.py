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
            "Possible Weak Immune System"
        )

    # ===========================
    # Platelets
    # ===========================

    if analysis.get("Platelets") == "Low":
        possible_conditions.append(
            "Possible Bleeding Disorder"
        )

    elif analysis.get("Platelets") == "High":
        possible_conditions.append(
            "Possible Blood Clotting Disorder"
        )

    # ===========================
    # Diabetes
    # ===========================

    if analysis.get("Glucose") == "High":
        possible_conditions.append(
            "Possible Diabetes or Prediabetes"
        )

    if analysis.get("HbA1c") == "Prediabetes":
        possible_conditions.append(
            "Prediabetes"
        )

    elif analysis.get("HbA1c") == "Diabetes":
        possible_conditions.append(
            "Diabetes Mellitus"
        )

    # ===========================
    # Kidney
    # ===========================

    if analysis.get("Creatinine") == "High":
        possible_conditions.append(
            "Possible Kidney Dysfunction"
        )

    if analysis.get("Urea") == "High":
        possible_conditions.append(
            "Possible Kidney Disease"
        )

    if analysis.get("Uric Acid") == "High":
        possible_conditions.append(
            "Possible Gout or Kidney Stone Risk"
        )

    # ===========================
    # Thyroid
    # ===========================

    if analysis.get("TSH") == "High":
        possible_conditions.append(
            "Possible Hypothyroidism"
        )

    elif analysis.get("TSH") == "Low":
        possible_conditions.append(
            "Possible Hyperthyroidism"
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
            "Increased Heart Disease Risk"
        )

    if analysis.get("HDL") == "Low":
        possible_conditions.append(
            "Low Good Cholesterol"
        )

    # ===========================
    # Liver
    # ===========================

    if analysis.get("SGPT") == "High":
        possible_conditions.append(
            "Possible Liver Dysfunction"
        )

    if analysis.get("SGOT") == "High":
        possible_conditions.append(
            "Possible Liver Inflammation"
        )

    # ===========================
    # Electrolytes
    # ===========================

    if analysis.get("Potassium") == "High":
        possible_conditions.append(
            "High Potassium (Hyperkalemia)"
        )

    if analysis.get("Sodium") == "Low":
        possible_conditions.append(
            "Low Sodium (Hyponatremia)"
        )

    # ===========================
    # Vitamin D
    # ===========================

    if analysis.get("Vitamin D") == "Low":
        possible_conditions.append(
            "Vitamin D Deficiency"
        )

    # ===========================
    # Final
    # ===========================

    if len(possible_conditions) == 0:

        possible_conditions.append(
            "No major abnormalities detected."
        )

    return list(dict.fromkeys(possible_conditions))
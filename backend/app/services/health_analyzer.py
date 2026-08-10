def analyze_blood_report(report: dict):

    analysis = {}

    # -----------------------
    # Blood Report
    # -----------------------

    if "Hemoglobin" in report:
        value = float(report["Hemoglobin"])

        if value < 12:
            analysis["Hemoglobin"] = "Low"
        elif value > 17:
            analysis["Hemoglobin"] = "High"
        else:
            analysis["Hemoglobin"] = "Normal"

    if "WBC" in report:
        value = float(report["WBC"])

        if value < 4000:
            analysis["WBC"] = "Low"
        elif value > 11000:
            analysis["WBC"] = "High"
        else:
            analysis["WBC"] = "Normal"

    if "RBC" in report:
        value = float(report["RBC"])

        if value < 4:
            analysis["RBC"] = "Low"
        elif value > 6:
            analysis["RBC"] = "High"
        else:
            analysis["RBC"] = "Normal"

    if "Platelets" in report:
        value = float(report["Platelets"])

        if value < 150000:
            analysis["Platelets"] = "Low"
        elif value > 450000:
            analysis["Platelets"] = "High"
        else:
            analysis["Platelets"] = "Normal"

    # -----------------------
    # Diabetes
    # -----------------------

    if "Glucose" in report:

        value = float(report["Glucose"])

        if value < 70:
            analysis["Glucose"] = "Low"

        elif value > 125:
            analysis["Glucose"] = "High"

        else:
            analysis["Glucose"] = "Normal"

    if "HbA1c" in report:

        value = float(report["HbA1c"])

        if value < 5.7:
            analysis["HbA1c"] = "Normal"

        elif value < 6.5:
            analysis["HbA1c"] = "Prediabetes"

        else:
            analysis["HbA1c"] = "Diabetes"

    # -----------------------
    # Thyroid
    # -----------------------

    if "TSH" in report:

        value = float(report["TSH"])

        if value < 0.4:
            analysis["TSH"] = "Low"

        elif value > 4.0:
            analysis["TSH"] = "High"

        else:
            analysis["TSH"] = "Normal"

    # -----------------------
    # Lipid Profile
    # -----------------------

    if "Cholesterol" in report:

        value = float(report["Cholesterol"])

        if value < 200:
            analysis["Cholesterol"] = "Normal"

        elif value < 240:
            analysis["Cholesterol"] = "Borderline"

        else:
            analysis["Cholesterol"] = "High"

    if "LDL" in report:

        value = float(report["LDL"])

        if value < 100:
            analysis["LDL"] = "Normal"

        else:
            analysis["LDL"] = "High"

    if "HDL" in report:

        value = float(report["HDL"])

        if value < 40:
            analysis["HDL"] = "Low"

        else:
            analysis["HDL"] = "Normal"

    # -----------------------
    # Kidney
    # -----------------------

    if "Creatinine" in report:

        value = float(report["Creatinine"])

        if value < 0.6:
            analysis["Creatinine"] = "Low"

        elif value > 1.3:
            analysis["Creatinine"] = "High"

        else:
            analysis["Creatinine"] = "Normal"

    # -----------------------
    # Liver
    # -----------------------

    if "SGPT" in report:

        value = float(report["SGPT"])

        if value > 56:
            analysis["SGPT"] = "High"

        else:
            analysis["SGPT"] = "Normal"

    if "SGOT" in report:

        value = float(report["SGOT"])

        if value > 40:
            analysis["SGOT"] = "High"

        else:
            analysis["SGOT"] = "Normal"

    if "Bilirubin" in report:

        value = float(report["Bilirubin"])

        if value > 1.2:
            analysis["Bilirubin"] = "High"

        else:
            analysis["Bilirubin"] = "Normal"

    return analysis
from app.services.health_analyzer import analyze_blood_report


blood_data = {
    "Hemoglobin": "13.5",
    "WBC": "7200",
    "RBC": "4.8",
    "Platelets": "250000"
}


result = analyze_blood_report(blood_data)

print(result)
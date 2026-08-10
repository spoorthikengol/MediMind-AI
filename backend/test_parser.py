from app.services.report_parser import parse_blood_report


sample_text = """
Patient Name: Spoorthi

Hemoglobin: 13.5
WBC: 7200
RBC: 4.8
Platelets: 250000
"""


result = parse_blood_report(sample_text)

print(result)
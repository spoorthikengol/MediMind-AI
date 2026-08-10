from app.services.report_service import analyze_report


pdf_path = "uploads/reports/a99e2202-18ee-41eb-bf6d-c6a35dad24a1_blood_report.pdf"


result = analyze_report(pdf_path)

print(result)
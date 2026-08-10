from app.services.pdf_service import extract_text_from_pdf
from app.services.report_parser import parse_blood_report


pdf_path = "uploads/reports/a99e2202-18ee-41eb-bf6d-c6a35dad24a1_blood_report.pdf"

text = extract_text_from_pdf(pdf_path)

print("Extracted Text:")
print(text)


result = parse_blood_report(text)

print("\nBlood Report Values:")
print(result)
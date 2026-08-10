from app.services.pdf_service import extract_text_from_pdf

pdf_path = "uploads/reports/c74901f5-a83f-4c7a-8ad4-e6a0b5891fea_dummy.pdf"

text = extract_text_from_pdf(pdf_path)

print(text)
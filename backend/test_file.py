pdf_path = r"C:\Users\Spoorthi\Downloads\blood_report.pdf"

with open(pdf_path, "rb") as f:
    data = f.read()

print("File size:", len(data))
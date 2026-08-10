import re

from app.services.report_aliases import REPORT_ALIASES


def parse_blood_report(text: str):

    report = {}

    lower = text.lower()

    # -------------------------
    # Detect Report Type
    # -------------------------

    if (
        "hemoglobin" in lower
        or "haemoglobin" in lower
        or "platelets" in lower
        or "wbc" in lower
    ):
        report["report_type"] = "Blood Report"

    elif (
        "glucose" in lower
        or "blood sugar" in lower
        or "hba1c" in lower
    ):
        report["report_type"] = "Diabetes Report"

    elif (
        "tsh" in lower
        or "t3" in lower
        or "t4" in lower
    ):
        report["report_type"] = "Thyroid Report"

    elif (
        "cholesterol" in lower
        or "hdl" in lower
        or "ldl" in lower
    ):
        report["report_type"] = "Lipid Profile"

    elif (
        "creatinine" in lower
        or "urea" in lower
    ):
        report["report_type"] = "Kidney Report"

    elif (
        "sgpt" in lower
        or "sgot" in lower
        or "bilirubin" in lower
        or "alt" in lower
        or "ast" in lower
    ):
        report["report_type"] = "Liver Report"

    else:
        report["report_type"] = "Unknown"

    # -------------------------
    # Extract Report Values
    # -------------------------

    for parameter, aliases in REPORT_ALIASES.items():

        for alias in aliases:

            pattern = rf"{re.escape(alias)}[:\s]*([\d.]+)"

            match = re.search(
                pattern,
                text,
                re.IGNORECASE,
            )

            if match:

                report[parameter] = match.group(1)

                break

    return report
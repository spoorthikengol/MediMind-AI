from app.services.medical_reference import MEDICAL_REFERENCE


def enrich_report(values: dict, analysis: dict):
    enriched = {}

    for parameter, value in values.items():

        if parameter not in MEDICAL_REFERENCE:
            continue

        reference = MEDICAL_REFERENCE[parameter]

        enriched[parameter] = {
            "value": value,
            "unit": reference["unit"],
            "normal_range": f'{reference["min"]} - {reference["max"]}',
            "status": analysis.get(parameter, "Unknown"),
            "description": reference["description"],
        }

    return enriched
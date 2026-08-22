import logging
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in .env file")

# Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)

# Keep report input within a reasonable size
MAX_SUMMARY_INPUT_CHARS = 12000


def generate_gemini_summary(extracted_text: str) -> str:
    """
    Generate a complete AI medical summary from the extracted report text.
    """

    report_text = extracted_text or ""

    if not report_text.strip():
        return """
# AI Summary Unavailable

No medical report text was available for analysis.

This AI report is for educational purposes only. Please consult a qualified doctor.
"""

    # Prevent extremely large requests
    if len(report_text) > MAX_SUMMARY_INPUT_CHARS:
        report_text = (
            report_text[:MAX_SUMMARY_INPUT_CHARS]
            + "\n\n[Report truncated because it exceeded the processing limit.]"
        )

    prompt = f"""
You are MediMind AI, a medical report explanation assistant.

Analyze ONLY the medical report provided below.

MEDICAL REPORT:
{report_text}

IMPORTANT RULES:

- Start immediately with "# Overall Health".
- Do NOT create a "Parameters to cover" section.
- Do NOT create an outline.
- Do NOT explain what you are going to analyze.
- Analyze the actual laboratory parameters directly.
- Cover EVERY laboratory parameter present in the report.
- Use ONLY values explicitly present in the report.
- Never invent laboratory values.
- Never invent abnormalities.
- Compare every value with its stated reference range.
- Classify every parameter as Normal, High, or Low.
- Mention abnormal parameters first.
- Mention normal parameters after abnormal parameters.
- Keep each parameter explanation concise.
- Never stop in the middle of a parameter.
- Never end with an incomplete sentence.
- Do not diagnose diseases.
- Do not prescribe medicines.
- Do not scare the patient.
- If information is insufficient, clearly say so.

KIDNEY ACCURACY RULES:

- High creatinine alone does NOT mean kidney disease.
- High creatinine alone does NOT mean kidney dysfunction.
- If creatinine is high, call it "elevated creatinine" or "high creatinine".
- If eGFR is normal, explicitly say that the reported eGFR is normal.
- If other kidney markers are normal, state that they are normal.
- For abnormal kidney-related values, recommend discussing the result with a qualified healthcare professional.
- Do not diagnose kidney disease from one laboratory value.

RETURN EXACTLY THESE SECTIONS:

# Overall Health

Give a concise 2-3 sentence overview based only on the report.

# Blood Parameter Analysis

Analyze EVERY laboratory parameter.

Use this format:

**Parameter Name**
- Value: actual value and unit
- Status: Normal / High / Low
- Why it matters: one concise explanation

Do NOT omit normal parameters.

# Possible Health Risks

Mention ONLY risks supported by abnormal laboratory findings.

If there are no abnormal findings, write:

"No specific risk identified from the available laboratory values."

Do not turn normal values into health risks.

# Diet Recommendations

Give 2-3 general healthy suggestions.

# Exercise Recommendations

Give 1-2 general safe exercise suggestions.

# Hydration Advice

Give a general hydration suggestion.

# Lifestyle Tips

Mention:
- Sleep
- Stress management
- Healthy habits
- Appropriate medical follow-up

FINAL RULE:

Complete ALL sections before stopping.

Never stop halfway through the parameter analysis.

End with exactly:

"This AI report is for educational purposes only. Please consult a qualified doctor."
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=3000,
            ),
        )

        if not response.text:
            raise RuntimeError("Gemini returned an empty response")

        result = response.text.strip()

        if not result:
            raise RuntimeError("Gemini returned an empty response")

        return result

    except Exception as exc:
        logger.exception("Gemini AI summary request failed: %s", exc)

        return """
# AI Summary Unavailable

We couldn't generate an AI summary for this report right now.

Your extracted laboratory values, health score and report analysis are still available.

Please try generating the summary again shortly.

This AI report is for educational purposes only. Please consult a qualified doctor.
"""
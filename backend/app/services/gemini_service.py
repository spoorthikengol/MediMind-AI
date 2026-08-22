import logging
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types


# ==========================================
# Logging
# ==========================================

logger = logging.getLogger(__name__)


# ==========================================
# Environment
# ==========================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY not found in .env file"
    )


# ==========================================
# Gemini Client
# ==========================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ==========================================
# Gemini Model
# ==========================================

MODEL = "gemini-3.6-flash"


# ==========================================
# Performance Settings
# ==========================================

MAX_SUMMARY_INPUT_CHARS = 8000

# 1600 gives enough space to finish every parameter
# without making the response unnecessarily long.
MAX_SUMMARY_OUTPUT_TOKENS = 1600


# ==========================================
# Generate AI Medical Summary
# ==========================================

def generate_gemini_summary(extracted_text: str) -> str:

    report_text = extracted_text or ""

    # ==========================================
    # Empty Report
    # ==========================================

    if not report_text.strip():

        return """
# AI Medical Summary

### Overall Health

No medical report information was available.

### Blood Parameter Analysis

No laboratory values were available for analysis.

### Possible Health Risks

No specific risk identified from the available laboratory values.

### Recommendations

- Provide a valid medical report.
- Review the report with a qualified healthcare professional.

This AI report is for educational purposes only. Please consult a qualified doctor.
""".strip()

    # ==========================================
    # Limit Input Size
    # ==========================================

    if len(report_text) > MAX_SUMMARY_INPUT_CHARS:

        report_text = (
            report_text[:MAX_SUMMARY_INPUT_CHARS]
            + "\n\n[Additional report text omitted for processing.]"
        )

    # ==========================================
    # AI Prompt
    # ==========================================

    prompt = f"""
You are MediMind AI, a medical report explanation assistant.

Analyze ONLY the laboratory information provided below.

MEDICAL REPORT:
{report_text}

Create a clear and complete medical summary.

IMPORTANT:

- Cover EVERY laboratory parameter present in the report.
- Do not skip parameters.
- Do not invent laboratory values.
- Do not invent abnormalities.
- Use the exact values from the report.
- Use the reference range from the report when available.
- Classify each parameter as Normal, High or Low.
- Mention abnormal parameters first.
- Then mention normal parameters.
- Keep explanations concise but complete.
- Do not use "..." for missing values.
- If a value is unavailable, write "Not available".
- Do not diagnose diseases.
- Do not prescribe medicines.
- Do not scare the patient.
- Do not create risks from normal results.

Use EXACTLY these sections:

### Overall Health

Write 2-3 simple sentences describing the overall laboratory findings.

### Blood Parameter Analysis

For EVERY laboratory parameter use this format:

**Parameter Name**
- Value: actual value and unit
- Status: Normal / High / Low
- Why it matters: one clear sentence

Example:

**Blood Urea Nitrogen (BUN)**
- Value: 12.1 mg/dL
- Status: Normal
- Why it matters: BUN reflects a waste product produced when the body breaks down protein and can help assess kidney function and hydration.

Important:
Every parameter must be completed before moving to the next one.

### Possible Health Risks

Mention ONLY possible risks supported by abnormal laboratory findings.

If there are no abnormal findings, write:

"No specific risk identified from the available laboratory values."

### Recommendations

Give 3-4 short recommendations covering:

- Diet
- Hydration
- Exercise or lifestyle
- Medical follow-up when appropriate

KIDNEY SAFETY RULES:

- Use only kidney-related values actually present in the report.
- High creatinine alone does NOT prove kidney disease.
- Do not call one abnormal kidney value kidney disease.
- If eGFR is normal, explicitly state that the reported eGFR is normal.
- If eGFR is low, describe it as a reduced eGFR and recommend discussing it with a qualified healthcare professional.
- If urine protein or microalbumin is elevated, describe the reported abnormality without diagnosing kidney disease.
- If BUN is normal, clearly state that BUN is normal.
- Do not invent kidney abnormalities.

FINAL RULE:

Complete EVERY laboratory parameter.

Do not stop halfway through the parameter list.

Do not create additional sections.

End exactly with:

"This AI report is for educational purposes only. Please consult a qualified doctor."
"""

    # ==========================================
    # Gemini API Request
    # ==========================================

    try:

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=MAX_SUMMARY_OUTPUT_TOKENS,
            ),
        )

        # ==========================================
        # Validate Response
        # ==========================================

        if not response.text:
            raise RuntimeError(
                "Gemini returned an empty response"
            )

        result = response.text.strip()

        if not result:
            raise RuntimeError(
                "Gemini returned an empty response"
            )

        return result

    # ==========================================
    # Error Handling
    # ==========================================

    except Exception as exc:

        logger.exception(
            "Gemini AI summary request failed: %s",
            exc
        )

        # TEMPORARY DEBUG MESSAGE
        # This lets us see the actual Gemini error.
        return f"""
# AI Medical Summary

### AI Summary Unavailable

Gemini could not generate the summary.

**Error:**
{str(exc)}

Please check the backend terminal for the full error.

This AI report is for educational purposes only. Please consult a qualified doctor.
""".strip()
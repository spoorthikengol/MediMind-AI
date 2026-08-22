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
# Model
# ==========================================

MODEL = "gemini-3.6-flash"


# ==========================================
# Performance Settings
# ==========================================

# The report_service already sends compact
# structured laboratory data.
MAX_SUMMARY_INPUT_CHARS = 8000

# Keep the AI response short to improve speed.
MAX_SUMMARY_OUTPUT_TOKENS = 1000


# ==========================================
# Generate AI Medical Summary
# ==========================================

def generate_gemini_summary(extracted_text: str) -> str:

    report_text = extracted_text or ""

    # --------------------------------------
    # Empty report protection
    # --------------------------------------

    if not report_text.strip():
        return """
# AI Summary Unavailable

No medical report information was available for AI summary generation.

This AI report is for educational purposes only. Please consult a qualified doctor.
""".strip()

    # --------------------------------------
    # Limit input size
    # --------------------------------------

    if len(report_text) > MAX_SUMMARY_INPUT_CHARS:
        report_text = (
            report_text[:MAX_SUMMARY_INPUT_CHARS]
            + "\n[Additional report data omitted for processing speed.]"
        )

    # --------------------------------------
    # Short optimized prompt
    # --------------------------------------

    prompt = f"""
You are MediMind AI.

Analyze ONLY the laboratory data provided below.

REPORT DATA:
{report_text}

Return Markdown using EXACTLY these sections:

# Overall Health
Give a concise 2-sentence overview.

# Blood Parameter Analysis
Cover EVERY parameter.

For each parameter use:

**Parameter Name**
- Value: actual value and unit
- Status: Normal / High / Low
- Why it matters: one short explanation

Put abnormal parameters first, then normal parameters.

# Possible Health Risks
Mention only risks supported by abnormal values.

If there are no abnormal values, write:
"No specific risk identified from the available laboratory values."

# Diet Recommendations
Give 2 short general suggestions.

# Exercise Recommendations
Give 1-2 short safe suggestions.

# Hydration Advice
Give one general hydration suggestion.

# Lifestyle Tips
Briefly mention sleep, stress management, healthy habits and appropriate follow-up.

IMPORTANT ACCURACY RULES:

- Use ONLY values provided in the report data.
- Never invent values or abnormalities.
- Use the stated reference range when available.
- Do not diagnose diseases.
- Do not prescribe medicines.
- Do not exaggerate risks.
- Do not scare the patient.
- Do not omit laboratory parameters.
- Keep every explanation concise.
- Complete every section before stopping.

KIDNEY SAFETY:

- High creatinine alone does NOT mean kidney disease.
- High creatinine alone does NOT prove kidney dysfunction.
- Describe it only as "elevated creatinine" or "high creatinine".
- If eGFR is normal, state that the reported eGFR is normal.
- If other kidney markers are normal, state that they are normal.
- For abnormal kidney-related values, recommend discussing them with a qualified healthcare professional.
- Do not diagnose kidney disease from a single laboratory value.

End exactly with:

"This AI report is for educational purposes only. Please consult a qualified doctor."
"""

    # --------------------------------------
    # Gemini request
    # --------------------------------------

    try:

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=MAX_SUMMARY_OUTPUT_TOKENS,
            ),
        )

        # ----------------------------------
        # Validate response
        # ----------------------------------

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

    # --------------------------------------
    # Error handling
    # --------------------------------------

    except Exception as exc:

        logger.exception(
            "Gemini AI summary request failed: %s",
            exc
        )

        return """
# AI Summary Unavailable

We couldn't generate an AI summary for this report right now.

Your laboratory values, health score and report analysis are still available.

Please try again shortly.

This AI report is for educational purposes only. Please consult a qualified doctor.
""".strip()
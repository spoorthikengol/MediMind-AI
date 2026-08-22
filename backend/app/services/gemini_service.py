import logging
import os

from dotenv import load_dotenv
from openai import OpenAI


# ==========================================
# Logging
# ==========================================

logger = logging.getLogger(__name__)


# ==========================================
# Environment
# ==========================================
#
# NOTE: This service now calls Hugging Face instead of Gemini
# (function name/signature kept as generate_gemini_summary since
# report_service.py imports it by that exact name). GEMINI_API_KEY
# is intentionally no longer read here — gemini_parser.py and any
# other Gemini-dependent files are untouched and still use it.

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    raise RuntimeError(
        "HF_TOKEN not found in .env file"
    )


# ==========================================
# Hugging Face Client
# ==========================================
#
# Same OpenAI-compatible Inference Providers approach already
# used successfully in chat_service.py: reuse the existing
# `openai` package pointed at Hugging Face's router instead of
# adding a new dependency.

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN,
)


# ==========================================
# Hugging Face Model
# ==========================================

MODEL = "Qwen/Qwen2.5-7B-Instruct"


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
    # Hugging Face API Request
    # ==========================================

    try:

        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=MAX_SUMMARY_OUTPUT_TOKENS,
        )

        # ==========================================
        # Validate Response
        # ==========================================

        result = (
            completion.choices[0].message.content
            if completion.choices else None
        )

        if not result or not result.strip():
            raise RuntimeError(
                "Hugging Face returned an empty response"
            )

        return result.strip()

    # ==========================================
    # Error Handling
    # ==========================================
    #
    # Any failure (bad token, quota, model unavailable, network,
    # etc.) is logged with the full exception on the backend so
    # it can be diagnosed, but a friendly, non-alarming message
    # is returned to the user instead of a raw error string, a
    # 429, or any other provider-specific error.

    except Exception as exc:

        logger.exception(
            "Hugging Face AI summary request failed: %s",
            exc
        )

        return """
# AI Medical Summary

### AI Summary Unavailable

The AI medical summary could not be generated right now.
Please try again shortly.

This AI report is for educational purposes only. Please consult a qualified doctor.
""".strip()
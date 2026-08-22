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

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    raise RuntimeError(
        "HF_TOKEN not found in .env file"
    )


# ==========================================
# Hugging Face Client
# ==========================================

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN,
)


# ==========================================
# Hugging Face Model
# ==========================================

MODEL = "Qwen/Qwen3-8B"


# ==========================================
# Performance Settings
# ==========================================

MAX_SUMMARY_INPUT_CHARS = 8000
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

No specific action is indicated from the available laboratory values.

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

Create a clear, accurate and patient-friendly medical summary.

==========================================
IMPORTANT DATA RULES
==========================================

1. Cover EVERY laboratory parameter present in the report.

2. Do not skip laboratory parameters.

3. Do not invent laboratory values.

4. Do not invent parameters that are not present.

5. Use the exact value and unit provided in the report.

6. Use the reference range from the report when available.

7. Do not invent a reference range when one is not provided.

8. Determine the status as Normal, High or Low using the
   report's supplied status or reference range.

9. If the report already provides a status, respect that status.

10. Never describe a value as Normal if it is outside the
    supplied reference range.

11. Never describe a value as High or Low without evidence
    from the report data.

12. Put abnormal parameters first.

13. Put normal parameters after abnormal parameters.

14. Keep explanations simple and easy for a normal patient
    to understand.

15. Do not diagnose diseases.

16. Do not prescribe medicines.

17. Do not scare the patient.

18. Do not exaggerate risks.

19. Do not create health risks from normal results.

20. If information is missing, write "Not available".

==========================================
EXACT OUTPUT STRUCTURE
==========================================

Use EXACTLY these four sections:

### Overall Health

Write 2-3 simple sentences describing the overall laboratory
findings.

Mention important abnormal findings first.

If all available parameters are normal, clearly say that the
reported laboratory findings are within their stated ranges.

Do not make conclusions about tests that are not present.

==========================================

### Blood Parameter Analysis

List EVERY laboratory parameter.

For EACH parameter use EXACTLY this format:

**Parameter Name**

- Current Value: actual value and unit
- Normal / High / Low: Normal / High / Low
- Why it matters: one short, simple sentence

Example:

**Hemoglobin A1c**

- Current Value: 5.2 %
- Normal / High / Low: Normal
- Why it matters: Hemoglobin A1c is within the reported normal range.

Example:

**Serum Creatinine**

- Current Value: 1.35 mg/dL
- Normal / High / Low: High
- Why it matters: The reported creatinine is above the stated reference range.

IMPORTANT:

- Include EVERY parameter.
- Use the exact parameter name from the report.
- Use the exact value from the report.
- Use the exact unit from the report.
- Use the correct Normal / High / Low status.
- Keep "Why it matters" to ONE short sentence.
- Do not write long explanations.
- Do not add unrelated medical information.
- Do not repeat the complete reference range for every normal result.
- If a reference range is important for an abnormal result, mention it briefly.
- Never use "..." as a replacement for missing information.

==========================================

### Possible Health Risks

Mention ONLY possible concerns supported by abnormal laboratory
findings.

If there are no abnormal findings, write EXACTLY:

"No specific risk identified from the available laboratory values."

If there is an abnormal value:

- Explain that specific abnormal result.
- Do not automatically call it a disease.
- Do not diagnose the patient.
- Do not invent additional risks.

For example, if creatinine is high, say that the reported
creatinine is elevated and that it may warrant discussion
with a healthcare professional.

Do NOT claim that the patient has kidney disease based only
on an elevated creatinine value.

==========================================

### Recommendations

Give recommendations ONLY when supported by the laboratory
findings.

IMPORTANT:

- Do NOT automatically give diet advice.
- Do NOT automatically give hydration advice.
- Do NOT automatically give exercise advice.
- Do NOT give exact fluid intake amounts.
- Do NOT prescribe medicines.
- Do NOT recommend medication changes.
- Do NOT recommend specific treatments.
- Do NOT invent follow-up timeframes.
- Do NOT recommend a specific medical specialist unless the
  report itself explicitly recommends one.

If all reported parameters are normal, write:

"No specific action is indicated from the available laboratory values."

If abnormal parameters are present, recommend discussing the
reported abnormal findings with a qualified healthcare
professional.

Keep recommendations short and directly related to the
reported laboratory findings.

==========================================
KIDNEY SAFETY RULES
==========================================

1. Use only kidney-related values actually present in the report.

2. If creatinine is present, use its actual value and status.

3. If eGFR is present, use its actual value and status.

4. If BUN or urea is present, use its actual value and status.

5. If urine protein, microalbumin or ACR is present, use the
   actual reported value and status.

6. High creatinine alone does NOT prove kidney disease.

7. Do not diagnose kidney disease from a single abnormal value.

8. If eGFR is normal according to the report, state that the
   reported eGFR is normal.

9. If eGFR is low according to the report, describe it as a
   reduced eGFR and recommend discussing the finding with a
   qualified healthcare professional.

10. If urine protein, microalbumin or ACR is elevated, describe
    the reported abnormality without diagnosing kidney disease.

11. If BUN is normal, clearly state that the reported BUN is normal.

12. Do not invent kidney abnormalities.

==========================================
FINAL RULES
==========================================

- Complete EVERY laboratory parameter.
- Never stop halfway through the parameter list.
- Do not create additional sections.
- Do not repeat the entire medical report.
- Keep the response concise.
- Make the output visually clean.
- Follow the exact parameter format above.

End EXACTLY with:

This AI report is for educational purposes only. Please consult a qualified doctor.
"""

    # ==========================================
    # Hugging Face API Request
    # ==========================================

    try:

        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0.2,
            max_tokens=MAX_SUMMARY_OUTPUT_TOKENS,
        )

        # ==========================================
        # Validate Response
        # ==========================================

        result = (
            completion.choices[0].message.content
            if completion.choices
            else None
        )

        if not result or not result.strip():

            raise RuntimeError(
                "Hugging Face returned an empty response"
            )

        return result.strip()

    # ==========================================
    # Error Handling
    # ==========================================

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
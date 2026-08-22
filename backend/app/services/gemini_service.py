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
MAX_SUMMARY_OUTPUT_TOKENS = 1800


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

### Possible Health Considerations

No specific health considerations can be identified because no laboratory values were provided.

### Recommended Next Steps

No specific action can be recommended from the available information.

### Important Note

This AI-generated summary is for educational and informational purposes only.
It does not diagnose a medical condition and should not replace evaluation
by a qualified healthcare professional.
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
You are MediMind AI, a medical laboratory report explanation assistant.

Your job is to explain ONLY the laboratory information contained in the
provided report in a clear, accurate, cautious and patient-friendly way.

You are NOT a doctor.

You must NOT diagnose diseases, prescribe medicines or invent information.

==================================================
MEDICAL REPORT
==================================================

{report_text}

==================================================
CORE DATA ACCURACY RULES
==================================================

1. Analyze ONLY information actually present in the medical report.

2. Cover EVERY laboratory parameter present in the report.

3. Never skip laboratory parameters.

4. Never invent laboratory values.

5. Never invent laboratory parameters.

6. Never invent units.

7. Use the exact value and unit provided in the report.

8. Use the exact laboratory reference range when available.

9. NEVER invent a reference range.

10. If a reference range is not provided, write:
   "Reference range not provided."

11. If the report explicitly provides a status such as Normal, High or Low,
    respect that status.

12. If the report does not provide a status but provides a reference range,
    determine the status from that supplied range.

13. If there is insufficient information to determine the status, write:
    "Status cannot be determined from the available information."

14. Never call a result Normal if the supplied report indicates it is outside
    the stated reference range.

15. Never call a result High or Low without evidence from the report.

16. Put abnormal parameters before normal parameters.

17. Keep explanations simple enough for a normal patient to understand.

18. Do not repeat the entire original medical report.

==================================================
CLINICAL SAFETY RULES
==================================================

1. An abnormal laboratory result is NOT automatically a diagnosis.

2. Never diagnose a disease from a single laboratory value.

3. Never tell the patient that they definitely have a disease based only
   on laboratory findings.

4. Clearly distinguish:
   - Reported laboratory finding
   - Possible clinical significance
   - Recommended follow-up

5. If information is insufficient for a conclusion, explicitly say:
   "The available laboratory information is insufficient to determine this."

6. Do not exaggerate risks.

7. Do not create health risks from normal laboratory results.

8. Do not scare the patient.

9. Do not prescribe medication.

10. Do not recommend medication changes.

11. Do not provide medication dosages.

12. Do not recommend specific treatments.

13. Do not provide exact fluid-intake amounts.

14. Do not automatically give diet advice.

15. Do not automatically give exercise advice.

16. Do not invent follow-up timeframes.

17. Do not recommend a specific medical specialist unless the report itself
    explicitly recommends one.

==================================================
KIDNEY SAFETY RULES
==================================================

When kidney-related laboratory values are present:

1. Use ONLY kidney-related values actually present in the report.

2. If creatinine is present, use its exact reported value, unit and status.

3. If eGFR is present, use its exact reported value, unit and status.

4. If BUN or urea is present, use its exact reported value, unit and status.

5. If urine protein, microalbumin or ACR is present, use the exact reported
   value, unit and status.

6. An elevated creatinine alone does NOT prove kidney disease.

7. Do NOT diagnose kidney disease from a single abnormal creatinine result.

8. Creatinine interpretation can depend on the laboratory reference range
   and the individual's clinical context.

9. If eGFR is reported as normal by the laboratory, state that the reported
   eGFR is within the stated range.

10. If eGFR is reported as reduced, describe it as a reduced reported eGFR
    and recommend discussing the finding with a qualified healthcare
    professional.

11. If urine protein, microalbumin or ACR is elevated, describe the reported
    abnormality without diagnosing kidney disease.

12. If BUN is reported as normal, state that the reported BUN is normal.

13. Never invent kidney abnormalities.

14. If eGFR is NOT present, do NOT calculate or invent an eGFR.

==================================================
OUTPUT STRUCTURE
==================================================

Return ONLY the following sections.

# AI Medical Summary

### Overall Health

Write 2-4 concise sentences.

Mention important abnormal findings first.

Explain the overall pattern of the laboratory results.

If all available laboratory parameters are within their stated ranges,
clearly say so.

Do NOT make conclusions about tests that are not present.

Do NOT diagnose a disease.

==================================================

### Blood Parameter Analysis

List EVERY laboratory parameter from the report.

Put abnormal parameters first.

For EACH parameter use EXACTLY this format:

**Parameter Name**

- Current Value: actual value and unit
- Normal / High / Low: Normal / High / Low
- Why it matters: one short patient-friendly sentence

Example:

**Hemoglobin A1c**

- Current Value: 5.2 %
- Normal / High / Low: Normal
- Why it matters: The reported HbA1c is within the stated laboratory range.

Example:

**Serum Creatinine**

- Current Value: 1.35 mg/dL
- Normal / High / Low: High
- Why it matters: The reported creatinine is above the stated laboratory reference range.

IMPORTANT:

- Include EVERY parameter.
- Use the exact parameter name.
- Use the exact value.
- Use the exact unit.
- Use the correct reported status.
- Keep "Why it matters" to ONE short sentence.
- Do not write long explanations here.
- Do not add unrelated medical information.
- Do not repeat the complete reference range for every normal result.
- If a reference range is important for an abnormal result, mention it briefly.
- Never use "..." to replace missing information.

==================================================

### Possible Health Considerations

Mention ONLY concerns supported by abnormal laboratory findings.

If there are no abnormal findings, write:

"No specific health concern is identified from the available laboratory values."

If an abnormal result exists:

- Identify the abnormal laboratory finding.
- Explain its possible significance cautiously.
- Do NOT call it a confirmed disease.
- Do NOT invent additional risks.
- Do NOT imply certainty.

For example, if creatinine is elevated:

"The reported creatinine is above the stated laboratory reference range.
An elevated creatinine can have several possible causes and may warrant
discussion with a qualified healthcare professional. This result alone
does not establish a diagnosis of kidney disease."

==================================================

### Recommended Next Steps

Recommendations must be directly related to the reported laboratory
findings.

If abnormal laboratory findings are present:

- Recommend discussing the abnormal findings with a qualified healthcare
  professional.
- Mention relevant additional laboratory information ONLY when appropriate.

For kidney-related findings, if appropriate, you may mention that a healthcare
professional may consider other kidney-function information such as eGFR,
BUN/urea or urine protein measurements.

IMPORTANT:

- Do NOT diagnose.
- Do NOT prescribe.
- Do NOT recommend medication changes.
- Do NOT give exact fluid amounts.
- Do NOT invent follow-up deadlines.
- Do NOT recommend unnecessary tests.
- Do NOT provide unsupported treatment advice.

If all reported laboratory parameters are normal, write:

"No specific action is indicated from the available laboratory values."

==================================================

### Important Note

Use EXACTLY this text:

"This AI-generated summary is for educational and informational purposes only.
It does not diagnose a medical condition and should not replace evaluation by
a qualified healthcare professional. Clinical interpretation should consider
the complete laboratory report and the individual's clinical context."

==================================================
FINAL QUALITY CHECK
==================================================

Before returning the answer, verify internally:

✓ Every laboratory parameter was included.

✓ No value was invented.

✓ No unit was invented.

✓ No reference range was invented.

✓ Abnormal findings appear before normal findings.

✓ The exact reported values are preserved.

✓ No disease was diagnosed.

✓ No medication was prescribed.

✓ No unsupported risk was added.

✓ No unsupported lifestyle advice was added.

✓ Kidney findings follow the kidney safety rules.

✓ eGFR was NOT invented or calculated if absent.

✓ The output contains ONLY the requested sections.

✓ The final Important Note is present.

Return the final medical summary now.
"""

    # ==========================================
    # Hugging Face API Request
    # ==========================================

    try:

        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are MediMind AI, a cautious medical laboratory "
                        "report explanation assistant. Never diagnose, "
                        "prescribe medication or invent medical data."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.15,
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

        result = result.strip()

        # ==========================================
        # Basic Output Safety Checks
        # ==========================================

        forbidden_patterns = [
            "you definitely have",
            "you have kidney disease",
            "take this medicine",
            "start taking",
            "stop taking",
            "change your medication",
        ]

        result_lower = result.lower()

        for pattern in forbidden_patterns:
            if pattern in result_lower:
                logger.warning(
                    "AI output contained potentially unsafe phrase: %s",
                    pattern,
                )

        # ==========================================
        # Ensure Disclaimer Exists
        # ==========================================

        if "This AI-generated summary is for educational" not in result:
            result += """

### Important Note

This AI-generated summary is for educational and informational purposes only.
It does not diagnose a medical condition and should not replace evaluation by
a qualified healthcare professional. Clinical interpretation should consider
the complete laboratory report and the individual's clinical context.
"""

        return result.strip()

    # ==========================================
    # Error Handling
    # ==========================================

    except Exception as exc:

        logger.exception(
            "Hugging Face AI summary request failed: %s",
            exc,
        )

        return """
# AI Medical Summary

### AI Summary Unavailable

The AI medical summary could not be generated right now.
Please try again shortly.

### Important Note

This AI-generated summary is for educational and informational purposes only.
It does not diagnose a medical condition and should not replace evaluation by
a qualified healthcare professional.
""".strip()
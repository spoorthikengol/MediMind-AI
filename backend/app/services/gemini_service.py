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
    raise Exception("GEMINI_API_KEY not found in .env file")

# Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)

# Keep prompt size bounded to avoid unnecessary latency/cost.
MAX_SUMMARY_INPUT_CHARS = 12000


def generate_gemini_summary(extracted_text: str):
    report_text = extracted_text or ""

    if len(report_text) > MAX_SUMMARY_INPUT_CHARS:
        report_text = (
            report_text[:MAX_SUMMARY_INPUT_CHARS]
            + "\n\n[Report truncated for length — earlier content shown above.]"
        )

    prompt = f"""
You are MediMind AI.

You are an expert medical AI assistant.

Analyze the following blood report.

Blood Report:

{report_text}

Return the result in Markdown.

Use EXACTLY these headings.

# Overall Health

Explain the patient's health.

# Blood Parameter Analysis

Explain every blood parameter.

For each parameter include:

- Current Value
- Normal / High / Low
- Why it matters

# Possible Health Risks

Mention ONLY possible risks.

Do NOT diagnose diseases.

# Diet Recommendations

Give healthy diet suggestions.

# Exercise Recommendations

Suggest suitable exercises.

# Hydration Advice

Suggest daily water intake.

# Lifestyle Tips

Mention sleep, stress management, healthy habits and follow-up tests.

Rules:

- Use simple English.
- Mention abnormal values first.
- Mention normal values too.
- Never scare the patient.
- Do not diagnose diseases.
- End with:

"This AI report is for educational purposes only. Please consult a qualified doctor."
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=1200,
            ),
        )

        if not response.text:
            raise RuntimeError("Gemini returned an empty response")

        return response.text

    except Exception:
        logger.exception("Gemini AI summary request failed")

        return """
# AI Summary Unavailable

We couldn't generate an AI summary for this report right now.
Your blood values and health score above are still available —
please try again shortly, or contact support if this continues.
"""
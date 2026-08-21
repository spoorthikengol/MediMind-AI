import logging
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise Exception("GEMINI_API_KEY not found in .env file")

client = genai.Client(api_key=GEMINI_API_KEY)

MODEL = "gemini-3.6-flash"


def analyze_report(report_text: str) -> str:
    prompt = f"""
You are MediMind AI, an intelligent medical report analysis assistant.

Analyze the following medical report.

Medical Report:
{report_text}

Instructions:

- Explain the important findings in simple English.
- Identify abnormal values when present.
- Explain what each abnormal value may indicate.
- Mention normal values when relevant.
- Do not diagnose diseases.
- Do not prescribe medicines.
- Do not invent values or information that is not present in the report.
- If information is unclear, say that further medical evaluation may be required.
- Always recommend consulting a qualified healthcare professional.

Return a clear Markdown response.
"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=1200,
            ),
        )

        if not response.text:
            return "No AI analysis was generated."

        return response.text

    except Exception:
        logger.exception("Gemini report analysis request failed")
        return (
            "AI report analysis is temporarily unavailable. "
            "Your extracted report values and health score are still available."
        )
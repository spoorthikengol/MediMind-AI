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


def ask_ai(report_text: str, question: str) -> str:
    prompt = f"""
You are MediMind AI, an intelligent medical assistant.

Medical Report:
{report_text}

User Question:
{question}

Instructions:
- Explain in simple English.
- Answer only using the information available in the report.
- Do NOT diagnose diseases.
- Do NOT prescribe medicines.
- If the report is unclear, say that more medical evaluation is required.
- Always recommend consulting a qualified healthcare professional.
"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=500,
            ),
        )

        if not response.text:
            return "Sorry, I couldn't generate a response right now."

        return response.text

    except Exception:
        logger.exception("Gemini chatbot request failed")
        return (
            "Sorry, the AI assistant is temporarily unavailable. "
            "Please try again shortly."
        )
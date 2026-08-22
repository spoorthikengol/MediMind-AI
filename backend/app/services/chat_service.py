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
# Load Environment Variables
# ==========================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise Exception("GEMINI_API_KEY not found in .env file")


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
# Maximum Chat Response
# ==========================================

MAX_CHAT_OUTPUT_TOKENS = 800


# ==========================================
# AI Medical Assistant
# ==========================================

def ask_ai(report_text: str, question: str) -> str:

    report_text = report_text or ""
    question = question or ""

    prompt = f"""
You are MediMind AI, an intelligent medical report assistant.

Your job is to answer the user's questions using the medical
report provided below.

==========================================
MEDICAL REPORT
==========================================

{report_text}

==========================================
USER QUESTION
==========================================

{question}

==========================================
INSTRUCTIONS
==========================================

1. Answer the user's question directly.

2. Use simple English that a normal patient can understand.

3. Use ONLY information available in the medical report.

4. Do NOT invent laboratory values.

5. Do NOT assume medical conditions that are not supported
   by the report.

6. Do NOT diagnose diseases.

7. Do NOT prescribe medicines.

8. If the user asks about kidney health, use the actual
   kidney-related values in the report such as:
   - Creatinine
   - Urea
   - BUN
   - eGFR
   - Urine findings
   if they are available.

9. If kidney values are normal, clearly explain that the
   reported kidney-related values are within the stated
   reference ranges.

10. If one kidney value is abnormal, explain that specific
    abnormal result without automatically calling it
    kidney disease.

11. If the report does not contain enough information to
    answer the question, clearly say that the report does
    not provide enough information.

12. Do not scare the patient.

13. Do not exaggerate risks.

14. When appropriate, explain:
    - What the result means
    - Whether it is normal, high or low
    - Why it matters
    - What the patient can discuss with a doctor

15. Keep the response concise while still answering the
    question completely.

16. Use headings or bullet points only when they improve
    readability.

17. Do not repeat the entire medical report.

18. Do not provide unrelated medical information.

19. Never stop in the middle of an explanation.

20. Always finish the answer completely.

21. Always include this reminder at the end when giving
    medical guidance:

    "This information is for educational purposes only.
    Please consult a qualified healthcare professional
    for medical advice."

==========================================
IMPORTANT
==========================================

Answer the USER QUESTION now.

Keep the response focused and concise.
"""


    # ==========================================
    # Gemini Request
    # ==========================================

    try:

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=MAX_CHAT_OUTPUT_TOKENS,
            ),
        )


        # ==========================================
        # Validate Response
        # ==========================================

        if not response.text:

            return (
                "Sorry, I couldn't generate a response "
                "right now. Please try again."
            )


        return response.text.strip()


    # ==========================================
    # Error Handling
    # ==========================================

    except Exception:

        logger.exception(
            "Gemini chatbot request failed"
        )

        return (
            "Sorry, the AI assistant is temporarily "
            "unavailable. Please try again shortly."
        )
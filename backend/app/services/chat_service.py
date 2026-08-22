import logging
import os
import traceback

from dotenv import load_dotenv
from openai import OpenAI


# ==========================================
# Logging
# ==========================================

logger = logging.getLogger(__name__)


# ==========================================
# Load Environment Variables
# ==========================================

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    raise Exception("HF_TOKEN not found in .env file")


# ==========================================
# Hugging Face Client
# ==========================================
#
# Hugging Face's Inference Providers expose an OpenAI-compatible
# chat completions endpoint at router.huggingface.co, so the
# already-installed `openai` package can be reused as the client
# just by pointing it at a different base_url + api_key. This
# avoids adding a new dependency (huggingface_hub) for something
# the existing package already covers.

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN,
)


# ==========================================
# Hugging Face Model
# ==========================================

MODEL = "Qwen/Qwen3-8B"


# ==========================================
# Maximum Chat Response
# ==========================================

MAX_CHAT_OUTPUT_TOKENS = 800


# ==========================================
# System Instructions (Medical Safety Rules)
# ==========================================

SYSTEM_PROMPT = """You are MediMind AI, an intelligent medical report assistant.

Your job is to answer the user's questions using the medical report
provided to you.

INSTRUCTIONS:

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
   - Urine findings (protein, microalbumin, ACR)
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

Keep the response focused and concise."""


# ==========================================
# AI Medical Assistant
# ==========================================

def ask_ai(report_text: str, question: str) -> str:

    report_text = report_text or ""
    question = question or ""

    user_message = f"""==========================================
MEDICAL REPORT
==========================================

{report_text}

==========================================
USER QUESTION
==========================================

{question}

==========================================
IMPORTANT
==========================================

Answer the USER QUESTION now.
Keep the response focused and concise."""


    # ==========================================
    # Hugging Face Request
    # ==========================================

    try:

        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=MAX_CHAT_OUTPUT_TOKENS,
        )


        # ==========================================
        # Validate Response
        # ==========================================

        answer = completion.choices[0].message.content if completion.choices else None

        if not answer:

            return (
                "Sorry, I couldn't generate a response "
                "right now. Please try again."
            )


        return answer.strip()


    # ==========================================
    # Error Handling
    # ==========================================
    #
    # DEBUG BEHAVIOR (matches the previous Gemini debugging setup):
    # Any failure here is logged with a full traceback and then
    # re-raised, so chat.py's existing `except Exception as e`
    # handler in the /chat/ask route returns the real error
    # message to the caller as a 500 response, e.g.
    # "AI Chat Error: <actual reason>", instead of always
    # returning a generic "temporarily unavailable" string.
    #
    # Once this is confirmed working end-to-end, this can be
    # swapped back to catching the exception and returning a
    # friendly fallback string for production use.

    except Exception:

        logger.exception(
            "Hugging Face chatbot request failed"
        )

        traceback.print_exc()

        raise
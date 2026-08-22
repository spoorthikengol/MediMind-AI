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

Your job is to answer the user's questions using ONLY the medical
report data provided to you below. The report data given to you is
already structured as one line per laboratory parameter, in this
exact format:

Parameter Name: value unit | Reference: reference range | Status: Normal/High/Low/Unknown

INSTRUCTIONS:

1. Answer the user's question directly.

2. Use simple English that a normal patient can understand.

3. Use ONLY information available in the medical report data
   provided to you. Do not use outside medical knowledge to fill
   in missing values, ranges, or statuses.

4. Do NOT invent laboratory values, units, reference ranges, or
   parameters that are not present in the supplied report data.

5. Do NOT assume a parameter exists if it is not present in the
   supplied report data.

6. STATUS RULE (critical):
   - If a line includes a Status (Normal / High / Low), you MUST
     use that exact status. Never change it, soften it, or
     contradict it, even if the value looks borderline to you.
   - If a line's Status is "Unknown" but a Reference range is
     given, carefully compare the value to that reference range
     yourself to describe it as within range, above range, or
     below range.
   - Never describe a value as normal if it falls outside the
     supplied reference range.

7. Do NOT assume medical conditions that are not supported
   by the report.

8. Do NOT diagnose diseases.

9. Do NOT prescribe medicines or give specific medication
   instructions (names, dosages, or schedules).

10. Do NOT give specific unsupported instructions such as exact
    fluid intake amounts, exact retest timeframes, or naming a
    medical specialist to see (e.g. "drink 2-2.5 liters", "repeat
    in 6-8 weeks", "see a nephrologist"), unless the report itself
    explicitly states that recommendation. A general, non-specific
    suggestion to discuss results with a doctor is fine.

11. If the user asks about kidney health, use the actual
    kidney-related values in the report such as:
    - Creatinine
    - Urea
    - BUN
    - eGFR
    - Urine findings (protein, microalbumin, ACR)
    if they are available, following the STATUS RULE above.

12. If one kidney value is abnormal, explain that specific
    abnormal result using its actual value and reference range,
    without automatically calling it kidney disease.

13. If the report data does not contain the information needed
    to answer the question, respond with exactly:
    "The report does not provide enough information to answer that."

14. Do not scare the patient.

15. Do not exaggerate risks.

16. When appropriate, explain:
    - What the result means
    - Whether it is normal, high or low (per the STATUS RULE)
    - Why it matters
    - That the patient can discuss it with a doctor (general, not
      a specific specialist or timeframe unless the report says so)

17. Keep the response concise while still answering the
    question completely.

18. Use headings or bullet points only when they improve
    readability.

19. Do not repeat the entire medical report.

20. Do not provide unrelated medical information.

21. Never stop in the middle of an explanation.

22. Always finish the answer completely.

23. For a request like "explain my last report in simple terms",
    cover the important abnormal (High/Low/out-of-range) findings
    first, then the important normal findings.

24. Always include this reminder at the end when giving
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

    # ==========================================
    # TEMPORARY DEBUG LOGGING
    # ==========================================
    # Confirms exactly what data is actually reaching the model,
    # to catch data-flow bugs (e.g. empty/wrong report text) before
    # blaming the model or the prompt. Never logs HF_TOKEN or any
    # other secret.
    #
    # Uses print() (not just logger.info) because the default
    # Python/uvicorn logging level is WARNING, which would silently
    # swallow logger.info() calls unless logging is separately
    # configured. print() guarantees this is visible in the
    # terminal running uvicorn regardless of logging setup.

    debug_msg = (
        f"[chat_service DEBUG] model={MODEL} | "
        f"report_text_len={len(report_text)} | "
        f"report_text_empty={not report_text.strip()} | "
        f"report_text_preview={report_text[:500]!r}"
    )

    print(debug_msg)
    logger.info(debug_msg)

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
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
# Gemini Model
# ==========================================

MODEL = "gemini-3.6-flash"


# ==========================================
# Chat Response Limit
# ==========================================

MAX_CHAT_OUTPUT_TOKENS = 800


# ==========================================
# AI Medical Assistant
# ==========================================

def ask_ai(report_text: str, question: str) -> str:

    report_text = (report_text or "").strip()
    question = (question or "").strip()

    if not report_text:
        return (
            "I couldn't find your latest medical report. "
            "Please upload a report first."
        )

    if not question:
        return (
            "Please enter a question about your medical report."
        )


    # ==========================================
    # AI Prompt
    # ==========================================

    prompt = f"""
You are MediMind AI, a medical report explanation assistant.

Your task is to answer the patient's question using ONLY
the medical report provided below.

MEDICAL REPORT
==============

{report_text}


PATIENT QUESTION
================

{question}


IMPORTANT RULES
===============

1. Answer the patient's question directly.

2. Use simple English that a normal patient can understand.

3. Use ONLY information that appears in the report.

4. Never invent laboratory values.

5. Never invent symptoms or diagnoses.

6. Do not diagnose a disease.

7. Do not prescribe medicines.

8. Do not exaggerate medical risks.

9. Do not unnecessarily scare the patient.

10. If the report does not contain enough information,
say clearly that the available report does not provide
enough information.

11. If the patient asks about kidney health, carefully
check the actual kidney-related values in the report,
including when available:

- BUN
- Creatinine
- BUN/Creatinine ratio
- eGFR
- Urine protein
- Urine microalbumin
- Albumin/Creatinine ratio
- Urine findings
- Uric acid

12. Compare values with the reference ranges shown in
the report.

13. If the kidney values are normal, clearly say that
the reported kidney-related values are within the
provided reference ranges.

14. Do NOT call a patient as having kidney disease just
because of one laboratory value.

15. If an abnormal value exists, explain that specific
result and recommend discussing it with a qualified
healthcare professional.

16. If the patient asks "Explain my last report in simple
terms", give a useful summary instead of repeating the
entire report.

17. For a general report explanation, use this structure:

### Overall Health

Give a short 2-3 sentence explanation of the overall
report.

### Important Results

Mention the important laboratory results with their
actual values and status.

### What It Means

Explain the important results in simple language.

### What You Can Do

Give 2-4 general healthy suggestions based only on
the report.

18. If the patient asks a specific question such as
"Am I at risk for kidney disease?", answer that question
directly rather than generating the full report summary.

19. Keep the answer reasonably detailed.

20. Do not make the answer extremely short.

21. Do not use "..." as a replacement for a laboratory
value.

22. If a requested value is not available, say
"Not available in the report."

23. Complete the answer before stopping.

24. Always end medical guidance with:

"This information is for educational purposes only.
Please consult a qualified healthcare professional
for medical advice."


NOW ANSWER THE PATIENT'S QUESTION.

Do not repeat the entire medical report.
Do not create unrelated information.
"""


    # ==========================================
    # Gemini Request
    # ==========================================

    try:

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=MAX_CHAT_OUTPUT_TOKENS,
            ),
        )


        # ==========================================
        # Validate Gemini Response
        # ==========================================

        if response is None:
            raise RuntimeError(
                "Gemini returned no response."
            )

        answer = response.text


        if not answer:
            raise RuntimeError(
                "Gemini returned an empty response."
            )


        answer = answer.strip()


        if not answer:
            raise RuntimeError(
                "Gemini returned an empty response."
            )


        return answer


    # ==========================================
    # Error Handling
    # ==========================================

    except Exception as exc:

        logger.exception(
            "Gemini chatbot request failed: %s",
            exc
        )

        # Print the REAL error in the terminal
        print("\n==========================================")
        print("MEDIMIND CHAT ERROR")
        print("==========================================")
        print(str(exc))
        print("==========================================\n")

        # Re-raise so chat.py can return the real error
        raise
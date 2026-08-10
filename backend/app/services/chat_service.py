import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN,
)

MODEL = "Qwen/Qwen2.5-7B-Instruct:together"


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
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful medical AI assistant."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=500,
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"AI Error: {str(e)}"
import os
from dotenv import load_dotenv
from openai import OpenAI

print("🔥 Hugging Face AI Service Loaded")

# Load environment variables
load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

print("HF TOKEN FOUND:", HF_TOKEN is not None)

if not HF_TOKEN:
    raise Exception("HF_TOKEN not found in .env file")

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN,
    timeout=120.0,
    max_retries=2,
)


def generate_gemini_summary(extracted_text: str):

    prompt = f"""
You are MediMind AI.

You are an expert medical AI assistant.

Analyze the following blood report.

Blood Report:

{extracted_text}

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
- End with:

"This AI report is for educational purposes only. Please consult a qualified doctor."
"""

    try:

        completion = client.chat.completions.create(
            model="Qwen/Qwen2.5-7B-Instruct:together",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional healthcare AI assistant."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=1200
        )

        return completion.choices[0].message.content

    except Exception as e:

        print("\n==============================")
        print("HUGGING FACE ERROR")
        print("==============================")
        print("Type:", type(e).__name__)
        print("Details:", repr(e))
        print("==============================\n")

        return f"""
# AI Summary Failed

Error:

{str(e)}

Please check:

- HF_TOKEN
- Internet Connection
- Hugging Face Router
- Model Availability
"""
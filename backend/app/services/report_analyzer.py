import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.getenv("HF_TOKEN")
)

MODEL = "Qwen/Qwen2.5-7B-Instruct:together"


def analyze_report(report_text: str):

    prompt = f"""
Analyze the following medical report.

Medical Report:
{report_text}

Return ONLY valid JSON.

Format:

{{
    "summary":"",
    "health_score":0,
    "risk_level":"",
    "key_findings":[],
    "recommendations":[]
}}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role":"user",
                "content":prompt
            }
        ],
        temperature=0.2
    )

    text = response.choices[0].message.content

    return json.loads(text)
import json
from google import genai

from app.core.config import settings

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


def parse_medical_report(text: str):

    prompt = f"""
You are an expert medical AI.

Analyze the following medical report.

Return ONLY valid JSON.

Format:

{{
  "report_type": "",
  "blood_values": {{}},
  "analysis": {{}}
}}

Rules:

1. Detect report type.
2. Extract every medical parameter.
3. blood_values should contain parameter:value.
4. analysis should contain parameter: Normal/Low/High/Borderline/Diabetes etc.
5. No markdown.
6. No explanation.
7. Output ONLY JSON.

Medical Report:

{text}
"""

    response = client.models.generate_content(
      model="gemini-2.0-flash",
        contents=prompt
    )

    cleaned = (
        response.text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    return json.loads(cleaned)
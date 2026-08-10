import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print("API Key:", api_key)

client = genai.Client(api_key=api_key)

try:
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Say Hello!"
    )

    print("\nSUCCESS!")
    print(response.text)

except Exception as e:
    print("\nERROR:")
    print(type(e).__name__)
    print(e)
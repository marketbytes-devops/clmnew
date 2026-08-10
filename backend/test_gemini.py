import os
import google.generativeai as genai

# Load env file manually to verify
from dotenv import load_dotenv
load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
print(f"Loaded GEMINI_API_KEY from .env: {api_key[:10] if api_key else 'None'}...")

if not api_key:
    print("Error: GEMINI_API_KEY is not set in the environment.")
    sys.exit(1)

try:
    print("Initializing Gemini API client...")
    genai.configure(api_key=api_key)
    print("Calling gemini-flash-latest model...")
    model = genai.GenerativeModel("gemini-flash-latest")
    response = model.generate_content("Hello! Say 'Gemini is working' if you can read this.")
    print("--- Response from Gemini API ---")
    print(response.text.strip())
    print("--------------------------------")
    print("Gemini API connection is 100% SUCCESSFUL!")
except Exception as e:
    print(f"Error calling Gemini API: {e}")

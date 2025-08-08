import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def get_completion(prompt: str, model: str = "gemini-1.5-flash") -> str:
    """
    Sends a prompt to the Gemini API and returns the model's response.
    """
    try:
        model_instance = genai.GenerativeModel(model)
        # Use the native async method for better performance and stability in an async app
        response = await model_instance.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"An error occurred: {e}")
        return f"Error: Could not get completion. {e}"

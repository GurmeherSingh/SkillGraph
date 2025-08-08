import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

from typing import Optional, Type
from pydantic import BaseModel

async def get_completion(
    prompt: str,
    model: str = "gemini-1.5-flash",
    response_schema: Optional[Type[BaseModel]] = None
) -> str:
    """
    Sends a prompt to the Gemini API and returns the model's response.
    If a response_schema is provided, it enables JSON mode.
    """
    try:
        model_instance = genai.GenerativeModel(model)
        
        generation_config = {}
        if response_schema:
            generation_config["response_mime_type"] = "application/json"
            # The API expects the schema itself, not a dict
            generation_config["response_schema"] = response_schema

        response = await model_instance.generate_content_async(
            prompt,
            generation_config=generation_config
        )
        return response.text
    except Exception as e:
        print(f"An error occurred: {e}")
        return f"Error: Could not get completion. {e}"

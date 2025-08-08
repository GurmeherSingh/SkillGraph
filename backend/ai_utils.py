# ai_utils.py
import os
import asyncio
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def get_completion(prompt: str, model: str = "gemini-1.5-flash", response_schema=None) -> str:
    """
    Gemini wrapper compatible with the old OpenAI-style get_completion.
    - If response_schema (Pydantic model) is passed, we instruct Gemini to output valid JSON that matches it.
    - Returns plain text (Mermaid, JSON, etc.) with markdown fences stripped.
    """

    # If schema is given, force JSON output
    if response_schema:
        # Pydantic schema → JSON Schema
        schema_str = response_schema.schema_json(indent=2) if hasattr(response_schema, "schema_json") else ""
        prompt = f"""
You are a JSON API. Output ONLY valid JSON that matches this schema exactly, with no extra commentary or formatting.
Schema:
{schema_str}

User request:
{prompt}
""".strip()

    def sync_call():
        model_instance = genai.GenerativeModel(model)
        response = model_instance.generate_content(prompt)
        return response.text or ""

    # Gemini Python SDK is sync → wrap in asyncio
    raw_output = await asyncio.to_thread(sync_call)

    # Clean markdown fences if present
    cleaned = raw_output.strip()
    if cleaned.startswith("```"):
        # Remove starting and ending triple backticks
        cleaned = cleaned.strip("`")
        # Remove language labels like 'mermaid' or 'json'
        cleaned = cleaned.replace("mermaid", "").replace("json", "").strip()

    return cleaned

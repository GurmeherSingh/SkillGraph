import openai
import os

# Make sure to set the OPENAI_API_KEY environment variable.
# openai.api_key = os.getenv("OPENAI_API_KEY")

# For development, you can hardcode the key (not recommended for production)
# from dotenv import load_dotenv
# load_dotenv()
# openai.api_key = os.getenv("OPENAI_API_KEY")


async def get_completion(prompt: str, model: str = "gpt-4o") -> str:
    """
    Sends a prompt to the OpenAI API and returns the model's response.
    """
    try:
        # This is the new syntax for openai > 1.0
        client = openai.AsyncOpenAI()
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant for the SkillGraph application."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"An error occurred: {e}")
        return f"Error: Could not get completion. {e}"

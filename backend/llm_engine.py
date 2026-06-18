import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from schemas import ItineraryGenerationSchema

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_itinerary(country_data: dict, user_prompt: str, days: int) -> ItineraryGenerationSchema:
    system_instruction = (
        "You are an elite travel concierge. Craft a sensible, localized itinerary. "
        "Ground your description directly using the provided country metadata payload. "
        "Always use the local currency symbol provided in the currency payload for tracking costs."
    )

    prompt = f"""
    Country Data context: {country_data}
    Duration: {days} Days
    User Vibe/Preferences: {user_prompt}

    Format the complete plan to perfectly fit the required structured JSON schema output.
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=ItineraryGenerationSchema,
            temperature=0.3,
        )
    )
    
    return ItineraryGenerationSchema.model_validate_json(response.text)
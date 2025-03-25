import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
AGENT_ID = os.getenv("AGENT_ID")  # Set this in your .env file

if not ELEVENLABS_API_KEY or not AGENT_ID:
    raise ValueError("ELEVENLABS_API_KEY and AGENT_ID must be set in the environment.")

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

async def get_conversational_signed_url():
    try:
        # Request a signed URL from ElevenLabs for your conversational agent.
        response = await client.conversational_ai.get_signed_url(agent_id=AGENT_ID)
        return response.signed_url
    except Exception as e:
        raise Exception(f"Failed to get conversational signed URL: {e}")

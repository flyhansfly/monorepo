import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

# Load environment variables
load_dotenv()

# Get the API key from environment variables
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
if not ELEVENLABS_API_KEY:
    raise ValueError("ELEVENLABS_API_KEY is not set in the environment variables.")

# Initialize the ElevenLabs client
client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

def convert_text_to_speech(
    text: str,
    voice_id: str = "JBFqnCBsd6RMkjVDRZzb",  # Replace with your chosen voice ID
    model_id: str = "eleven_multilingual_v2",
    output_format: str = "mp3_44100_128"
) -> bytes:
    """
    Converts text to speech using ElevenLabs API and returns the audio data.
    """
    try:
        # Call the ElevenLabs API to convert text to speech
        audio = client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id=model_id,
            output_format=output_format
        )
        return audio
    except Exception as e:
        raise Exception(f"Failed to convert text to speech: {e}")

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from app.services.elevenlabs_service import convert_text_to_speech

router = APIRouter()

class TextToSpeechRequest(BaseModel):
    text: str
    # Optionally, allow clients to specify voice_id, model_id, or output_format
    voice_id: str = "JBFqnCBsd6RMkjVDRZzb"
    model_id: str = "eleven_multilingual_v2"
    output_format: str = "mp3_44100_128"

@router.post("/text-to-speech")
async def tts_endpoint(request: TextToSpeechRequest):
    try:
        audio_data = convert_text_to_speech(
            text=request.text,
            voice_id=request.voice_id,
            model_id=request.model_id,
            output_format=request.output_format
        )
        # Return the audio data with the appropriate media type (for MP3 output)
        return Response(content=audio_data, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException
from app.services.elevenlabs_conv_service import get_conversational_signed_url

router = APIRouter()

@router.get("/signed-url")
async def get_signed_url():
    """
    Endpoint to retrieve a signed URL for the ElevenLabs conversational AI.
    The frontend can use this URL to establish a WebSocket connection.
    """
    try:
        signed_url = await get_conversational_signed_url()
        return {"signed_url": signed_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

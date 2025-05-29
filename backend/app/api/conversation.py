from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class ConversationData(BaseModel):
    questions: List[str]
    answers: List[str]
    patient_story: Optional[str] = None

@router.post("/process_conversation")
async def process_conversation(data: ConversationData):
    try:
        # Here you would process the conversation data
        # For now, we'll just return a success response
        return {
            "status": "success",
            "message": "Conversation processed successfully",
            "data": {
                "questions": data.questions,
                "answers": data.answers,
                "patient_story": data.patient_story
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
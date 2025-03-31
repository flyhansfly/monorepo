from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.core.llm import llm_service
from app.prompts.conversation_analysis_prompt import CONVERSATION_ANALYSIS_PROMPT
import logging

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter()

class Message(BaseModel):
    role: str
    time_in_call_secs: int
    message: str

class ConversationData(BaseModel):
    conversation_id: str
    transcript: List[Message]
    metadata: Dict[str, Any]

class AnalysisResult(BaseModel):
    summary: str
    key_points: List[str]
    recommendations: List[str]
    risk_factors: List[str]
    treatment_suggestions: List[str]

@router.post("/process-conversation", response_model=AnalysisResult)
async def process_conversation(data: ConversationData):
    try:
        logger.info(f"Processing conversation {data.conversation_id}")
        
        # Format transcript for analysis
        formatted_transcript = "\n".join([
            f"{msg.role}: {msg.message}" 
            for msg in data.transcript
        ])
        
        # Generate analysis using LLM
        analysis = llm_service.generate_response(
            prompt_template=CONVERSATION_ANALYSIS_PROMPT,
            input_variables={
                "transcript": formatted_transcript,
                "metadata": data.metadata
            }
        )
        
        logger.info(f"Analysis generated for conversation {data.conversation_id}")
        return analysis
        
    except Exception as e:
        logger.error(f"Error processing conversation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing conversation: {str(e)}"
        ) 
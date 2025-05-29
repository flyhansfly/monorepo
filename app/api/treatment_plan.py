from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from ..core.llm import llm_service
from ..models.treatment_plan import TreatmentPlan
from ..prompts.treatment_plan_prompt import TREATMENT_PLAN_PROMPT
import logging
import json
from .intake_analysis import store_treatment_plan
from langchain.output_parsers import PydanticOutputParser
from .session_store import session_store
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.database import Session as SessionModel, LLMLog

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class TreatmentPlanRequest(BaseModel):
    session_id: str

@router.post("/treatment_plan", response_model=TreatmentPlan)
async def generate_treatment_plan(request: TreatmentPlanRequest, db: AsyncSession = Depends(get_db)):
    """
    Generate a treatment plan based on the analysis result.
    """
    try:
        logger.info(f"Generating treatment plan for session {request.session_id}")
        
        # Fetch the session data from the database
        result = await db.execute(
            select(SessionModel).where(SessionModel.session_id == request.session_id)
        )
        session_data = result.scalar_one_or_none()
        if not session_data:
            logger.error(f"No session found for ID: {request.session_id}")
            raise HTTPException(status_code=404, detail="No analysis found for that session")
        
        analysis = session_data.analysis
        
        # Create output parser for TreatmentPlan
        output_parser = PydanticOutputParser(pydantic_object=TreatmentPlan)
        
        # Generate treatment plan using LLM
        response = llm_service.generate_response(
            prompt_template=TREATMENT_PLAN_PROMPT,
            input_variables={"session_id": request.session_id},
            output_parser=output_parser
        )
        
        # Log the LLM interaction
        llm_log = LLMLog(
            session_id=request.session_id,
            step="treatment_plan",
            payload={
                "input": {"session_id": request.session_id},
                "output": response.dict()
            }
        )
        db.add(llm_log)
        await db.commit()
        
        # Store the treatment plan
        store_treatment_plan(response, request.session_id)
        logger.info(f"Successfully generated and stored treatment plan for session {request.session_id}")
        
        return response
            
    except Exception as e:
        logger.error(f"Error generating treatment plan: {str(e)}")
        # Fallback to default treatment plan
        treatment_plan = TreatmentPlan(
            treatment_focus="pain management and core stability",
            treatment_recommendations=[
                {
                    "name": "Pelvic Tilts",
                    "description": "Gentle core exercise to improve pelvic stability and reduce lower back strain",
                    "sets": "3",
                    "reps": "10-12",
                    "frequency": "Daily",
                    "duration": "2 weeks",
                    "precautions": "Stop if pain increases beyond 3/10. Maintain neutral spine position."
                },
                {
                    "name": "Cat-Cow Stretch",
                    "description": "Dynamic spinal mobility exercise to improve flexibility and reduce stiffness",
                    "sets": "2",
                    "reps": "Hold each position for 5-10 seconds",
                    "frequency": "Twice daily",
                    "duration": "2 weeks",
                    "precautions": "Move slowly and breathe deeply. Avoid if sharp pain occurs."
                }
            ],
            reasoning="Initial treatment plan focusing on core stability and proper posture to address the muscle strain.",
            next_phase_focus="progressive strengthening"
        )
        
        # Log the fallback plan
        llm_log = LLMLog(
            session_id=request.session_id,
            step="treatment_plan_fallback",
            payload={
                "error": str(e),
                "fallback_plan": treatment_plan.dict()
            }
        )
        db.add(llm_log)
        await db.commit()
        
        # Store the default treatment plan
        store_treatment_plan(treatment_plan, request.session_id)
        logger.info(f"Using default treatment plan for session {request.session_id}")
        
        return treatment_plan 
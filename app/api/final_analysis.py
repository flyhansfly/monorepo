# Import required modules and libraries
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ValidationError, validator
from typing import List
from langchain.output_parsers import PydanticOutputParser
import logging
import traceback
from langchain.globals import set_llm_cache
from langchain.cache import InMemoryCache
from ..prompts.final_analysis_prompt import FINAL_ANALYSIS_PROMPT
import json
import os
import datetime
from ..core.llm import llm_service

# Set up logging
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Set up the data directory relative to this file's location.
DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/raw')
os.makedirs(DATA_DIR, exist_ok=True)
FILE_PATH = os.path.join(DATA_DIR, "treatment_plans.jsonl")

class Exercise(BaseModel):
    type: str = "Exercise"
    name: str
    description: str
    sets: str
    reps: str
    frequency: str
    duration: str = "1 week"
    precautions: str

class TreatmentPlan(BaseModel):
    treatment_focus: str  # pain, mobility, or strength
    treatment_recommendations: List[Exercise]
    reasoning: str
    next_phase_focus: str

    @validator('treatment_recommendations')
    def validate_exercises(cls, v):
        if len(v) != 3:
            raise ValueError("Treatment plan must contain exactly 3 exercises")
        return v

def store_treatment_plan(treatment_plan, session_id):
    """
    Save the treatment plan along with session info to a JSONL file.
    """
    try:
        record = {
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "session_id": session_id,
            "treatment_plan": treatment_plan.dict(),
            "source": "user_generated"
        }
        with open(FILE_PATH, "a") as f:
            f.write(json.dumps(record) + "\n")
        logger.info(f"Successfully stored treatment plan for session {session_id}")
    except Exception as e:
        logger.error(f"Error storing treatment plan: {str(e)}")
        logger.error(traceback.format_exc())

# Initialize FastAPI router
router = APIRouter()

# Set up LLM cache
set_llm_cache(InMemoryCache())

# Health check endpoint
@router.get("/health")
async def health_check():
    """
    Health check endpoint for the treatment planning API.
    """
    return {"status": "ok", "service": "treatment-planning"}

# Instantiate the Pydantic parser for TreatmentPlan
result_parser = PydanticOutputParser(pydantic_object=TreatmentPlan)

# Define the API endpoint for generating treatment plan
@router.post("/treatment-plan", response_model=TreatmentPlan)
async def generate_treatment_plan():
    logger.info("Received request to generate treatment plan.")
    try:
        # Get the intake analysis result from the atom
        try:
            from app.core.atoms import get_intake_analysis_result
            intake_analysis = get_intake_analysis_result()
            if not intake_analysis:
                raise HTTPException(
                    status_code=400,
                    detail="No intake analysis available. Please complete the intake form first."
                )

            formatted_intake_analysis = f"""
Previous Diagnosis: {intake_analysis.main_diagnosis.diagnosis}
ICD-10 Code: {intake_analysis.main_diagnosis.icd10_code}
Explanation: {intake_analysis.main_diagnosis.simple_explanation}

Muscle Group: {intake_analysis.big_muscle_group.name}
Description: {intake_analysis.big_muscle_group.description}

Other Possible Diagnoses:
{chr(10).join([f"- {d.diagnosis} ({d.icd10_code}): {d.simple_explanation}" for d in intake_analysis.other_probabilistic_diagnosis])}

Clinical Reasoning: {intake_analysis.reasoning}
"""
        except Exception as e:
            logger.error(f"Error getting intake analysis: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error retrieving intake analysis"
            )

        # Format the input data for the LLM
        formatted_input = {
            "intake_analysis": formatted_intake_analysis
        }

        logger.info("Calling LLM service...")
        # Get the treatment plan from the LLM
        try:
            treatment_plan = llm_service.generate_response(
                prompt_template=FINAL_ANALYSIS_PROMPT,
                input_variables=formatted_input,
                output_parser=result_parser
            )
            
            # Validate the result
            if not treatment_plan.treatment_recommendations:
                raise ValueError("LLM response missing treatment_recommendations field")
            if not treatment_plan.treatment_focus in ["pain", "mobility", "strength"]:
                raise ValueError("Invalid treatment focus. Must be one of: pain, mobility, strength")
            if len(treatment_plan.treatment_recommendations) != 3:
                raise ValueError("Treatment plan must contain exactly 3 exercises")
            
            # Store the result
            store_treatment_plan(treatment_plan, "session_id")

            return treatment_plan
            
        except ValueError as ve:
            logger.error(f"Validation error in LLM response: {str(ve)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error validating LLM response: {str(ve)}"
            )
        except Exception as e:
            logger.error(f"Error generating LLM response: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(
                status_code=500,
                detail=f"Error generating treatment plan: {str(e)}"
            )

    except ValidationError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing treatment plan: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e)) 
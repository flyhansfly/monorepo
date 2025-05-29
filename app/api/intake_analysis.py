from fastapi import APIRouter, HTTPException, Depends
from ..models.intake import IntakeFormData, AnalysisResult
from ..core.llm import llm_service
from ..prompts.intake_analysis_prompt import INTAKE_ANALYSIS_PROMPT
from langchain.output_parsers import PydanticOutputParser
import logging
from langchain.globals import set_llm_cache
from langchain.cache import InMemoryCache
from .session_store import session_store
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.database import Session as SessionModel, LLMLog

import os
import datetime
import json
import uuid

# Set up the data directory relative to this file's location.
# Adjust the relative path as needed to reach your project root.
DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/raw')
os.makedirs(DATA_DIR, exist_ok=True)
FILE_PATH = os.path.join(DATA_DIR, "user_responses.jsonl")
FEEDBACK_FILE_PATH = os.path.join(DATA_DIR, "feedback.jsonl")
TREATMENT_FILE_PATH = os.path.join(DATA_DIR, "treatment_plans.jsonl")

def generate_session_id():
    """Generate a unique session ID for tracking a patient's journey"""
    return str(uuid.uuid4())

def store_analysis_result(intake_data, analysis_result, session_id):
    """
    Save the analysis result along with the intake data and session info to a JSONL file.
    """
    record = {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "session_id": session_id,
        "intake_data": intake_data,
        "analysis_result": analysis_result.json(),
        "source": "user_generated"
    }
    with open(FILE_PATH, "a") as f:
        f.write(json.dumps(record) + "\n")
    return session_id

def store_feedback(feedback_data, session_id):
    """
    Save the feedback along with the analysis result to a JSONL file.
    """
    record = {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "session_id": session_id,
        "feedback": feedback_data["feedback"],
        "analysis_result": feedback_data["analysis_result"],
        "source": "user_feedback"
    }
    with open(FEEDBACK_FILE_PATH, "a") as f:
        f.write(json.dumps(record) + "\n")

def store_treatment_plan(treatment_plan, session_id):
    """
    Save the treatment plan with the session ID to link it with previous records.
    """
    record = {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "session_id": session_id,
        "treatment_plan": treatment_plan.json(),
        "source": "treatment_plan"
    }
    with open(TREATMENT_FILE_PATH, "a") as f:
        f.write(json.dumps(record) + "\n")

set_llm_cache(InMemoryCache())
# Configure logging
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

router = APIRouter()

# Instantiate the Pydantic parser for AnalysisResult
analysis_result_parser = PydanticOutputParser(pydantic_object=AnalysisResult)


@router.post("/", response_model=AnalysisResult)
async def analyze_intake_form(data: IntakeFormData, db: Session = Depends(get_db)):
    logger.info("Received request to analyze intake form.")
    try:
        # Log the raw input data
        logger.info(f"Raw Input Data: {data.dict()}")
        
        # Validate the data
        try:
            validated_data = data.dict()
            logger.info(f"Validated Data: {validated_data}")
        except Exception as validation_error:
            logger.error(f"Validation Error: {str(validation_error)}")
            raise HTTPException(
                status_code=422,
                detail={"validation_error": str(validation_error)}
            )

        # Generate a session_id for tracking
        session_id = generate_session_id()
        logger.info(f"Generated session ID: {session_id}")

        # Add session_id to the input variables
        validated_data["session_id"] = session_id

        logger.info("Calling LLM service...")
        try:
            response = llm_service.generate_response(
                prompt_template=INTAKE_ANALYSIS_PROMPT,
                input_variables=validated_data,
                output_parser=analysis_result_parser,
            )
            logger.info(f"LLM Response: {response}")

            # Store the result in the database
            session = SessionModel(
                session_id=session_id,
                analysis=response.dict()
            )
            db.add(session)
            
            # Log the LLM interaction
            llm_log = LLMLog(
                session_id=session_id,
                step="intake_analysis",
                payload={
                    "input": validated_data,
                    "output": response.dict()
                }
            )
            db.add(llm_log)
            db.commit()
            
            # Convert response to dict and add session_id
            response_dict = response.dict()
            response_dict["session_id"] = session_id
            logger.info(f"Final response with session ID: {response_dict}")
            
            return response_dict
        except Exception as llm_error:
            logger.error(f"LLM Error: {str(llm_error)}")
            raise HTTPException(
                status_code=500,
                detail={"llm_error": str(llm_error)}
            )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"error": str(e)}
        )

@router.post("/feedback")
async def submit_feedback(feedback_data: dict):
    """
    Endpoint to handle feedback submission and store it along with the analysis result.
    """
    try:
        logger.info(f"Received feedback data: {feedback_data}")
        
        session_id = feedback_data.get("session_id")
        feedback = feedback_data.get("feedback")
        analysis_result = feedback_data.get("analysis_result")
        
        if not session_id:
            raise HTTPException(
                status_code=400,
                detail={"error": "Session ID is required"}
            )
            
        if not feedback:
            raise HTTPException(
                status_code=400,
                detail={"error": "Feedback is required"}
            )
            
        if not analysis_result:
            raise HTTPException(
                status_code=400,
                detail={"error": "Analysis result is required"}
            )
        
        # Create a feedback record with all required data
        feedback_record = {
            "feedback": feedback,
            "session_id": session_id,
            "analysis_result": analysis_result
        }
        
        store_feedback(feedback_record, session_id)
        logger.info(f"Successfully stored feedback for session {session_id}")
        
        return {"status": "success", "message": "Feedback saved successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error saving feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"error": f"Failed to save feedback: {str(e)}"}
        )

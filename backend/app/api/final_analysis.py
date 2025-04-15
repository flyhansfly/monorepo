# Import required modules and libraries
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ValidationError
from typing import List, Optional
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
import logging
import traceback
from langchain.globals import set_llm_cache
from langchain.cache import InMemoryCache
from app.models.final_analysis import FinalAnalysisFormData, FinalAnalysisResult, BaseDiagnosis, BigMuscleGroup, TreatmentRecommendation
from app.prompts.final_analysis_prompt import FINAL_ANALYSIS_PROMPT
import json
import os
import datetime
from app.core.llm import llm_service
from app.models.final_analysis import PositionChangePain

# Set up logging
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Set up the data directory relative to this file's location.
DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/raw')
os.makedirs(DATA_DIR, exist_ok=True)
FILE_PATH = os.path.join(DATA_DIR, "final_analysis_responses.jsonl")

def store_analysis_result(form_data, analysis_result, session_id):
    """
    Save the analysis result along with the form data and session info to a JSONL file.
    """
    try:
        record = {
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "session_id": session_id,
            "form_data": form_data,
            "analysis_result": analysis_result.dict(),
            "source": "user_generated"
        }
        with open(FILE_PATH, "a") as f:
            f.write(json.dumps(record) + "\n")
        logger.info(f"Successfully stored analysis result for session {session_id}")
    except Exception as e:
        logger.error(f"Error storing analysis result: {str(e)}")
        logger.error(traceback.format_exc())

# Initialize FastAPI router
router = APIRouter()

# Set up LLM cache
set_llm_cache(InMemoryCache())

# Health check endpoint
@router.get("/health")
async def health_check():
    """
    Health check endpoint for the final analysis API.
    """
    return {"status": "ok", "service": "final-analysis"}

# Instantiate the Pydantic parser for FinalAnalysisResult
result_parser = PydanticOutputParser(pydantic_object=FinalAnalysisResult)

# Define the API endpoint for processing final analysis
@router.post("/final-analysis", response_model=FinalAnalysisResult)
async def analyze_final_form(data: FinalAnalysisFormData):
    logger.info("Received request to analyze final form.")
    try:
        # Convert Pydantic model to dict
        input_data = data.dict()
        logger.info(f"Input Data: {input_data}")

        # Get the intake analysis result from the atom
        try:
            from app.core.atoms import get_intake_analysis_result
            intake_analysis = get_intake_analysis_result()
            if intake_analysis:
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
            else:
                formatted_intake_analysis = "No previous intake analysis available."
        except Exception as e:
            logger.error(f"Error getting intake analysis: {str(e)}")
            formatted_intake_analysis = "Error retrieving previous intake analysis."

        # Format the input data for the LLM
        formatted_input = {
            "intake_analysis": formatted_intake_analysis,
            "position_change_pain": input_data["position_change_pain"],
            "activity_level": input_data["activity_level"],
            "leg_pain": input_data["leg_pain"],
            "pain_time": input_data["pain_time"],
            "accidents": input_data["accidents"],
            "bowel_bladder": input_data["bowel_bladder"],
            "fever": input_data["fever"]
        }

        logger.info("Calling LLM service...")
        # Get the analysis result from the LLM
        try:
            analysis_result = llm_service.generate_response(
                prompt_template=FINAL_ANALYSIS_PROMPT,
                input_variables=formatted_input,
                output_parser=result_parser
            )
            
            # Validate the result
            if not analysis_result.main_diagnosis:
                raise ValueError("LLM response missing main_diagnosis field")
            if not analysis_result.big_muscle_group:
                raise ValueError("LLM response missing big_muscle_group field")
            if not analysis_result.treatment_recommendations:
                raise ValueError("LLM response missing treatment_recommendations field")
            
            # Store the result
            store_analysis_result(input_data, analysis_result, "session_id")

            return analysis_result
            
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
                detail=f"Error generating analysis: {str(e)}"
            )

    except ValidationError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing final analysis: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e)) 
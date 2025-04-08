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
from app.models.final_analysis import FinalAnalysisFormData, AnalysisResult
from app.prompts.final_analysis_prompt import FINAL_ANALYSIS_PROMPT
import json
import os
import datetime
from app.core.llm import llm_service

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

# Instantiate the Pydantic parser for AnalysisResult
analysis_result_parser = PydanticOutputParser(pydantic_object=AnalysisResult)

# Define the API endpoint for processing final analysis
@router.post("/final-analysis", response_model=AnalysisResult)
async def analyze_final_form(data: FinalAnalysisFormData):
    logger.info("Received request to analyze final form.")
    try:
        # Convert Pydantic model to dict and ensure all fields are properly formatted
        input_data = data.dict()
        logger.info(f"Input Data: {input_data}")

        # Log each field for debugging
        for field, value in input_data.items():
            logger.info(f"Field {field}: {value} (type: {type(value)})")

        # Format the input data for the LLM
        formatted_input = {
            "positionChangePain": input_data.get("positionChangePain", ""),
            "activityLevel": input_data.get("activityLevel", ""),
            "legPain": input_data.get("legPain", ""),
            "painTime": input_data.get("painTime", ""),
            "accidents": input_data.get("accidents", ""),
            "bowelBladder": input_data.get("bowelBladder", ""),
            "fever": input_data.get("fever", "")
        }

        # Add derived fields for the prompt template
        if formatted_input['positionChangePain'] == 'flexion':
            formatted_input['painInFlexion'] = 'yes'
            formatted_input['painInExtension'] = 'no'
        elif formatted_input['positionChangePain'] == 'extension':
            formatted_input['painInFlexion'] = 'no'
            formatted_input['painInExtension'] = 'yes'
        else:  # no pain
            formatted_input['painInFlexion'] = 'no'
            formatted_input['painInExtension'] = 'no'

        logger.info("Calling LLM service...")
        logger.info(f"Formatted input: {formatted_input}")
        
        try:
            response = llm_service.generate_response(
                prompt_template=FINAL_ANALYSIS_PROMPT,
                input_variables=formatted_input,
                output_parser=analysis_result_parser,
            )
            logger.info(f"LLM Response: {response}")
        except Exception as e:
            logger.error(f"Error in LLM service: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(
                status_code=500,
                detail=f"Error in LLM service: {str(e)}"
            )

        # Generate a session_id (for example, by hashing the form data)
        session_id = str(hash(json.dumps(input_data, sort_keys=True)))

        # Store the result to the designated file for training purposes
        store_analysis_result(input_data, response, session_id)
        
        return response
    except ValidationError as e:
        logger.error(f"Validation error: {str(e)}")
        logger.error(f"Validation errors: {e.errors()}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Validation Error",
                "message": str(e),
                "errors": e.errors()
            }
        )
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing final form: {str(e)}"
        ) 
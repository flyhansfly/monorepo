from fastapi import APIRouter, HTTPException
from app.models.intake import IntakeFormData, AnalysisResult
from app.core.llm import llm_service
from app.prompts.intake_analysis_prompt import INTAKE_ANALYSIS_PROMPT
from langchain.output_parsers import PydanticOutputParser
import logging
from langchain.globals import set_llm_cache
from langchain.cache import InMemoryCache

import os
import datetime
import json

# Set up the data directory relative to this file's location.
# Adjust the relative path as needed to reach your project root.
DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/raw')
os.makedirs(DATA_DIR, exist_ok=True)
FILE_PATH = os.path.join(DATA_DIR, "user_responses.jsonl")

def store_analysis_result(intake_data, analysis_result, session_id):
    """
    Save the analysis result along with the intake data and session info to a JSONL file.
    """
    record = {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "session_id": session_id,
        "intake_data": intake_data,
        "analysis_result": analysis_result,
        "source": "user_generated"
    }
    with open(FILE_PATH, "a") as f:
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
async def analyze_intake_form(data: IntakeFormData):
    logger.info("Received request to analyze intake form.")
    logger.info(f"Input Data: {data.dict()}")
    try:
        logger.info("Calling LLM service...")
        response = llm_service.generate_response(
            prompt_template=INTAKE_ANALYSIS_PROMPT,
            input_variables=data.dict(),
            output_parser=analysis_result_parser,
        )
        logger.info(f"LLM Response: {response}")

        # Generate a session_id (for example, by hashing the intake data)
        session_id = str(hash(json.dumps(data.dict(), sort_keys=True)))

        # Store the result to the designated file for training purposes
        store_analysis_result(data.dict(), response, session_id)
        
        return response
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error analyzing intake form: {str(e)}"
        )

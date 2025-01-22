from fastapi import APIRouter, HTTPException
from app.models.intake import IntakeFormData, AnalysisResult
from app.core.llm import llm_service
from app.prompts.intake_analysis_prompt import INTAKE_ANALYSIS_PROMPT
from langchain.output_parsers import PydanticOutputParser
import logging
from langchain.globals import set_llm_cache
from langchain.cache import InMemoryCache

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
        return response
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error analyzing intake form: {str(e)}"
        )

from fastapi import APIRouter, HTTPException
from app.models.patient_story import PatientStoryResponse
from app.models.intake import IntakeFormData
from app.core.llm import llm_service
from app.prompts.patient_story_prompt import PATIENT_STORY_PROMPT
import logging
from langchain.output_parsers import PydanticOutputParser

# Instantiate the Pydantic parser for PatientStoryResponse
patient_story_parser = PydanticOutputParser(
    pydantic_object=PatientStoryResponse
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=PatientStoryResponse)
async def generate_patient_story(data: IntakeFormData):
    """
    Generate a patient story based on provided health data.
    """
    logger.info("Received request to generate patient story.")
    logger.info(f"Input Data: {data.dict()}")

    try:
        logger.info("Calling LLM service for patient story...")
        # Call the LLM service with the prompt, input variables, and parser
        response = llm_service.generate_response(
            prompt_template=PATIENT_STORY_PROMPT,
            input_variables=data.dict(),
            output_parser=patient_story_parser,  # Pass the output parser
        )
        logger.info(f"Generated Patient Story: {response}")
        return response
    except Exception as e:
        logger.error(f"Error generating patient story: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error generating patient story: {str(e)}"
        )

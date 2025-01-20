from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.models.intake import IntakeFormData, AnalysisResult
from app.core.llm import llm_service
from app.prompts.intake_analysis_prompt import INTAKE_ANALYSIS_PROMPT

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResult)
async def analyze_intake_form(data: IntakeFormData):
    """
    Endpoint to analyze intake form data using the LLM.
    """
    try:
        # Generate the response from the LLM
        response = llm_service.generate_response(
            prompt_template=INTAKE_ANALYSIS_PROMPT,
            input_variables=data.dict(),
        )
        return AnalysisResult.parse_raw(response)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error analyzing intake form: {str(e)}")

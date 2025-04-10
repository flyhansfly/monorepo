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
from app.models.final_analysis import FinalAnalysisFormData, AnalysisResult, FinalAnalysisResponse, BaseDiagnosis, BigMuscleGroup, TreatmentRecommendation
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

# Instantiate the Pydantic parser for AnalysisResult
analysis_result_parser = PydanticOutputParser(pydantic_object=AnalysisResult)

# Define the API endpoint for processing final analysis
@router.post("/final-analysis", response_model=AnalysisResult)
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
            "position_change_pain": input_data["positionChangePain"],
            "activity_level": input_data["activityLevel"],
            "leg_pain": input_data["legPain"],
            "pain_time": input_data["painTime"],
            "accidents": input_data["accidents"],
            "bowel_bladder": input_data["bowelBladder"],
            "fever": input_data["fever"],
            "pain_location": input_data["painLocation"],
            "pain_description": input_data["painDescription"],
            "pain_duration": input_data["painDuration"],
            "pain_frequency": input_data["painFrequency"],
            "pain_intensity": input_data["painIntensity"],
            "pain_aggravating_factors": input_data["painAggravatingFactors"],
            "pain_relieving_factors": input_data["painRelievingFactors"],
            "pain_history": input_data["painHistory"],
            "medical_history": input_data["medicalHistory"],
            "medications": input_data["medications"],
            "allergies": input_data["allergies"],
            "family_history": input_data["familyHistory"],
            "social_history": input_data["socialHistory"],
            "review_of_systems": input_data["reviewOfSystems"],
            "physical_exam": input_data["physicalExam"],
            "imaging": input_data["imaging"],
            "lab_work": input_data["labWork"],
            "other_tests": input_data["otherTests"],
            "other_notes": input_data["otherNotes"]
        }

        # Add derived fields for the prompt template based on positionChangePain
        if formatted_input["position_change_pain"] == PositionChangePain.FLEXION:
            formatted_input["pain_in_flexion"] = "yes"
            formatted_input["pain_in_extension"] = "no"
        elif formatted_input["position_change_pain"] == PositionChangePain.EXTENSION:
            formatted_input["pain_in_flexion"] = "no"
            formatted_input["pain_in_extension"] = "yes"
        else:  # NO_PAIN
            formatted_input["pain_in_flexion"] = "no"
            formatted_input["pain_in_extension"] = "no"

        logger.info("Calling LLM service...")
        # Get the analysis result from the LLM
        try:
            analysis_result = llm_service.generate_response(
                prompt_template=FINAL_ANALYSIS_PROMPT,
                input_variables=formatted_input,
                output_parser=analysis_result_parser
            )
            
            # Convert the result to a dictionary if it's not already
            if not isinstance(analysis_result, dict):
                analysis_result = analysis_result.dict()
                
            # Create the FinalAnalysisResponse model
            response = FinalAnalysisResponse(
                main_diagnosis=BaseDiagnosis(**analysis_result["main_diagnosis"]),
                big_muscle_group=BigMuscleGroup(**analysis_result["big_muscle_group"]),
                other_probabilistic_diagnosis=[
                    BaseDiagnosis(**diagnosis) 
                    for diagnosis in analysis_result["other_probabilistic_diagnosis"]
                ],
                treatment_recommendations=[
                    TreatmentRecommendation(**recommendation)
                    for recommendation in analysis_result["treatment_recommendations"]
                ],
                reasoning=analysis_result["reasoning"]
            )
            
        except Exception as e:
            logger.error(f"Error generating LLM response: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(
                status_code=500,
                detail=f"Error generating analysis: {str(e)}"
            )

        # Store the result
        store_analysis_result(input_data, response, "session_id")

        return response

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
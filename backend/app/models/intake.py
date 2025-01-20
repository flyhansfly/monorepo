from pydantic import BaseModel, Field
from typing import List, Dict, Optional


class IntakeFormData(BaseModel):
    """
    Data schema for the patient intake form.
    """
    age: int
    gender: str
    symptoms: List[str]
    duration: str
    pain_severity: int
    affected_body_parts: List[str]
    additional_notes: Optional[str] = None


class AnalysisResult(BaseModel):
    """
    Schema for the analysis results returned by the LLM.
    """
    serious_vs_treatable: str
    differentiation_probabilities: Dict[str, float]
    icd10_codes: List[str]
    recommendations: Optional[str] = None

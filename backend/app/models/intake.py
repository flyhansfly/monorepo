from pydantic import BaseModel, Field
from typing import List, Dict, Optional


class IntakeFormData(BaseModel):
    """
    Data schema for the patient intake form.
    """
    primary_complaint: str
    location_of_pain: List[str]
    describe_pain: List[str]  # Changed from str to List[str]
    severity: int  # Assuming this is a 0-10 scale
    frequency: str  # Example: "constant", "intermittent" (changed to str)
    timing: List[str]  # Example: "morning", "evening", etc.
    duration_of_symptoms: str  # Example: "3 days", "2 weeks"
    onset_of_pain: str  # Example: "sudden", "gradual"
    symptom_progression: str  # Example: "improving", "worsening", "unchanged"
    red_flag_symptoms: List[str]  # True if red flag symptoms are present
    red_flag_details: Optional[str]  # Description of red flag symptoms
    movement_difficulties: List[str]  # Description of movement difficulties
    activities_affected: List[str]  # Activities impacted by the condition
    symptom_triggers: List[str]  # Factors that worsen symptoms
    symptom_relievers: List[str]  # Factors that alleviate symptoms


class BaseDiagnosis(BaseModel):
    diagnosis: str
    probability: float


class ProbabilisticDiagnosis(BaseDiagnosis):
    icd10_code: str
    simple_explanation: str


class MainDiagnosis(ProbabilisticDiagnosis):
    reasoning: str


class BigMuscleGroup(BaseModel):
    name: str
    description: str
    probability: float


class AnalysisResult(BaseModel):
    """
    Schema for the analysis results returned by the LLM.
    """
    serious_vs_treatable: BaseDiagnosis
    differentiation_probabilities: List[BaseDiagnosis]
    big_muscle_group: BigMuscleGroup
    main_diagnosis: MainDiagnosis
    other_probabilistic_diagnosis: List[ProbabilisticDiagnosis]

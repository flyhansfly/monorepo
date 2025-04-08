from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum

class PositionChangePain(str, Enum):
    NO_PAIN = "no pain"
    FLEXION = "flexion"
    EXTENSION = "extension"

class ActivityLevel(str, Enum):
    NONE = "none"
    LIGHT = "light"
    MODERATE = "moderate"
    HEAVY = "heavy"

class PainTime(str, Enum):
    AM = "AM"
    PM = "PM"

class BaseDiagnosis(BaseModel):
    diagnosis: str
    probability: float = Field(..., ge=0, le=1)

class ProbabilisticDiagnosis(BaseDiagnosis):
    icd10_code: str
    simple_explanation: str

class MainDiagnosis(ProbabilisticDiagnosis):
    reasoning: str

class BigMuscleGroup(BaseModel):
    name: str
    description: str
    probability: float = Field(..., ge=0, le=1)

class AnalysisResult(BaseModel):
    """
    Schema for the analysis results returned by the LLM.
    """
    serious_vs_treatable: BaseDiagnosis
    differentiation_probabilities: List[BaseDiagnosis]
    big_muscle_group: BigMuscleGroup
    main_diagnosis: MainDiagnosis
    other_probabilistic_diagnosis: List[ProbabilisticDiagnosis]

    @validator('differentiation_probabilities')
    def validate_probabilities_sum(cls, v):
        total = sum(item.probability for item in v)
        if not 0.99 <= total <= 1.01:  # Allow for small floating point errors
            raise ValueError("Probabilities must sum to 1")
        return v

class FinalAnalysisFormData(BaseModel):
    """
    Data schema for the final analysis form.
    """
    positionChangePain: PositionChangePain
    activityLevel: ActivityLevel
    legPain: str
    painTime: PainTime
    accidents: str
    bowelBladder: str
    fever: str 
from typing import Optional
from app.models.intake import AnalysisResult

# Simple in-memory storage for the intake analysis result
_intake_analysis_result: Optional[AnalysisResult] = None

def get_intake_analysis_result() -> Optional[AnalysisResult]:
    return _intake_analysis_result

def set_intake_analysis_result(result: AnalysisResult) -> None:
    global _intake_analysis_result
    _intake_analysis_result = result 
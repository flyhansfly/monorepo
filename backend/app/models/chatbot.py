from pydantic import BaseModel
from typing import List, Optional
from app.models.patient_story import FollowUpQuestion  # Add this import


class ChatbotRequest(BaseModel):
    user_input: str
    session_id: str  # Add session tracking
    context: Optional[dict] = None


class ChatbotResponse(BaseModel):
    message: str
    # Use FollowUpQuestion type
    current_question: Optional[FollowUpQuestion] = None
    remaining_questions: List[str] = []
    is_complete: bool = False
    diagnosis: Optional[str] = None
    treatment_plan: Optional[List[str]] = None

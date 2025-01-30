from pydantic import BaseModel
from typing import List, Dict


class FollowUpQuestion(BaseModel):
    id: str  # Unique question ID (e.g., "q1")
    text: str
    paragraph_key: str  # Links to parent paragraph


class PatientStoryParagraph(BaseModel):
    key: str  # Unique paragraph ID (e.g., "para1")
    content: str
    questions: List[FollowUpQuestion]  # Predefined questions


class PatientStoryResponse(BaseModel):
    paragraphs: List[PatientStoryParagraph]
    all_questions: List[FollowUpQuestion]  # Flattened list of all questions

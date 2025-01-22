from pydantic import BaseModel
from typing import List


class PatientStoryParagraph(BaseModel):
    paragraph: str


class PatientStoryResponse(BaseModel):
    story: List[PatientStoryParagraph]

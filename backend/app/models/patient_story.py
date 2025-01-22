from pydantic import BaseModel


class PatientStoryResponse(BaseModel):
    story: str

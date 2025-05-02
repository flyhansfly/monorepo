from pydantic import BaseModel, Field
from typing import List, Optional

class TreatmentRecommendation(BaseModel):
    name: str = Field(..., description="Name of the exercise or treatment")
    description: str = Field(..., description="Detailed description of the exercise or treatment")
    sets: str = Field(..., description="Number of sets to perform")
    reps: str = Field(..., description="Number of repetitions or duration per set")
    frequency: str = Field(..., description="How often to perform the exercise (e.g., Daily, Twice daily, Weekly)")
    duration: str = Field(..., description="How long to continue this exercise (e.g., 2 weeks, Ongoing)")
    precautions: str = Field(..., description="Safety precautions and warning signs to watch for")

class TreatmentPlan(BaseModel):
    treatment_focus: str = Field(
        ...,
        description="Primary focus of the treatment plan (e.g., pain management, strength building, flexibility)"
    )
    treatment_recommendations: List[TreatmentRecommendation] = Field(
        ...,
        description="List of specific exercises and treatments recommended"
    )
    reasoning: str = Field(
        ...,
        description="Explanation of why this treatment approach was chosen"
    )
    next_phase_focus: str = Field(
        ...,
        description="Focus for the next phase of treatment after completing this plan"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "treatment_focus": "pain management and core stability",
                "treatment_recommendations": [
                    {
                        "name": "Pelvic Tilts",
                        "description": "Gentle core exercise to improve pelvic stability and reduce lower back strain",
                        "sets": "3",
                        "reps": "10-12",
                        "frequency": "Daily",
                        "duration": "2 weeks",
                        "precautions": "Stop if pain increases beyond 3/10. Maintain neutral spine position."
                    },
                    {
                        "name": "Cat-Cow Stretch",
                        "description": "Dynamic spinal mobility exercise to improve flexibility and reduce stiffness",
                        "sets": "2",
                        "reps": "Hold each position for 5-10 seconds",
                        "frequency": "Twice daily",
                        "duration": "2 weeks",
                        "precautions": "Move slowly and breathe deeply. Avoid if sharp pain occurs."
                    },
                    {
                        "name": "Bridging Exercise",
                        "description": "Progressive core and glute strengthening exercise",
                        "sets": "3",
                        "reps": "Hold for 10 seconds",
                        "frequency": "Daily",
                        "duration": "Ongoing",
                        "precautions": "Maintain neutral spine. Stop if pain increases in lower back."
                    }
                ],
                "reasoning": "This initial treatment plan focuses on pain management and core stability to address the reported lower back pain. The exercises are chosen to be gentle yet effective, with a focus on proper form and gradual progression. The plan includes both mobility and stability exercises to address both immediate pain relief and long-term strength building.",
                "next_phase_focus": "progressive strengthening and functional movement patterns"
            }
        } 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import intake_analysis, patient_story


app = FastAPI()

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
# app.include_router(intake.router, prefix="/api/intake", tags=["Intake"])
app.include_router(intake_analysis.router,
                   prefix="/api/intake_analysis", tags=["Intake Analysis"])
app.include_router(patient_story.router,
                   prefix="/api/patient_story", tags=["Patient Story"])
# app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chabot"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the PT-AI API"}

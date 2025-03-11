from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import intake_analysis, patient_story, chatbot, text_to_speech  # Import endpoints

app = FastAPI()

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(intake_analysis.router,
                   prefix="/api/intake_analysis", tags=["Intake Analysis"])
app.include_router(patient_story.router,
                   prefix="/api/patient_story", tags=["Patient Story"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])

# <-- Add the text-to-speech router here -->
app.include_router(text_to_speech.router, prefix="/api/text_to_speech", tags=["Text to Speech"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the PT-AI API"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import intake_analysis, patient_story, chatbot, conversational_ai  # Updated import

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production to your frontend domain.
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(intake_analysis.router,
                   prefix="/api/intake_analysis", tags=["Intake Analysis"])
app.include_router(patient_story.router,
                   prefix="/api/patient_story", tags=["Patient Story"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(conversational_ai.router, prefix="/api/conversational_ai", tags=["Conversational AI"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Remap PT"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api import intake_analysis, final_analysis, treatment_plan


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://remap-pt-frontend.herokuapp.com",
        "http://localhost:3000"  # For local development
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(intake_analysis.router,
                   prefix="/api/intake_analysis", tags=["Intake Analysis"])
app.include_router(final_analysis.router,
                   prefix="/api", tags=["Final Analysis"])
app.include_router(treatment_plan.router,
                   prefix="/api", tags=["Treatment Plan"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Remap PT"}

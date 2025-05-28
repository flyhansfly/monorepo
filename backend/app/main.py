from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import init_db, close_db
from backend.app.api import intake_analysis, final_analysis, treatment_plan


app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://remap-pt-frontend-fb59e2ffd3d3.herokuapp.com",  # Production frontend
        "http://localhost:3000"  # Local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
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

@app.on_event("startup")
async def startup():
    await init_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

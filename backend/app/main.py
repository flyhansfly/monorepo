import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import init_db, close_db, database
from .core.logging import logger, log_event
from .core.redis import redis_client
from backend.app.api import intake_analysis, final_analysis, treatment_plan

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("🛑 DATABASE_URL not set")

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
    log_event("app_startup", message="Starting application")
    await init_db()
    if redis_client:
        log_event("redis_connected", message="Redis connection established")
    log_event("app_startup_complete", message="Application startup complete")

@app.on_event("shutdown")
async def shutdown():
    log_event("app_shutdown", message="Shutting down application")
    await close_db()
    if redis_client:
        redis_client.close()
    log_event("app_shutdown_complete", message="Application shutdown complete")

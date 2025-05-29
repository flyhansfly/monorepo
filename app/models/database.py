from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class Session(Base):
    __tablename__ = "sessions"

    session_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LLMLog(Base):
    __tablename__ = "llm_logs"

    log_id = Column(Integer, primary_key=True)
    session_id = Column(String, ForeignKey("sessions.session_id"), nullable=False)
    step = Column(String, nullable=False)  # e.g., 'intake_analysis', 'treatment_plan'
    payload = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 
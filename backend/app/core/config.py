import os
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # General app settings
    APP_NAME: str = "Dr. Ray"
    DEBUG: bool = False

    # OpenAI / LLM settings
    OPENAI_API_KEY: str
    LLM_MODEL_NAME: str = "gpt-4"
    MAX_TOKENS: int = 1500
    TEMPERATURE: float = 0.7

    # Database settings (if needed)
    # DATABASE_URL: str = "sqlite:///./test.db"

    # Other configurations
    ENVIRONMENT: str = "development"

    class Config:
        env_file = Path(__file__).parent / ".env"


# Create a singleton settings object to use across the app
settings = Settings()

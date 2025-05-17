import os
from pydantic_settings import BaseSettings
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

class Settings(BaseSettings):
    # General app settings
    APP_NAME: str = "Dr. Ray"
    DEBUG: bool = False

    # OpenAI / LLM settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_MODEL_NAME: str = "gpt-4"
    MAX_TOKENS: int = 1500
    TEMPERATURE: float = 0.7

    # Database settings (if needed)
    # DATABASE_URL: str = "sqlite:///./test.db"

    # Other configurations
    ENVIRONMENT: str = "development"

    class Config:
        env_file = env_path
        env_file_encoding = 'utf-8'
        case_sensitive = True

# Create a singleton settings object to use across the app
settings = Settings()

"""
Core Application Configuration
Loads, parses, and type-checks environment variables according to 12-Factor principles.
"""

from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """
    Strongly-typed application settings loaded from environment or .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Application Environment
    ENVIRONMENT: Literal["development", "testing", "production"] = "development"
    DEBUG: bool = True
    APP_NAME: str = "ExamPilot"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "change-this-in-production-to-a-secure-random-secret-key-32-chars"

    # Server Configuration
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000

    # Persistence / Database
    # Default to local SQLite WAL database for zero-friction dev & unit tests
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/local/exampilot.db"

    # AI Subsystem Configuration
    AI_PROVIDER: Literal["gemini", "mock"] = "gemini"
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API Key for question generation")
    GEMINI_MODEL_NAME: str = "gemini-1.5-flash"
    AI_REQUEST_TIMEOUT_SECONDS: int = 30
    AI_MAX_RETRIES: int = 3

    # Logging
    LOG_LEVEL: str = "INFO"


# Global singleton settings instance
settings = Settings()

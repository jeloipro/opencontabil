import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "OpenContabil Phoenix"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/opencontabil.db"
    CORS_ORIGINS: list[str] = ["*"]

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()

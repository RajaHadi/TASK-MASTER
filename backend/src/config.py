"""Configuration management for the Backend API."""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Database configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # Authentication secret (MUST match frontend BETTER_AUTH_SECRET)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")

    # CORS origins (comma-separated list)
    CORS_ORIGINS: List[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000"
    ).split(",")

    # Environment name
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Logging level
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # JWT algorithm
    JWT_ALGORITHM: str = "HS256"

    # Database connection pool settings
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_PRE_PING: bool = True


settings = Settings()

"""FastAPI application initialization and configuration."""

import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from .config import settings
from .db.session import engine
from .api.health import router as health_router
from .api.tasks import router as tasks_router
from .api.auth import router as auth_router
from .models import User, Task


# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}',
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    Handles startup and shutdown events.
    """
    # Startup: Validate configuration and create database tables
    logger.info("Application startup initiated")

    # Validate SECRET_KEY is configured
    if not settings.SECRET_KEY:
        logger.error("CRITICAL: SECRET_KEY environment variable is not set")
        raise ValueError("SECRET_KEY must be configured in environment variables")

    # Validate DATABASE_URL is configured
    if not settings.DATABASE_URL:
        logger.error("CRITICAL: DATABASE_URL environment variable is not set")
        raise ValueError("DATABASE_URL must be configured in environment variables")

    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"CORS Origins: {settings.CORS_ORIGINS}")

    # Create database tables
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created/verified successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

    logger.info("Application startup complete")

    yield

    # Shutdown
    logger.info("Application shutdown")


# Create FastAPI application
app = FastAPI(
    title="Todo Backend API",
    description="RESTful API for multi-user Todo application with JWT authentication",
    version="1.0.0",
    lifespan=lifespan,
)


# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(health_router, tags=["System"])
app.include_router(auth_router, prefix="/api", tags=["Auth"])
app.include_router(tasks_router, prefix="/api", tags=["Tasks"])


@app.get("/")
async def root():
    """Root endpoint - redirects to API documentation."""
    return {
        "message": "Todo Backend API",
        "docs": "/docs",
        "health": "/health",
    }

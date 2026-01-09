"""Database session management with connection pooling."""

from typing import Generator
from sqlmodel import Session, create_engine
from ..config import settings

# Create database engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    echo=settings.ENVIRONMENT == "development",
)


def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.

    Yields:
        Session: SQLModel database session

    Usage:
        @app.get("/tasks")
        def get_tasks(session: Session = Depends(get_session)):
            ...
    """
    with Session(engine) as session:
        yield session

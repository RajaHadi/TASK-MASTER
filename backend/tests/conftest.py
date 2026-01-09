"""Pytest configuration and fixtures for testing."""

import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from jose import jwt

from src.main import app
from src.db.session import get_session
from src.config import settings


# Create in-memory SQLite database for testing
@pytest.fixture(name="session")
def session_fixture():
    """Create a fresh database session for each test."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a TestClient with overridden database session."""

    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user_id")
def test_user_id_fixture():
    """Generate a test user ID."""
    return uuid4()


@pytest.fixture(name="test_user_token")
def test_user_token_fixture(test_user_id):
    """Generate a valid JWT token for testing."""
    payload = {
        "sub": str(test_user_id),
        "email": "test@example.com",
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


@pytest.fixture(name="another_user_id")
def another_user_id_fixture():
    """Generate another user ID for multi-user testing."""
    return uuid4()


@pytest.fixture(name="another_user_token")
def another_user_token_fixture(another_user_id):
    """Generate a JWT token for a different user."""
    payload = {
        "sub": str(another_user_id),
        "email": "another@example.com",
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token

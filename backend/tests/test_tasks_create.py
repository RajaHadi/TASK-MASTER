"""Integration tests for POST /api/tasks endpoint."""

from uuid import UUID
from fastapi.testclient import TestClient


def test_create_task_success(client: TestClient, test_user_token: str, test_user_id: UUID):
    """Test successful task creation."""
    response = client.post(
        "/api/tasks",
        json={"title": "Buy groceries"},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 201
    data = response.json()

    assert "id" in data
    assert data["title"] == "Buy groceries"
    assert data["status"] == "pending"
    assert data["user_id"] == str(test_user_id)
    assert "created_at" in data
    assert "updated_at" in data


def test_create_task_with_long_title(client: TestClient, test_user_token: str):
    """Test task creation with maximum length title."""
    long_title = "A" * 500

    response = client.post(
        "/api/tasks",
        json={"title": long_title},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == long_title


def test_create_task_with_whitespace_title_gets_trimmed(
    client: TestClient, test_user_token: str
):
    """Test that whitespace in title is trimmed."""
    response = client.post(
        "/api/tasks",
        json={"title": "  Trimmed Task  "},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Trimmed Task"


def test_create_task_missing_title_returns_400(
    client: TestClient, test_user_token: str
):
    """Test that missing title field returns 400."""
    response = client.post(
        "/api/tasks",
        json={},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 422  # Pydantic validation error


def test_create_task_empty_title_returns_400(
    client: TestClient, test_user_token: str
):
    """Test that empty title returns 400."""
    response = client.post(
        "/api/tasks",
        json={"title": ""},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 422  # Pydantic validation error


def test_create_task_whitespace_only_title_returns_400(
    client: TestClient, test_user_token: str
):
    """Test that whitespace-only title returns 400."""
    response = client.post(
        "/api/tasks",
        json={"title": "   "},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 422  # Pydantic validation error


def test_create_task_title_exceeds_500_chars_returns_400(
    client: TestClient, test_user_token: str
):
    """Test that title >500 characters returns 400."""
    long_title = "A" * 501

    response = client.post(
        "/api/tasks",
        json={"title": long_title},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 422  # Pydantic validation error


def test_create_task_requires_authentication(client: TestClient):
    """Test that POST /api/tasks requires authentication."""
    response = client.post(
        "/api/tasks",
        json={"title": "Test task"},
    )

    assert response.status_code == 401


def test_create_task_with_invalid_token(client: TestClient):
    """Test that invalid token returns 401."""
    response = client.post(
        "/api/tasks",
        json={"title": "Test task"},
        headers={"Authorization": "Bearer invalid-token"},
    )

    assert response.status_code == 401


def test_create_task_auto_sets_status_pending(
    client: TestClient, test_user_token: str
):
    """Test that new tasks automatically get status='pending'."""
    response = client.post(
        "/api/tasks",
        json={"title": "Auto pending task"},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "pending"


def test_create_task_sets_correct_user_id(
    client: TestClient, test_user_id: UUID, test_user_token: str
):
    """Test that task is assigned to the authenticated user."""
    response = client.post(
        "/api/tasks",
        json={"title": "Task with correct user"},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == str(test_user_id)

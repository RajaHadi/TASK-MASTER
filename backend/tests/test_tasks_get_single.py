"""Integration tests for GET /api/tasks/{id} endpoint."""

from uuid import UUID
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.models.task import Task, TaskStatus


def test_get_single_task_success(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test successful retrieval of a single task."""
    task = Task(
        title="Test task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.get(
        f"/api/tasks/{str(task.id)}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(task.id)
    assert data["title"] == "Test task"
    assert data["status"] == "pending"
    assert data["user_id"] == str(test_user_id)


def test_get_single_task_not_found_returns_404(
    client: TestClient, test_user_token: str
):
    """Test that non-existent task returns 404."""
    fake_uuid = "550e8400-e29b-41d4-a716-446655440000"

    response = client.get(
        f"/api/tasks/{fake_uuid}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 404


def test_get_single_task_wrong_user_returns_403(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    another_user_token: str,
):
    """Test that user cannot view another user's task."""
    task = Task(
        title="User 1 task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.get(
        f"/api/tasks/{str(task.id)}",
        headers={"Authorization": f"Bearer {another_user_token}"},
    )

    assert response.status_code == 403


def test_get_single_task_requires_authentication(
    client: TestClient, session: Session, test_user_id: UUID
):
    """Test that GET /api/tasks/{id} requires authentication."""
    task = Task(
        title="Test task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.get(f"/api/tasks/{str(task.id)}")

    assert response.status_code == 401


def test_get_single_task_invalid_uuid_returns_400(
    client: TestClient, test_user_token: str
):
    """Test that invalid UUID format returns 400."""
    invalid_uuid = "not-a-valid-uuid"

    response = client.get(
        f"/api/tasks/{invalid_uuid}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 422  # FastAPI validation error for invalid UUID

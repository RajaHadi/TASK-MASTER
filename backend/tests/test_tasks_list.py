"""Integration tests for GET /api/tasks endpoint."""

from uuid import UUID
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.models.task import Task, TaskStatus


def test_list_tasks_returns_empty_for_new_user(
    client: TestClient, test_user_token: str
):
    """Test that new user gets empty task list."""
    response = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "tasks" in data
    assert data["tasks"] == []


def test_list_tasks_returns_user_tasks_only(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
    another_user_id: UUID,
):
    """Test that user only sees their own tasks."""
    # Create tasks for test user
    task1 = Task(
        title="User 1 Task 1",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    task2 = Task(
        title="User 1 Task 2",
        status=TaskStatus.COMPLETED,
        user_id=test_user_id,
    )

    # Create task for another user
    task3 = Task(
        title="User 2 Task",
        status=TaskStatus.PENDING,
        user_id=another_user_id,
    )

    session.add(task1)
    session.add(task2)
    session.add(task3)
    session.commit()

    # Request tasks as test user
    response = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "tasks" in data
    assert len(data["tasks"]) == 2

    # Verify all returned tasks belong to test user
    for task in data["tasks"]:
        assert task["user_id"] == str(test_user_id)


def test_list_tasks_requires_authentication(client: TestClient):
    """Test that GET /api/tasks requires authentication."""
    response = client.get("/api/tasks")
    assert response.status_code == 401


def test_list_tasks_with_invalid_token(client: TestClient):
    """Test that invalid token returns 401."""
    response = client.get(
        "/api/tasks",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401

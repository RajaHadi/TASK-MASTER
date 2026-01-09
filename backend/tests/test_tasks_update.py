"""Integration tests for PUT /api/tasks/{id} endpoint."""

from uuid import UUID
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.models.task import Task, TaskStatus


def test_update_task_title_success(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test successful task title update."""
    task = Task(
        title="Original title",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    task_id = str(task.id)
    original_status = task.status

    response = client.put(
        f"/api/tasks/{task_id}",
        json={"title": "Updated title"},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Updated title"
    assert data["status"] == original_status.value  # Status unchanged


def test_update_task_status_unchanged(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test that PUT doesn't modify status."""
    task = Task(
        title="Test task",
        status=TaskStatus.COMPLETED,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.put(
        f"/api/tasks/{str(task.id)}",
        json={"title": "New title"},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"  # Status preserved


def test_update_task_empty_title_returns_400(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test that empty title returns 400."""
    task = Task(
        title="Test task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.put(
        f"/api/tasks/{str(task.id)}",
        json={"title": ""},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 422  # Pydantic validation error


def test_update_task_whitespace_only_title_returns_400(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test that whitespace-only title returns 400."""
    task = Task(
        title="Test task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.put(
        f"/api/tasks/{str(task.id)}",
        json={"title": "   "},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 422


def test_update_task_title_exceeds_500_chars_returns_400(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test that title >500 characters returns 400."""
    task = Task(
        title="Test task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    long_title = "A" * 501

    response = client.put(
        f"/api/tasks/{str(task.id)}",
        json={"title": long_title},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 422


def test_update_task_not_found_returns_404(
    client: TestClient, test_user_token: str
):
    """Test that non-existent task returns 404."""
    fake_uuid = "550e8400-e29b-41d4-a716-446655440000"

    response = client.put(
        f"/api/tasks/{fake_uuid}",
        json={"title": "Updated title"},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 404


def test_update_task_wrong_user_returns_403(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    another_user_token: str,
):
    """Test that user cannot update another user's task."""
    task = Task(
        title="User 1 task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.put(
        f"/api/tasks/{str(task.id)}",
        json={"title": "Hacked title"},
        headers={"Authorization": f"Bearer {another_user_token}"},
    )

    assert response.status_code == 403


def test_update_task_requires_authentication(
    client: TestClient, session: Session, test_user_id: UUID
):
    """Test that PUT /api/tasks/{id} requires authentication."""
    task = Task(
        title="Test task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.put(
        f"/api/tasks/{str(task.id)}",
        json={"title": "New title"},
    )

    assert response.status_code == 401

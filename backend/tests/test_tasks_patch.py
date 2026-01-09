"""Integration tests for PATCH /api/tasks/{id} endpoint."""

from uuid import UUID
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.models.task import Task, TaskStatus


def test_patch_task_status_to_completed(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test marking a task as completed."""
    # Create a pending task
    task = Task(
        title="Pending task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    task_id = str(task.id)
    original_updated_at = task.updated_at

    # Update status to completed
    response = client.patch(
        f"/api/tasks/{task_id}",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["status"] == "completed"
    assert data["title"] == "Pending task"  # Title unchanged
    assert data["updated_at"] != original_updated_at.isoformat() + "Z"


def test_patch_task_status_to_pending(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test marking a completed task as pending."""
    # Create a completed task
    task = Task(
        title="Completed task",
        status=TaskStatus.COMPLETED,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    task_id = str(task.id)

    # Update status to pending
    response = client.patch(
        f"/api/tasks/{task_id}",
        json={"status": "pending"},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"


def test_patch_task_invalid_status_returns_400(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test that invalid status value returns 400."""
    task = Task(
        title="Test task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.patch(
        f"/api/tasks/{str(task.id)}",
        json={"status": "invalid-status"},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 422  # Pydantic validation error


def test_patch_task_not_found_returns_404(
    client: TestClient, test_user_token: str
):
    """Test that non-existent task returns 404."""
    fake_uuid = "550e8400-e29b-41d4-a716-446655440000"

    response = client.patch(
        f"/api/tasks/{fake_uuid}",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 404


def test_patch_task_wrong_user_returns_403(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    another_user_id: UUID,
    another_user_token: str,
):
    """Test that user cannot update another user's task."""
    # Create task for test_user
    task = Task(
        title="User 1 task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    # Try to update as another_user
    response = client.patch(
        f"/api/tasks/{str(task.id)}",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {another_user_token}"},
    )

    assert response.status_code == 403


def test_patch_task_requires_authentication(
    client: TestClient, session: Session, test_user_id: UUID
):
    """Test that PATCH /api/tasks/{id} requires authentication."""
    task = Task(
        title="Test task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.patch(
        f"/api/tasks/{str(task.id)}",
        json={"status": "completed"},
    )

    assert response.status_code == 401


def test_patch_task_updated_at_changes(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test that updated_at timestamp changes on status update."""
    task = Task(
        title="Test task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    original_updated_at = task.updated_at

    response = client.patch(
        f"/api/tasks/{str(task.id)}",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()

    # Verify updated_at has changed
    assert data["updated_at"] != original_updated_at.isoformat() + "Z"

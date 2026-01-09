"""Integration tests for DELETE /api/tasks/{id} endpoint."""

from uuid import UUID
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from src.models.task import Task, TaskStatus


def test_delete_task_success(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test successful task deletion."""
    task = Task(
        title="Task to delete",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    task_id = str(task.id)

    response = client.delete(
        f"/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "Task deleted successfully"


def test_delete_task_hard_delete_confirmed(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test that deletion is permanent (hard delete, not soft delete)."""
    task = Task(
        title="Task to delete",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    task_id = task.id

    # Delete the task
    response = client.delete(
        f"/api/tasks/{str(task_id)}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 200

    # Verify task no longer exists in database
    statement = select(Task).where(Task.id == task_id)
    deleted_task = session.exec(statement).first()
    assert deleted_task is None


def test_delete_task_not_in_task_list(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test that deleted task doesn't appear in task list."""
    task = Task(
        title="Task to delete",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    task_id = str(task.id)

    # Delete the task
    client.delete(
        f"/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    # Get task list
    response = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    task_ids = [task["id"] for task in data["tasks"]]
    assert task_id not in task_ids


def test_delete_task_twice_returns_404(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    test_user_token: str,
):
    """Test that deleting the same task twice returns 404."""
    task = Task(
        title="Task to delete",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    task_id = str(task.id)

    # First delete
    response1 = client.delete(
        f"/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response1.status_code == 200

    # Second delete (should fail)
    response2 = client.delete(
        f"/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response2.status_code == 404


def test_delete_task_not_found_returns_404(
    client: TestClient, test_user_token: str
):
    """Test that non-existent task returns 404."""
    fake_uuid = "550e8400-e29b-41d4-a716-446655440000"

    response = client.delete(
        f"/api/tasks/{fake_uuid}",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == 404


def test_delete_task_wrong_user_returns_403(
    client: TestClient,
    session: Session,
    test_user_id: UUID,
    another_user_token: str,
):
    """Test that user cannot delete another user's task."""
    task = Task(
        title="User 1 task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.delete(
        f"/api/tasks/{str(task.id)}",
        headers={"Authorization": f"Bearer {another_user_token}"},
    )

    assert response.status_code == 403

    # Verify task still exists
    statement = select(Task).where(Task.id == task.id)
    existing_task = session.exec(statement).first()
    assert existing_task is not None


def test_delete_task_requires_authentication(
    client: TestClient, session: Session, test_user_id: UUID
):
    """Test that DELETE /api/tasks/{id} requires authentication."""
    task = Task(
        title="Test task",
        status=TaskStatus.PENDING,
        user_id=test_user_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.delete(f"/api/tasks/{str(task.id)}")

    assert response.status_code == 401

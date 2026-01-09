"""Task management endpoints."""

import logging
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..auth.jwt import get_current_user, CurrentUser
from ..db.session import get_session
from ..models.task import (
    Task,
    TaskListResponse,
    TaskResponse,
    TaskCreate,
    TaskUpdate,
    TaskPatch,
    TaskStatus,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/tasks", response_model=TaskListResponse)
async def list_tasks(
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Get all tasks for the authenticated user.

    Security: Filters tasks by user_id from JWT token.
    Returns tasks ordered by creation date (newest first).

    Returns:
        TaskListResponse: List of tasks owned by the user
    """
    try:
        # Query tasks filtered by current user
        statement = (
            select(Task)
            .where(Task.user_id == current_user.id)
            .order_by(Task.created_at.desc())
        )
        tasks = session.exec(statement).all()

        logger.info(f"User {current_user.id} retrieved {len(tasks)} tasks")

        return TaskListResponse(tasks=[TaskResponse.model_validate(task) for task in tasks])

    except Exception as e:
        logger.error(f"Failed to retrieve tasks for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve tasks",
        )


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Create a new task for the authenticated user.

    Security: Task is automatically associated with user_id from JWT token.
    Initial status is set to 'pending'.

    Args:
        task_data: Task creation payload with title

    Returns:
        TaskResponse: Created task with generated ID and timestamps
    """
    try:
        # Create new task with user_id from JWT token
        task = Task(
            title=task_data.title,
            status=TaskStatus.PENDING,
            user_id=current_user.id,
        )

        session.add(task)
        session.commit()
        session.refresh(task)

        logger.info(f"User {current_user.id} created task {task.id}")

        return TaskResponse.model_validate(task)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create task for user {current_user.id}: {str(e)}")
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again later.",
        )


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def patch_task_status(
    task_id: UUID,
    task_data: TaskPatch,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Update task status (partial update).

    Security: Only the task owner can update status.
    Ownership verified via user_id filter.

    Args:
        task_id: UUID of the task to update
        task_data: Patch payload with status

    Returns:
        TaskResponse: Updated task

    Raises:
        404: Task not found or belongs to another user
        403: Valid token but user doesn't own the task
    """
    try:
        # Query task with ownership check
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == current_user.id,
        )
        task = session.exec(statement).first()

        if not task:
            # Task doesn't exist or belongs to another user
            logger.warning(f"User {current_user.id} attempted to access task {task_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        # Check if task exists but belongs to another user (403 vs 404)
        statement_any = select(Task).where(Task.id == task_id)
        task_exists = session.exec(statement_any).first()

        if task_exists and task_exists.user_id != current_user.id:
            logger.warning(
                f"User {current_user.id} attempted to update task {task_id} owned by {task_exists.user_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )

        # Update status and timestamp
        task.status = TaskStatus(task_data.status)
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        logger.info(f"User {current_user.id} updated task {task_id} status to {task.status}")

        return TaskResponse.model_validate(task)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update task {task_id} for user {current_user.id}: {str(e)}")
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update task",
        )


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Update task title (full replacement).

    Security: Only the task owner can update the title.
    Status is NOT modified by this endpoint (use PATCH for status changes).

    Args:
        task_id: UUID of the task to update
        task_data: Update payload with new title

    Returns:
        TaskResponse: Updated task

    Raises:
        404: Task not found or belongs to another user
        403: Valid token but user doesn't own the task
    """
    try:
        # Query task with ownership check
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == current_user.id,
        )
        task = session.exec(statement).first()

        if not task:
            logger.warning(f"User {current_user.id} attempted to access task {task_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        # Check if task exists but belongs to another user
        statement_any = select(Task).where(Task.id == task_id)
        task_exists = session.exec(statement_any).first()

        if task_exists and task_exists.user_id != current_user.id:
            logger.warning(
                f"User {current_user.id} attempted to update task {task_id} owned by {task_exists.user_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )

        # Update title only (preserve status)
        task.title = task_data.title
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        logger.info(f"User {current_user.id} updated task {task_id} title")

        return TaskResponse.model_validate(task)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update task {task_id} for user {current_user.id}: {str(e)}")
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update task",
        )


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Permanently delete a task (hard delete).

    Security: Only the task owner can delete the task.
    This operation is irreversible.

    Args:
        task_id: UUID of the task to delete

    Returns:
        dict: Success message

    Raises:
        404: Task not found or belongs to another user
        403: Valid token but user doesn't own the task
    """
    try:
        # Query task with ownership check
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == current_user.id,
        )
        task = session.exec(statement).first()

        if not task:
            logger.warning(f"User {current_user.id} attempted to delete task {task_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        # Check if task exists but belongs to another user
        statement_any = select(Task).where(Task.id == task_id)
        task_exists = session.exec(statement_any).first()

        if task_exists and task_exists.user_id != current_user.id:
            logger.warning(
                f"User {current_user.id} attempted to delete task {task_id} owned by {task_exists.user_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )

        # Hard delete from database
        session.delete(task)
        session.commit()

        # Audit log for delete operation
        logger.info(f"User {current_user.id} deleted task {task_id} (title: '{task.title}')")

        return {"message": "Task deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete task {task_id} for user {current_user.id}: {str(e)}")
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete task",
        )


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Get a single task by ID.

    Security: Only the task owner can retrieve the task.
    Returns 404 if task doesn't exist or belongs to another user.

    Args:
        task_id: UUID of the task to retrieve

    Returns:
        TaskResponse: The requested task

    Raises:
        404: Task not found or belongs to another user
        403: Valid token but user doesn't own the task
    """
    try:
        # Query task with ownership check
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == current_user.id,
        )
        task = session.exec(statement).first()

        if not task:
            logger.warning(f"User {current_user.id} attempted to access task {task_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        # Check if task exists but belongs to another user
        statement_any = select(Task).where(Task.id == task_id)
        task_exists = session.exec(statement_any).first()

        if task_exists and task_exists.user_id != current_user.id:
            logger.warning(
                f"User {current_user.id} attempted to view task {task_id} owned by {task_exists.user_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )

        logger.info(f"User {current_user.id} retrieved task {task_id}")

        return TaskResponse.model_validate(task)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve task {task_id} for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve task",
        )

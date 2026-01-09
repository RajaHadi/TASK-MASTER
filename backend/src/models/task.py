"""Task model and related Pydantic schemas."""

from datetime import datetime
from enum import Enum as PyEnum
from uuid import UUID, uuid4
from typing import List, Literal
from sqlmodel import Field, SQLModel
from pydantic import BaseModel, field_validator


class TaskStatus(str, PyEnum):
    """Task status enum."""

    PENDING = "pending"
    COMPLETED = "completed"


class Task(SQLModel, table=True):
    """
    Task entity - represents a todo item owned by a user.

    Security: ALWAYS filter queries by user_id to enforce user isolation.
    """

    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True, nullable=False)
    title: str = Field(max_length=500, nullable=False)
    status: TaskStatus = Field(default=TaskStatus.PENDING, nullable=False)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


# Pydantic Request Schemas


class TaskCreate(BaseModel):
    """Request schema for creating a new task."""

    title: str = Field(..., min_length=1, max_length=500, description="Task title")

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        """Validate that title is not empty or whitespace only."""
        if not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()


class TaskUpdate(BaseModel):
    """Request schema for updating task details (PUT)."""

    title: str = Field(..., min_length=1, max_length=500, description="Updated title")

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        """Validate that title is not empty or whitespace only."""
        if not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()


class TaskPatch(BaseModel):
    """Request schema for partial task updates (PATCH)."""

    status: Literal["pending", "completed"] = Field(..., description="Task status")


# Pydantic Response Schemas


class TaskResponse(BaseModel):
    """Response schema for single task."""

    id: UUID
    title: str
    status: str
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Response schema for task list."""

    tasks: List[TaskResponse]

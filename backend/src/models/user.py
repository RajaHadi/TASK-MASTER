"""User model (reference only - managed by Better Auth)."""

from datetime import datetime
from uuid import UUID
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """
    User entity - managed by Better Auth, referenced by backend.

    This model is NOT directly used by the backend API.
    It exists only as a reference for the foreign key relationship.
    User management (signup, login, etc.) is handled by Better Auth.
    """

    __tablename__ = "users"

    id: UUID = Field(primary_key=True)
    email: str = Field(max_length=255, unique=True, nullable=False, index=True)
    hashed_password: str = Field(nullable=False)
    email_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

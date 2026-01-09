# Data Model: Backend API for Multi-User Todo Application

**Feature**: 002-todo-backend
**Date**: 2026-01-06
**Status**: Design Complete

## Overview

This document defines the database schema and data entities for the multi-user Todo application backend. The schema enforces user isolation, supports JWT-based authentication, and maintains data integrity through foreign key constraints.

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
│  (Better Auth)      │
├─────────────────────┤
│ id: UUID (PK)       │
│ email: String(255)  │
│ email_verified: Bool│
│ created_at: DateTime│
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│       Task          │
├─────────────────────┤
│ id: UUID (PK)       │
│ title: String(500)  │
│ status: Enum        │
│ user_id: UUID (FK)  │
│ created_at: DateTime│
│ updated_at: DateTime│
└─────────────────────┘
```

**Relationships**:
- One User has many Tasks (1:N)
- One Task belongs to exactly one User (N:1)
- Cascading delete: Deleting a User deletes all their Tasks

---

## Entities

### User (Reference Model)

**Purpose**: Represents an authenticated user account (managed by Better Auth)

**Note**: This entity is NOT created or managed by the backend API. It is maintained by Better Auth's authentication system. The backend only references this table via foreign key relationships.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique identifier for the user |
| `email` | String(255) | UNIQUE, NOT NULL | User's email address (used for login) |
| `email_verified` | Boolean | DEFAULT FALSE | Whether email has been confirmed |
| `created_at` | DateTime (with TZ) | NOT NULL, AUTO-SET | Timestamp when user account was created |

**Indexes**:
- Primary key index on `id` (automatic)
- Unique index on `email` (enforced by constraint)

**Validation Rules**:
- Email must match valid email format
- Email is case-insensitive (normalized to lowercase)

**Business Rules**:
- Users cannot be deleted via this API (managed by Better Auth)
- User ID is extracted from JWT token claims (`sub` claim)
- Backend never directly queries or modifies User table

---

### Task (Core Model)

**Purpose**: Represents a single todo item owned by a user

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL, AUTO-GENERATE | Unique identifier for the task |
| `title` | String(500) | NOT NULL, CHECK(length >= 1) | Task description/title |
| `status` | Enum | NOT NULL, DEFAULT 'pending' | Current task status |
| `user_id` | UUID | FOREIGN KEY(users.id), NOT NULL, INDEX | Owner of this task |
| `created_at` | DateTime (with TZ) | NOT NULL, AUTO-SET | Timestamp when task was created |
| `updated_at` | DateTime (with TZ) | NOT NULL, AUTO-UPDATE | Timestamp when task was last modified |

**Enum Values for `status`**:
- `pending`: Task is not yet completed (default)
- `completed`: Task has been marked as done

**Indexes**:
- Primary key index on `id` (automatic)
- Index on `user_id` (critical for filtering tasks by owner)
- Optional: Index on `status` (future optimization for filtering)

**Foreign Key Constraints**:
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE
  - If user is deleted, all their tasks are automatically removed

**Validation Rules**:
- `title`: Must be 1-500 characters after trimming whitespace
- `title`: Cannot be empty string or only whitespace
- `status`: Must be one of the defined enum values
- `user_id`: Must reference an existing user (enforced by FK)

**Business Rules**:
- New tasks automatically get `status = 'pending'`
- `created_at` is immutable after creation
- `updated_at` is automatically updated on any modification
- Task ownership cannot be transferred (user_id is immutable after creation)
- Tasks can only be accessed by their owner (enforced in API layer)

---

## SQLModel Implementation

### Task Model Definition

```python
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from enum import Enum as PyEnum
from uuid import UUID, uuid4
from typing import Optional

class TaskStatus(str, PyEnum):
    PENDING = "pending"
    COMPLETED = "completed"

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True, nullable=False)
    title: str = Field(max_length=500, nullable=False)
    status: TaskStatus = Field(default=TaskStatus.PENDING, nullable=False)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, sa_column_kwargs={"onupdate": datetime.utcnow})

    # Validation
    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        if len(v) > 500:
            raise ValueError('Title cannot exceed 500 characters')
        return v.strip()
```

### User Model Reference (Not Used Directly)

```python
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(primary_key=True)
    email: str = Field(max_length=255, unique=True, nullable=False)
    email_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship (for reference only - not queried by backend)
    # tasks: List["Task"] = Relationship(back_populates="user", cascade_delete=True)
```

---

## Pydantic Request/Response Models

### Task Request Models

```python
from pydantic import BaseModel, Field, validator
from typing import Literal

class TaskCreate(BaseModel):
    """Request model for creating a new task"""
    title: str = Field(..., min_length=1, max_length=500, description="Task title")

    @validator('title')
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()

class TaskUpdate(BaseModel):
    """Request model for updating task details (PUT)"""
    title: str = Field(..., min_length=1, max_length=500, description="Updated task title")

    @validator('title')
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()

class TaskPatch(BaseModel):
    """Request model for partial task updates (PATCH)"""
    status: Literal["pending", "completed"] = Field(..., description="Task status")
```

### Task Response Models

```python
from datetime import datetime
from uuid import UUID

class TaskResponse(BaseModel):
    """Response model for single task"""
    id: UUID
    title: str
    status: str
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows creation from ORM models

class TaskListResponse(BaseModel):
    """Response model for task list"""
    tasks: list[TaskResponse]
```

---

## Database Migrations

### Initial Migration (Alembic)

```sql
-- Migration: Create tasks table
-- Revision: 001_create_tasks_table
-- Date: 2026-01-06

-- Create enum type for task status
CREATE TYPE task_status AS ENUM ('pending', 'completed');

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL CHECK (length(trim(title)) >= 1),
    status task_status NOT NULL DEFAULT 'pending',
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for filtering tasks by user
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Optional: Create index for future status filtering
CREATE INDEX idx_tasks_status ON tasks(status);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Assumptions**:
- `users` table already exists (created by Better Auth)
- PostgreSQL `gen_random_uuid()` function is available (standard in PostgreSQL 13+)

---

## Query Patterns

### Common Queries (All Filtered by User)

**Get All Tasks for User**:
```python
tasks = session.exec(
    select(Task).where(Task.user_id == current_user_id).order_by(Task.created_at.desc())
).all()
```

**Get Single Task with Ownership Check**:
```python
task = session.exec(
    select(Task).where(Task.id == task_id, Task.user_id == current_user_id)
).first()
if not task:
    raise HTTPException(status_code=404, detail="Task not found")
```

**Create Task**:
```python
task = Task(
    title=task_data.title,
    user_id=current_user_id,
    status=TaskStatus.PENDING
)
session.add(task)
session.commit()
session.refresh(task)
```

**Update Task (with Ownership Check)**:
```python
task = session.exec(
    select(Task).where(Task.id == task_id, Task.user_id == current_user_id)
).first()
if not task:
    raise HTTPException(status_code=404, detail="Task not found")

task.title = task_data.title
session.add(task)
session.commit()
session.refresh(task)
```

**Delete Task (with Ownership Check)**:
```python
task = session.exec(
    select(Task).where(Task.id == task_id, Task.user_id == current_user_id)
).first()
if not task:
    raise HTTPException(status_code=404, detail="Task not found")

session.delete(task)
session.commit()
```

---

## Security Considerations

### User Isolation Enforcement

**Critical Pattern**: EVERY query MUST filter by `user_id` from JWT token

```python
# ❌ WRONG - Security vulnerability
tasks = session.exec(select(Task).where(Task.id == task_id)).all()

# ✅ CORRECT - User isolation enforced
tasks = session.exec(
    select(Task).where(Task.id == task_id, Task.user_id == current_user_id)
).all()
```

**Why This Matters**:
- Without `user_id` filter, users could access others' tasks by guessing IDs
- UUIDs make guessing harder but don't prevent enumeration attacks
- Defense-in-depth: Filter by user at query level, not just authorization layer

### SQL Injection Prevention

**SQLModel Protection**:
- All queries use parameterized statements (automatic with SQLModel)
- ORM prevents raw SQL injection vectors
- Pydantic validation sanitizes inputs before reaching database

**Example** (automatically safe):
```python
# User input is safely parameterized by SQLModel
task_id = "'; DROP TABLE tasks; --"  # Malicious input
task = session.exec(
    select(Task).where(Task.id == task_id)  # Safe: treated as literal UUID value
).first()
```

---

## Performance Considerations

### Index Strategy

**Primary Indexes** (must have):
- `tasks.id` (primary key - automatic)
- `tasks.user_id` (foreign key - critical for filtering)

**Optional Indexes** (future optimization):
- `tasks.status` (if filtering by status becomes common)
- `tasks.created_at` (if ordering/pagination is added)

### Query Optimization

**Current Scale** (Phase II):
- Expected: <10,000 total tasks across all users
- Expected: <100 tasks per user on average
- Performance target: <100ms for task list queries

**Optimization Strategy**:
- Index on `user_id` ensures fast filtering (O(log n) lookup)
- No pagination needed for Phase II scale
- Ordering by `created_at DESC` uses sequential scan (acceptable at this scale)

**Future Optimizations** (Phase III):
- Add pagination for users with 1000+ tasks
- Add compound index `(user_id, created_at)` for sorted pagination
- Consider materialized view for aggregate queries

---

## Data Integrity Rules

### Immutability Constraints

**Immutable Fields** (cannot change after creation):
- `id`: Auto-generated, never modified
- `user_id`: Set on creation, prevents task ownership transfer
- `created_at`: Set on creation, audit trail

**Mutable Fields**:
- `title`: Can be updated via PUT endpoint
- `status`: Can be updated via PATCH endpoint
- `updated_at`: Auto-updated on any modification

### Referential Integrity

**Foreign Key Cascade**:
- Deleting a user cascades to delete all their tasks
- Prevents orphaned tasks in database
- Handled automatically by database constraint

**Validation Timing**:
- Pydantic validates request payloads (API layer)
- SQLModel validates before insert/update (ORM layer)
- PostgreSQL enforces constraints (database layer)
- Defense-in-depth: Three layers of validation

---

## Testing Data Model

### Test Database Setup

```python
# Use SQLite in-memory for fast tests
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL)

# Create tables before tests
SQLModel.metadata.create_all(engine)

# Sample test data
test_user_id = uuid4()
test_task = Task(
    title="Test task",
    user_id=test_user_id,
    status=TaskStatus.PENDING
)
```

### Test Cases for Data Model

1. **Task Creation**: Verify default values (status='pending', timestamps set)
2. **Title Validation**: Reject empty titles, titles >500 chars
3. **Status Enum**: Reject invalid status values
4. **Foreign Key**: Reject tasks with non-existent user_id
5. **Cascading Delete**: Verify tasks deleted when user is deleted
6. **Updated Timestamp**: Verify updated_at changes on modification
7. **User Isolation**: Verify queries only return user's own tasks

---

## Migration Strategy

### Development Workflow

1. **Define Models**: Update SQLModel classes in `backend/src/models/task.py`
2. **Generate Migration**: `alembic revision --autogenerate -m "description"`
3. **Review Migration**: Manually inspect generated SQL
4. **Test Migration**: Apply to test database
5. **Apply Migration**: `alembic upgrade head`
6. **Rollback Plan**: `alembic downgrade -1` if issues occur

### Migration Files Location

```
backend/
└── alembic/
    ├── versions/
    │   └── 001_create_tasks_table.py
    ├── env.py
    └── alembic.ini
```

---

## Summary

**Entities**: 2 (User reference, Task core model)
**Relationships**: 1 (User 1:N Task)
**Indexes**: 2 required (id, user_id)
**Constraints**: 6 (PK, FK, NOT NULL, CHECK, DEFAULT, ENUM)
**Security**: User isolation enforced at query level
**Performance**: Optimized for <10K tasks total, <100 per user

**Ready for**: API contract generation (Phase 1 next step)

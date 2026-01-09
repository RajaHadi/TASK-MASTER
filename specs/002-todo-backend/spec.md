# Feature Specification: Backend API for Multi-User Todo Application

**Feature Branch**: `002-todo-backend`
**Created**: 2026-01-06
**Status**: Draft
**Input**: User description: "Backend – Phase II Todo Full-Stack Web Application - Backend service for a multi-user Todo web application that exposes a secure REST API, persists data in Neon Serverless PostgreSQL, and enforces user isolation using JWT authentication issued by Better Auth."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Personal Task List (Priority: P1)

As an authenticated user, I want to see all my tasks so that I can review what I need to accomplish.

**Why this priority**: Core functionality - users must be able to view their tasks to derive any value from the application. This is the foundation that all other features build upon.

**Independent Test**: Can be fully tested by authenticating a user, creating tasks via backend, and calling GET /api/tasks. Delivers immediate value by showing user their task list.

**Acceptance Scenarios**:

1. **Given** a user is authenticated with a valid JWT token, **When** they request GET /api/tasks, **Then** the system returns a list of only their tasks with 200 status
2. **Given** a user is authenticated and has no tasks, **When** they request GET /api/tasks, **Then** the system returns an empty list with 200 status
3. **Given** a user has 5 tasks, **When** they request GET /api/tasks, **Then** the system returns exactly 5 tasks, all owned by that user
4. **Given** a request is made without authentication, **When** GET /api/tasks is called, **Then** the system returns 401 Unauthorized

---

### User Story 2 - Create New Task (Priority: P1)

As an authenticated user, I want to create new tasks so that I can track things I need to do.

**Why this priority**: Critical for MVP - without task creation, users cannot add data to the system. This is essential for any functional todo application.

**Independent Test**: Can be tested by authenticating a user and calling POST /api/tasks with a task title. Delivers value by allowing users to populate their task list.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** they POST /api/tasks with a valid task title, **Then** a new task is created with status "pending" and returns 201 status
2. **Given** a user is authenticated, **When** they create a task, **Then** the task is automatically associated with their user ID
3. **Given** a user creates a task, **When** they retrieve their task list, **Then** the new task appears in the list
4. **Given** a request is made without authentication, **When** POST /api/tasks is called, **Then** the system returns 401 Unauthorized
5. **Given** a user submits a task without a title, **When** POST /api/tasks is called, **Then** the system returns 400 Bad Request with validation error

---

### User Story 3 - Mark Task as Complete (Priority: P1)

As an authenticated user, I want to mark tasks as complete so that I can track my progress.

**Why this priority**: Core functionality - completing tasks is fundamental to task management. Without this, users cannot track progress on their todos.

**Independent Test**: Can be tested by creating a task and calling PATCH /api/tasks/:id with status "completed". Delivers value by allowing users to track completion.

**Acceptance Scenarios**:

1. **Given** a user owns a task with status "pending", **When** they PATCH /api/tasks/:id with status "completed", **Then** the task status updates and returns 200 status
2. **Given** a user owns a task with status "completed", **When** they PATCH /api/tasks/:id with status "pending", **Then** the task status updates back to pending
3. **Given** a user tries to update another user's task, **When** PATCH /api/tasks/:id is called, **Then** the system returns 403 Forbidden
4. **Given** a task ID doesn't exist, **When** PATCH /api/tasks/:id is called, **Then** the system returns 404 Not Found
5. **Given** a request is made without authentication, **When** PATCH /api/tasks/:id is called, **Then** the system returns 401 Unauthorized

---

### User Story 4 - Update Task Details (Priority: P2)

As an authenticated user, I want to update task details so that I can modify task information as needs change.

**Why this priority**: Important for usability - users need to correct typos or update task details. While not essential for MVP, it significantly improves user experience.

**Independent Test**: Can be tested by creating a task and calling PUT /api/tasks/:id with updated data. Delivers value by allowing task modifications.

**Acceptance Scenarios**:

1. **Given** a user owns a task, **When** they PUT /api/tasks/:id with updated title, **Then** the task title updates and returns 200 status
2. **Given** a user tries to update another user's task, **When** PUT /api/tasks/:id is called, **Then** the system returns 403 Forbidden
3. **Given** a task ID doesn't exist, **When** PUT /api/tasks/:id is called, **Then** the system returns 404 Not Found
4. **Given** a request is made without authentication, **When** PUT /api/tasks/:id is called, **Then** the system returns 401 Unauthorized

---

### User Story 5 - Delete Task (Priority: P2)

As an authenticated user, I want to delete tasks so that I can remove tasks I no longer need.

**Why this priority**: Important for maintenance - users need to clean up their task list. Essential for long-term usability but not critical for initial MVP.

**Independent Test**: Can be tested by creating a task and calling DELETE /api/tasks/:id. Delivers value by allowing users to maintain a clean task list.

**Acceptance Scenarios**:

1. **Given** a user owns a task, **When** they DELETE /api/tasks/:id, **Then** the task is permanently removed and returns 200 status
2. **Given** a user tries to delete another user's task, **When** DELETE /api/tasks/:id is called, **Then** the system returns 403 Forbidden
3. **Given** a task ID doesn't exist, **When** DELETE /api/tasks/:id is called, **Then** the system returns 404 Not Found
4. **Given** a task is deleted, **When** the user retrieves their task list, **Then** the deleted task does not appear
5. **Given** a request is made without authentication, **When** DELETE /api/tasks/:id is called, **Then** the system returns 401 Unauthorized

---

### User Story 6 - Retrieve Single Task (Priority: P3)

As an authenticated user, I want to retrieve a specific task by ID so that I can view detailed information about one task.

**Why this priority**: Nice-to-have - useful for frontend detail views but not essential since task list provides all data. Can be deferred if time-constrained.

**Independent Test**: Can be tested by creating a task and calling GET /api/tasks/:id. Delivers value for detail-view scenarios.

**Acceptance Scenarios**:

1. **Given** a user owns a task, **When** they GET /api/tasks/:id, **Then** the system returns the task details with 200 status
2. **Given** a user tries to access another user's task, **When** GET /api/tasks/:id is called, **Then** the system returns 403 Forbidden
3. **Given** a task ID doesn't exist, **When** GET /api/tasks/:id is called, **Then** the system returns 404 Not Found
4. **Given** a request is made without authentication, **When** GET /api/tasks/:id is called, **Then** the system returns 401 Unauthorized

---

### Edge Cases

- What happens when a JWT token expires during a request? System must return 401 Unauthorized with clear error message.
- How does the system handle concurrent updates to the same task? Last-write-wins pattern with database transaction isolation.
- What happens if the database connection fails? System must return 503 Service Unavailable and log the error.
- How does the system handle extremely long task titles? Task title must be limited to 500 characters maximum.
- What happens when a user tries to create tasks without providing required fields? System returns 400 Bad Request with specific validation errors.
- How does the system handle malformed JWT tokens? System returns 401 Unauthorized with error indicating invalid token format.
- What happens if the same task is deleted twice? Second delete returns 404 Not Found.
- How does the system handle SQL injection attempts? SQLModel ORM prevents SQL injection through parameterized queries.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose REST API endpoints under `/api` base path
- **FR-002**: System MUST verify JWT tokens on every API request using shared `BETTER_AUTH_SECRET`
- **FR-003**: System MUST extract user identity (user_id, email) from JWT payload claims
- **FR-004**: System MUST reject requests without valid JWT token with 401 Unauthorized status
- **FR-005**: System MUST reject requests with expired or invalid JWT tokens with 401 Unauthorized status
- **FR-006**: System MUST reject requests where authenticated user attempts to access another user's tasks with 403 Forbidden status
- **FR-007**: System MUST persist all task data in Neon Serverless PostgreSQL database
- **FR-008**: System MUST filter all task queries by authenticated user's user_id
- **FR-009**: System MUST support GET /api/tasks endpoint to retrieve all tasks for authenticated user
- **FR-010**: System MUST support POST /api/tasks endpoint to create new tasks for authenticated user
- **FR-011**: System MUST support GET /api/tasks/:id endpoint to retrieve a specific task by ID
- **FR-012**: System MUST support PUT /api/tasks/:id endpoint to update task details
- **FR-013**: System MUST support PATCH /api/tasks/:id endpoint to update task status (pending/completed)
- **FR-014**: System MUST support DELETE /api/tasks/:id endpoint to permanently delete tasks
- **FR-015**: System MUST validate task ownership before allowing any update or delete operation
- **FR-016**: System MUST return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- **FR-017**: System MUST validate request payloads and return 400 Bad Request for invalid data
- **FR-018**: System MUST return structured JSON error responses with error messages
- **FR-019**: System MUST automatically set task status to "pending" when creating new tasks
- **FR-020**: System MUST automatically associate tasks with authenticated user's user_id
- **FR-021**: System MUST enforce maximum task title length of 500 characters
- **FR-022**: System MUST use SQLModel as the ORM for database operations
- **FR-023**: System MUST use environment variables for database URL and secret key configuration
- **FR-024**: System MUST log all authentication failures for security monitoring
- **FR-025**: System MUST handle database connection failures gracefully with 503 Service Unavailable

### Key Entities *(include if feature involves data)*

- **Task**: Represents a todo item with the following attributes:
  - Unique identifier (id)
  - Task title (string, max 500 characters)
  - Status (enumeration: "pending" or "completed")
  - Owner reference (user_id - foreign key to user)
  - Timestamps (created_at, updated_at for audit trail)
  - Relationships: Each task belongs to exactly one user

- **User**: Represents an authenticated user (managed by Better Auth):
  - Unique identifier (id)
  - Email address (unique)
  - Email verification status
  - Timestamps (created_at)
  - Relationships: Each user can have multiple tasks

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 5 core CRUD operations (Create, Read, Update, Delete, List) are functional and accessible via REST API
- **SC-002**: 100% of API endpoints enforce JWT authentication - zero endpoints accessible without valid token
- **SC-003**: User isolation is complete - authenticated users can only access their own tasks, never another user's tasks
- **SC-004**: API responses return within 500ms for 95% of requests under normal load
- **SC-005**: System handles at least 100 concurrent authenticated requests without errors
- **SC-006**: JWT token verification succeeds for valid tokens issued by Better Auth frontend
- **SC-007**: All task data persists correctly in PostgreSQL database and survives server restarts
- **SC-008**: API returns correct HTTP status codes for all success and error scenarios
- **SC-009**: Zero SQL injection vulnerabilities - all database queries use parameterized statements
- **SC-010**: Backend is stateless - no session storage required, all authentication via JWT
- **SC-011**: Frontend integration succeeds - frontend can successfully call all backend endpoints
- **SC-012**: Manual testing confirms all user stories pass their acceptance scenarios

### Assumptions

- Better Auth frontend is already implemented and issuing valid JWT tokens with user_id and email claims
- `BETTER_AUTH_SECRET` environment variable is identical between frontend and backend
- Neon Serverless PostgreSQL database is provisioned and accessible
- JWT tokens contain standard claims: `sub` (user_id), `email`, `exp` (expiration)
- Python 3.13+ runtime environment is available
- Task status is limited to two values: "pending" and "completed"
- Task updates are non-partial for PUT (full replacement), partial for PATCH (status only)
- Database connection string is provided via `DATABASE_URL` environment variable
- No rate limiting or API throttling is required in Phase II
- CORS configuration allows requests from frontend origin

### Out of Scope

- User authentication endpoints (handled by Better Auth)
- User registration and password management
- Role-based access control (RBAC) or admin privileges
- Task sharing or collaboration features
- Task prioritization, tags, or categories
- Task due dates or reminders
- File attachments or task descriptions
- Search or filtering capabilities
- Pagination for task lists
- WebSocket or real-time updates
- Background jobs or task scheduling
- Admin dashboard or analytics
- AI or chatbot integrations
- Email notifications
- API versioning strategy
- Rate limiting or abuse prevention
- Database migrations tooling
- Automated testing infrastructure

# Tasks: Backend API for Multi-User Todo Application

**Input**: Design documents from `/specs/002-todo-backend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Integration tests included for security-critical authentication and user isolation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend/ directory structure: src/, tests/, alembic/
- [ ] T002 Create requirements.txt with dependencies: fastapi>=0.109.0, sqlmodel>=0.0.14, python-jose[cryptography]>=3.3.0, psycopg2-binary>=2.9.9, uvicorn>=0.25.0, python-dotenv>=1.0.0, pydantic>=2.0.0
- [ ] T003 [P] Create .env.example with DATABASE_URL, SECRET_KEY, CORS_ORIGINS, ENVIRONMENT, LOG_LEVEL
- [ ] T004 [P] Create .gitignore for backend/ with .env, venv/, __pycache__/, *.pyc
- [ ] T005 [P] Create README.md in backend/ referencing specs/002-todo-backend/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create backend/src/config.py to load environment variables (DATABASE_URL, SECRET_KEY, CORS_ORIGINS, ENVIRONMENT, LOG_LEVEL)
- [ ] T007 [P] Create backend/src/db/session.py with SQLModel engine initialization and get_session() dependency (pool_size=5, max_overflow=10, pool_pre_ping=True)
- [ ] T008 [P] Create backend/src/auth/jwt.py with get_current_user() dependency function (JWT verification using python-jose, HS256 algorithm)
- [ ] T009 Create backend/src/main.py with FastAPI app initialization, CORS middleware configuration, and startup/shutdown events
- [ ] T010 [P] Create backend/src/api/health.py with GET /health endpoint (no authentication required)
- [ ] T011 [P] Setup logging configuration in backend/src/main.py (JSON format, INFO level, security event tracking)
- [ ] T012 Create backend/src/models/user.py with User SQLModel reference (id, email, email_verified, created_at - not directly used, managed by Better Auth)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Personal Task List (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can retrieve a list of all their tasks via GET /api/tasks

**Independent Test**:
1. Obtain JWT token from frontend (signup/login)
2. Send GET request to /api/tasks with Authorization header
3. Verify response contains only current user's tasks
4. Verify 401 response when token is missing/invalid

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Create tests/test_auth.py with integration test for JWT verification (401 when missing token, 401 when invalid token, 200 when valid token)
- [ ] T014 [P] [US1] Create tests/test_tasks_list.py with integration test for GET /api/tasks (empty list for new user, filtered by user_id, no cross-user access)

### Implementation for User Story 1

- [ ] T015 [US1] Create backend/src/models/task.py with Task SQLModel (id, title, status, user_id, created_at, updated_at) and TaskStatus enum
- [ ] T016 [US1] Add Pydantic response schemas in backend/src/models/task.py: TaskResponse, TaskListResponse
- [ ] T017 [US1] Create backend/src/api/tasks.py with GET /api/tasks endpoint (requires authentication, filters by user_id from JWT, orders by created_at DESC)
- [ ] T018 [US1] Register tasks router in backend/src/main.py with /api prefix
- [ ] T019 [US1] Add standardized error handling for 401 Unauthorized (missing token, invalid token) in backend/src/api/tasks.py
- [ ] T020 [US1] Add security logging for authentication failures in backend/src/auth/jwt.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Create New Task (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can create a new task via POST /api/tasks

**Independent Test**:
1. Obtain JWT token from frontend
2. Send POST request to /api/tasks with {"title": "Test task"}
3. Verify response contains created task with status="pending" and correct user_id
4. Verify 400 response when title is missing or invalid
5. Verify GET /api/tasks now returns the created task

### Tests for User Story 2

- [ ] T021 [P] [US2] Create tests/test_tasks_create.py with integration tests for POST /api/tasks (201 success, 400 validation errors, auto-set status=pending, correct user_id from JWT)

### Implementation for User Story 2

- [ ] T022 [US2] Add Pydantic request schema in backend/src/models/task.py: TaskCreate (title with min_length=1, max_length=500, custom validator for whitespace)
- [ ] T023 [US2] Implement POST /api/tasks endpoint in backend/src/api/tasks.py (requires authentication, extracts user_id from JWT, validates title, sets status=pending, returns 201)
- [ ] T024 [US2] Add validation error handling for 400 Bad Request (empty title, title >500 chars, missing field) in backend/src/api/tasks.py
- [ ] T025 [US2] Add database error handling for 503 Service Unavailable (connection failures) in backend/src/api/tasks.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Mark Task as Complete (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can update task status via PATCH /api/tasks/{id}

**Independent Test**:
1. Create a task via POST /api/tasks
2. Send PATCH request to /api/tasks/{task_id} with {"status": "completed"}
3. Verify response shows status="completed" and updated_at changed
4. Verify GET /api/tasks shows updated task
5. Verify 404 when task doesn't exist or belongs to another user
6. Verify 400 when status value is invalid

### Tests for User Story 3

- [ ] T026 [P] [US3] Create tests/test_tasks_patch.py with integration tests for PATCH /api/tasks/{id} (200 success, 400 invalid status, 404 not found, 403 wrong user, updated_at changes)

### Implementation for User Story 3

- [ ] T027 [US3] Add Pydantic request schema in backend/src/models/task.py: TaskPatch (status with Literal["pending", "completed"])
- [ ] T028 [US3] Implement PATCH /api/tasks/{id} endpoint in backend/src/api/tasks.py (requires authentication, ownership check via user_id, updates status only, updates updated_at timestamp)
- [ ] T029 [US3] Add ownership error handling for 403 Forbidden (valid token but wrong user) in backend/src/api/tasks.py
- [ ] T030 [US3] Add not found error handling for 404 Not Found (task doesn't exist or belongs to another user) in backend/src/api/tasks.py

**Checkpoint**: At this point, User Stories 1, 2, AND 3 (MVP core) should be fully functional

---

## Phase 6: User Story 4 - Update Task Details (Priority: P2)

**Goal**: Authenticated users can update task title via PUT /api/tasks/{id}

**Independent Test**:
1. Create a task via POST /api/tasks
2. Send PUT request to /api/tasks/{task_id} with {"title": "Updated title"}
3. Verify response shows new title and updated_at changed
4. Verify status remains unchanged
5. Verify 400 when title is invalid
6. Verify 404 when task doesn't exist or belongs to another user

### Tests for User Story 4

- [ ] T031 [P] [US4] Create tests/test_tasks_update.py with integration tests for PUT /api/tasks/{id} (200 success, 400 validation errors, 404 not found, 403 wrong user, status unchanged)

### Implementation for User Story 4

- [ ] T032 [US4] Add Pydantic request schema in backend/src/models/task.py: TaskUpdate (title with min_length=1, max_length=500, custom validator)
- [ ] T033 [US4] Implement PUT /api/tasks/{id} endpoint in backend/src/api/tasks.py (requires authentication, ownership check, updates title only, preserves status, updates updated_at)
- [ ] T034 [US4] Add validation to ensure PUT doesn't modify status field in backend/src/api/tasks.py

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Delete Task (Priority: P2)

**Goal**: Authenticated users can permanently delete a task via DELETE /api/tasks/{id}

**Independent Test**:
1. Create a task via POST /api/tasks
2. Send DELETE request to /api/tasks/{task_id}
3. Verify response returns 200 with success message
4. Verify GET /api/tasks no longer includes deleted task
5. Verify subsequent DELETE returns 404
6. Verify 404 when trying to delete another user's task

### Tests for User Story 5

- [ ] T035 [P] [US5] Create tests/test_tasks_delete.py with integration tests for DELETE /api/tasks/{id} (200 success, 404 not found, 403 wrong user, hard delete confirmed)

### Implementation for User Story 5

- [ ] T036 [US5] Implement DELETE /api/tasks/{id} endpoint in backend/src/api/tasks.py (requires authentication, ownership check, hard delete from database, returns success message)
- [ ] T037 [US5] Add delete confirmation logging for audit trail in backend/src/api/tasks.py

**Checkpoint**: At this point, User Stories 1-5 should all work independently

---

## Phase 8: User Story 6 - Retrieve Single Task (Priority: P3)

**Goal**: Authenticated users can retrieve a specific task by ID via GET /api/tasks/{id}

**Independent Test**:
1. Create a task via POST /api/tasks
2. Send GET request to /api/tasks/{task_id}
3. Verify response returns the correct task
4. Verify 404 when task doesn't exist or belongs to another user
5. Verify 401 when token is invalid

### Tests for User Story 6

- [ ] T038 [P] [US6] Create tests/test_tasks_get_single.py with integration tests for GET /api/tasks/{id} (200 success, 404 not found, 403 wrong user)

### Implementation for User Story 6

- [ ] T039 [US6] Implement GET /api/tasks/{id} endpoint in backend/src/api/tasks.py (requires authentication, ownership check via user_id filter, returns single TaskResponse)
- [ ] T040 [US6] Add UUID validation error handling for 400 Bad Request (invalid task ID format) in backend/src/api/tasks.py

**Checkpoint**: All user stories (1-6) should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T041 [P] Create database migration script using Alembic in backend/alembic/versions/001_create_tasks_table.py (tasks table with indexes)
- [ ] T042 [P] Add API documentation enhancements in backend/src/main.py (title, description, version, OpenAPI tags)
- [ ] T043 [P] Add startup validation for SECRET_KEY environment variable in backend/src/main.py (fail fast if missing or mismatched)
- [ ] T044 [P] Create tests/conftest.py with pytest fixtures for TestClient, test database, and JWT token generation
- [ ] T045 Add comprehensive error response formatting (consistent JSON structure with code, message, details) in backend/src/main.py exception handlers
- [ ] T046 [P] Add request/response logging middleware for debugging in backend/src/main.py
- [ ] T047 Validate quickstart.md instructions (manual run through setup steps, test all curl commands)
- [ ] T048 [P] Add security headers middleware (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection) in backend/src/main.py
- [ ] T049 Performance optimization: verify connection pooling working correctly and index on user_id is used
- [ ] T050 [P] Final integration test: run all user stories end-to-end with multiple users to verify isolation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P1 → P2 → P2 → P3)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 and US2 (needs tasks to exist) but independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 and US2 but independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 and US2 but independently testable
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1 and US2 but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before endpoints
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004, T005)
- All Foundational tasks marked [P] can run in parallel (T007, T008, T010, T011)
- Once Foundational phase completes, User Stories 1, 2, 3, 4, 5, 6 can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Polish tasks marked [P] can run in parallel (T041, T042, T043, T044, T046, T048, T050)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T013: "Integration test for JWT verification in tests/test_auth.py"
Task T014: "Integration test for GET /api/tasks in tests/test_tasks_list.py"

# These tasks can run in parallel since they create different test files
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only - All P1)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T012) - CRITICAL
3. Complete Phase 3: User Story 1 (T013-T020) - View tasks
4. Complete Phase 4: User Story 2 (T021-T025) - Create tasks
5. Complete Phase 5: User Story 3 (T026-T030) - Mark complete
6. **STOP and VALIDATE**: Test all three MVP stories work together
7. Deploy/demo MVP

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (View only)
3. Add User Story 2 → Test independently → Deploy/Demo (View + Create)
4. Add User Story 3 → Test independently → Deploy/Demo (View + Create + Complete = MVP!)
5. Add User Story 4 → Test independently → Deploy/Demo (+ Edit)
6. Add User Story 5 → Test independently → Deploy/Demo (+ Delete)
7. Add User Story 6 → Test independently → Deploy/Demo (+ Single view)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T012)
2. Once Foundational is done:
   - Developer A: User Story 1 (T013-T020)
   - Developer B: User Story 2 (T021-T025)
   - Developer C: User Story 3 (T026-T030)
3. Stories complete and integrate independently
4. Continue with User Stories 4, 5, 6 in parallel

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail (Red) before implementing (Green)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Critical security pattern: EVERY database query MUST filter by user_id from JWT token
- All endpoints except /health require Bearer token authentication
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Count Summary

- **Setup**: 5 tasks (T001-T005)
- **Foundational**: 7 tasks (T006-T012)
- **User Story 1**: 8 tasks (T013-T020) - P1 Priority
- **User Story 2**: 5 tasks (T021-T025) - P1 Priority
- **User Story 3**: 5 tasks (T026-T030) - P1 Priority
- **User Story 4**: 4 tasks (T031-T034) - P2 Priority
- **User Story 5**: 3 tasks (T035-T037) - P2 Priority
- **User Story 6**: 3 tasks (T038-T040) - P3 Priority
- **Polish**: 10 tasks (T041-T050)
- **Total**: 50 tasks

**MVP Scope** (P1 stories only): 25 tasks (Setup + Foundational + US1 + US2 + US3)
**Full Feature Scope**: 50 tasks (all user stories + polish)

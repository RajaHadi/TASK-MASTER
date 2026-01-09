---
id: 005
title: Backend API Implementation Plan
stage: plan
date: 2026-01-06
surface: agent
model: claude-sonnet-4-5
feature: todo-backend
branch: 002-todo-backend
user: user
command: /sp.plan
labels: ["backend", "planning", "architecture", "jwt", "fastapi", "postgresql", "rest-api"]
links:
  spec: specs/002-todo-backend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-todo-backend/plan.md
  - specs/002-todo-backend/research.md
  - specs/002-todo-backend/data-model.md
  - specs/002-todo-backend/contracts/openapi.yaml
  - specs/002-todo-backend/quickstart.md
tests:
  - Constitution Check: ALL PASS (5/5 principles)
  - Design validation: Complete
---

## Prompt

/sp.plan

User triggered planning workflow for Backend API (002-todo-backend) based on specification created in previous step.

## Response snapshot

Executed complete planning workflow with Phase 0 (Research) and Phase 1 (Design) artifacts:

**Phase 0: Research (`research.md`)**

Resolved 8 technical unknowns:
1. **JWT Verification**: Selected `python-jose[cryptography]` for HS256 token validation
2. **Database Schema**: UUID primary keys, foreign key cascades, indexed user_id filtering
3. **Error Handling**: Standardized JSON error format with status code mapping (400/401/403/404/500/503)
4. **CORS Configuration**: Environment-driven with credential support for frontend JWT transmission
5. **Database Connections**: Connection pooling (pool_size=5, max_overflow=10) with pre-ping validation
6. **Logging Strategy**: JSON-formatted logs with security event tracking (FR-024 requirement)
7. **Input Validation**: Pydantic models with custom validators for business logic
8. **Testing Approach**: Integration tests focusing on auth and user isolation (security-critical)

**Architectural Decision Records**:
- AD-001: Stateless Architecture (JWT-only, no session storage)
- AD-002: UUID Primary Keys (security over efficiency)
- AD-003: Single Transaction per Request (ACID guarantees)
- AD-004: Synchronous Database Operations (sufficient for Phase II scale)
- AD-005: No Soft Deletes (hard deletes acceptable per spec)

**Risk Analysis**:
- High Priority: JWT secret mismatch (mitigation: startup validation), database connection exhaustion (mitigation: pooling)
- Medium Priority: CORS misconfiguration (mitigation: env-driven config), migration conflicts (mitigation: manual review)

**Dependencies Justified**: 7 production (FastAPI, SQLModel, python-jose, psycopg2, uvicorn, python-dotenv, pydantic) + 3 development (pytest, httpx, pytest-asyncio)

**Phase 1: Design Artifacts**

Created 4 design documents:

1. **`data-model.md`** (database schema):
   - Task entity: id (UUID PK), title (String 500), status (Enum), user_id (UUID FK, indexed), timestamps
   - User entity: Reference only (managed by Better Auth)
   - Relationships: User 1:N Task with cascade delete
   - Security: Every query filtered by user_id from JWT
   - Validation: Title 1-500 chars, status enum constraint
   - Performance: Index on user_id for fast filtering

2. **`contracts/openapi.yaml`** (API specification):
   - 7 endpoints: GET/POST/PUT/PATCH/DELETE /api/tasks, GET /api/tasks/:id, GET /health
   - All endpoints require BearerAuth except /health
   - Request schemas: TaskCreate, TaskUpdate, TaskPatch with validation rules
   - Response schemas: TaskResponse, TaskListResponse, ErrorResponse
   - Complete examples for all operations
   - Status code mapping for success/error scenarios

3. **`quickstart.md`** (setup guide):
   - Initial setup: venv, dependencies, Neon PostgreSQL
   - Environment configuration: DATABASE_URL, SECRET_KEY (match frontend), CORS_ORIGINS
   - Database setup: SQLModel auto-create or Alembic migrations
   - Running backend: uvicorn dev and production modes
   - Testing API: health check, JWT token extraction, CRUD operations via curl
   - Troubleshooting: Database connection, JWT errors, CORS issues

4. **`plan.md`** (this implementation plan):
   - Constitution Check: ALL PASS (5/5 principles)
   - Technical Context: Python 3.13+, FastAPI 0.109+, SQLModel, Neon PostgreSQL
   - Project Structure: backend/ with src/models, src/api, src/auth, src/db, tests/
   - Phase 0/1 summaries and Phase 2 expectations
   - Testing strategy: Integration tests for auth, isolation, CRUD
   - Deployment considerations: serverless-compatible, environment variables
   - Success criteria review: All 12 criteria addressed in design

**Constitution Check Results**:
- ✅ Principle I: Spec-First Development (specs complete before code)
- ✅ Principle II: Separation of Concerns (backend REST API only, no UI logic)
- ✅ Principle III: Security-by-Default (JWT auth + user isolation on every query)
- ✅ Principle IV: Scalability Mindset (stateless, indexed queries, connection pooling)
- ✅ Principle V: Reproducibility (OpenAPI spec, SQLModel definitions, quickstart guide)

**Project Structure Defined**:
```
backend/src/
├── main.py
├── models/ (task.py, user.py)
├── api/ (tasks.py, health.py)
├── auth/ (jwt.py)
├── db/ (session.py)
└── config.py
```

**Key Design Decisions**:
- Stateless architecture: JWT-only authentication (no session table)
- UUID primary keys: Security over storage efficiency
- User isolation at query level: `WHERE user_id = current_user.id` on every query
- Connection pooling: pool_size=5, max_overflow=10 for performance
- Pydantic validation: Auto 422 responses on invalid input
- JSON error format: Consistent {error: {code, message, details}} structure

## Outcome

- ✅ Impact: Complete architectural plan for secure FastAPI backend with JWT auth and user isolation
- 🧪 Tests: Constitution check passed all 5 principles, 12 success criteria validated
- 📁 Files: plan.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md (5 artifacts)
- 🔁 Next prompts: /sp.tasks for implementation task breakdown, /sp.implement for execution
- 🧠 Reflection: Comprehensive planning with security-first design, all technical unknowns resolved, ready for task generation

## Evaluation notes (flywheel)

- Failure modes observed: None - smooth execution through both research and design phases
- Graders run and results (PASS/FAIL): Constitution Check PASS (5/5 principles), Design validation PASS
- Prompt variant (if applicable): Standard /sp.plan workflow with Phase 0 research + Phase 1 design
- Next experiment (smallest change to try): Execute /sp.tasks to generate implementation breakdown, then /sp.implement

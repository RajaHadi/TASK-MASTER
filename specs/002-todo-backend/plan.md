# Implementation Plan: Backend API for Multi-User Todo Application

**Branch**: `002-todo-backend` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-todo-backend/spec.md`

## Summary

Build a secure, stateless REST API backend for a multi-user Todo application using FastAPI and PostgreSQL. The backend enforces JWT-based authentication, strict user isolation, and provides CRUD operations for task management. All endpoints verify user identity via JWT tokens issued by Better Auth frontend, ensuring users can only access their own data.

**Key Requirements**:
- 6 REST API endpoints (GET, POST, PUT, PATCH, DELETE for tasks)
- JWT token verification using shared secret (BETTER_AUTH_SECRET)
- PostgreSQL persistence via SQLModel ORM
- User isolation on every database query
- Stateless architecture (no session storage)
- CORS support for frontend integration

---

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: FastAPI 0.109+, SQLModel 0.0.14+, python-jose[cryptography] 3.3+, psycopg2-binary
**Storage**: Neon Serverless PostgreSQL (remote), SQLite (test)
**Testing**: pytest 7.4+ with TestClient, pytest-asyncio
**Target Platform**: ASGI server (uvicorn), serverless-compatible
**Project Type**: Web API (backend only)
**Performance Goals**: <500ms p95 latency, 100+ concurrent requests
**Constraints**: Stateless (no session storage), user isolation mandatory on all queries
**Scale/Scope**: <10,000 total tasks, <100 tasks per user, 6 API endpoints

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Spec-First Development

**Compliance**: PASS
- Feature specification complete (`spec.md`)
- All user stories documented with acceptance criteria
- API contracts defined in OpenAPI 3.0 format (`contracts/openapi.yaml`)
- Database schema documented before implementation (`data-model.md`)
- No code written before specifications approved

**Evidence**:
- `specs/002-todo-backend/spec.md` - 223 lines, 6 user stories, 25 functional requirements
- `specs/002-todo-backend/contracts/openapi.yaml` - Complete OpenAPI 3.0 specification
- `specs/002-todo-backend/data-model.md` - Full database schema with SQLModel definitions

### ✅ Principle II: Separation of Concerns

**Compliance**: PASS
- Backend contains zero UI logic (FastAPI REST API only)
- Frontend communicates exclusively via REST endpoints (no direct DB access)
- Database access through SQLModel ORM only (no raw SQL)
- Authentication state managed by Better Auth via JWT tokens
- No cross-layer imports or dependencies

**Evidence**:
- Backend exposes HTTP endpoints only (no frontend dependencies)
- All database operations use SQLModel (documented in data-model.md)
- JWT tokens shared between layers (stateless boundary)
- CORS middleware enforces origin separation

### ✅ Principle III: Security-by-Default

**Compliance**: PASS
- All endpoints require JWT authentication (except `/health`)
- JWT verification using shared secret (`SECRET_KEY` env var)
- User isolation enforced at query level (`WHERE user_id = current_user.id`)
- No cross-user data exposure (403 Forbidden on ownership violations)
- All secrets via environment variables (no hardcoded credentials)

**Evidence**:
- JWT verification in `get_current_user` dependency (research.md section 1)
- All queries filtered by `user_id` (data-model.md query patterns)
- OpenAPI spec documents `BearerAuth` security scheme
- Environment variables documented in quickstart.md

### ✅ Principle IV: Scalability Mindset

**Compliance**: PASS
- Backend is stateless (no session state, JWT-only auth)
- Database queries optimized with indexes (user_id index required)
- No blocking operations (FastAPI async-ready)
- Neon PostgreSQL auto-scales with load
- Connection pooling configured (pool_size=5, max_overflow=10)

**Evidence**:
- Stateless architecture (research.md AD-001)
- Index strategy documented (data-model.md performance section)
- Connection pooling configuration (research.md section 5)
- Async-compatible design (synchronous SQLModel chosen for Phase II simplicity)

### ✅ Principle V: Reproducibility

**Compliance**: PASS
- API behavior matches OpenAPI specification exactly
- Database schema reproducible from SQLModel definitions
- All dependencies locked in `requirements.txt`
- Setup instructions in `quickstart.md`
- Environment requirements documented (Python 3.13+)

**Evidence**:
- `contracts/openapi.yaml` - Complete API specification with examples
- `data-model.md` - SQLModel definitions and migration SQL
- `quickstart.md` - Step-by-step setup guide
- `research.md` - All dependencies justified and versioned

### Technology Stack Compliance

**Required Stack** (per Constitution):
- ✅ Backend: FastAPI (chosen)
- ✅ ORM: SQLModel (chosen)
- ✅ Database: Neon Serverless PostgreSQL (chosen)
- ✅ Auth: Better Auth JWT tokens (integrated)
- ✅ Development: Claude Code workflow (followed)

**No Deviations**: All mandated technologies used as specified.

### Constitution Compliance Summary

**Result**: ✅ **ALL PRINCIPLES SATISFIED**

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-First Development | ✅ PASS | Complete specs before code |
| II. Separation of Concerns | ✅ PASS | Backend REST API only |
| III. Security-by-Default | ✅ PASS | JWT auth + user isolation |
| IV. Scalability Mindset | ✅ PASS | Stateless + indexed queries |
| V. Reproducibility | ✅ PASS | Documented setup + specs |

**No violations requiring justification.**

**Post-Phase 1 Re-Check**: ✅ All principles remain satisfied after design phase.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-todo-backend/
├── spec.md              # Feature specification (input to /sp.plan)
├── plan.md              # This file (output of /sp.plan)
├── research.md          # Phase 0 output - technical decisions
├── data-model.md        # Phase 1 output - database schema
├── quickstart.md        # Phase 1 output - setup guide
├── contracts/           # Phase 1 output - API contracts
│   └── openapi.yaml     # OpenAPI 3.0 specification
└── tasks.md             # Phase 2 output (created by /sp.tasks - NOT by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py              # FastAPI application entry point
│   ├── models/              # SQLModel database models
│   │   ├── __init__.py
│   │   ├── task.py          # Task model and Pydantic schemas
│   │   └── user.py          # User model (reference only)
│   ├── api/                 # API route handlers
│   │   ├── __init__.py
│   │   ├── tasks.py         # Task CRUD endpoints
│   │   └── health.py        # Health check endpoint
│   ├── auth/                # Authentication logic
│   │   ├── __init__.py
│   │   └── jwt.py           # JWT verification dependency
│   ├── db/                  # Database configuration
│   │   ├── __init__.py
│   │   └── session.py       # Database session management
│   └── config.py            # Environment configuration
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   ├── test_auth.py         # Authentication tests
│   ├── test_tasks.py        # Task CRUD tests
│   └── test_isolation.py    # User isolation tests
├── alembic/                 # Database migrations (optional)
│   ├── versions/
│   │   └── 001_create_tasks_table.py
│   ├── env.py
│   └── alembic.ini
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variable template
├── .env                     # Local environment (gitignored)
└── README.md                # Backend-specific setup instructions

frontend/
├── [existing frontend structure]
└── .env.local               # MUST contain matching BETTER_AUTH_SECRET
```

**Structure Decision**: Web application structure (Option 2) selected. Backend and frontend are separate projects with independent deployment capability. Backend exposes REST API consumed by frontend. Clear boundary enforces separation of concerns principle.

**Key Directories**:
- `src/`: Production code organized by function (models, api, auth, db)
- `tests/`: Integration tests focusing on security-critical paths
- `alembic/`: Optional migration tooling (SQLModel can auto-create tables)
- `contracts/`: API specification consumed by frontend development

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected.** This section is empty.

---

## Phase 0: Research Outcomes

**Document**: `research.md` (generated)

### Key Technical Decisions

1. **JWT Verification**: `python-jose[cryptography]` library chosen
   - Supports HS256 algorithm required by Better Auth
   - Integrates with FastAPI dependency injection
   - Handles token expiration automatically

2. **Database Schema**: UUID primary keys, foreign key cascade deletes
   - UUIDs prevent ID enumeration attacks
   - Cascade ensures no orphaned tasks
   - Index on `user_id` optimizes filtering

3. **Error Handling**: Standardized JSON error format
   - Consistent structure: `{error: {code, message, details}}`
   - Status code mapping: 400/401/403/404/500/503
   - Security: No stack traces in production

4. **CORS Configuration**: Environment-driven with credential support
   - `CORS_ORIGINS` env var allows multiple origins
   - `allow_credentials=True` for JWT transmission
   - Explicit method whitelist (least privilege)

5. **Database Connections**: Connection pooling with pre-ping
   - `pool_size=5, max_overflow=10`
   - `pool_pre_ping=True` handles stale connections
   - Neon handles autoscaling at database level

6. **Logging Strategy**: JSON-formatted logs with security events
   - Authentication failures logged (FR-024 requirement)
   - Database errors and exceptions captured
   - Structured format for analysis

7. **Input Validation**: Pydantic models with custom validators
   - Type checking + field constraints (length, enum)
   - Custom validators for business logic
   - Automatic 422 responses on validation errors

8. **Testing Approach**: Integration tests with in-memory database
   - Focus on auth and user isolation (security critical)
   - CRUD operation tests for all endpoints
   - SQLite in-memory for fast execution

### Architectural Decisions (ADRs)

- **AD-001**: Stateless Architecture - JWT-only auth (no session storage)
- **AD-002**: UUID Primary Keys - Security over storage efficiency
- **AD-003**: Single Transaction per Request - Simplicity and ACID guarantees
- **AD-004**: Synchronous Database Operations - Sufficient for Phase II scale
- **AD-005**: No Soft Deletes - Hard deletes acceptable per spec

### Risk Analysis

**High Priority Risks**:
1. JWT secret mismatch (Impact: Critical) - Mitigated with startup validation
2. Database connection exhaustion (Impact: High) - Mitigated with connection pooling

**Medium Priority Risks**:
3. CORS misconfiguration (Impact: Medium) - Mitigated with env-driven config
4. SQLModel migration conflicts (Impact: Medium) - Mitigated with manual review

### Dependencies Justified

| Dependency | Purpose | Alternatives Considered |
|------------|---------|------------------------|
| FastAPI | Core framework | Flask (less async), Django REST (over-engineered) |
| SQLModel | ORM + validation | SQLAlchemy + Pydantic (redundant), Tortoise (less mature) |
| python-jose | JWT verification | PyJWT (fewer features), Authlib (too complex) |
| psycopg2-binary | PostgreSQL driver | asyncpg (async unnecessary), psycopg3 (less stable) |
| uvicorn | ASGI server | gunicorn (WSGI not async), hypercorn (less popular) |

**Total Dependencies**: 7 production + 3 development (pytest, httpx, pytest-asyncio)

---

## Phase 1: Design Artifacts

### Data Model (`data-model.md`)

**Entities**:
- **User** (reference only - managed by Better Auth)
  - `id`: UUID primary key
  - `email`: String(255), unique
  - `email_verified`: Boolean
  - `created_at`: DateTime

- **Task** (core model)
  - `id`: UUID primary key, auto-generated
  - `title`: String(500), NOT NULL, check length >= 1
  - `status`: Enum (pending, completed), default='pending'
  - `user_id`: UUID foreign key to users.id, NOT NULL, indexed
  - `created_at`: DateTime, auto-set
  - `updated_at`: DateTime, auto-update

**Relationships**: User 1:N Task (one user has many tasks)

**Indexes**:
- Primary keys (automatic)
- `tasks.user_id` (critical for user filtering)

**Validation Rules**:
- Title: 1-500 characters after trimming whitespace
- Status: Must be "pending" or "completed"
- User ID: Must reference existing user (FK constraint)

**Security**:
- Every query MUST filter by `user_id` from JWT
- Parameterized queries prevent SQL injection (SQLModel automatic)
- Foreign key cascade prevents orphaned data

### API Contracts (`contracts/openapi.yaml`)

**Endpoints Specified**:

| Method | Path | Auth | Request | Response | Status Codes |
|--------|------|------|---------|----------|--------------|
| GET | `/api/tasks` | Required | None | TaskListResponse | 200, 401 |
| POST | `/api/tasks` | Required | TaskCreate | TaskResponse | 201, 400, 401 |
| GET | `/api/tasks/{id}` | Required | None | TaskResponse | 200, 401, 403, 404 |
| PUT | `/api/tasks/{id}` | Required | TaskUpdate | TaskResponse | 200, 400, 401, 403, 404 |
| PATCH | `/api/tasks/{id}` | Required | TaskPatch | TaskResponse | 200, 400, 401, 403, 404 |
| DELETE | `/api/tasks/{id}` | Required | None | SuccessMessage | 200, 401, 403, 404 |
| GET | `/health` | None | None | HealthStatus | 200 |

**Request Schemas**:
- `TaskCreate`: `{title: string(1-500)}`
- `TaskUpdate`: `{title: string(1-500)}`
- `TaskPatch`: `{status: "pending" | "completed"}`

**Response Schemas**:
- `TaskResponse`: `{id, title, status, user_id, created_at, updated_at}`
- `TaskListResponse`: `{tasks: TaskResponse[]}`
- `ErrorResponse`: `{error: {code, message, details}}`

**Security Scheme**: BearerAuth (JWT in Authorization header)

**Examples**: Complete request/response examples for all endpoints

### Quickstart Guide (`quickstart.md`)

**Sections**:
1. Initial Setup - Clone, venv, dependencies
2. Environment Configuration - .env setup, Neon connection, shared secret
3. Database Setup - Schema initialization, migrations
4. Running the Backend - Development and production modes
5. Testing the API - Health check, authentication flow, CRUD operations
6. Troubleshooting - Common issues and solutions

**Key Information**:
- Environment variables required and purpose
- Step-by-step JWT token extraction from frontend
- curl commands for manual API testing
- Database connection verification steps
- CORS configuration for frontend integration

---

## Implementation Phases (Post-Planning)

### Phase 2: Task Generation (`/sp.tasks` command)

**Not created by `/sp.plan`** - Will be generated by separate `/sp.tasks` command.

**Expected Task Categories**:
1. **Setup Tasks**: Project initialization, dependency installation
2. **Core Infrastructure**: FastAPI app, database connection, config management
3. **Authentication**: JWT verification dependency, error handling
4. **Data Models**: Task and User SQLModel definitions
5. **API Endpoints**: 6 CRUD endpoints with validation
6. **Security**: User isolation enforcement, CORS middleware
7. **Testing**: Authentication, user isolation, and CRUD tests
8. **Documentation**: README, deployment guide

**Estimated Tasks**: 30-40 discrete implementation tasks

---

## Testing Strategy

### Test Coverage Priorities

**Highest Priority** (security-critical):
1. JWT token verification (valid, invalid, expired, missing)
2. User isolation (User A cannot access User B's tasks)
3. Ownership validation on updates/deletes

**High Priority** (functional):
4. Task CRUD operations (create, read, update, delete)
5. Request validation (empty titles, invalid status)
6. Error responses (correct status codes and formats)

**Medium Priority** (edge cases):
7. Concurrent updates (last-write-wins)
8. Database connection failures (503 responses)
9. Long titles (500 character limit)

### Test Environment

**Database**: SQLite in-memory (fast, isolated)
**Auth**: Mocked JWT tokens (bypass real auth)
**Client**: FastAPI TestClient (realistic HTTP simulation)

### Test Execution

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_isolation.py -v
```

**Expected Coverage**: >80% line coverage, 100% security-critical paths

---

## Deployment Considerations

### Environment Variables

**Required**:
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `SECRET_KEY`: JWT signing secret (matches frontend)
- `CORS_ORIGINS`: Allowed frontend origins (comma-separated)

**Optional**:
- `ENVIRONMENT`: development | production
- `LOG_LEVEL`: DEBUG | INFO | WARNING | ERROR

### Deployment Targets

**Development**:
- Local: `uvicorn src.main:app --reload`
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

**Production** (future):
- Vercel (serverless functions)
- AWS Lambda + API Gateway
- Fly.io (Docker containers)
- Heroku (Procfile-based)

### Serverless Compatibility

**Design Decisions Supporting Serverless**:
- Stateless (no session storage)
- Connection pooling (efficient resource usage)
- Fast startup (minimal imports)
- Environment-driven config (no file-based config)
- Neon PostgreSQL (serverless-native database)

---

## Open Questions & Future Work

### Resolved in Phase 0

- ✅ JWT verification library
- ✅ Database schema design
- ✅ Error response format
- ✅ CORS configuration
- ✅ Connection pooling strategy

### Deferred to Phase III (Out of Scope)

- API versioning strategy
- Rate limiting / abuse prevention
- Pagination for large task lists
- Search and filtering capabilities
- Background jobs / async tasks
- Automated testing infrastructure
- JWT token revocation
- Soft delete / task archiving
- Task sharing / collaboration
- Audit logging

---

## Dependencies & Prerequisites

### Python Dependencies

**Production** (`requirements.txt`):
```
fastapi>=0.109.0
sqlmodel>=0.0.14
python-jose[cryptography]>=3.3.0
psycopg2-binary>=2.9.9
uvicorn>=0.25.0
python-dotenv>=1.0.0
pydantic>=2.0.0
```

**Development**:
```
pytest>=7.4.0
pytest-asyncio>=0.21.0
httpx>=0.25.0
pytest-cov>=4.1.0
black>=23.12.0
ruff>=0.1.9
```

### External Dependencies

- **Neon PostgreSQL**: Serverless PostgreSQL database (cloud-hosted)
- **Better Auth Frontend**: Must be running and issuing JWT tokens
- **Shared Secret**: `SECRET_KEY` (backend) = `BETTER_AUTH_SECRET` (frontend)

### Version Requirements

- Python: 3.13+ (mandated by constitution)
- PostgreSQL: 13+ (for `gen_random_uuid()` function)
- Node.js: 20+ (frontend requirement)

---

## Success Criteria Review

**From Specification** (`spec.md` Success Criteria):

✅ **SC-001**: All 5 core CRUD operations functional and accessible via REST API
- Design: 6 endpoints defined in OpenAPI spec (includes GET single task)

✅ **SC-002**: 100% of API endpoints enforce JWT authentication
- Design: All endpoints require `BearerAuth` except `/health`

✅ **SC-003**: User isolation complete - users only access their own tasks
- Design: All queries filter by `user_id` (documented in data-model.md)

✅ **SC-004**: API responses within 500ms for 95% of requests
- Design: Indexed queries, connection pooling configured

✅ **SC-005**: System handles 100+ concurrent requests without errors
- Design: Connection pooling (5 + 10 overflow), FastAPI async-ready

✅ **SC-006**: JWT token verification succeeds for Better Auth tokens
- Design: `python-jose` library, HS256 algorithm support

✅ **SC-007**: Task data persists correctly in PostgreSQL database
- Design: PostgreSQL (Neon), SQLModel ORM, foreign key constraints

✅ **SC-008**: API returns correct HTTP status codes
- Design: Status code mapping documented in error response section

✅ **SC-009**: Zero SQL injection vulnerabilities
- Design: SQLModel parameterized queries (automatic protection)

✅ **SC-010**: Backend is stateless - no session storage required
- Design: JWT-only authentication, no session table

✅ **SC-011**: Frontend integration succeeds
- Design: CORS configured, OpenAPI spec for frontend consumption

✅ **SC-012**: Manual testing confirms all user stories pass
- Design: Quickstart guide includes manual testing steps

**Design Phase**: All 12 success criteria addressed in architecture.

---

## Next Steps

✅ **Phase 0 Complete**: Research findings documented in `research.md`
✅ **Phase 1 Complete**: Design artifacts created:
- `data-model.md` - Database schema and SQLModel definitions
- `contracts/openapi.yaml` - Complete OpenAPI 3.0 specification
- `quickstart.md` - Setup and testing guide

➡️ **Phase 2**: Run `/sp.tasks` to generate implementation task breakdown
➡️ **Phase 3**: Run `/sp.implement` to execute implementation tasks
➡️ **Phase 4**: Integration testing with frontend
➡️ **Phase 5**: Deployment to production environment

---

## References

- **Feature Specification**: `specs/002-todo-backend/spec.md`
- **Constitution**: `.specify/memory/constitution.md`
- **Frontend Integration**: `frontend/BETTER_AUTH_SETUP.md`
- **Frontend Spec**: `specs/001-todo-frontend/spec.md`

---

**Plan Status**: ✅ **COMPLETE** - Ready for task generation
**Created**: 2026-01-06
**Phase**: Design (Phase 1)
**Next Command**: `/sp.tasks`

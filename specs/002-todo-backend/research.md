# Research: Backend API for Multi-User Todo Application

**Feature**: 002-todo-backend
**Date**: 2026-01-06
**Purpose**: Resolve technical unknowns and establish architectural decisions

## Research Areas

### 1. JWT Verification with Better Auth

**Question**: How should FastAPI verify JWT tokens issued by Better Auth using a shared secret?

**Research Findings**:

Better Auth issues JWT tokens signed with HS256 (HMAC-SHA256) algorithm using a shared secret. The backend must:
1. Extract token from `Authorization: Bearer <token>` header
2. Decode and verify signature using `python-jose` library
3. Validate standard claims: `sub` (user_id), `email`, `exp` (expiration)
4. Handle token expiration gracefully with 401 responses

**Decision**: Use `python-jose[cryptography]` for JWT verification

**Rationale**:
- Industry standard for JWT handling in Python
- Supports HS256 algorithm required by Better Auth
- Integrates seamlessly with FastAPI dependency injection
- Handles expiration validation automatically
- Well-documented and actively maintained

**Alternatives Considered**:
- PyJWT: More lightweight but lacks some cryptography features
- Authlib: More comprehensive but adds unnecessary complexity for simple JWT verification
- Manual implementation: Error-prone and difficult to test

**Implementation Pattern**:
```python
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, Header

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

### 2. Database Schema with SQLModel

**Question**: How should we structure the database schema for Task and User entities with proper relationships and constraints?

**Research Findings**:

SQLModel combines SQLAlchemy ORM with Pydantic validation, providing:
- Type-safe models with automatic validation
- Seamless FastAPI integration (Pydantic models for request/response)
- Automatic migration generation via Alembic
- Built-in relationship management

**Decision**: Use SQLModel with the following schema structure

**Task Model**:
- `id`: UUID primary key (auto-generated)
- `title`: String(500) with NOT NULL constraint
- `status`: Enum('pending', 'completed') with default 'pending'
- `user_id`: UUID foreign key to users.id with ON DELETE CASCADE
- `created_at`: DateTime with timezone, auto-set on creation
- `updated_at`: DateTime with timezone, auto-update on modification

**User Model** (reference only - managed by Better Auth):
- `id`: UUID primary key
- `email`: String(255), unique, NOT NULL
- `email_verified`: Boolean with default False
- `created_at`: DateTime with timezone

**Indexes**:
- `tasks.user_id` (required for filtering by user)
- `tasks.status` (optional, for future filtering)
- `users.email` (unique constraint doubles as index)

**Rationale**:
- UUID over integer IDs prevents ID guessing attacks
- Cascading delete ensures orphaned tasks are cleaned up
- Timestamps provide audit trail
- Enum constraint prevents invalid status values
- Index on user_id optimizes the most common query pattern

**Alternatives Considered**:
- Integer IDs: More compact but vulnerable to enumeration attacks
- Soft deletes: Adds complexity without clear benefit for Phase II
- Additional status values: Deferred to Phase III per spec requirements

---

### 3. API Error Handling Strategy

**Question**: What is the best pattern for consistent error responses across all endpoints?

**Research Findings**:

FastAPI provides built-in exception handling with `HTTPException` and custom exception handlers. Best practices for REST APIs:
- Consistent JSON error structure
- Appropriate HTTP status codes
- Descriptive error messages without exposing internals
- Distinction between client errors (4xx) and server errors (5xx)

**Decision**: Implement standardized error response format

**Error Response Schema**:
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Authentication token is invalid or expired",
    "details": null
  }
}
```

**Status Code Mapping**:
- 400: Bad Request - validation errors, missing required fields
- 401: Unauthorized - missing or invalid JWT token
- 403: Forbidden - valid token but insufficient permissions (wrong user)
- 404: Not Found - resource doesn't exist
- 500: Internal Server Error - unexpected server errors
- 503: Service Unavailable - database connection failures

**Rationale**:
- Consistent structure aids frontend error handling
- Error codes enable programmatic error handling
- Descriptive messages improve developer experience
- Security: No stack traces or sensitive data in production

**Alternatives Considered**:
- Problem Details (RFC 7807): More comprehensive but overkill for simple CRUD API
- Minimal errors (message only): Lacks structure for programmatic handling
- Verbose errors with stack traces: Security risk in production

---

### 4. CORS Configuration

**Question**: How should CORS be configured to allow frontend requests while maintaining security?

**Research Findings**:

FastAPI's built-in CORS middleware provides granular control over cross-origin requests. For Phase II:
- Frontend runs on `http://localhost:3000` (development)
- Backend runs on `http://localhost:8000` (development)
- Different origins require CORS configuration

**Decision**: Use FastAPI's CORSMiddleware with environment-driven configuration

**Configuration**:
```python
from fastapi.middleware.cors import CORSMiddleware

allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)
```

**Rationale**:
- Environment variable allows different configs for dev/prod
- `allow_credentials=True` required for JWT token transmission
- Explicit method whitelist follows principle of least privilege
- Wildcard headers acceptable since authorization is token-based

**Alternatives Considered**:
- Nginx/proxy CORS: Adds deployment complexity for local development
- Same-origin deployment: Limits deployment flexibility
- Wildcard origins (`*`): Security risk, disallows credentials

---

### 5. Database Connection Management

**Question**: How should database connections be managed in a serverless-friendly manner with Neon PostgreSQL?

**Research Findings**:

Neon Serverless PostgreSQL uses connection pooling and requires efficient connection management:
- Connection per request is wasteful
- Global connection pool is serverless-friendly
- SQLModel uses SQLAlchemy's connection pooling

**Decision**: Use SQLModel's async session management with connection pooling

**Pattern**:
```python
from sqlmodel import create_engine, Session
from fastapi import Depends

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=5, max_overflow=10)

def get_session():
    with Session(engine) as session:
        yield session
```

**Configuration**:
- `pool_pre_ping=True`: Validates connections before use (handles stale connections)
- `pool_size=5`: Initial connection pool size
- `max_overflow=10`: Maximum connections beyond pool_size under load

**Rationale**:
- Connection pooling reduces latency and database load
- Pre-ping prevents errors from stale connections
- Neon's autoscaling handles connection pooling at database level
- FastAPI dependency injection ensures proper session lifecycle

**Alternatives Considered**:
- Per-request connections: High overhead, poor performance
- Singleton session: Thread-safety issues, not serverless-compatible
- Async SQLModel: More complex, unnecessary for Phase II scale

---

### 6. Logging and Monitoring

**Question**: What logging strategy should be implemented for security monitoring and debugging?

**Research Findings**:

FastAPI uses Python's standard logging module. Key events to log:
- Authentication failures (security requirement FR-024)
- Database connection errors
- Unhandled exceptions
- API access patterns (optional for Phase II)

**Decision**: Use Python's `logging` module with structured JSON output

**Configuration**:
```python
import logging
logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp":"%(asctime)s", "level":"%(levelname)s", "message":"%(message)s", "module":"%(name)s"}'
)
```

**Log Events**:
- INFO: Successful authentication, task CRUD operations
- WARNING: Failed authentication attempts (security monitoring)
- ERROR: Database errors, JWT verification failures
- CRITICAL: Service unavailability, startup failures

**Rationale**:
- JSON format enables structured log analysis
- Standard module avoids external dependencies
- Security events logged per FR-024 requirement
- Sufficient for Phase II without log aggregation

**Alternatives Considered**:
- Loguru: Better developer experience but adds dependency
- Structlog: More features but increases complexity
- No logging: Violates FR-024 security requirement

---

### 7. Input Validation Strategy

**Question**: How should request payloads be validated to prevent injection attacks and data integrity issues?

**Research Findings**:

FastAPI integrates Pydantic for automatic validation:
- Type checking at runtime
- Field constraints (length, range, format)
- Custom validators for business logic
- Automatic 422 responses for validation errors

**Decision**: Use Pydantic models for all request/response validation

**Example Validation**:
```python
from pydantic import BaseModel, Field, validator

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)

    @validator('title')
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()

class TaskUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)

class TaskPatch(BaseModel):
    status: Literal["pending", "completed"]
```

**Validation Rules**:
- Task title: 1-500 characters, no empty strings
- Status: Must be "pending" or "completed"
- User ID: Extracted from JWT, never accepted from client

**Rationale**:
- Pydantic validation prevents malformed data at API boundary
- SQLModel inherits Pydantic validation for database layer
- Automatic 422 responses reduce boilerplate error handling
- Type safety prevents common bugs

**Alternatives Considered**:
- Manual validation: Error-prone and verbose
- Marshmallow: Requires separate library, redundant with Pydantic
- Cerberus: Less FastAPI integration

---

### 8. Testing Strategy

**Question**: What testing approach balances coverage with implementation speed for Phase II?

**Research Findings**:

FastAPI provides excellent testing support via `TestClient`:
- In-memory testing without real database
- JWT mocking for authentication tests
- Fast execution (<1 second per test)

**Decision**: Focus on integration tests for critical paths, defer unit tests to Phase III

**Test Coverage**:
1. **Authentication Tests** (highest priority):
   - Valid JWT token accepted
   - Invalid JWT token rejected (401)
   - Expired JWT token rejected (401)
   - Missing token rejected (401)

2. **User Isolation Tests** (security critical):
   - User A cannot access User B's tasks (403)
   - Task creation associates with correct user
   - Task updates validate ownership

3. **CRUD Operation Tests**:
   - Create task returns 201 with task data
   - List tasks returns only user's tasks
   - Update task modifies correct fields
   - Delete task removes from database
   - Get single task returns 404 for non-existent

**Testing Tools**:
- `pytest`: Test runner
- `pytest-asyncio`: Async test support
- `TestClient`: FastAPI's built-in test client
- SQLite in-memory: Fast test database

**Rationale**:
- Integration tests catch real-world issues
- TestClient provides realistic API testing
- In-memory database keeps tests fast
- Authentication and isolation are highest security priorities

**Alternatives Considered**:
- Full unit test coverage: Time-consuming for Phase II deadline
- Manual testing only: Insufficient for security requirements
- E2E tests with real database: Too slow for iterative development

---

## Technology Stack Summary

**Core Framework**: FastAPI 0.109+
**ORM**: SQLModel 0.0.14+
**Database Driver**: psycopg2-binary (PostgreSQL)
**JWT Handling**: python-jose[cryptography] 3.3+
**Validation**: Pydantic (FastAPI dependency)
**Testing**: pytest 7.4+, pytest-asyncio
**ASGI Server**: uvicorn 0.25+
**Python Version**: 3.13+

**Additional Dependencies**:
- passlib[bcrypt]: Password hashing (if implementing auth endpoints later)
- python-dotenv: Environment variable loading
- alembic: Database migrations (SQLModel dependency)

**Development Dependencies**:
- httpx: TestClient dependency
- pytest-cov: Code coverage reporting
- black: Code formatting
- ruff: Linting

---

## Architectural Decisions

### AD-001: Stateless Architecture
**Decision**: Backend maintains no session state; all authentication via JWT
**Rationale**: Enables horizontal scaling and serverless deployment
**Trade-offs**: JWT revocation requires additional infrastructure (deferred to Phase III)

### AD-002: UUID Primary Keys
**Decision**: Use UUIDs instead of integer IDs for all entities
**Rationale**: Prevents ID enumeration attacks and supports distributed systems
**Trade-offs**: Slightly larger storage footprint, negligible at Phase II scale

### AD-003: Single Database Transaction per Request
**Decision**: Each API request operates within a single database transaction
**Rationale**: Simplifies error handling and ensures ACID properties
**Trade-offs**: Long-running operations could hold transactions (not applicable to Phase II)

### AD-004: Synchronous Database Operations
**Decision**: Use synchronous SQLModel (not async)
**Rationale**: Simpler code, sufficient performance for Phase II scale
**Trade-offs**: Async would provide better concurrency under extreme load (>1000 concurrent)

### AD-005: No Soft Deletes
**Decision**: Task deletion is permanent (hard delete)
**Rationale**: Simpler implementation, no recovery requirement in Phase II
**Trade-offs**: Deleted data is unrecoverable (acceptable per spec)

---

## Risk Analysis

### High Priority Risks

**Risk 1: JWT Secret Mismatch**
**Likelihood**: Medium | **Impact**: Critical
**Mitigation**: Document required environment variable, add startup validation
**Contingency**: Implement `/health` endpoint that validates JWT secret format

**Risk 2: Database Connection Exhaustion**
**Likelihood**: Low | **Impact**: High
**Mitigation**: Connection pooling with max_overflow limit
**Contingency**: Neon's autoscaling handles connection pooling at database level

**Risk 3: CORS Misconfiguration**
**Likelihood**: Medium | **Impact**: Medium
**Mitigation**: Environment-driven configuration, documented in README
**Contingency**: Fallback to same-origin deployment if CORS issues persist

### Medium Priority Risks

**Risk 4: SQLModel Migration Conflicts**
**Likelihood**: Low | **Impact**: Medium
**Mitigation**: Manual review of generated migrations before applying
**Contingency**: Alembic rollback support

**Risk 5: JWT Token Size**
**Likelihood**: Low | **Impact**: Low
**Mitigation**: Minimal claims (sub, email, exp only)
**Contingency**: JWT size is negligible for Phase II scale

---

## Environment Variables Required

```env
# Backend Configuration
DATABASE_URL=postgresql://user:password@host:5432/dbname  # Neon PostgreSQL connection string
SECRET_KEY=your-super-secret-key-at-least-32-characters   # MUST match frontend BETTER_AUTH_SECRET
CORS_ORIGINS=http://localhost:3000                         # Comma-separated allowed origins
ENVIRONMENT=development                                     # development | production

# Optional
LOG_LEVEL=INFO                                             # DEBUG | INFO | WARNING | ERROR
```

---

## Dependencies Justification

Each dependency serves a specific, non-overlapping purpose:

1. **FastAPI**: Core framework (mandated by constitution)
2. **SQLModel**: ORM and validation (mandated by constitution)
3. **python-jose**: JWT verification (security requirement)
4. **psycopg2-binary**: PostgreSQL driver (database requirement)
5. **uvicorn**: ASGI server (FastAPI deployment requirement)
6. **python-dotenv**: Environment variable loading (configuration requirement)
7. **pytest**: Testing framework (quality requirement)

No redundant or unnecessary dependencies added.

---

## Open Questions for Phase 1

1. **Database Migration Strategy**: Should migrations be auto-generated or hand-written?
   - **Recommendation**: Auto-generate via Alembic, manually review before applying

2. **API Versioning**: Should `/api/v1/` prefix be added proactively?
   - **Recommendation**: No - deferred per out-of-scope items, use `/api/` only

3. **Health Check Endpoint**: Should `/health` endpoint be public or require auth?
   - **Recommendation**: Public endpoint for deployment health checks

4. **Task Ordering**: Should tasks have a default ordering (creation date, alphabetical)?
   - **Recommendation**: Order by `created_at DESC` (newest first) for better UX

---

## Next Steps

✅ **Phase 0 Complete**: All technical unknowns resolved
➡️ **Phase 1**: Create data-model.md, contracts/, and quickstart.md
➡️ **Phase 2**: Generate tasks.md via `/sp.tasks` command

**Ready for Phase 1 design artifacts**

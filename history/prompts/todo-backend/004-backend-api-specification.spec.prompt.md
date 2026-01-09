---
id: 004
title: Backend API Specification
stage: spec
date: 2026-01-06
surface: agent
model: claude-sonnet-4-5
feature: todo-backend
branch: 002-todo-backend
user: user
command: /sp.specify
labels: ["backend", "api", "specification", "jwt-auth", "rest", "postgresql"]
links:
  spec: specs/002-todo-backend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-todo-backend/spec.md
  - specs/002-todo-backend/checklists/requirements.md
tests:
  - Specification validation checklist: PASS
---

## Prompt

/sp.specify Backend – Phase II Todo Full-Stack Web Application

Project:
Backend service for a multi-user Todo web application that exposes a secure REST API, persists data in Neon Serverless PostgreSQL, and enforces user isolation using JWT authentication issued by Better Auth.

Target audience:
- Hackathon reviewers evaluating spec-driven, agentic development
- Developers extending the backend in later phases

Scope & Focus:
- RESTful API design using FastAPI
- Secure JWT-based authentication and authorization
- Persistent data storage with SQLModel and PostgreSQL
- Strict user-level data isolation
- Clean, maintainable backend architecture

Success criteria:
- All 5 core todo features implemented via REST API (Add, Delete, Update, View list, Mark complete)
- All endpoints require valid JWT authentication
- Authenticated users can only access their own tasks
- Backend correctly verifies JWT tokens issued by Better Auth
- Data is persisted in Neon Serverless PostgreSQL
- API responses match defined schemas and HTTP status codes
- Backend is stateless and production-ready

API Requirements:
- Base path: /api
- Authentication: Authorization: Bearer <JWT>
- Endpoints: GET/POST/PUT/PATCH/DELETE for /api/tasks and /api/tasks/:id
- Enforce task ownership on every request

Authentication & Security:
- Verify JWT signature using shared BETTER_AUTH_SECRET
- Reject requests with missing/invalid/expired tokens (401 Unauthorized)
- Reject user ID mismatch (403 Forbidden)
- Extract user identity from JWT payload
- Do not trust user_id from request without token verification

Database Requirements:
- Use SQLModel as ORM
- PostgreSQL hosted on Neon (serverless)
- Tables: users (managed by Better Auth), tasks (owned by user_id)
- All task queries filtered by authenticated user_id

Technology Stack: Python 3.13+, FastAPI, SQLModel, Neon PostgreSQL, JWT, Uvicorn

Constraints:
- No manual coding; Claude Code implementation only
- Spec-driven development using Spec-Kit Plus
- Environment variables for secrets
- No frontend logic or AI features in Phase II

Not building: RBAC, admin dashboards, background jobs, AI integrations, WebSockets, real-time features

## Response snapshot

Created comprehensive backend API specification with:

**User Stories (6 total, prioritized P1-P3)**:
- P1: View Personal Task List - Core read functionality
- P1: Create New Task - Essential write capability
- P1: Mark Task as Complete - Fundamental status tracking
- P2: Update Task Details - Usability enhancement
- P2: Delete Task - Maintenance feature
- P3: Retrieve Single Task - Detail view support

**Functional Requirements (25 total)**:
- FR-001 to FR-009: API structure, JWT verification, user isolation
- FR-010 to FR-014: CRUD endpoint support
- FR-015 to FR-021: Validation, ownership, data integrity
- FR-022 to FR-025: Technical constraints (SQLModel, env vars, error handling)

**Success Criteria (12 measurable outcomes)**:
- 100% JWT authentication enforcement
- Complete user isolation
- <500ms API response time (95th percentile)
- 100+ concurrent request handling
- Zero SQL injection vulnerabilities
- Stateless backend architecture
- Full frontend integration readiness

**Key Entities**:
- Task: id, title (max 500 chars), status (pending/completed), user_id, timestamps
- User: id, email, verification status, timestamps (managed by Better Auth)

**Edge Cases (8 identified)**:
- Expired tokens, concurrent updates, database failures, malformed inputs, SQL injection attempts, etc.

**Assumptions documented**:
- JWT structure (sub, email, exp claims)
- Shared BETTER_AUTH_SECRET between frontend/backend
- Neon PostgreSQL provisioned
- CORS configured for frontend origin

**Out of Scope explicitly defined**:
- User auth endpoints, RBAC, task sharing, advanced features (search, pagination), real-time updates, admin tools

**Validation**:
- Created requirements.md checklist - ALL items PASS
- Zero [NEEDS CLARIFICATION] markers
- Technology-agnostic success criteria
- Testable acceptance scenarios for all user stories

## Outcome

- ✅ Impact: Complete backend API specification created for multi-user Todo application with JWT authentication
- 🧪 Tests: Specification validation checklist passed all quality checks
- 📁 Files: specs/002-todo-backend/spec.md (223 lines), specs/002-todo-backend/checklists/requirements.md
- 🔁 Next prompts: /sp.plan for architectural design, /sp.tasks for implementation breakdown
- 🧠 Reflection: Successfully captured all backend requirements with proper user isolation, JWT security, and REST API design without leaking implementation details

## Evaluation notes (flywheel)

- Failure modes observed: Initial PowerShell script failed but branch creation succeeded; gracefully recovered
- Graders run and results (PASS/FAIL): Requirements checklist validation - PASS (all 12 criteria met)
- Prompt variant (if applicable): Standard specification workflow with validation
- Next experiment (smallest change to try): Proceed to /sp.plan phase for architectural decisions and technology choices

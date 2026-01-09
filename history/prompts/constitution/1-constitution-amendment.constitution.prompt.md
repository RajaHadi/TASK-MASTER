---
id: 1
title: constitution-amendment
stage: constitution
date: 2026-01-02
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution","governance","setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md (created/updated)
tests:
  - None (governance update only)
---

## Prompt

/sp.constitution

Project: Phase II – Full-Stack Todo Web Application (Spec-Driven Hackathon)

Core principles:
- Spec-first development (no implementation without an approved spec)
- Clear separation of concerns (frontend, backend, database, auth)
- Security-by-default (JWT-based authentication and user isolation)
- Scalability mindset (stateless backend, serverless-friendly design)
- Reproducibility (any developer can rebuild the system from specs)

Key standards:
- Every feature must have a written spec before implementation
- All API behavior must match the REST specification exactly
- Authentication must be enforced on every protected endpoint
- Each user can only access their own data (strict ownership checks)
- Backend must validate JWT tokens using a shared secret
- Frontend must attach JWT tokens to all API requests
- Database access must go through SQLModel ORM only

Constraints:
- Technology stack is fixed and must not be changed:
  - Frontend: Next.js 16+ (App Router)
  - Backend: Python FastAPI
  - ORM: SQLModel
  - Database: Neon Serverless PostgreSQL
  - Auth: Better Auth (JWT-based)
  - Spec-driven: Claude Code + Spec-Kit Plus
- No manual coding outside Claude Code execution
- Monorepo structure must follow Spec-Kit conventions
- All configuration secrets must be provided via environment variables

Success criteria:
- All 5 core todo features work in a multi-user web environment
- REST API is fully secured with JWT authentication
- Users can only view and modify their own tasks
- Frontend and backend integrate correctly via documented APIs
- Project can be set up and run using only the specs and README
- Claude Code can navigate and modify the repo using Spec-Kit references

## Response snapshot

Constitution successfully created with 5 core principles and comprehensive governance structure. Document includes Sync Impact Report showing template alignment verification. Version 1.0.0 ratified 2026-01-02. All placeholder tokens resolved, semantic versioning established, and compliance verification framework defined.

## Outcome

- ✅ Impact: Established governance foundation for full-stack todo application with spec-driven development, security requirements, and technology constraints
- 🧪 Tests: None (governance update only)
- 📁 Files: Created .specify/memory/constitution.md with 5 core principles, technology stack definition, success criteria, and governance framework
- 🔁 Next prompts: Run /sp.specify to create feature specifications; run /sp.plan to generate implementation plans; run /sp.tasks for actionable task lists
- 🧠 Reflection: Constitution provides clear guardrails while maintaining flexibility for architectural decisions via ADRs. Template alignment verified to ensure future compliance.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A

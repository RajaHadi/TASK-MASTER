<!--
  SYNC IMPACT REPORT
  Version change: [none] → 1.0.0
  Modified principles: [none - new constitution]
  Added sections: Core Principles (5 principles), Technology Stack & Constraints, Success Criteria, Governance
  Removed sections: [none]
  Templates requiring updates:
    ✅ plan-template.md - Reviewed, alignment verified
    ✅ spec-template.md - Reviewed, alignment verified
    ✅ tasks-template.md - Reviewed, alignment verified
    ✅ commands (none found) - No updates needed
  Follow-up TODOs: None
-->

# Full-Stack Todo Web Application Constitution

## Core Principles

### I. Spec-First Development

Every feature MUST have a written, approved specification before any implementation work begins. This principle is NON-NEGOTIABLE and serves as the foundation for all development work.

**Mandatory Requirements:**
- All user stories MUST be documented in the spec with clear acceptance criteria
- API contracts MUST be defined before any endpoint implementation
- Database schema MUST be designed via the spec process before migration creation
- No code changes without a corresponding spec (except trivial bug fixes)

**Rationale:** Prevents scope creep, ensures alignment between frontend/backend teams, provides testable acceptance criteria, and maintains architectural coherence.

### II. Separation of Concerns

Clear architectural boundaries MUST exist between frontend, backend, database, and authentication layers. Each layer operates independently through well-defined contracts.

**Mandatory Requirements:**
- Frontend (Next.js) communicates ONLY via REST API to backend
- Backend (FastAPI) contains NO UI logic and exposes ONLY HTTP endpoints
- Database access MUST go through SQLModel ORM only (no raw SQL)
- Authentication state managed by Better Auth, shared via JWT tokens
- No cross-layer imports or direct dependencies (e.g., frontend importing backend code)

**Rationale:** Enables independent testing, deployment, and scaling of each layer. Reduces coupling and makes the system easier to maintain.

### III. Security-by-Default

JWT-based authentication and user data isolation are mandatory. Every protected endpoint MUST verify user identity and enforce ownership boundaries.

**Mandatory Requirements:**
- All non-public API endpoints MUST require valid JWT token
- Backend MUST validate JWT tokens using a shared secret (JWT_SECRET env var)
- Frontend MUST attach JWT tokens to all API requests in Authorization header
- Each user can ONLY access their own data (strict ownership checks on every query)
- No cross-user data exposure even if user IDs are guessed or manipulated
- All configuration secrets MUST be provided via environment variables (never hardcoded)

**Rationale:** Multi-user environments require tenant isolation to prevent data leakage. JWT provides stateless auth suitable for serverless deployment. Environment secrets prevent credential exposure in code.

### IV. Scalability Mindset

Backend design MUST be stateless and serverless-friendly. No in-memory session state, no file-based storage, no blocking I/O patterns that limit horizontal scaling.

**Mandatory Requirements:**
- Backend MUST NOT store session state (use JWTs instead)
- Database queries MUST be efficient and indexed appropriately
- API design MUST support async operations where appropriate
- No blocking operations that prevent handling concurrent requests
- Neon PostgreSQL chosen for serverless compatibility (auto-scaling)

**Rationale:** Enables cost-effective scaling, maintains responsiveness under load, and allows deployment to platforms like Vercel, AWS Lambda, or other serverless runtimes.

### V. Reproducibility

Any developer MUST be able to rebuild the entire system using only the specifications, README, and configuration files. No manual setup steps or tribal knowledge required.

**Mandatory Requirements:**
- All API behavior MUST match the REST specification exactly (documented in contracts/)
- Database schema MUST be reproducible from migrations
- Environment requirements documented in README (Node.js, Python versions)
- Dependencies locked via package.json and requirements.txt
- Setup instructions in README MUST work from a fresh clone

**Rationale:** Reduces onboarding time, prevents configuration drift, ensures CI/CD reliability, and enables deployment reproducibility.

## Technology Stack & Constraints

The technology stack is FIXED and MUST NOT be changed without explicit project governance approval.

**Frontend:**
- Next.js 16+ with App Router (Mandatory)
- TypeScript (strongly recommended)

**Backend:**
- Python FastAPI (Mandatory)
- SQLModel ORM for database access (Mandatory)
- Pydantic for data validation (FastAPI dependency)

**Database:**
- Neon Serverless PostgreSQL (Mandatory)
- Schema migrations via Alembic (SQLModel default)

**Authentication:**
- Better Auth (JWT-based) (Mandatory)
- JWT_SECRET shared between frontend/backend (env var)

**Development Workflow:**
- Claude Code for all implementation execution
- No manual coding outside Claude Code (enforced via governance)
- Monorepo structure per Spec-Kit conventions:
  ```
  specs/[feature-name]/
  ├── spec.md
  ├── plan.md
  ├── tasks.md
  ├── research.md
  └── contracts/
  backend/
  ├── src/
  ├── tests/
  └── requirements.txt
  frontend/
  ├── src/
  ├── tests/
  └── package.json
  ```

**Configuration:**
- All secrets via environment variables (.env file, never committed)
- Environment-specific configs (.env.example as template)
- No hardcoded URLs, API keys, or database credentials

## Success Criteria

The project is considered successful when ALL of the following criteria are met:

**Functional Requirements:**
1. All 5 core todo features work in a multi-user web environment:
   - User registration and login
   - Create new tasks
   - View all tasks for current user
   - Edit existing tasks
   - Delete tasks
2. Each user sees ONLY their own tasks (verified via multi-user testing)

**Security Requirements:**
3. REST API is fully secured with JWT authentication:
   - All protected endpoints return 401 without valid token
   - Token validation uses shared secret
   - Token expiration enforced
4. User isolation enforced on every data access:
   - Users cannot view/modify other users' tasks
   - Ownership checks prevent ID guessing attacks
   - API returns 403 for cross-user access attempts

**Integration Requirements:**
5. Frontend and backend integrate correctly via documented APIs:
   - Frontend attaches JWT to all API requests
   - API responses match contract specification
   - Error handling consistent across frontend/backend
   - Loading states and error messages displayed to users

**Reproducibility Requirements:**
6. Project can be set up and run using only the specs and README:
   - Fresh clone works with documented setup steps
   - Database migrations apply correctly
   - Both frontend and backend start successfully
   - Full user flow works end-to-end

**Maintainability Requirements:**
7. Claude Code can navigate and modify the repo using Spec-Kit references:
   - All code locations cited with file:line format
   - Specs link correctly to implementation
   - Plan maps spec requirements to concrete tasks
   - ADRs created for significant architectural decisions

## Governance

**Amendment Process:**
- Constitution changes require explicit discussion and documented rationale
- Version MUST be incremented using semantic versioning:
  - MAJOR (X.0.0): Backward incompatible changes (e.g., removing a principle)
  - MINOR (0.X.0): Adding new principles or expanding guidance
  - PATCH (0.0.X): Clarifications, wording improvements, typos
- All amendments MUST update the Sync Impact Report at the top of this file

**Compliance Verification:**
- Every plan.md MUST include a "Constitution Check" section validating alignment
- Every code review MUST verify compliance with applicable principles
- Architectural Decision Records (ADRs) MUST be created for violations or exceptions
- ADRs suggested automatically when significant decisions detected (via `/sp.adr` command)

**Enforcement:**
- Template files (plan-template.md, spec-template.md, tasks-template.md) MUST remain in sync with constitution
- If a principle is added/removed, affected templates MUST be updated immediately
- Version bump rationale MUST be documented in the Sync Impact Report

**Guidance References:**
- Use CLAUDE.md for runtime development guidance and tool-specific instructions
- Use .specify/templates/ for structure and formatting guidance
- Use README.md for project-specific setup and operational guidance

**Authority:**
- This constitution supersedes all other practices and conventions
- In case of conflict, constitution governs
- Temporary exceptions require explicit documentation and sunset date

---

**Version**: 1.0.0 | **Ratified**: 2026-01-02 | **Last Amended**: 2026-01-02

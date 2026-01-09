# Tasks: Todo Application Frontend User Interface

**Input**: Design documents from `/specs/001-todo-frontend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: NOT included - tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend web app**: `frontend/src/` at repository root
- Paths below follow the plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create frontend directory structure at frontend/src/
- [X] T002 Initialize Next.js 16+ project with TypeScript and Tailwind CSS in frontend/
- [X] T003 [P] Install dependencies: better-auth/react, clsx, tailwind-merge in frontend/package.json
- [X] T004 [P] Create tsconfig.json with strict mode and path aliases (@/*) in frontend/tsconfig.json
- [X] T005 [P] Create tailwind.config.ts with content paths in frontend/tailwind.config.ts
- [X] T006 [P] Create global styles with Tailwind directives in frontend/src/app/globals.css
- [X] T007 Create .env.local with NEXT_PUBLIC_API_URL placeholder in frontend/.env.local
- [X] T008 [P] Create .env.example documenting all required environment variables in frontend/.env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### TypeScript Types and API Client

- [X] T009 [P] Define User, Task, and API response types in frontend/src/types/index.ts
- [X] T010 [P] Define ApiError and validation types in frontend/src/types/api.ts
- [X] T011 Create centralized API client with JWT handling in frontend/src/lib/api-client.ts
- [X] T012 Implement request/response interceptors for token attachment in frontend/src/lib/api-client.ts
- [X] T013 Create authentication utilities (token storage, session check) in frontend/src/lib/auth.ts

### Reusable UI Components

- [X] T014 [P] Create Button component with variants and states in frontend/src/components/ui/Button.tsx
- [X] T015 [P] Create Input component with validation support in frontend/src/components/ui/Input.tsx
- [X] T016 [P] Create LoadingSpinner component in frontend/src/components/ui/LoadingSpinner.tsx
- [X] T017 [P] Create ErrorMessage component for error display in frontend/src/components/ui/ErrorMessage.tsx
- [X] T018 [P] Create EmptyState component for empty data scenarios in frontend/src/components/ui/EmptyState.tsx

### Layout and Navigation

- [X] T019 Create root layout with metadata in frontend/src/app/layout.tsx
- [X] T020 Create Navbar component with auth state display in frontend/src/components/layout/Navbar.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Account Creation and Initial Login (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts and authenticate securely

**Independent Test**: Visit landing page → click signup → register → logout → login → verify dashboard access. Delivers user identity and secure session management.

### Implementation for User Story 1

- [X] T021 [US1] Create landing page with app description and CTAs in frontend/src/app/page.tsx
- [X] T022 [US1] Create signup page with email/password form in frontend/src/app/signup/page.tsx
- [X] T023 [US1] Implement email validation helper (RFC 5322 format) in frontend/src/lib/validation.ts
- [X] T024 [US1] Implement password length validation (min 8 chars) in frontend/src/lib/validation.ts
- [X] T025 [US1] Add inline validation errors to signup form in frontend/src/app/signup/page.tsx
- [X] T026 [US1] Display API error messages for duplicate email in frontend/src/app/signup/page.tsx
- [X] T027 [US1] Create login page with email/password form in frontend/src/app/login/page.tsx
- [X] T028 [US1] Add inline validation errors to login form in frontend/src/app/login/page.tsx
- [X] T029 [US1] Display API error messages for incorrect credentials in frontend/src/app/login/page.tsx
- [X] T030 [US1] Implement redirect to dashboard after successful signup in frontend/src/app/signup/page.tsx
- [X] T031 [US1] Implement redirect to dashboard after successful login in frontend/src/app/login/page.tsx
- [X] T032 [US1] Add loading states to signup form during submission in frontend/src/app/signup/page.tsx
- [X] T033 [US1] Add loading states to login form during submission in frontend/src/app/login/page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can signup, login, and access the dashboard

---

## Phase 4: User Story 2 - View and Navigate Personal Tasks (Priority: P1)

**Goal**: Display all user tasks on a single dashboard with clear status indicators

**Independent Test**: Log in → view dashboard → verify all tasks listed → confirm completed tasks visually distinct → check empty state when no tasks. Delivers task awareness and organization.

### Implementation for User Story 2

- [X] T034 [P] [US2] Create TaskList container component in frontend/src/components/task/TaskList.tsx
- [X] T035 [P] [US2] Create TaskItem component with title and status in frontend/src/components/task/TaskItem.tsx
- [X] T036 [US2] Apply visual distinction to completed tasks (strikethrough/color) in frontend/src/components/task/TaskItem.tsx
- [X] T037 [US2] Create dashboard page structure in frontend/src/app/dashboard/page.tsx
- [X] T038 [US2] Fetch user tasks on dashboard load in frontend/src/app/dashboard/page.tsx
- [X] T039 [US2] Display EmptyState when user has no tasks in frontend/src/app/dashboard/page.tsx
- [X] T040 [US2] Add LoadingSpinner during task fetch in frontend/src/app/dashboard/page.tsx
- [X] T041 [US2] Add ErrorMessage for task fetch failures in frontend/src/app/dashboard/page.tsx
- [X] T042 [US2] Display user email in Navbar when authenticated in frontend/src/components/layout/Navbar.tsx
- [X] T043 [US2] Ensure all tasks accessible via scroll in frontend/src/components/task/TaskList.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can authenticate and view their tasks

---

## Phase 5: User Story 3 - Create New Tasks (Priority: P1)

**Goal**: Enable users to quickly add new tasks with title validation

**Independent Test**: Access dashboard → fill task form → submit → verify task appears in list with pending status. Delivers task capture and productivity tracking.

### Implementation for User Story 3

- [X] T044 [US3] Create TaskForm component with title input in frontend/src/components/task/TaskForm.tsx
- [X] T045 [US3] Add title validation (non-empty, trimmed) to TaskForm in frontend/src/components/task/TaskForm.tsx
- [X] T046 [US3] Display inline validation error for empty title in frontend/src/components/task/TaskForm.tsx
- [X] T047 [US3] Add LoadingSpinner during task creation in frontend/src/components/task/TaskForm.tsx
- [X] T048 [US3] Implement task creation API call in frontend/src/app/dashboard/page.tsx
- [X] T049 [US3] Add new task to list with "pending" status in frontend/src/app/dashboard/page.tsx
- [X] T050 [US3] Integrate TaskForm into dashboard page in frontend/src/app/dashboard/page.tsx

**Checkpoint**: All core P1 user stories (US1, US2, US3) now functional - users can authenticate, view, and create tasks

---

## Phase 6: User Story 4 - Mark Tasks as Complete (Priority: P1)

**Goal**: Enable users to toggle task completion status with visual feedback

**Independent Test**: Click completion toggle on pending task → verify visual change to completed → click again → verify reverts to pending. Delivers progress tracking and task organization.

### Implementation for User Story 4

- [X] T051 [P] [US4] Add completion toggle (checkbox/switch) to TaskItem in frontend/src/components/task/TaskItem.tsx
- [X] T052 [US4] Implement optimistic status update on toggle in frontend/src/app/dashboard/page.tsx
- [X] T053 [US4] Add API call to update task status in frontend/src/app/dashboard/page.tsx
- [X] T054 [US4] Implement rollback logic on API failure in frontend/src/app/dashboard/page.tsx
- [X] T055 [US4] Add visual loading indicator during status update in frontend/src/components/task/TaskItem.tsx

**Checkpoint**: All P1 stories complete - core CRUD functionality (create, read, update) now working

---

## Phase 7: User Story 5 - Delete Tasks with Confirmation (Priority: P2)

**Goal**: Enable users to remove tasks with confirmation to prevent accidental deletions

**Independent Test**: Click delete on task → see confirmation dialog → confirm → verify task removed → repeat but cancel → verify task remains. Delivers list management and focus.

### Implementation for User Story 5

- [X] T056 [P] [US5] Create DeleteConfirmation dialog component in frontend/src/components/task/DeleteConfirmation.tsx
- [X] T057 [US5] Add delete action button to TaskItem in frontend/src/components/task/TaskItem.tsx
- [X] T058 [US5] Show confirmation dialog on delete click in frontend/src/app/dashboard/page.tsx
- [X] T059 [US5] Remove task from list on confirmation in frontend/src/app/dashboard/page.tsx
- [X] T060 [US5] Keep task in list on cancellation in frontend/src/app/dashboard/page.tsx
- [X] T061 [US5] Add LoadingSpinner during deletion in frontend/src/components/task/DeleteConfirmation.tsx

**Checkpoint**: User Stories 1-5 functional - full CRUD (create, read, update, delete) with proper safety measures

---

## Phase 8: User Story 6 - Logout and Session Management (Priority: P2)

**Goal**: Enable users to securely end sessions and protect data on shared devices

**Independent Test**: Click logout → verify redirect to landing → attempt to access dashboard → verify redirect to login. Delivers data security and session isolation.

### Implementation for User Story 6

- [X] T062 [US6] Add logout button to Navbar when authenticated in frontend/src/components/layout/Navbar.tsx
- [X] T063 [US6] Implement logout function (clear token, redirect) in frontend/src/lib/auth.ts
- [X] T064 [US6] Wire logout button to logout action in frontend/src/components/layout/Navbar.tsx
- [X] T065 [US6] Create route protection middleware/hook in frontend/src/lib/auth.ts
- [X] T066 [US6] Redirect to login when accessing dashboard unauthenticated in frontend/src/app/dashboard/page.tsx
- [X] T067 [US6] Redirect to login on 401 API errors in frontend/src/lib/api-client.ts

**Checkpoint**: User Stories 1-6 functional - complete auth flow with session management

---

## Phase 9: User Story 7 - Responsive Multi-Device Experience (Priority: P2)

**Goal**: Ensure application works seamlessly on mobile, tablet, and desktop

**Independent Test**: Access on mobile (<768px) → verify no horizontal scroll → test on tablet (768-1024px) → verify optimized layout → test on desktop (>1024px) → verify full layout utilization → test orientation changes. Delivers flexibility and access.

### Implementation for User Story 7

- [ ] T068 [P] [US7] Apply mobile-first Tailwind classes to Navbar in frontend/src/components/layout/Navbar.tsx
- [ ] T069 [P] [US7] Apply mobile-first Tailwind classes to TaskList in frontend/src/components/task/TaskList.tsx
- [ ] T070 [P] [US7] Apply mobile-first Tailwind classes to TaskForm in frontend/src/components/task/TaskForm.tsx
- [ ] T071 [P] [US7] Apply mobile-first Tailwind classes to TaskItem in frontend/src/components/task/TaskItem.tsx
- [ ] T072 [P] [US7] Apply mobile-first Tailwind classes to DeleteConfirmation in frontend/src/components/task/DeleteConfirmation.tsx
- [ ] T073 [P] [US7] Apply mobile-first Tailwind classes to auth forms in frontend/src/app/signup/page.tsx
- [ ] T074 [P] [US7] Apply mobile-first Tailwind classes to login form in frontend/src/app/login/page.tsx
- [ ] T075 [US7] Apply mobile-first Tailwind classes to dashboard in frontend/src/app/dashboard/page.tsx
- [ ] T076 [US7] Ensure minimum 44x44px touch targets on all interactive elements across all components
- [ ] T077 [US7] Test on mobile breakpoints (<768px) and verify no horizontal scroll
- [ ] T078 [US7] Test on tablet breakpoints (768-1024px) and verify optimized layout
- [ ] T079 [US7] Test on desktop breakpoints (>1024px) and verify full screen utilization
- [ ] T080 [US7] Verify functionality maintained on portrait/landscape orientation changes

**Checkpoint**: All user stories (US1-US7) complete - full responsive implementation

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T081 [P] Update quickstart.md with final implementation notes in specs/001-todo-frontend/quickstart.md
- [ ] T082 Add error boundary for React error handling in frontend/src/app/error.tsx
- [ ] T083 [P] Create not-found page for 404 errors in frontend/src/app/not-found.tsx
- [ ] T084 Run quickstart.md validation to verify all steps work
- [ ] T085 Code cleanup and TypeScript type check (npm run build)
- [ ] T086 Verify all success criteria from spec.md (SC-001 through SC-010)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2)
  - P1 stories (US1-US4) must complete before P2 stories (US5-US7)
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Requires dashboard from US2
- **User Story 4 (P1)**: Can start after US3 - Requires TaskList and TaskItem from US2/US3
- **User Story 5 (P2)**: Can start after US4 - Requires TaskItem and TaskList from earlier stories
- **User Story 6 (P2)**: Can start after US5 - Requires Navbar and auth setup from US1
- **User Story 7 (P2)**: Can start after US6 - Applies responsive design to all previous components

### Within Each User Story

- Parallelizable [P] tasks can run together
- UI components before page integration
- Core functionality before polish/error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase (T003-T008)**: All [P] tasks can run in parallel
- **Foundational Phase (T009, T010)**: Type definitions can run in parallel
- **Foundational Phase (T014-T018)**: All UI components can run in parallel
- **User Story 2 (T034-T035)**: TaskList and TaskItem can run in parallel
- **User Story 7 (T068-T079)**: Responsive styling tasks can run in parallel across components
- **Polish Phase (T081-T083)**: Documentation and error pages can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch task components together:
Task: "Create TaskList container component in frontend/src/components/task/TaskList.tsx"
Task: "Create TaskItem component with title and status in frontend/src/components/task/TaskItem.tsx"

# After components complete, integrate in dashboard:
Task: "Create dashboard page structure in frontend/src/app/dashboard/page.tsx"
Task: "Fetch user tasks on dashboard load in frontend/src/app/dashboard/page.tsx"
```

---

## Parallel Example: User Story 7 (Responsive Design)

```bash
# Launch responsive styling for all components in parallel:
Task: "Apply mobile-first Tailwind classes to Navbar in frontend/src/components/layout/Navbar.tsx"
Task: "Apply mobile-first Tailwind classes to TaskList in frontend/src/components/task/TaskList.tsx"
Task: "Apply mobile-first Tailwind classes to TaskForm in frontend/src/components/task/TaskForm.tsx"
Task: "Apply mobile-first Tailwind classes to TaskItem in frontend/src/components/task/TaskItem.tsx"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Account Creation/Login)
4. **STOP and VALIDATE**: Test signup/login flow independently
5. Complete Phase 4: User Story 2 (View Tasks)
6. **STOP and VALIDATE**: Test task viewing independently
7. Complete Phase 5: User Story 3 (Create Tasks)
8. **STOP and VALIDATE**: Test task creation independently
9. Complete Phase 6: User Story 4 (Complete Tasks)
10. **STOP and VALIDATE**: Test full P1 user journey (auth → view → create → complete)
11. Deploy/demo MVP (P1 stories complete!)

### Incremental Delivery (Full Feature)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (P1) → Test → **MVP Threshold: Users can authenticate**
3. Add User Story 2 (P1) → Test → **MVP Threshold: Users can view tasks**
4. Add User Story 3 (P1) → Test → **MVP Threshold: Users can create tasks**
5. Add User Story 4 (P1) → Test → **MVP Complete: Full CRUD for P1 stories**
6. Add User Story 5 (P2) → Test → **Enhancement: Task deletion with safety**
7. Add User Story 6 (P2) → Test → **Enhancement: Secure logout**
8. Add User Story 7 (P2) → Test → **Enhancement: Full responsive support**
9. Each story adds value without breaking previous functionality

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (Phases 1-2)
2. **Once Foundational is done** (after T020):
   - **Developer A**: User Story 1 (Account Creation/Login) - Phase 3
   - **Developer B**: User Story 2 (View Tasks) - Phase 4 (can start after T020)
   - **Developer C**: User Story 3 (Create Tasks) - Phase 5 (waits for US2 TaskList)
3. **After P1 stories complete**:
   - **Developer A**: User Story 5 (Delete Tasks) - Phase 7
   - **Developer B**: User Story 6 (Logout) - Phase 8
   - **Developer C**: User Story 7 (Responsive) - Phase 9 (works on all components in parallel)
4. **All developers converge** on Polish phase (Phase 10)

---

## Summary Statistics

- **Total Tasks**: 86
- **Setup Phase**: 8 tasks (T001-T008)
- **Foundational Phase**: 12 tasks (T009-T020)
- **User Story 1 (P1)**: 13 tasks (T021-T033)
- **User Story 2 (P1)**: 10 tasks (T034-T043)
- **User Story 3 (P1)**: 7 tasks (T044-T050)
- **User Story 4 (P1)**: 5 tasks (T051-T055)
- **User Story 5 (P2)**: 6 tasks (T056-T061)
- **User Story 6 (P2)**: 6 tasks (T062-T067)
- **User Story 7 (P2)**: 13 tasks (T068-T080)
- **Polish Phase**: 6 tasks (T081-T086)
- **P1 Priority**: 48 tasks (56% of total) - Core MVP functionality
- **P2 Priority**: 31 tasks (36% of total) - Enhancements
- **Infrastructure**: 14 tasks (18% of total) - Setup and polish
- **Parallelizable [P] Tasks**: 23 tasks (27% of total)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests were NOT included as they were not explicitly requested in the spec
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP delivered after completing User Stories 1-4 (all P1 stories)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

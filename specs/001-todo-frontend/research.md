# Phase 0 Research: Frontend Implementation

**Feature**: 001-todo-frontend | **Date**: 2026-01-04
**Purpose**: Resolve technical decisions and document best practices for frontend implementation

## Research Findings

### 1. Better Auth Integration with Next.js App Router

**Decision**: Use Better Auth client library for session management and JWT handling

**Rationale**:
- Better Auth provides built-in JWT token management
- Client library integrates seamlessly with Next.js App Router
- Includes automatic token refresh and session state management
- Reduces boilerplate code for authentication flows

**Alternatives Considered**:
- Manual JWT handling: More control but requires manual token refresh logic
- Auth.js (NextAuth.js): Popular but heavier, more configuration needed
- Custom auth solution: Too complex for current scope

**Implementation Notes**:
- Use `better-auth/react` package for React hooks
- Store JWT token in httpOnly cookie or localStorage (based on security requirements)
- Better Auth provides session hooks: `useSession()`, `useUser()`
- Automatic token attachment via axios interceptors or fetch wrapper

---

### 2. API Client Architecture

**Decision**: Centralized API client using fetch with TypeScript types

**Rationale**:
- Built-in to modern browsers, no additional dependency
- Can be easily wrapped with interceptors for JWT attachment
- TypeScript provides type safety for requests/responses
- Simpler than Axios for RESTful API calls

**Alternatives Considered**:
- Axios: Popular but larger bundle size, more features than needed
- tRPC: Too complex for initial implementation
- Direct fetch in components: Violates single responsibility, harder to test

**Implementation Notes**:
- Create `lib/api.ts` as centralized API client
- Implement request/response interceptors for JWT handling
- Define TypeScript interfaces for all API contracts
- Handle 401 errors with automatic redirect to login
- Support loading states and error propagation

---

### 3. State Management Strategy

**Decision**: Use React hooks (useState, useEffect, useReducer) without global state library

**Rationale**:
- Simplicity aligns with "no global state libraries unless required" constraint
- App Router's built-in data fetching (Server Components) reduces client state needs
- Component-local state is sufficient for current scope
- Easier to understand and maintain for team

**Alternatives Considered**:
- Zustand: Lightweight but adds unnecessary complexity
- Redux Toolkit: Overkill for todo application scope
- Jotai: Modern but learning curve, adds dependency
- React Query: Excellent for API state but may be overkill for simple CRUD

**Implementation Notes**:
- Use Server Components for initial data fetching where possible
- Use useState for local component state (forms, toggles)
- Use useEffect for side effects (API calls, subscriptions)
- Consider React Query in future if caching/invalidation needs grow

---

### 4. Tailwind CSS Responsive Design Strategy

**Decision**: Mobile-first responsive design using Tailwind breakpoints

**Rationale**:
- Tailwind provides built-in breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- Mobile-first approach ensures core functionality on all devices
- Breakpoints align with spec requirements (mobile < 768px, tablet 768-1024px, desktop > 1024px)
- Consistent with modern web development best practices

**Alternatives Considered**:
- Desktop-first approach: Less optimal for mobile performance
- Custom breakpoints: Unnecessary complexity, Tailwind defaults sufficient
- CSS Grid/Flexbox only: Less control, harder to maintain responsive behavior

**Implementation Notes**:
- Use `mobile-first` classes by default, add larger breakpoints for enhancements
- Key breakpoints:
  - `sm`: Small devices (640px and up) - minor layout tweaks
  - `md`: Medium devices (768px and up) - tablet optimization
  - `lg`: Large devices (1024px and up) - desktop layout
- Use `container` utilities for responsive spacing
- Test on actual devices, not just browser resize

---

### 5. Error Handling and User Feedback Strategy

**Decision**: Comprehensive error handling with toast notifications and inline validation

**Rationale**:
- Users need clear feedback for all error conditions
- Toast notifications are non-blocking and less intrusive than modals
- Inline validation provides immediate feedback on form errors
- Consistent error UI improves user experience

**Alternatives Considered**:
- Alert dialogs: Too intrusive, disrupts user flow
- Console logging only: No user feedback, poor UX
- Silent failures: Confusing for users, violates clarity principle

**Implementation Notes**:
- Create reusable `Alert/Toast` component for notifications
- Implement inline validation for all forms (signup, login, task creation)
- Display user-friendly error messages from API responses
- Provide actionable guidance (e.g., "Password must be at least 8 characters")
- Log errors to console for debugging (in development)
- Graceful degradation for network errors

---

### 6. Loading States and Optimistic UI

**Decision**: Mixed approach - loading indicators for actions, optimistic updates where possible

**Rationale**:
- Loading indicators provide clear feedback for long operations
- Optimistic UI (immediate UI update before API response) improves perceived performance
- Spec mentions "Task creation should feel instant (optimistic UI if possible)"
- Balance between feedback and responsiveness

**Alternatives Considered**:
- Always wait for API response: Slower perceived performance
- Always optimistic: Can lead to UI inconsistencies if API fails
- Skeleton loading: Good for initial load, overkill for single actions

**Implementation Notes**:
- Use optimistic updates for task completion toggle (fast rollback on error)
- Use loading indicators for task creation and deletion
- Show skeleton screens on initial page load
- Implement rollback logic for failed optimistic updates
- Use disabled button states during operations

---

### 7. Testing Strategy

**Decision**: Component testing with React Testing Library, E2E testing with Playwright

**Rationale**:
- React Testing Library focuses on user behavior, not implementation details
- Aligns with spec's user-scenario approach
- Playwright provides reliable cross-browser E2E testing
- TypeScript ensures type safety across tests

**Alternatives Considered**:
- Jest DOM: Less maintainable, too focused on implementation
- Cypress: Similar to Playwright but slightly more complex setup
- No testing: Violates quality standards

**Implementation Notes**:
- Write tests for all user stories from spec
- Focus on user flows (login → dashboard → create task → complete)
- Mock API responses for isolated component testing
- Test responsive behavior at different viewports
- Ensure test coverage for error states and edge cases

---

### 8. TypeScript Configuration and Type Safety

**Decision**: Strict TypeScript configuration with path aliases

**Rationale**:
- Strict mode catches errors at compile time
- Path aliases improve code readability (`@/components` vs `../../../components`)
- Type safety prevents common bugs (null reference, type mismatches)
- Aligns with modern Next.js best practices

**Alternatives Considered**:
- Lax configuration: Less typing but more runtime errors
- JavaScript: No type safety, harder to maintain at scale

**Implementation Notes**:
- Enable `strict: true` in tsconfig.json
- Enable `noUncheckedIndexedAccess` for safer array access
- Configure path aliases: `@/*` → `./*`
- Use strict types for API contracts
- Avoid `any` types unless absolutely necessary
- Use utility types (Pick, Omit, Partial) for deriving types

---

### 9. Environment Variable Management

**Decision**: Next.js environment variables with .env.example template

**Rationale**:
- Next.js provides built-in env variable support
- .env.example documents required configuration without exposing secrets
- Server-side and client-side env variables supported via prefixes
- Aligns with constitution's "configuration secrets via environment variables"

**Alternatives Considered**:
- Hardcoded values: Security risk, violates constitution
- Configuration files: Less flexible, harder to deploy

**Implementation Notes**:
- Client-side vars: `NEXT_PUBLIC_*` prefix
- Server-side vars: All others (backend API URL, auth config)
- Create .env.local for local development (gitignored)
- Document all variables in .env.example
- Validate required environment variables at build/start time

---

## Summary

All research decisions align with:
- Constitution principles (Security-by-Default, Reproducibility)
- Technical constraints from spec (Next.js 16+, App Router, Tailwind CSS)
- User experience requirements (fast feedback, responsive design)
- Best practices for modern web applications

No NEEDS CLARIFICATION items remain. Ready to proceed to Phase 1 design.

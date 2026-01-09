# Data Model: Todo Frontend

**Feature**: 001-todo-frontend | **Date**: 2026-01-04
**Purpose**: Define frontend data structures and state management

## Frontend Data Structures

### User Entity (Frontend View)

```typescript
interface User {
  id: string;           // Unique user identifier (UUID)
  email: string;         // User email address (validated format)
  emailVerified: boolean; // Whether email has been verified
  createdAt: string;      // ISO-8601 timestamp
}
```

**Validation Rules**:
- Email must match RFC 5322 format
- Email must be unique across all users (enforced by backend)
- Minimum password length: 8 characters ( enforced on signup)

### Task Entity (Frontend View)

```typescript
interface Task {
  id: string;              // Unique task identifier (UUID)
  title: string;            // Task title (non-empty, trimmed)
  status: 'pending' | 'completed';  // Task completion state
  userId: string;           // Owner user ID (for scoping)
  createdAt: string;       // ISO-8601 timestamp
  updatedAt: string;       // ISO-8601 timestamp
}
```

**Validation Rules**:
- Title cannot be empty or whitespace only
- Title max length: 200 characters (reasonable limit)
- Status must be either 'pending' or 'completed' (enum)
- Tasks are scoped to authenticated user (userId)

### Task Creation Request

```typescript
interface CreateTaskRequest {
  title: string;  // Required, non-empty, max 200 chars
}
```

### Task Update Request

```typescript
interface UpdateTaskRequest {
  status?: 'pending' | 'completed';  // Optional status update
  title?: string;                       // Optional title update
}
```

### Authentication Request/Response

```typescript
interface SignupRequest {
  email: string;      // Required, valid email format
  password: string;   // Required, min 8 characters
}

interface LoginRequest {
  email: string;      // Required, valid email format
  password: string;   // Required
}

interface AuthResponse {
  user: User;
  token: string;      // JWT token for API requests
}
```

## State Management Strategy

### Client-Side State (Components)

```typescript
// Task list state
interface TaskListState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

// Task creation state
interface TaskCreationState {
  title: string;
  isSubmitting: boolean;
  validationError: string | null;
}

// Auth state (managed by Better Auth)
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

### Server State (Data Fetching)

- User tasks: Fetched on dashboard load (Server Component or useEffect)
- Auth session: Managed by Better Auth (automatic session checks)
- Token storage: Better Auth handles JWT token management

## Component State Responsibilities

### Navigation Bar
- User authentication state (read from Better Auth)
- Logout action (dispatch to Better Auth client)

### Task List
- Task list (from API or optimistic updates)
- Loading state (initial fetch)
- Error state (API failures)

### Task Item
- Optimistic status (pending/completed toggle)
- Loading state (update in progress)
- Delete confirmation (modal/dialog state)

### Task Creation Form
- Form input (task title)
- Validation state (empty title check)
- Submission state (isSubmitting)

### Auth Pages (Signup/Login)
- Form inputs (email, password)
- Validation errors (inline)
- Submission state (isSubmitting)
- API errors (displayed to user)

## Data Flow Patterns

### Optimistic Updates

```
User Action → Update UI Immediately → Call API →
  ├─ Success: UI already updated ✓
  └─ Error: Rollback UI change + Show error
```

**Applied to**: Task completion toggle, task deletion (after confirmation)

### Non-Optimistic Updates

```
User Action → Show Loading → Call API →
  ├─ Success: Update UI + Hide Loading
  └─ Error: Hide Loading + Show Error Message
```

**Applied to**: Task creation, task edit, signup, login

### Session-Based Data Refresh

```
Page Load → Check Auth Session →
  ├─ Authenticated: Fetch User Tasks → Display
  └─ Unauthenticated: Redirect to Login
```

**Applied to**: Dashboard load, protected route access

## Error Handling

### API Error Types

```typescript
interface ApiError {
  message: string;         // User-friendly error message
  code: string;           // Error code for programmatic handling
  details?: Record<string, unknown>;  // Additional error context
}
```

### Error State Management

- **Network errors**: Display "Connection error. Please try again."
- **401 Unauthorized**: Redirect to login page (session expired)
- **403 Forbidden**: Display "You don't have permission to access this resource"
- **404 Not Found**: Display "Resource not found"
- **422 Validation Error**: Display field-specific validation messages
- **500 Server Error**: Display "Server error. Please try again later."

## Type Safety

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Utility Types

```typescript
// Derive partial type for updates
type PartialTask = Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

// Error response type
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

// Loading state helper
type LoadingState<T> =
  | { status: 'idle'; data: null }
  | { status: 'loading'; data: null }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

## Summary

This data model provides:
- Clear TypeScript interfaces for all frontend entities
- Validation rules mapped from spec requirements
- State management strategy aligned with React hooks constraint
- Optimistic and non-optimistic update patterns
- Comprehensive error handling approach
- Strict type safety configuration

All structures align with:
- Feature spec (User and Task entities from FR-015, FR-033)
- Constitution (Security-by-Default - token management)
- Technical constraints (TypeScript, no global state libraries)

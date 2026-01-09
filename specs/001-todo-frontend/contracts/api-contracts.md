# API Contracts: Todo Frontend

**Feature**: 001-todo-frontend | **Date**: 2026-01-04
**Purpose**: Define frontend-backend API contracts for task management and authentication

## Authentication Endpoints

### POST /api/auth/signup

**Description**: Register a new user account

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```typescript
{
  email: string;      // Required, valid email format
  password: string;   // Required, min 8 characters
}
```

**Success Response (201)**:
```json
{
  "user": {
    "id": "string (UUID)",
    "email": "string",
    "emailVerified": "boolean",
    "createdAt": "string (ISO-8601)"
  },
  "token": "string (JWT)"
}
```

**Error Responses**:
- **400 Bad Request**: Invalid email format or password too short
  ```json
  {
    "error": {
      "message": "Validation failed",
      "code": "VALIDATION_ERROR",
      "details": {
        "password": "Password must be at least 8 characters"
      }
    }
  }
  ```
- **409 Conflict**: Email already in use
  ```json
  {
    "error": {
      "message": "Email already registered",
      "code": "EMAIL_EXISTS"
    }
  }
  ```

---

### POST /api/auth/login

**Description**: Authenticate existing user and receive JWT token

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```typescript
{
  email: string;      // Required, valid email format
  password: string;   // Required
}
```

**Success Response (200)**:
```json
{
  "user": {
    "id": "string (UUID)",
    "email": "string",
    "emailVerified": "boolean",
    "createdAt": "string (ISO-8601)"
  },
  "token": "string (JWT)"
}
```

**Error Responses**:
- **400 Bad Request**: Invalid email format
  ```json
  {
    "error": {
      "message": "Invalid email format",
      "code": "VALIDATION_ERROR"
    }
  }
  ```
- **401 Unauthorized**: Invalid credentials
  ```json
  {
    "error": {
      "message": "Invalid email or password",
      "code": "INVALID_CREDENTIALS"
    }
  }
  ```

---

### POST /api/auth/logout

**Description**: End user session (client-side token invalidation)

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**: None

**Success Response (200)**:
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses**:
- **401 Unauthorized**: Invalid or expired token
  ```json
  {
    "error": {
      "message": "Unauthorized",
      "code": "UNAUTHORIZED"
    }
  }
  ```

---

## Task Endpoints

### GET /api/tasks

**Description**: Fetch all tasks for authenticated user

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**: None

**Success Response (200)**:
```json
{
  "tasks": [
    {
      "id": "string (UUID)",
      "title": "string",
      "status": "pending|completed",
      "userId": "string (UUID)",
      "createdAt": "string (ISO-8601)",
      "updatedAt": "string (ISO-8601)"
    }
  ]
}
```

**Error Responses**:
- **401 Unauthorized**: Missing, invalid, or expired token
  ```json
  {
    "error": {
      "message": "Unauthorized",
      "code": "UNAUTHORIZED"
    }
  }
  ```
- **500 Internal Server Error**: Server error during fetch
  ```json
  {
    "error": {
      "message": "Failed to fetch tasks",
      "code": "SERVER_ERROR"
    }
  }
  ```

---

### POST /api/tasks

**Description**: Create a new task for authenticated user

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```typescript
{
  title: string;  // Required, non-empty, max 200 chars
}
```

**Success Response (201)**:
```json
{
  "task": {
    "id": "string (UUID)",
    "title": "string",
    "status": "pending",
    "userId": "string (UUID)",
    "createdAt": "string (ISO-8601)",
    "updatedAt": "string (ISO-8601)"
  }
}
```

**Error Responses**:
- **400 Bad Request**: Validation error (empty title, too long)
  ```json
  {
    "error": {
      "message": "Validation failed",
      "code": "VALIDATION_ERROR",
      "details": {
        "title": "Title is required and must be at most 200 characters"
      }
    }
  }
  ```
- **401 Unauthorized**: Missing, invalid, or expired token
  ```json
  {
    "error": {
      "message": "Unauthorized",
      "code": "UNAUTHORIZED"
    }
  }
  ```

---

### PATCH /api/tasks/:id

**Description**: Update an existing task (status and/or title)

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```typescript
{
  status?: 'pending' | 'completed';  // Optional
  title?: string;                       // Optional, max 200 chars
}
```

**Success Response (200)**:
```json
{
  "task": {
    "id": "string (UUID)",
    "title": "string",
    "status": "pending|completed",
    "userId": "string (UUID)",
    "createdAt": "string (ISO-8601)",
    "updatedAt": "string (ISO-8601)"
  }
}
```

**Error Responses**:
- **400 Bad Request**: Validation error
  ```json
  {
    "error": {
      "message": "Validation failed",
      "code": "VALIDATION_ERROR",
      "details": {
        "title": "Title must be at most 200 characters"
      }
    }
  }
  ```
- **401 Unauthorized**: Missing, invalid, or expired token
  ```json
  {
    "error": {
      "message": "Unauthorized",
      "code": "UNAUTHORIZED"
    }
  }
  ```
- **403 Forbidden**: Attempting to update another user's task
  ```json
  {
    "error": {
      "message": "You do not have permission to modify this task",
      "code": "FORBIDDEN"
    }
  }
  ```
- **404 Not Found**: Task does not exist
  ```json
  {
    "error": {
      "message": "Task not found",
      "code": "NOT_FOUND"
    }
  }
  ```

---

### DELETE /api/tasks/:id

**Description**: Delete an existing task

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**: None

**Success Response (200)**:
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses**:
- **401 Unauthorized**: Missing, invalid, or expired token
  ```json
  {
    "error": {
      "message": "Unauthorized",
      "code": "UNAUTHORIZED"
    }
  }
  ```
- **403 Forbidden**: Attempting to delete another user's task
  ```json
  {
    "error": {
      "message": "You do not have permission to delete this task",
      "code": "FORBIDDEN"
    }
  }
  ```
- **404 Not Found**: Task does not exist
  ```json
  {
    "error": {
      "message": "Task not found",
      "code": "NOT_FOUND"
    }
  }
  ```

---

## Error Response Format

All error responses follow this structure:

```typescript
interface ErrorResponse {
  error: {
    message: string;                              // User-friendly error message
    code: string;                                 // Error code for programmatic handling
    details?: Record<string, string | string[]>;    // Field-specific errors (optional)
  };
}
```

**Error Codes Reference**:
- `VALIDATION_ERROR`: Request data validation failed
- `UNAUTHORIZED`: Missing, invalid, or expired JWT token
- `FORBIDDEN`: Attempting to access/modify another user's data
- `NOT_FOUND`: Requested resource does not exist
- `EMAIL_EXISTS`: Email already registered during signup
- `INVALID_CREDENTIALS`: Email or password incorrect
- `SERVER_ERROR`: Unexpected server error

---

## Frontend Implementation Guidelines

### JWT Token Handling

1. **Storage**: Store JWT token in localStorage or httpOnly cookie (configurable via Better Auth)
2. **Attachment**: Include `Authorization: Bearer <token>` header on all authenticated requests
3. **Refresh**: Use Better Auth's automatic token refresh mechanism
4. **Expiry**: Handle 401 errors by redirecting to login page

### Request Interceptor Pattern

```typescript
// Example fetch wrapper
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken(); // Get from Better Auth or storage

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    // Redirect to login
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data;
}
```

### Error Display Guidelines

- **Validation errors**: Display inline below relevant form field
- **Auth errors**: Display clearly above form with action guidance
- **Network errors**: Display non-intrusive toast notification
- **401 errors**: Redirect to login (show message if unexpected)
- **403/404 errors**: Display user-friendly message about resource access

---

## Summary

This API contract specification provides:
- Clear endpoints for all auth and task operations
- Typed request/response structures
- Comprehensive error handling with user-friendly messages
- JWT token attachment guidelines
- Frontend implementation patterns

All contracts align with:
- Feature spec (all functional requirements covered)
- Research findings (fetch-based API client)
- Data model (TypeScript interfaces match contracts)
- Constitution (Security-by-Default with JWT auth)

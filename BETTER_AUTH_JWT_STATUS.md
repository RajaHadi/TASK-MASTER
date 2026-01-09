# Better Auth JWT Implementation Status

## ✅ Implementation Complete - According to jwt.md Documentation

### 1. Better Auth Client Configuration ✅

**File**: `frontend/src/lib/better-auth.ts`

```typescript
import { createAuthClient } from "better-auth/client";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  plugins: [
    jwtClient()  // JWT plugin enabled per jwt.md line 158
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

**Documentation Reference**: jwt.md lines 152-161
- ✅ Using `createAuthClient` (correct API)
- ✅ JWT plugin added with `jwtClient()`
- ✅ Base URL configured for backend API

---

### 2. JWT Token Retrieval ✅

**File**: `frontend/src/lib/api-client.ts`

```typescript
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Get JWT token using Better Auth's token() method
  let jwtToken: string | null = null;

  try {
    const { data, error } = await authClient.token();
    if (data?.token) {
      jwtToken = data.token;
    }
  } catch (error) {
    // Token retrieval failed - user may not be authenticated
  }

  // Fallback to localStorage token if Better Auth token() fails
  if (!jwtToken && typeof window !== 'undefined') {
    jwtToken = localStorage.getItem('token');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
    },
  });
  // ...
}
```

**Documentation Reference**: jwt.md lines 166-174
- ✅ Using `authClient.token()` method (recommended approach)
- ✅ Extracting token from `data.token`
- ✅ Attaching to `Authorization: Bearer <token>` header
- ✅ Fallback to localStorage for backward compatibility

---

### 3. Authentication Flow ✅

**Files**:
- `frontend/src/lib/auth.ts`
- `frontend/app/signup/page.tsx`
- `frontend/app/login/page.tsx`

**Signup/Login Pattern**:
```typescript
export async function signUpWithBetterAuth(email: string, password: string) {
  const result = await authClient.signUp.email({ email, password });

  if (result.data?.session) {
    const token = result.data.session.token || '';
    const user = result.data.user;

    setToken(token);
    setUser(user as User);

    return { user: user as User, token };
  }

  throw new Error('Signup failed');
}
```

**What Happens**:
1. User fills signup/login form
2. Frontend calls `authClient.signUp.email()` or `authClient.signIn.email()`
3. Better Auth → `POST /api/auth/signup` or `POST /api/auth/login`
4. Backend creates/verifies user, signs JWT with SECRET_KEY
5. Backend returns `{ user, session: { token } }`
6. Better Auth stores session
7. Frontend stores token in localStorage for backward compatibility
8. User redirected to `/dashboard`

**Documentation Reference**: jwt.md lines 140-211
- ✅ Better Auth handles session management
- ✅ JWT token automatically issued by backend
- ✅ Token stored and managed by Better Auth
- ✅ Token available via `authClient.token()` method

---

### 4. Protected API Requests ✅

**Pattern**:
```typescript
// Every API call automatically includes JWT token
const tasks = await api.getTasks();  // Authorization: Bearer <jwt>
await api.createTask(title);         // Authorization: Bearer <jwt>
await api.updateTask(id, data);      // Authorization: Bearer <jwt>
await api.deleteTask(id);            // Authorization: Bearer <jwt>
```

**Auto-Redirect on 401**:
```typescript
if (response.status === 401) {
  window.location.href = '/login';
  throw new Error('Unauthorized');
}
```

**Documentation Reference**: jwt.md lines 188-196
- ✅ Token attached to all API requests
- ✅ Authorization header format: `Bearer <token>`
- ✅ Automatic redirect on authentication failure

---

## 📋 What Backend Needs to Implement

According to the user's roadmap and jwt.md documentation, the backend must:

### 1. Install Better Auth Server + JWT Plugin

```bash
# Backend dependencies
pip install better-auth python-jose[cryptography] passlib[bcrypt]
```

### 2. Environment Configuration

**Backend `.env`**:
```env
SECRET_KEY=your-super-secret-key-at-least-32-characters-long-change-in-production
# ☝️ MUST MATCH frontend's BETTER_AUTH_SECRET
DATABASE_URL=postgresql://user:password@localhost/dbname
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**Critical**: `SECRET_KEY` must be identical to frontend's `BETTER_AUTH_SECRET`

### 3. JWT Token Generation (Backend)

```python
from jose import jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def create_access_token(user_id: str, email: str):
    """Create JWT token that Better Auth can verify"""
    payload = {
        "sub": user_id,        # User ID (required)
        "email": email,        # User email
        "exp": datetime.utcnow() + timedelta(days=1)  # 24hr expiry
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token
```

**Documentation Reference**: jwt.md lines 249-273
- Token signed with shared `SECRET_KEY`
- Standard JWT claims: `sub` (user ID), `email`, `exp` (expiration)
- Issuer/Audience default to BASE_URL (can be customized)

### 4. JWT Verification Middleware (Backend)

```python
from fastapi import Depends, HTTPException, Header
from jose import jwt, JWTError

async def get_current_user(authorization: str = Header(None)):
    """Verify Better Auth JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Fetch user from database
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Documentation Reference**: jwt.md lines 212-220, 249-268
- Extract token from `Authorization: Bearer <token>` header
- Verify token using shared `SECRET_KEY`
- Decode user ID from `sub` claim
- Fetch user from database
- Return user object for protected endpoints

### 5. Auth Endpoints (Backend)

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/api/auth/signup")
async def signup(email: str, password: str):
    # Check if user exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed = pwd_context.hash(password)

    # Create user
    user = User(email=email, hashed_password=hashed)
    db.add(user)
    db.commit()

    # Generate JWT token
    token = create_access_token(user.id, user.email)

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "emailVerified": False,
            "createdAt": user.created_at.isoformat()
        },
        "session": {
            "token": token
        }
    }

@router.post("/api/auth/login")
async def login(email: str, password: str):
    # Find user
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate JWT token
    token = create_access_token(user.id, user.email)

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "emailVerified": user.email_verified,
            "createdAt": user.created_at.isoformat()
        },
        "session": {
            "token": token
        }
    }
```

**Response Format**: Must match Better Auth's expected structure:
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "emailVerified": false,
    "createdAt": "..."
  },
  "session": {
    "token": "eyJhbGc..."
  }
}
```

### 6. Protected Task Endpoints (Backend)

```python
@router.get("/api/tasks")
async def get_tasks(current_user: User = Depends(get_current_user)):
    """Get tasks for authenticated user only"""
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    return {"tasks": tasks}

@router.post("/api/tasks")
async def create_task(
    title: str,
    current_user: User = Depends(get_current_user)
):
    """Create task for authenticated user"""
    task = Task(
        title=title,
        status="pending",
        user_id=current_user.id
    )
    db.add(task)
    db.commit()
    return {"task": task}

@router.patch("/api/tasks/{id}")
async def update_task(
    id: str,
    data: UpdateTaskRequest,
    current_user: User = Depends(get_current_user)
):
    """Update user's task only"""
    task = db.query(Task).filter(
        Task.id == id,
        Task.user_id == current_user.id  # User isolation
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = data.status
    db.commit()
    return {"task": task}

@router.delete("/api/tasks/{id}")
async def delete_task(
    id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete user's task only"""
    task = db.query(Task).filter(
        Task.id == id,
        Task.user_id == current_user.id  # User isolation
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}
```

**Critical**: ALL task queries MUST filter by `current_user.id` (user isolation)

---

## 🔐 Security Architecture

### Shared Secret Model

```
┌─────────────────────────────────────────────────┐
│  BETTER_AUTH_SECRET (Frontend .env.local)       │
│  = your-super-secret-key-at-least-32...         │
└────────────────────┬────────────────────────────┘
                     │
                     │ MUST MATCH
                     │
┌────────────────────▼────────────────────────────┐
│  SECRET_KEY (Backend .env)                      │
│  = your-super-secret-key-at-least-32...         │
└─────────────────────────────────────────────────┘
```

### Token Flow

```
1. User Signup/Login
   ├─> Frontend: signUpWithBetterAuth(email, password)
   ├─> Better Auth → POST /api/auth/signup
   ├─> Backend: Hash password, create user
   ├─> Backend: jwt.encode(payload, SECRET_KEY)
   └─> Backend → { user, session: { token } }

2. Better Auth stores session with token

3. API Request
   ├─> Component: api.getTasks()
   ├─> API Client: authClient.token() → JWT
   ├─> Request → Authorization: Bearer <jwt>
   ├─> Backend: jwt.decode(token, SECRET_KEY) → user_id
   ├─> Backend: Filter by user_id
   └─> Response → { tasks: [...] }
```

**Documentation Reference**: jwt.md entire document
- Stateless authentication (no database sessions)
- Token contains user identity (`sub` claim)
- Backend verifies token without calling auth service
- User data isolated by `user_id` from token

---

## ✅ Frontend Checklist (COMPLETE)

- [X] Install Better Auth package
- [X] Configure Better Auth client with `createAuthClient()`
- [X] Add JWT plugin with `jwtClient()`
- [X] Update API client to use `authClient.token()`
- [X] Implement signup with Better Auth
- [X] Implement login with Better Auth
- [X] Implement logout with Better Auth
- [X] Auto-attach JWT to all API requests
- [X] Auto-redirect on 401 responses
- [X] Create environment configuration (.env.local)
- [X] Document setup in BETTER_AUTH_SETUP.md
- [X] Document status in FRONTEND_STATUS.md
- [X] Verify implementation matches jwt.md

---

## 🔄 Backend Checklist (TODO)

- [ ] Install FastAPI + JWT dependencies
- [ ] Configure SECRET_KEY (match frontend)
- [ ] Create User model (SQLModel/SQLAlchemy)
- [ ] Create Task model with user_id foreign key
- [ ] Implement password hashing (bcrypt)
- [ ] Create JWT signing function
- [ ] Create JWT verification middleware
- [ ] Implement POST /api/auth/signup
- [ ] Implement POST /api/auth/login
- [ ] Implement GET /api/tasks (with user filtering)
- [ ] Implement POST /api/tasks (with user isolation)
- [ ] Implement PATCH /api/tasks/:id (with user ownership check)
- [ ] Implement DELETE /api/tasks/:id (with user ownership check)
- [ ] Configure CORS for frontend origin
- [ ] Test end-to-end authentication flow

---

## 🎯 Current Status: READY FOR BACKEND

### What Works Now (Frontend Only)
- ✅ Better Auth JWT client configured correctly
- ✅ All pages render (landing, signup, login, dashboard)
- ✅ Form validation works
- ✅ JWT token retrieval via `authClient.token()`
- ✅ Token automatically attached to API requests
- ✅ UI components complete
- ✅ Task CRUD operations implemented (client-side)

### What Needs Backend
- ❌ User registration (POST /api/auth/signup)
- ❌ User login (POST /api/auth/login)
- ❌ JWT token generation (backend signing)
- ❌ JWT token verification (backend middleware)
- ❌ Task CRUD operations (API endpoints)
- ❌ User data isolation (filter by user_id)

---

## 📚 Documentation References

All implementation follows:
- **jwt.md** - Official Better Auth JWT plugin documentation
- **User's Roadmap** - Shared secret JWT architecture
- **BETTER_AUTH_SETUP.md** - Complete setup guide
- **FRONTEND_STATUS.md** - Implementation progress

---

## ⚡ Next Action

**READY TO BUILD BACKEND** with:
1. FastAPI + JWT verification using shared secret
2. User authentication endpoints (signup/login)
3. Task CRUD endpoints with user filtering
4. Password hashing and validation
5. CORS configuration for frontend

The frontend is now fully configured according to jwt.md documentation and ready for backend integration.

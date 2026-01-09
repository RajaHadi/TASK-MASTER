# Better Auth Setup Guide

## Frontend Setup ✅ COMPLETE

### 1. Installation
```bash
cd frontend
npm install better-auth
```

### 2. Configuration Files

#### `.env.local` (Frontend)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-key-at-least-32-characters-long-change-in-production
```

#### Better Auth Client (`src/lib/better-auth.ts`)
```typescript
import { betterAuth } from "better-auth/client";

export const authClient = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  plugins: [],
});
```

### 3. Integration Points

✅ **Auth Utilities** (`src/lib/auth.ts`)
- `signUpWithBetterAuth()` - Handles user registration
- `signInWithBetterAuth()` - Handles user login
- `logout()` - Signs out via Better Auth
- `getSession()` - Retrieves current session

✅ **API Client** (`src/lib/api-client.ts`)
- Automatically attaches Better Auth JWT token to all requests
- Falls back to localStorage token if Better Auth session unavailable

✅ **Auth Pages**
- Signup page uses `signUpWithBetterAuth()`
- Login page uses `signInWithBetterAuth()`

---

## Backend Setup 🔄 TODO

### 1. Install Dependencies (FastAPI)
```bash
pip install python-jose[cryptography] passlib[bcrypt] python-multipart
```

### 2. Environment Variables

#### `.env` (Backend)
```env
SECRET_KEY=your-super-secret-key-at-least-32-characters-long-change-in-production
DATABASE_URL=postgresql://user:password@localhost/dbname
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**CRITICAL:** `SECRET_KEY` must match `BETTER_AUTH_SECRET` from frontend!

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
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token
```

### 4. JWT Verification Middleware (Backend)

```python
from fastapi import Depends, HTTPException, Header
from jose import jwt, JWTError
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

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

### 5. Auth Endpoints (Backend)

```python
from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/api/auth/signup")
async def signup(email: str, password: str):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_password = pwd_context.hash(password)

    # Create user
    user = User(email=email, hashed_password=hashed_password)
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
        "token": token
    }

@router.post("/api/auth/login")
async def login(email: str, password: str):
    # Find user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password
    if not pwd_context.verify(password, user.hashed_password):
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
        "token": token
    }
```

### 6. Protected Routes (Backend)

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
```

---

## How It Works

### 1. User Signup/Login Flow

```
┌──────────────┐
│   Frontend   │
│  (Better     │
│   Auth)      │
└──────┬───────┘
       │
       │ 1. signUpWithBetterAuth(email, password)
       ▼
┌──────────────┐
│ Better Auth  │
│   Client     │
└──────┬───────┘
       │
       │ 2. POST /api/auth/signup
       │    { email, password }
       ▼
┌──────────────┐
│   Backend    │
│  (FastAPI)   │
│              │
│ - Hash pwd   │
│ - Create usr │
│ - Sign JWT   │
└──────┬───────┘
       │
       │ 3. { user, token }
       ▼
┌──────────────┐
│  localStorage│
│  token: JWT  │
└──────────────┘
```

### 2. API Request Flow

```
┌──────────────┐
│  Dashboard   │
│  Component   │
└──────┬───────┘
       │
       │ api.getTasks()
       ▼
┌──────────────┐
│ API Client   │
│              │
│ Gets token   │
│ from Better  │
│ Auth session │
└──────┬───────┘
       │
       │ GET /api/tasks
       │ Authorization: Bearer eyJhbGc...
       ▼
┌──────────────┐
│   Backend    │
│              │
│ - Verify JWT │
│ - Extract ID │
│ - Filter by  │
│   user_id    │
└──────┬───────┘
       │
       │ { tasks: [...] }
       ▼
┌──────────────┐
│  Dashboard   │
│   Shows      │
│   Tasks      │
└──────────────┘
```

---

## Security Benefits

| Benefit | Description |
|---------|-------------|
| **User Isolation** | Each user only sees their own tasks (filtered by `user_id`) |
| **Stateless Auth** | Backend doesn't need database sessions |
| **Token Expiry** | JWTs automatically expire (configurable) |
| **Shared Secret** | Both services verify tokens with same secret key |
| **No Plaintext Passwords** | Passwords hashed with bcrypt |

---

## Testing

### 1. Frontend Only (Current State)
```bash
cd frontend
npm run dev
```
- ✅ Pages render correctly
- ❌ Auth will fail (no backend)
- ❌ API calls will fail

### 2. With Backend (After Implementation)
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```
- ✅ Full signup/login flow works
- ✅ JWT tokens issued and verified
- ✅ Tasks filtered by user
- ✅ Protected routes enforced

---

## Next Steps

1. ✅ **Frontend Setup** - COMPLETE
2. 🔄 **Backend Implementation** - Build FastAPI backend with JWT
3. 🔄 **Database Models** - User and Task tables
4. 🔄 **Test Integration** - Verify end-to-end flow
5. 🔄 **Deploy** - Production deployment with secure secrets

---

## Common Issues

### Issue: "Invalid token"
- **Cause**: `SECRET_KEY` mismatch between frontend and backend
- **Fix**: Ensure both `.env` files use the same secret

### Issue: "User not found"
- **Cause**: JWT verified but user deleted from database
- **Fix**: Check database for user with ID from token

### Issue: "401 Unauthorized"
- **Cause**: Token expired or missing
- **Fix**: Re-login to get new token

---

## Resources

- Better Auth Docs: https://www.better-auth.com/docs
- FastAPI JWT: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- JWT.io: https://jwt.io/ (Debug tokens)

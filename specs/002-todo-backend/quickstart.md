# Quickstart Guide: Backend API Setup

**Feature**: 002-todo-backend
**Target Audience**: Developers setting up the backend for the first time
**Prerequisites**: Python 3.13+, PostgreSQL access (Neon), Git

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Running the Backend](#running-the-backend)
5. [Testing the API](#testing-the-api)
6. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### 1. Clone the Repository (if not already done)

```bash
git clone <repository-url>
cd my-fullstack-todo
git checkout 002-todo-backend
```

### 2. Navigate to Backend Directory

```bash
cd backend
```

### 3. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

**Expected dependencies**:
- `fastapi>=0.109.0`
- `sqlmodel>=0.0.14`
- `python-jose[cryptography]>=3.3.0`
- `psycopg2-binary>=2.9.9`
- `uvicorn>=0.25.0`
- `python-dotenv>=1.0.0`
- `pydantic>=2.0.0`

---

## Environment Configuration

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Edit `.env` File

Open `.env` in your text editor and configure the following variables:

```env
# Database Configuration (Required)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication Secret (Required - MUST match frontend)
SECRET_KEY=your-super-secret-key-at-least-32-characters-long

# CORS Configuration (Required for frontend)
CORS_ORIGINS=http://localhost:3000

# Environment (Optional)
ENVIRONMENT=development

# Logging (Optional)
LOG_LEVEL=INFO
```

### 3. Get Neon PostgreSQL Connection String

**Option A: Using Existing Neon Database**

1. Log in to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to "Connection Details"
4. Copy the connection string
5. Paste into `DATABASE_URL` in `.env`

**Option B: Create New Neon Database**

1. Go to [Neon Console](https://console.neon.tech)
2. Click "Create Project"
3. Name: `todo-backend`
4. Region: Choose closest to your location
5. Copy the connection string
6. Paste into `DATABASE_URL` in `.env`

### 4. Configure Shared Secret

**CRITICAL**: The `SECRET_KEY` in backend `.env` MUST match `BETTER_AUTH_SECRET` in frontend `.env.local`

To generate a secure secret:

```bash
# Option 1: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Option 2: OpenSSL
openssl rand -base64 32
```

Copy the generated secret to both:
- Backend: `SECRET_KEY` in `.env`
- Frontend: `BETTER_AUTH_SECRET` in `.env.local`

---

## Database Setup

### 1. Initialize Database Schema

The database schema will be created automatically on first run using SQLModel's `create_all()` method.

Alternatively, if using Alembic migrations:

```bash
# Generate initial migration
alembic revision --autogenerate -m "Create tasks table"

# Review the generated migration file
# Located in: backend/alembic/versions/

# Apply migration
alembic upgrade head
```

### 2. Verify Database Connection

Test the database connection:

```bash
python -c "from sqlmodel import create_engine; import os; from dotenv import load_dotenv; load_dotenv(); engine = create_engine(os.getenv('DATABASE_URL')); print('Database connection successful!')"
```

Expected output: `Database connection successful!`

---

## Running the Backend

### Development Mode (with auto-reload)

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Flags**:
- `--reload`: Auto-restart on code changes
- `--host 0.0.0.0`: Accept connections from any network interface
- `--port 8000`: Listen on port 8000

**Expected output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Production Mode (no auto-reload)

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Flags**:
- `--workers 4`: Run 4 worker processes (adjust based on CPU cores)
- No `--reload`: Optimized for production

---

## Testing the API

### 1. Check Health Endpoint

```bash
curl http://localhost:8000/health
```

**Expected response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-06T12:00:00Z"
}
```

### 2. View API Documentation

Open in your browser:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 3. Test Authentication Flow

**Step 1: Get JWT Token from Frontend**

1. Start the frontend (`cd frontend && npm run dev`)
2. Sign up or log in at http://localhost:3000
3. Open browser DevTools → Application → Local Storage
4. Copy the value of the `token` key

**Step 2: Test Protected Endpoint**

```bash
# Replace <YOUR_JWT_TOKEN> with the actual token
export TOKEN="<YOUR_JWT_TOKEN>"

# List tasks (should return empty array for new user)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/tasks
```

**Expected response**:
```json
{
  "tasks": []
}
```

**Step 3: Create a Task**

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task from API"}' \
  http://localhost:8000/api/tasks
```

**Expected response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Test task from API",
  "status": "pending",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2026-01-06T12:00:00Z",
  "updated_at": "2026-01-06T12:00:00Z"
}
```

**Step 4: List Tasks Again**

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/tasks
```

**Expected response**:
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Test task from API",
      "status": "pending",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2026-01-06T12:00:00Z",
      "updated_at": "2026-01-06T12:00:00Z"
    }
  ]
}
```

---

## Troubleshooting

### Issue: Database Connection Failed

**Error**: `OperationalError: could not connect to server`

**Solutions**:
1. Verify `DATABASE_URL` in `.env` is correct
2. Check Neon dashboard for connection string
3. Ensure Neon database is not paused (auto-pauses after inactivity)
4. Test connection manually: `psql $DATABASE_URL`

### Issue: JWT Token Invalid

**Error**: `401 Unauthorized - Invalid token`

**Solutions**:
1. Verify `SECRET_KEY` matches frontend's `BETTER_AUTH_SECRET`
2. Check token hasn't expired (default 24 hours)
3. Ensure token includes `Bearer ` prefix in Authorization header
4. Verify token was copied correctly (no trailing spaces)

### Issue: CORS Error from Frontend

**Error**: `Access to fetch at 'http://localhost:8000/api/tasks' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solutions**:
1. Verify `CORS_ORIGINS` in `.env` includes frontend URL
2. Check CORS middleware is registered in `main.py`
3. Ensure backend is running on expected port (8000)
4. Restart backend after changing `.env`

### Issue: Module Import Errors

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solutions**:
1. Ensure virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements.txt`
3. Check Python version: `python --version` (should be 3.13+)

### Issue: Port Already in Use

**Error**: `[Errno 48] Address already in use`

**Solutions**:
1. Kill process using port 8000: `lsof -ti:8000 | xargs kill -9` (macOS/Linux)
2. Or use different port: `uvicorn src.main:app --port 8001`
3. Update frontend API URL to match new port

### Issue: Tasks Not Persisting

**Error**: Tasks disappear after server restart

**Solutions**:
1. Verify using PostgreSQL, not SQLite
2. Check `DATABASE_URL` points to Neon (starts with `postgresql://`)
3. Ensure database migrations have been applied
4. Check database for `tasks` table: `psql $DATABASE_URL -c "\dt"`

### Issue: User Isolation Not Working

**Error**: Users can see other users' tasks

**Solutions**:
1. Verify `get_current_user` dependency extracts `user_id` from JWT
2. Check all queries filter by `Task.user_id == current_user.id`
3. Review JWT token payload: `jwt.io` to decode token
4. Ensure JWT `sub` claim contains correct user ID

---

## Next Steps

Once the backend is running successfully:

1. **Frontend Integration**: Start frontend and verify end-to-end flow
2. **Run Tests**: `pytest tests/` to verify all tests pass
3. **Review Logs**: Check console output for warnings or errors
4. **Monitor Performance**: Use `/docs` endpoint to explore API
5. **Production Deployment**: Follow deployment guide for your hosting platform

---

## Quick Reference

### Useful Commands

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn src.main:app --reload

# Run tests
pytest

# Apply database migrations
alembic upgrade head

# Check code quality
ruff check src/
black --check src/

# Generate requirements file
pip freeze > requirements.txt
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `SECRET_KEY` | Yes | - | JWT signing secret (match frontend) |
| `CORS_ORIGINS` | Yes | `http://localhost:3000` | Allowed frontend origins |
| `ENVIRONMENT` | No | `development` | Environment name |
| `LOG_LEVEL` | No | `INFO` | Logging verbosity |

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/docs` | No | API documentation (Swagger) |
| GET | `/api/tasks` | Yes | List user's tasks |
| POST | `/api/tasks` | Yes | Create new task |
| GET | `/api/tasks/{id}` | Yes | Get single task |
| PUT | `/api/tasks/{id}` | Yes | Update task title |
| PATCH | `/api/tasks/{id}` | Yes | Update task status |
| DELETE | `/api/tasks/{id}` | Yes | Delete task |

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (task created) |
| 400 | Bad Request | Invalid request payload |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but wrong user |
| 404 | Not Found | Task doesn't exist |
| 500 | Internal Server Error | Unhandled exception |
| 503 | Service Unavailable | Database connection failure |

---

## Support

For issues or questions:
- Check API documentation: http://localhost:8000/docs
- Review logs: Console output from uvicorn
- Consult spec: `specs/002-todo-backend/spec.md`
- Database schema: `specs/002-todo-backend/data-model.md`
- API contracts: `specs/002-todo-backend/contracts/openapi.yaml`

---

**Version**: 1.0.0
**Last Updated**: 2026-01-06
**Tested With**: Python 3.13, FastAPI 0.109, PostgreSQL 16 (Neon)

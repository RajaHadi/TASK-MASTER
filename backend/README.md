# Backend API - Todo Full-Stack Application

This is the FastAPI backend for the multi-user Todo application.

## Quick Start

For detailed setup instructions, see the [Quickstart Guide](../specs/002-todo-backend/quickstart.md).

## Key Features

- **JWT Authentication**: Token-based auth using python-jose (HS256)
- **User Isolation**: All queries filtered by user_id from JWT token
- **RESTful API**: 7 endpoints for complete CRUD operations
- **PostgreSQL**: Neon Serverless PostgreSQL with connection pooling
- **Security**: User data isolation, input validation, standardized error responses

## Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Run development server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, access interactive API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
pytest tests/
```

## Project Structure

```
backend/
├── src/
│   ├── main.py           # FastAPI app initialization
│   ├── config.py         # Environment configuration
│   ├── models/           # SQLModel and Pydantic schemas
│   │   ├── task.py
│   │   └── user.py
│   ├── api/              # API endpoints
│   │   ├── tasks.py
│   │   └── health.py
│   ├── auth/             # JWT authentication
│   │   └── jwt.py
│   └── db/               # Database session management
│       └── session.py
├── tests/                # Integration tests
├── alembic/              # Database migrations
└── requirements.txt      # Python dependencies
```

## Environment Variables

See `.env.example` for required configuration.

**CRITICAL**: `SECRET_KEY` must match `BETTER_AUTH_SECRET` in the frontend for JWT verification to work.

## Documentation

- **Full Specification**: `../specs/002-todo-backend/spec.md`
- **API Contracts**: `../specs/002-todo-backend/contracts/openapi.yaml`
- **Data Model**: `../specs/002-todo-backend/data-model.md`
- **Implementation Plan**: `../specs/002-todo-backend/plan.md`

"""Authentication endpoints for Better Auth compatibility."""

import logging
from datetime import datetime
from uuid import uuid4, UUID
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from jose import jwt
from sqlmodel import Session, select

from ..config import settings
from ..db.session import get_session
from ..models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth")
security = HTTPBearer()


# Request schemas
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Response schemas
class UserResponse(BaseModel):
    id: UUID
    email: str
    email_verified: bool = Field(serialization_alias="emailVerified")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserResponse
    token: str | None = None
    session: dict | None = None


class SessionResponse(BaseModel):
    user: UserResponse
    token: str | None = None


def create_jwt_token(user_id: str, email: str | None = None) -> str:
    """Create a JWT token for the user."""
    payload = {
        "sub": user_id,
        "email": email,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


@router.post("/signup", response_model=AuthResponse)
@router.post("/sign-up/email", response_model=AuthResponse)
async def signup(request: SignupRequest, db_session: Session = Depends(get_session)):
    """
    Create a new user account.

    This endpoint is compatible with Better Auth client.
    """
    try:
        # Check if user already exists
        existing = db_session.exec(
            select(User).where(User.email == request.email)
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        # Create new user
        user = User(
            id=uuid4(),
            email=request.email,
            email_verified=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        # Create JWT token
        token = create_jwt_token(str(user.id), user.email)

        logger.info(f"New user signed up: {user.id}")

        return AuthResponse(
            user=UserResponse.model_validate(user),
            token=token,
            session={"userId": str(user.id), "token": token},  # Better Auth expects token in session
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup failed: {str(e)}")
        db_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create account",
        )


@router.post("/login", response_model=AuthResponse)
@router.post("/sign-in/email", response_model=AuthResponse)
async def login(request: LoginRequest, db_session: Session = Depends(get_session)):
    """
    Authenticate user and return JWT token.

    Note: This is a simplified login that validates email exists.
    For production, add proper password hashing and verification.
    """
    try:
        # Find user by email
        user = db_session.exec(
            select(User).where(User.email == request.email)
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Create JWT token
        token = create_jwt_token(str(user.id), user.email)

        logger.info(f"User logged in: {user.id}")

        return AuthResponse(
            user=UserResponse.model_validate(user),
            token=token,
            session={"userId": str(user.id), "token": token},  # Better Auth expects token in session
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed",
        )


@router.post("/logout")
@router.post("/sign-out")
async def logout():
    """
    Logout user.

    JWT tokens are stateless, so we just return success.
    Client should discard the token.
    """
    return {"message": "Logged out successfully"}


@router.get("/session", response_model=SessionResponse)
@router.get("/get-session", response_model=SessionResponse)
async def get_session(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
):
    """
    Get current session.

    Requires valid JWT token in Authorization header.
    """
    try:
        token = credentials.credentials

        # Decode JWT token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        # Get user from database
        user = session.exec(
            select(User).where(User.id == UUID(user_id))
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        return SessionResponse(
            user=UserResponse.model_validate(user),
            token=token,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )


@router.get("/token")
async def get_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current JWT token.

    Used by Better Auth client to retrieve the token.
    """
    try:
        token = credentials.credentials
        return {"token": token}
    except Exception as e:
        logger.error(f"Token retrieval failed: {str(e)}")
        return {"token": None}

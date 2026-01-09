"""JWT authentication and user verification."""

import logging
from typing import Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel

from ..config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer()


class CurrentUser(BaseModel):
    """Represents the authenticated user extracted from JWT token."""

    id: UUID
    email: Optional[str] = None

    class Config:
        from_attributes = True


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> CurrentUser:
    """
    FastAPI dependency that extracts and verifies the current user from JWT token.

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        CurrentUser: Authenticated user with id and email

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired

    Usage:
        @app.get("/tasks")
        def get_tasks(current_user: CurrentUser = Depends(get_current_user)):
            user_id = current_user.id
            ...
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials

        # Decode JWT token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        # Extract user ID from 'sub' claim
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            logger.warning("JWT token missing 'sub' claim")
            raise credentials_exception

        # Convert to UUID
        try:
            user_id = UUID(user_id_str)
        except ValueError:
            logger.warning(f"Invalid UUID format in JWT 'sub' claim: {user_id_str}")
            raise credentials_exception

        # Extract optional email
        email: Optional[str] = payload.get("email")

        # Log successful authentication
        logger.info(f"User authenticated: {user_id}")

        return CurrentUser(id=user_id, email=email)

    except JWTError as e:
        logger.warning(f"JWT verification failed: {str(e)}")
        raise credentials_exception

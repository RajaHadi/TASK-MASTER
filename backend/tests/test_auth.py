"""Integration tests for JWT authentication."""

from fastapi.testclient import TestClient


def test_missing_token_returns_401(client: TestClient):
    """Test that requests without Authorization header return 401."""
    response = client.get("/api/tasks")
    assert response.status_code == 401


def test_invalid_token_returns_401(client: TestClient):
    """Test that requests with invalid JWT token return 401."""
    response = client.get(
        "/api/tasks",
        headers={"Authorization": "Bearer invalid-token-here"},
    )
    assert response.status_code == 401


def test_valid_token_passes_authentication(
    client: TestClient, test_user_token: str
):
    """Test that valid JWT token allows access to protected endpoints."""
    response = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    # Should not be 401 (may be 404 if endpoint doesn't exist yet)
    assert response.status_code != 401

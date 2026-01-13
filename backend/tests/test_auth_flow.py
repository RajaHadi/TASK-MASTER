from fastapi.testclient import TestClient
from sqlmodel import select
from src.models.user import User

def test_signup_hashes_password(client: TestClient, session):
    """Test that signup creates a user with a hashed password."""
    response = client.post("/api/auth/signup", json={
        "email": "signup_test@example.com",
        "password": "strongpassword123",
        "name": "Test User"
    })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    
    # Verify DB content
    user = session.exec(select(User).where(User.email == "signup_test@example.com")).first()
    assert user is not None
    assert user.hashed_password is not None
    assert user.hashed_password != "strongpassword123"
    # Bcrypt hashes start with $2b$, $2a$, etc.
    assert user.hashed_password.startswith("$") 

def test_login_success(client: TestClient):
    """Test that login works with correct password."""
    email = "login_success@example.com"
    password = "correcthorsebatterystaple"
    
    # Signup first
    client.post("/api/auth/signup", json={
        "email": email,
        "password": password
    })
    
    # Login
    response = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == email

def test_login_failure_wrong_password(client: TestClient):
    """Test that login fails with incorrect password."""
    email = "login_fail@example.com"
    password = "password123"
    
    # Signup
    client.post("/api/auth/signup", json={
        "email": email,
        "password": password
    })
    
    # Login with wrong password
    response = client.post("/api/auth/login", json={
        "email": email,
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"

def test_login_failure_nonexistent_user(client: TestClient):
    """Test that login fails for non-existent user."""
    response = client.post("/api/auth/login", json={
        "email": "ghost@example.com",
        "password": "password"
    })
    assert response.status_code == 401

import hmac
import hashlib
import base64
import json
import time
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.app.config import STORAGE_MODE, COGNITO_USER_POOL_ID, COGNITO_APP_CLIENT_ID

SECRET_KEY = "mtech-software-engineering-scm-inventory-secret-key"
security = HTTPBearer(auto_error=False)

# Seed user credentials for local authentication
LOCAL_USERS = {
    "admin@inventory.io": {
        "id": "USR-ADM-001",
        "username": "admin@inventory.io",
        "password": "Password123!",
        "role": "Admin",
        "name": "Dr. S. Sharma (Administrator)"
    },
    "staff@inventory.io": {
        "id": "USR-STF-002",
        "username": "staff@inventory.io",
        "password": "Password123!",
        "role": "Staff",
        "name": "Alex Mercer (Operations Staff)"
    }
}


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')


def _base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(user_data: Dict[str, Any], expires_delta: int = 86400) -> str:
    """Creates a signed, self-contained JWT token without external heavy dependencies."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_data["id"],
        "username": user_data["username"],
        "role": user_data["role"],
        "name": user_data["name"],
        "exp": int(time.time()) + expires_delta,
        "iat": int(time.time())
    }
    
    encoded_header = _base64url_encode(json.dumps(header).encode('utf-8'))
    encoded_payload = _base64url_encode(json.dumps(payload).encode('utf-8'))
    
    signature_bytes = hmac.new(
        SECRET_KEY.encode('utf-8'),
        f"{encoded_header}.{encoded_payload}".encode('utf-8'),
        hashlib.sha256
    ).digest()
    encoded_signature = _base64url_encode(signature_bytes)
    
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def verify_token(token: str) -> Dict[str, Any]:
    """Verifies HMAC signature and expiration timestamp of the token."""
    parts = token.split('.')
    if len(parts) != 3:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token format."
        )
    
    encoded_header, encoded_payload, encoded_signature = parts
    expected_signature = _base64url_encode(hmac.new(
        SECRET_KEY.encode('utf-8'),
        f"{encoded_header}.{encoded_payload}".encode('utf-8'),
        hashlib.sha256
    ).digest())
    
    if not hmac.compare_digest(encoded_signature, expected_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signature."
        )
    
    payload = json.loads(_base64url_decode(encoded_payload).decode('utf-8'))
    if payload.get("exp", 0) < time.time():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again."
        )
    
    return payload


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    """FastAPI Dependency: verifies Bearer token and returns active user."""
    if not credentials or not credentials.credentials:
        # Default mock admin user if no header is supplied in local mode for convenience during demo
        if STORAGE_MODE == "local":
            return LOCAL_USERS["admin@inventory.io"]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token."
        )
    
    return verify_token(credentials.credentials)


def require_role(allowed_roles: List[str]):
    """Role-based authorization guard."""
    def role_checker(user: Dict[str, Any] = Depends(get_current_user)):
        user_role = user.get("role", "Staff")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of the following roles: {', '.join(allowed_roles)}"
            )
        return user
    return role_checker

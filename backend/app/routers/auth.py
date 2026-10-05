from fastapi import APIRouter, HTTPException, Depends, status
from backend.app.models import LoginRequest, LoginResponse, UserResponse
from backend.app.auth import LOCAL_USERS, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    """
    Authenticates user credentials against local credentials or Cognito.
    Returns signed Bearer JWT token.
    """
    username = payload.username.lower().strip()
    user_record = LOCAL_USERS.get(username)
    
    if not user_record or user_record["password"] != payload.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    token = create_access_token(user_record)
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_record["id"],
            "username": user_record["username"],
            "role": user_record["role"],
            "name": user_record["name"]
        }
    }


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: dict = Depends(get_current_user)):
    """Returns currently authenticated user profile."""
    return {
        "id": current_user.get("sub", current_user.get("id")),
        "username": current_user.get("username"),
        "role": current_user.get("role", "Staff"),
        "name": current_user.get("name", "User")
    }


@router.post("/logout")
def logout():
    """Client handles token disposal."""
    return {"success": True, "message": "Logged out successfully."}

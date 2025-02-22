from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Any
from ...core.db import get_supabase
from ...core.models import UserResponse

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(oauth2_scheme)) -> Any:
    """
    Get current user profile.
    """
    try:
        supabase = get_supabase()
        user = supabase.auth.get_user(token)
        return UserResponse(
            id=user.user.id,
            email=user.user.email
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

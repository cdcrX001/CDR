from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from typing import Any
from ...core.models import UserCreate, UserLogin, Token, UserResponse, ResendConfirmation
from ...core.db import get_supabase, get_user_by_token
from postgrest.exceptions import APIError

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate) -> Any:
    """
    Register a new user.
    """
    try:
        supabase = get_supabase()
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed"
            )
            
        return UserResponse(
            id=response.user.id,
            email=response.user.email
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(user: UserLogin) -> Any:
    """
    Login for existing users.
    """
    try:
        print(user)
        supabase = get_supabase()
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        print(response)

        if not response.session:
            if response.error and "email not confirmed" in response.error.message:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Email not confirmed. Please check your inbox."
                )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        return Token(
            access_token=response.session.access_token,
            token_type="bearer"
        )
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)) -> Any:
    """
    Logout user session.
    """
    try:
        supabase = get_supabase()
        supabase.auth.sign_out()
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logout failed"
        )

@router.post("/resend-confirmation", response_model=dict)
async def resend_confirmation(resend_data: ResendConfirmation) -> Any:
    """
    Resend confirmation email to the user.
    """
    try:
        supabase = get_supabase()
        response = supabase.auth.api.send_verification_email(resend_data.email)
        
        if response.error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to resend confirmation email"
            )
        
        return {"message": "Confirmation email resent. Please check your inbox."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

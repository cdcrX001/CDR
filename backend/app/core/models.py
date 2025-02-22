from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    """User registration schema."""
    email: EmailStr
    password: str
    
class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr
    password: str

class Token(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    """User response schema."""
    id: str
    email: EmailStr

class ResendConfirmation(BaseModel):
    """Schema for resending confirmation email."""
    email: EmailStr

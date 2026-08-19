from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    org_name: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str

class MessageResponse(BaseModel):
    message: str

class AdminUserCreate(UserBase):
    password: Optional[str] = None
    org_id: int
    role_id: Optional[int] = None

class SetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class RoleResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    org_id: int
    role: Optional[str] = "Requester"

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

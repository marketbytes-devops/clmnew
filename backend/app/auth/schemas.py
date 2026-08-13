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
    password: str
    org_id: int
    role_id: Optional[int] = None

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
    roles: List[RoleResponse] = []

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

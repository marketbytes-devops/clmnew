from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

# Role Schemas
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: Optional[Any] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[Dict[str, Any]] = None

class RoleOut(RoleBase):
    id: int
    class Config:
        from_attributes = True

# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    department_head_id: Optional[int] = None
    budget_allocated: Optional[float] = 0.0
    sla_configuration: Optional[Dict[str, Any]] = None
    approval_chain: Optional[Dict[str, Any]] = None
    escalation_rules: Optional[Dict[str, Any]] = None

class DepartmentOut(DepartmentBase):
    id: int
    class Config:
        from_attributes = True

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    department_head_id: Optional[int] = None
    budget_allocated: Optional[float] = None
    sla_configuration: Optional[Dict[str, Any]] = None
    approval_chain: Optional[Dict[str, Any]] = None
    escalation_rules: Optional[Dict[str, Any]] = None

# Login History Schemas
class LoginHistoryBase(BaseModel):
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str

class LoginHistoryOut(LoginHistoryBase):
    id: int
    user_id: int
    login_time: datetime
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    name: Optional[str] = None
    is_active: bool = True
    role_id: Optional[int] = None
    department_id: Optional[int] = None
    profile_picture_url: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[int] = None
    department_id: Optional[int] = None
    profile_picture_url: Optional[str] = None

class PasswordReset(BaseModel):
    new_password: str

class UserOut(UserBase):
    id: int
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None
    
    role: Optional[str] = "Requester"
    department: Optional[DepartmentOut] = None
    
    class Config:
        from_attributes = True

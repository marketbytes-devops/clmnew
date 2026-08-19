from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User, Role, Department
from app.schemas.user import UserCreate, UserOut, RoleCreate, RoleOut, RoleUpdate
from app.core.security import get_password_hash
from app.core.dependencies import RoleChecker
from app.core.tenant import get_current_tenant_user, scope_query
from app.auth.utils import send_invite_email
import secrets
from datetime import datetime, timedelta

router = APIRouter()

# Allow only Admins
allow_admin = RoleChecker(["Admin"])

@router.get("/users", response_model=List[UserOut])
def read_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_tenant_user)):
    query = scope_query(db.query(User), User, current_user)
    users = query.offset(skip).limit(limit).all()
    return users

@router.post("/users", response_model=UserOut)
def create_user(
    user: UserCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_tenant_user)
):
    clean_email = user.email.strip().lower() if user.email else ""
    if not clean_email:
        raise HTTPException(status_code=400, detail="Email address is required")

    db_user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    password_to_hash = user.password if user.password else secrets.token_urlsafe(16)
    hashed_password = get_password_hash(password_to_hash)
    
    reset_token = secrets.token_urlsafe(32)
    reset_token_expires = datetime.utcnow() + timedelta(hours=24)

    target_org_id = user.org_id if hasattr(user, 'org_id') and user.org_id else (current_user.org_id if current_user and current_user.org_id else 1)

    db_user = User(
        email=clean_email,
        password_hash=hashed_password,
        full_name=user.full_name,
        is_active=user.is_active,
        org_id=target_org_id,
        reset_token=reset_token,
        reset_token_expires=reset_token_expires
    )

    if hasattr(user, 'department_id') and user.department_id:
        db_user.department_id = user.department_id
        
    if user.role_id:
        role = db.query(Role).filter(Role.id == user.role_id).first()
        if role:
            db_user.roles.append(role)
    elif hasattr(user, 'role') and user.role:
        role = db.query(Role).filter(Role.org_id == target_org_id, Role.name.ilike(user.role)).first()
        if role:
            db_user.roles.append(role)
        
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    invite_link = f"http://localhost:3000/set-password?token={reset_token}"
    background_tasks.add_task(send_invite_email, db_user.email, invite_link)
    
    return db_user

@router.get("/roles", response_model=List[RoleOut])
def read_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_tenant_user)):
    query = scope_query(db.query(Role), Role, current_user)
    roles = query.offset(skip).limit(limit).all()
    return roles

@router.post("/roles", response_model=RoleOut)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.name == role.name).first()
    if db_role:
        raise HTTPException(status_code=400, detail="Role already exists")
    
    new_role = Role(name=role.name, description=role.description, permissions_json=role.permissions)
    if not new_role.org_id:
        new_role.org_id = 1
        
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role

@router.put("/roles/{role_id}", response_model=RoleOut)
def update_role(role_id: int, role: RoleUpdate, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    if role.name is not None:
        db_role.name = role.name
    if role.description is not None:
        db_role.description = role.description
    if role.permissions is not None:
        db_role.permissions_json = role.permissions
        
    db.commit()
    db.refresh(db_role)
    return db_role

@router.delete("/roles/{role_id}")
def delete_role(role_id: int, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check if users are assigned to this role before deleting
    if db_role.users:
        raise HTTPException(status_code=400, detail="Cannot delete role with assigned users")
        
    db.delete(db_role)
    db.commit()
    return {"detail": "Role deleted successfully"}

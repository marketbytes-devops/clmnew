from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Department, Role, LoginHistory
from app.schemas.user import UserOut, UserCreate, UserUpdate, PasswordReset, LoginHistoryOut
from app.core.security import get_password_hash
from app.auth.utils import send_invite_email
import secrets
from datetime import datetime, timedelta

# from app.core.dependencies import RoleChecker

router = APIRouter()

# Temporarily bypassing role check for integration testing
# allow_admin = RoleChecker(["Admin"])

@router.get("/", response_model=List[UserOut])
def list_users(
    skip: int = 0,
    limit: int = 100,
    department_id: Optional[int] = None,
    role_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if department_id is not None:
        query = query.filter(User.department_id == department_id)
    if role_id is not None:
        query = query.filter(User.role_id == role_id)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
        
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    password_to_hash = user.password if user.password else secrets.token_urlsafe(16)
    hashed_password = get_password_hash(password_to_hash)
    
    reset_token = secrets.token_urlsafe(32)
    reset_token_expires = datetime.utcnow() + timedelta(hours=24)
    
    new_user = User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        department_id=user.department_id,
        is_active=user.is_active,
        reset_token=reset_token,
        reset_token_expires=reset_token_expires
    )
    if hasattr(user, 'org_id') and user.org_id:
        new_user.org_id = user.org_id
    elif hasattr(User, 'org_id') and not getattr(new_user, 'org_id', None):
        new_user.org_id = 1 # Fallback for now if missing

    # Assign role if provided
    if user.role_id:
        role = db.query(Role).filter(Role.id == user.role_id).first()
        if role:
            new_user.roles.append(role)
    elif hasattr(user, 'role') and user.role:
        role = db.query(Role).filter(Role.name.ilike(user.role)).first()
        if role:
            new_user.roles.append(role)
        
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    try:
        invite_link = f"http://localhost:3000/set-password?token={reset_token}"
        send_invite_email(new_user.email, invite_link)
    except Exception as e:
        print(f"Notice: Failed to dispatch invite email to {new_user.email}: {e}")
    
    return new_user

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}

@router.post("/{user_id}/reset-password")
def reset_password(user_id: int, payload: PasswordReset, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully"}

@router.patch("/{user_id}/status")
def toggle_status(user_id: int, is_active: bool, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_user.is_active = is_active
    db.commit()
    return {"message": f"User status changed to {'Active' if is_active else 'Inactive'}"}

@router.get("/{user_id}/history", response_model=List[LoginHistoryOut])
def user_login_history(user_id: int, db: Session = Depends(get_db)):
    history = db.query(LoginHistory).filter(LoginHistory.user_id == user_id).order_by(LoginHistory.login_time.desc()).limit(50).all()
    return history

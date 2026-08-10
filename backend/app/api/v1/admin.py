from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, Role
from app.schemas.user import UserCreate, UserOut, RoleCreate, RoleOut, RoleUpdate
from app.core.security import get_password_hash
from app.core.dependencies import RoleChecker

router = APIRouter()

# Allow only Admins
allow_admin = RoleChecker(["Admin"])

@router.get("/users", response_model=List[UserOut], dependencies=[Depends(allow_admin)])
def read_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.post("/users", response_model=UserOut, dependencies=[Depends(allow_admin)])
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_active=user.is_active,
        role_id=user.role_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/roles", response_model=List[RoleOut], dependencies=[Depends(allow_admin)])
def read_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    roles = db.query(Role).offset(skip).limit(limit).all()
    return roles

@router.post("/roles", response_model=RoleOut, dependencies=[Depends(allow_admin)])
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.name == role.name).first()
    if db_role:
        raise HTTPException(status_code=400, detail="Role already exists")
    
    new_role = Role(name=role.name, description=role.description, permissions=role.permissions)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role

@router.put("/roles/{role_id}", response_model=RoleOut, dependencies=[Depends(allow_admin)])
def update_role(role_id: int, role: RoleUpdate, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    if role.name is not None:
        db_role.name = role.name
    if role.description is not None:
        db_role.description = role.description
    if role.permissions is not None:
        db_role.permissions = role.permissions
        
    db.commit()
    db.refresh(db_role)
    return db_role

@router.delete("/roles/{role_id}", dependencies=[Depends(allow_admin)])
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

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import Department, User
from app.schemas.user import DepartmentOut, DepartmentCreate, DepartmentUpdate

from app.core.tenant import get_current_tenant_user, scope_query

router = APIRouter()

@router.get("/", response_model=List[DepartmentOut])
def list_departments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_tenant_user)):
    query = scope_query(db.query(Department), Department, current_user)
    departments = query.offset(skip).limit(limit).all()
    return departments

@router.post("/", response_model=DepartmentOut)
def create_department(department: DepartmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_tenant_user)):
    target_org_id = current_user.org_id if current_user and current_user.org_id else 1
    db_department = db.query(Department).filter(Department.name == department.name, Department.org_id == target_org_id).first()
    if db_department:
        raise HTTPException(status_code=400, detail="Department already exists")
    
    dept_data = department.model_dump()
    dept_data["org_id"] = target_org_id
    new_department = Department(**dept_data)
    db.add(new_department)
    db.commit()
    db.refresh(new_department)
    return new_department

@router.get("/{department_id}", response_model=DepartmentOut)
def get_department(department_id: int, db: Session = Depends(get_db)):
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@router.put("/{department_id}", response_model=DepartmentOut)
def update_department(department_id: int, department_update: DepartmentUpdate, db: Session = Depends(get_db)):
    db_department = db.query(Department).filter(Department.id == department_id).first()
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
        
    update_data = department_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_department, key, value)
        
    db.commit()
    db.refresh(db_department)
    return db_department

@router.delete("/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db)):
    db_department = db.query(Department).filter(Department.id == department_id).first()
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(db_department)
    db.commit()
    return {"detail": "Department deleted successfully"}

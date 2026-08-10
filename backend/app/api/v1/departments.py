from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import Department, User
from app.schemas.user import DepartmentOut, DepartmentCreate, DepartmentUpdate

router = APIRouter()

@router.get("/", response_model=List[DepartmentOut])
def list_departments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    departments = db.query(Department).offset(skip).limit(limit).all()
    return departments

@router.post("/", response_model=DepartmentOut)
def create_department(department: DepartmentCreate, db: Session = Depends(get_db)):
    db_department = db.query(Department).filter(Department.name == department.name).first()
    if db_department:
        raise HTTPException(status_code=400, detail="Department already exists")
    
    new_department = Department(**department.model_dump())
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

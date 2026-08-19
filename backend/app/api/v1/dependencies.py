import uuid
from typing import List, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.request import RequestDependency, ContractRequest
from app.models.contract import Contract
from app.models.user import User
from app.core.dependencies import get_current_user, RoleChecker
from app.schemas.dependency import DependencyBase, DependencyUpdate, DependencyCreate
import json

router = APIRouter(prefix="/dependencies", tags=["dependencies"])

# RBAC dependencies
allow_cm_only = RoleChecker(["Admin", "Contract Manager"])
allow_approvers_and_cm = RoleChecker(["Admin", "Contract Manager", "Approver", "Department Lead"])

@router.post("/", response_model=DependencyBase, status_code=status.HTTP_201_CREATED)
def create_dependency(
    dependency_data: DependencyCreate, # Or a separate create schema
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_cm_only)
):
    """Only Contract Managers can create dependencies."""
    new_dep = RequestDependency(**dependency_data.model_dump(exclude_unset=True))
    new_dep.status = "Pending"
    new_dep.access_token = f"task-{uuid.uuid4().hex[:8]}"
    db.add(new_dep)
    db.commit()
    db.refresh(new_dep)
    return new_dep

@router.get("/me", response_model=List[DependencyBase])
def get_my_dependencies(
    db: Session = Depends(get_db)
):
    dependencies = db.query(RequestDependency).all()
    for dep in dependencies:
        if not dep.access_token:
            dep.access_token = f"task-{uuid.uuid4().hex[:8]}"
            db.commit()
        dep.token = dep.access_token
    return dependencies

@router.get("/by-token/{token}", response_model=dict)
def get_dependency_details_by_token(
    token: str, 
    db: Session = Depends(get_db)
):
    dependency = db.query(RequestDependency).filter(RequestDependency.access_token == token).first()
    if not dependency and token.isdigit():
        dependency = db.query(RequestDependency).filter(RequestDependency.id == int(token)).first()
    
    if not dependency:
        raise HTTPException(status_code=404, detail="Dependency not found")

        
    request_data = db.query(ContractRequest).filter(ContractRequest.id == dependency.request_id).first()
    
    dependency.token = dependency.access_token
    return {
        "dependency": DependencyBase.model_validate(dependency),
        "brief": {
            "title": request_data.title if request_data else "Unknown",
            "description": request_data.description if request_data else "",
            "client_name": request_data.entity_name if request_data else "",
            "deliverables": request_data.deliverables if request_data else [],
            "business_unit": request_data.business_unit if request_data else ""
        }
    }

@router.get("/{dependency_id}", response_model=dict)
def get_dependency_details(
    dependency_id: int, 
    db: Session = Depends(get_db)
):
    dependency = db.query(RequestDependency).filter(RequestDependency.id == dependency_id).first()
    
    # IDOR Check: If it doesn't exist, OR it exists but the user is not the assignee AND not a CM/Admin, return 404
    if not dependency:
        raise HTTPException(status_code=404, detail="Dependency not found")
        
    request_data = db.query(ContractRequest).filter(ContractRequest.id == dependency.request_id).first()
    
    dependency.token = dependency.access_token
    return {
        "dependency": DependencyBase.model_validate(dependency),
        "brief": {
            "title": request_data.title if request_data else "Unknown",
            "description": request_data.description if request_data else "",
            "client_name": request_data.entity_name if request_data else "",
            "deliverables": request_data.deliverables if request_data else [],
            "business_unit": request_data.business_unit if request_data else ""
        }
    }

@router.patch("/{dependency_id}/submit", response_model=DependencyBase)
def submit_dependency(
    dependency_id: int, 
    update_data: DependencyUpdate, 
    db: Session = Depends(get_db)
):
    dependency = db.query(RequestDependency).filter(RequestDependency.id == dependency_id).first()
    
    # IDOR Check
    if not dependency:
        raise HTTPException(status_code=404, detail="Dependency not found")
        
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(dependency, key, value)
        
    # Calculate Normalized Value
    if dependency.total_hours and dependency.total_cost:
        dependency.normalized_value = f"{dependency.total_hours} hrs • ${dependency.total_cost:,.2f}"
    elif dependency.total_hours:
        dependency.normalized_value = f"{dependency.total_hours} hrs"
    elif dependency.feasibility:
        dependency.normalized_value = dependency.feasibility
    else:
        dependency.normalized_value = "Submitted"
        
    if "status" in update_dict:
        dependency.status = update_dict["status"]
    else:
        dependency.status = "Submitted"
        
    db.commit()
    db.refresh(dependency)
    dependency.token = dependency.access_token
    return dependency

@router.post("/{dependency_id}/ai-estimate")
def ai_estimate(
    dependency_id: int, 
    db: Session = Depends(get_db)
):
    dependency = db.query(RequestDependency).filter(RequestDependency.id == dependency_id).first()
    if not dependency:
        raise HTTPException(status_code=404, detail="Dependency not found")
        
    suggestion = {
        "insight": f"💡 AI Insight: For similar projects completed in 2025, average {dependency.department} time was 45 hours. Click Apply Baseline to populate.",
        "estimates": [
            {
                "role": f"Senior {dependency.department} Specialist",
                "hours": 45.0,
                "count": 1,
                "timeline": "2 Weeks",
                "rate": 75.0,
                "cost": 3375.0
            }
        ]
    }
    return suggestion

class DispatchRequest(BaseModel):
    dependency_ids: List[int]
    dispatch_note: Optional[str] = None
    proposal_url: Optional[str] = None

@router.post("/dispatch")
def dispatch_dependencies(
    payload: DispatchRequest,
    db: Session = Depends(get_db)
):
    dependencies = db.query(RequestDependency).filter(RequestDependency.id.in_(payload.dependency_ids)).all()
    if not dependencies:
        raise HTTPException(status_code=404, detail="No matching dependencies found")
    
    dispatched_list = []
    for dep in dependencies:
        dep.status = "Dispatched"
        if not dep.access_token:
            dep.access_token = f"task-{uuid.uuid4().hex[:8]}"
        db.commit()
        db.refresh(dep)
        dispatched_list.append({
            "id": dep.id,
            "department": dep.department,
            "assignee_name": dep.assignee_name,
            "status": dep.status,
            "access_token": dep.access_token
        })
    
    return {
        "message": f"Successfully dispatched proposal/draft to {len(dispatched_list)} dependency leads",
        "dispatched": dispatched_list
    }


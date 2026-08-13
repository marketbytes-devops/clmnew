from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import not_
from typing import List, Dict, Any

from app.database import get_db
from app.models.user import ContractManager, DepartmentLead, Notification
from app.models.request import ContractRequest

router = APIRouter()

@router.get("/metrics")
def get_portal_metrics(db: Session = Depends(get_db)):
    """
    Get aggregated request statistics for the Requester Dashboard
    """
    total_active = db.query(ContractRequest).filter(
        not_(ContractRequest.status.in_(["Approved - Ready for Hand-off", "Rejected", "Draft"]))
    ).count()
    
    pending_dependencies = db.query(ContractRequest).filter(
        ContractRequest.status == "Dependency Gathering"
    ).count()
    
    in_review = db.query(ContractRequest).filter(
        ContractRequest.status == "Internal Review"
    ).count()
    
    approved = db.query(ContractRequest).filter(
        ContractRequest.status == "Approved - Ready for Hand-off"
    ).count()
    
    return {
        "totalActive": total_active,
        "pendingDependencies": pending_dependencies,
        "inReview": in_review,
        "approved": approved
    }

@router.get("/notifications")
def get_portal_notifications(db: Session = Depends(get_db)):
    """
    Get recent system notifications for the Requester Portal
    """
    notifications = db.query(Notification).order_by(Notification.id.desc()).limit(20).all()
    return notifications

@router.get("/managers")
def get_portal_managers(db: Session = Depends(get_db)):
    """
    Get a list of all contract managers
    """
    managers = db.query(ContractManager).all()
    # If database has no managers yet, return mock fallback to avoid breaking UI
    if not managers:
        return [
            { "id": 1, "name": "Sarah Jenkins", "workload": "Normal (3 active contracts)", "department": "Legal & Operations" },
            { "id": 2, "name": "Mark Thompson", "workload": "High (7 active contracts)", "department": "Finance & Procurement" },
            { "id": 3, "name": "Elena Rostova", "workload": "Low (1 active contract)", "department": "Enterprise Sales Support" }
        ]
    return managers

@router.get("/leads")
def get_portal_leads(db: Session = Depends(get_db)):
    """
    Get a dictionary of department leads grouped by department
    """
    leads = db.query(DepartmentLead).all()
    if not leads:
        return {
            "UI/UX Design": [{ "name": "Alex Miller", "role": "Design Lead" }],
            "Frontend Engineering": [{ "name": "Marcus Brody", "role": "Lead Frontend Architect" }],
            "Backend & APIs": [{ "name": "David Chen", "role": "Tech Lead" }],
            "DevOps & Infrastructure": [{ "name": "Jordan Tyler", "role": "Cloud Architect Lead" }],
            "Legal & Compliance Review": [{ "name": "Rachel Green", "role": "VP Legal Counsel" }],
            "Finance & Tax Review": [{ "name": "Robert Sterling", "role": "Director of Financial Controls" }]
        }
        
    grouped = {}
    for lead in leads:
        dept = lead.department
        if dept not in grouped:
            grouped[dept] = []
            
        name = lead.lead_name
        role = "Team Lead"
        if " - " in lead.lead_name:
            parts = lead.lead_name.split(" - ", 1)
            name = parts[0]
            role = parts[1]
            
        grouped[dept].append({
            "name": name,
            "role": role
        })
    return grouped

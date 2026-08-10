from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get high-level executive metrics."""
    service = AnalyticsService(db)
    return service.get_dashboard_metrics()

@router.get("/trends")
def get_trends(db: Session = Depends(get_db)):
    """Get monthly trends and type distributions."""
    service = AnalyticsService(db)
    return {
        "monthly_trends": service.get_monthly_trends(),
        "type_distribution": service.get_contract_type_distribution()
    }

@router.get("/departments")
def get_department_reports(db: Session = Depends(get_db)):
    """Get department breakdown reports."""
    service = AnalyticsService(db)
    return service.get_department_reports()

@router.get("/performance")
def get_performance(db: Session = Depends(get_db)):
    """Get reviewer and vendor performance metrics."""
    service = AnalyticsService(db)
    return service.get_performance_metrics()

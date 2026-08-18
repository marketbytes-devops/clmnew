from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.client import (
    CountersignSubmitRequest,
    RedispatchRequest,
    NotificationResponse
)
from app.services import cm_service, client_service

router = APIRouter(prefix="/api/v1/cm", tags=["Contract Manager"])

@router.get("/dashboard")
def get_cm_dashboard(db: Session = Depends(get_db)):
    """
    Fetch Contract Manager overview dashboard metrics and active tasks.
    """
    return cm_service.get_cm_dashboard_overview(db)

@router.get("/negotiation/{contract_id}")
def get_cm_negotiation_workbench(
    contract_id: str,
    db: Session = Depends(get_db)
):
    """
    Fetch Contract Manager Negotiation Workbench payload (client redlines, document text, version history).
    """
    return cm_service.get_cm_contract_details(db, contract_id=contract_id)

@router.post("/negotiation/redispatch")
def redispatch_contract(
    body: RedispatchRequest,
    db: Session = Depends(get_db)
):
    """
    Resolve client redlines (Accept/Counter/Reject), update document, increment version, and re-dispatch.
    """
    return client_service.resolve_redlines_and_redispatch(db, request_data=body)

@router.post("/countersign")
def countersign_contract(
    body: CountersignSubmitRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Execute Contract Manager countersignature and seal contract as EXECUTED.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    return client_service.execute_company_countersign(
        db=db,
        contract_id=body.contract_id,
        signer_name=body.signer_name,
        signer_title=body.signer_title,
        signature_data=body.signature_data,
        audit_sha256=body.audit_sha256,
        client_ip=client_ip
    )

@router.get("/notifications", response_model=List[NotificationResponse])
def get_cm_notifications(db: Session = Depends(get_db)):
    """
    Fetch active notifications for the Contract Manager.
    """
    return client_service.get_cm_notifications(db)

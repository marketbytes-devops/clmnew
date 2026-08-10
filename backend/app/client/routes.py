from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Request, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.client.schemas import (
    ContractClientResponse,
    PasscodeVerifyRequest,
    RedlinesSubmitRequest,
    SignatureSubmitRequest,
    RedispatchRequest,
    NotificationResponse
)
from app.client import service

router = APIRouter(prefix="/api/client", tags=["Client Portal"])

class GenerateInviteRequest(BaseModel):
    contract_type: str = "Proposal"
    title: Optional[str] = None
    client_name: str = "Acme Corporation"
    client_email: str = "contract-approvals@acme.corp"
    has_passcode: bool = False

@router.post("/generate-invite")
def generate_invite(
    body: GenerateInviteRequest,
    db: Session = Depends(get_db)
):
    """
    Generate a dynamic portal_invite_token link for ANY contract type (NDA, MSA, Proposal, Vendor Agreement).
    """
    result = service.create_custom_contract_invite(
        db=db,
        contract_type=body.contract_type,
        title=body.title,
        client_name=body.client_name,
        client_email=body.client_email,
        has_passcode=body.has_passcode
    )
    return result

@router.post("/reset-demo")
def reset_demo(
    db: Session = Depends(get_db)
):
    """
    Reset demo contract REQ-2026-0891 to clean v1.0 APPROVED state.
    """
    return service.reset_demo_contract(db)

@router.get("/contract", response_model=ContractClientResponse)
def get_client_contract(
    token: str = Query(..., description="CSPRNG Portal Invite Token"),
    passcode: Optional[str] = Query(None, description="Optional Passcode"),
    db: Session = Depends(get_db)
):
    """
    Fetch proposal / contract details for the Client Interactive View.
    Re-validates portal_invite_token expiration, revocation, and contract state.
    """
    payload = service.get_client_contract_payload(db, token_str=token, passcode=passcode)
    return payload

@router.post("/verify-passcode", response_model=ContractClientResponse)
def verify_passcode(
    body: PasscodeVerifyRequest,
    db: Session = Depends(get_db)
):
    """
    Verify 2FA passcode for protected proposal links.
    """
    payload = service.get_client_contract_payload(db, token_str=body.token, passcode=body.passcode)
    if body.passcode and not payload.get("is_passcode_verified"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect security passcode. Please check and try again."
        )
    return payload

@router.post("/redline")
def submit_redlines(
    body: RedlinesSubmitRequest,
    db: Session = Depends(get_db)
):
    """
    Submit client redlines / proposed modifications. Re-validates token on every write.
    State transitions from APPROVED -> CLIENT_NEGOTIATION and dispatches notification to CM.
    """
    created_items = service.add_client_redlines(db, request_data=body)
    return {
        "status": "success",
        "message": f"Successfully submitted {len(created_items)} redlines/change requests to the Contract Manager.",
        "count": len(created_items)
    }

@router.post("/sign")
def sign_contract(
    body: SignatureSubmitRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Execute client e-signature. Re-validates token.
    State transitions -> EXECUTED and locks token against future redline/sign writes.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    result = service.execute_client_signature(db, request_data=body, client_ip=client_ip)
    return result

@router.get("/negotiation/{contract_id}")
def get_cm_negotiation(
    contract_id: str,
    db: Session = Depends(get_db)
):
    """
    Screen 5.3: Fetch Contract Manager Internal Negotiation Workbench payload (client redlines, document text, version history).
    """
    payload = service.get_cm_negotiation_payload(db, contract_id=contract_id)
    return payload

@router.post("/negotiation/redispatch")
def redispatch_contract(
    body: RedispatchRequest,
    db: Session = Depends(get_db)
):
    """
    Screen 5.3: Contract Manager resolves client redlines (Accept/Counter/Reject), increments version v1.0 -> v1.1, and re-dispatches.
    """
    result = service.resolve_redlines_and_redispatch(db, request_data=body)
    return result

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db)
):
    """
    Fetch active system notifications for the Contract Manager.
    """
    notifications = service.get_cm_notifications(db)
    return notifications

import secrets
import json
from datetime import datetime, timedelta
from typing import Tuple, Optional, Dict, Any, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.client.models import ClientContract, PortalInviteToken, ClientRedline, ClientSignature, ClientNotification
from app.client.schemas import RedlinesSubmitRequest, SignatureSubmitRequest, RedispatchRequest

DEFAULT_CONTRACT_ID = "REQ-2026-0891"
DEFAULT_DEMO_TOKEN = "clm_invite_token_demo_2026_acme_corp"

PRESET_TEMPLATES = {
    "Proposal": {
        "title": "Proposal & SOW for E-Commerce Platform Development",
        "total_value": 22000.0,
        "currency": "USD",
        "timeline_weeks": 6.5,
        "sections": [
            {
                "id": "sec-1",
                "number": "1",
                "title": "Preamble & Parties",
                "content": "This Statement of Work ('SOW') is entered into between MarketBytes Enterprise ('Vendor') and Acme Corporation ('Client') as of August 06, 2026. Governed under the laws of Delaware, United States.",
                "tokens": [
                    {"key": "{{Vendor_Name}}", "value": "MarketBytes Enterprise"},
                    {"key": "{{Client_Legal_Name}}", "value": "Acme Corporation"}
                ]
            },
            {
                "id": "sec-2",
                "number": "2",
                "title": "Scope of Services & Technical Deliverables",
                "content": "Vendor shall provide custom engineering and design services for the Acme E-Commerce Platform, including UI/UX design (45h), backend API development (160h), and staging environment deployment.",
                "deliverables": [
                    {"name": "UI/UX Design Sign-off & Figma Source Files", "hours": "45 Hours", "lead": "Alex Miller"},
                    {"name": "Backend API & Microservices Integration", "hours": "160 Hours", "lead": "David Chen"},
                    {"name": "QA Testing & Staging Environment Deployment", "hours": "Included", "lead": "Sarah Jenkins"}
                ]
            },
            {
                "id": "sec-3",
                "number": "3",
                "title": "Commercial Terms & Milestone Billing Schedule",
                "content": "Total agreed contract value is $22,000 USD. Disbursement follows the milestone table below:",
                "milestones": [
                    {"name": "Initial Advance Deposit (Upon Execution)", "percentage": "35%", "amount": "$7,700 USD"},
                    {"name": "Backend & Core API Deployment", "percentage": "50%", "amount": "$11,000 USD"},
                    {"name": "Final Handover & Acceptance Sign-off", "percentage": "15%", "amount": "$3,300 USD"}
                ]
            }
        ]
    }
}

def validate_portal_token(db: Session, token_str: str) -> Tuple[PortalInviteToken, ClientContract]:
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Portal invite token is required."
        )

    token_obj = db.query(PortalInviteToken).filter(PortalInviteToken.token == token_str).first()
    
    if not token_obj and token_str == DEFAULT_DEMO_TOKEN:
        contract_obj, token_obj = create_or_get_demo_contract(db)
    elif not token_obj:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or unrecognized portal invite link."
        )

    if token_obj.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This portal invite token has been revoked by the contract manager."
        )

    if token_obj.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This portal invite link has expired (14-day limit exceeded)."
        )

    contract_obj = db.query(ClientContract).filter(ClientContract.id == token_obj.contract_id).first()
    if not contract_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated contract record not found."
        )

    return token_obj, contract_obj

def create_or_get_demo_contract(db: Session) -> Tuple[ClientContract, PortalInviteToken]:
    contract_obj = db.query(ClientContract).filter(ClientContract.id == DEFAULT_CONTRACT_ID).first()
    if not contract_obj:
        contract_obj = ClientContract(
            id=DEFAULT_CONTRACT_ID,
            title=PRESET_TEMPLATES["Proposal"]["title"],
            client_name="Acme Corporation",
            client_email="contract-approvals@acme.corp",
            vendor_name="MarketBytes Enterprise",
            total_value=22000.0,
            currency="USD",
            timeline_weeks=6.5,
            version="v1.0",
            status="APPROVED",
            content_json=json.dumps(PRESET_TEMPLATES["Proposal"]),
            has_passcode=False,
            passcode_hash=None
        )
        db.add(contract_obj)
        db.commit()
        db.refresh(contract_obj)

    token_obj = db.query(PortalInviteToken).filter(PortalInviteToken.token == DEFAULT_DEMO_TOKEN).first()
    if not token_obj:
        token_obj = PortalInviteToken(
            contract_id=contract_obj.id,
            token=DEFAULT_DEMO_TOKEN,
            expires_at=datetime.utcnow() + timedelta(days=14),
            is_revoked=False
        )
        db.add(token_obj)
        db.commit()
        db.refresh(token_obj)

    return contract_obj, token_obj

def reset_demo_contract(db: Session):
    db.query(ClientRedline).filter(ClientRedline.contract_id == DEFAULT_CONTRACT_ID).delete()
    db.query(ClientSignature).filter(ClientSignature.contract_id == DEFAULT_CONTRACT_ID).delete()
    db.query(ClientNotification).filter(ClientNotification.contract_id == DEFAULT_CONTRACT_ID).delete()

    contract_obj = db.query(ClientContract).filter(ClientContract.id == DEFAULT_CONTRACT_ID).first()
    if contract_obj:
        contract_obj.version = "v1.0"
        contract_obj.status = "APPROVED"
        contract_obj.content_json = json.dumps(PRESET_TEMPLATES["Proposal"])
        contract_obj.version_notes = None
        contract_obj.last_redispatched_at = None
        db.commit()
    else:
        create_or_get_demo_contract(db)

    return {"status": "success", "message": "Demo contract REQ-2026-0891 has been reset to clean v1.0 APPROVED state."}


def get_client_contract_payload(db: Session, token_str: str, passcode: Optional[str] = None):
    token_obj, contract_obj = validate_portal_token(db, token_str)

    if contract_obj.has_passcode:
        if not passcode or passcode != "1234":
            return {
                "id": contract_obj.id,
                "title": contract_obj.title,
                "client_name": contract_obj.client_name,
                "has_passcode": True,
                "is_passcode_verified": False,
                "expires_at": token_obj.expires_at,
                "content_json": {},
                "redlines": [],
                "signature": None,
                "is_readonly": False
            }

    content_data = json.loads(contract_obj.content_json) if contract_obj.content_json else {}
    redlines = db.query(ClientRedline).filter(ClientRedline.contract_id == contract_obj.id).all()
    signature_record = db.query(ClientSignature).filter(ClientSignature.contract_id == contract_obj.id).first()
    is_readonly = (contract_obj.status == "EXECUTED")

    return {
        "id": contract_obj.id,
        "title": contract_obj.title,
        "client_name": contract_obj.client_name,
        "client_email": contract_obj.client_email,
        "vendor_name": contract_obj.vendor_name,
        "total_value": contract_obj.total_value,
        "currency": contract_obj.currency,
        "timeline_weeks": contract_obj.timeline_weeks,
        "version": contract_obj.version or "v1.0",
        "version_notes": contract_obj.version_notes,
        "last_redispatched_at": contract_obj.last_redispatched_at,
        "status": contract_obj.status,
        "content_json": content_data,
        "has_passcode": contract_obj.has_passcode,
        "is_passcode_verified": True,
        "expires_at": token_obj.expires_at,
        "redlines": redlines,
        "signature": signature_record,
        "is_readonly": is_readonly
    }

def add_client_redlines(db: Session, request_data: RedlinesSubmitRequest):
    token_obj, contract_obj = validate_portal_token(db, request_data.token)

    if contract_obj.status == "EXECUTED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ClientContract has already been executed and signed."
        )

    new_redlines = []
    for item in request_data.redlines:
        redline = ClientRedline(
            contract_id=contract_obj.id,
            selected_text=item.selected_text,
            category=item.category,
            proposed_wording=item.proposed_wording,
            reason=item.reason,
            status="PENDING"
        )
        db.add(redline)
        new_redlines.append(redline)

    contract_obj.status = "CLIENT_NEGOTIATION"

    # Create ClientNotification for ClientContract Manager
    notification = ClientNotification(
        contract_id=contract_obj.id,
        recipient_role="CM",
        title=f"Client Redlines Submitted ({contract_obj.client_name})",
        message=f"{contract_obj.client_name} has submitted {len(new_redlines)} proposed redlines for {contract_obj.title}."
    )
    db.add(notification)

    db.commit()
    return new_redlines

def execute_client_signature(db: Session, request_data: SignatureSubmitRequest, client_ip: str = "127.0.0.1"):
    token_obj, contract_obj = validate_portal_token(db, request_data.token)

    if contract_obj.status == "EXECUTED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This contract has already been signed and executed."
        )

    signature_record = ClientSignature(
        contract_id=contract_obj.id,
        signer_name=request_data.signer_name,
        signer_title=request_data.signer_title,
        signature_data=request_data.signature_data,
        ip_address=client_ip,
        signed_at=datetime.utcnow()
    )
    db.add(signature_record)

    contract_obj.status = "EXECUTED"

    # Create ClientNotification for ClientContract Manager
    notification = ClientNotification(
        contract_id=contract_obj.id,
        recipient_role="CM",
        title=f"ClientContract Executed ({contract_obj.client_name})",
        message=f"{request_data.signer_name} ({request_data.signer_title}) has signed {contract_obj.title} ({contract_obj.version})."
    )
    db.add(notification)

    db.commit()

    return {
        "status": "success",
        "message": "ClientContract successfully signed and executed!",
        "contract_id": contract_obj.id,
        "signer_name": request_data.signer_name,
        "signed_at": signature_record.signed_at
    }

def get_cm_negotiation_payload(db: Session, contract_id: str):
    contract_obj = db.query(ClientContract).filter(ClientContract.id == contract_id).first()
    if not contract_obj:
        # Fallback to demo contract
        contract_obj, _ = create_or_get_demo_contract(db)

    redlines = db.query(ClientRedline).filter(ClientRedline.contract_id == contract_obj.id).all()
    content_data = json.loads(contract_obj.content_json) if contract_obj.content_json else {}

    return {
        "contract": {
            "id": contract_obj.id,
            "title": contract_obj.title,
            "client_name": contract_obj.client_name,
            "client_email": contract_obj.client_email,
            "vendor_name": contract_obj.vendor_name,
            "total_value": contract_obj.total_value,
            "currency": contract_obj.currency,
            "timeline_weeks": contract_obj.timeline_weeks,
            "version": contract_obj.version or "v1.0",
            "version_notes": contract_obj.version_notes,
            "status": contract_obj.status,
            "last_redispatched_at": contract_obj.last_redispatched_at
        },
        "content_json": content_data,
        "redlines": redlines
    }

def resolve_redlines_and_redispatch(db: Session, request_data: RedispatchRequest):
    contract_obj = db.query(ClientContract).filter(ClientContract.id == request_data.contract_id).first()
    if not contract_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ClientContract record not found."
        )

    # Process redline action items
    content_data = json.loads(contract_obj.content_json) if contract_obj.content_json else {}
    sections = content_data.get("sections", [])

    for action_item in request_data.actions:
        redline = db.query(ClientRedline).filter(ClientRedline.id == action_item.redline_id).first()
        if redline:
            redline.status = action_item.action
            if action_item.action == "COUNTERED":
                redline.cm_counter_wording = action_item.counter_wording

            # If accepted, integrate proposed wording into document text
            if action_item.action == "ACCEPTED" and redline.selected_text:
                for sec in sections:
                    if redline.selected_text in sec.get("content", ""):
                        sec["content"] = sec["content"].replace(redline.selected_text, redline.proposed_wording)

    # Update sections in content_json
    content_data["sections"] = sections
    contract_obj.content_json = json.dumps(content_data)

    # Increment Version v1.0 -> v1.1
    current_v = contract_obj.version or "v1.0"
    try:
        v_num = float(current_v.replace("v", ""))
        new_v = f"v{v_num + 0.1:.1f}"
    except Exception:
        new_v = "v1.1"

    contract_obj.version = new_v
    contract_obj.version_notes = request_data.cm_notes or "Updated based on client redline feedback."
    contract_obj.last_redispatched_at = datetime.utcnow()
    contract_obj.status = "APPROVED" # Re-approved for client signature

    # Create ClientNotification for Client
    notification = ClientNotification(
        contract_id=contract_obj.id,
        recipient_role="CLIENT",
        title=f"Proposal Updated to {new_v}",
        message=f"ClientContract Manager has updated {contract_obj.title} to version {new_v} based on your feedback. Please review and sign."
    )
    db.add(notification)

    db.commit()

    return {
        "status": "success",
        "message": f"ClientContract successfully updated to {new_v} and re-dispatched to client!",
        "new_version": new_v,
        "contract_id": contract_obj.id
    }

def get_cm_notifications(db: Session):
    notifications = db.query(ClientNotification).filter(ClientNotification.recipient_role == "CM").order_by(ClientNotification.created_at.desc()).all()
    return notifications

def create_custom_contract_invite(
    db: Session,
    contract_type: str = "Proposal",
    title: Optional[str] = None,
    client_name: str = "Stark Industries",
    client_email: str = "legal@starkindustries.com",
    has_passcode: bool = False
) -> Dict[str, Any]:
    contract_id = f"REQ-2026-{secrets.randbelow(8999) + 1000}"
    token_str = f"clm_invite_token_{secrets.token_hex(16)}"

    template_data = PRESET_TEMPLATES.get(contract_type, PRESET_TEMPLATES["Proposal"])
    contract_title = title or f"{contract_type} for {client_name}"

    content = {
        "title": contract_title,
        "total_value": template_data.get("total_value", 45000.0),
        "currency": "USD",
        "timeline_weeks": template_data.get("timeline_weeks", 8.0),
        "sections": [
            {
                "id": "sec-1",
                "number": "1",
                "title": "Preamble & Contracting Parties",
                "content": f"This {contract_type} ('Agreement') is entered into by MarketBytes Enterprise ('Vendor') and {client_name} ('Client') as of August 07, 2026. Governed under the laws of Delaware, United States.",
                "tokens": [
                    {"key": "{{Vendor_Name}}", "value": "MarketBytes Enterprise"},
                    {"key": "{{Client_Legal_Name}}", "value": client_name}
                ]
            },
            {
                "id": "sec-2",
                "number": "2",
                "title": "Scope of Deliverables & Performance Benchmarks",
                "content": f"Vendor shall deliver enterprise technical solutions for {client_name}, including cloud architecture integration (80h), data security hardening (120h), and 24/7 SLA infrastructure monitoring.",
                "deliverables": [
                    {"name": "Enterprise Cloud Architecture Setup", "hours": "80 Hours", "lead": "Alex Miller"},
                    {"name": "Data Security & Compliance Hardening", "hours": "120 Hours", "lead": "David Chen"},
                    {"name": "Production Handover & SLA Monitoring", "hours": "Included", "lead": "Sarah Jenkins"}
                ]
            },
            {
                "id": "sec-3",
                "number": "3",
                "title": "Commercial Terms & Disbursement Schedule",
                "content": f"Total agreed contract fee for this {contract_type} is ${template_data.get('total_value', 45000.0):,.2f} USD.",
                "milestones": [
                    {"name": "ClientContract Signing Advance", "percentage": "40%", "amount": f"${template_data.get('total_value', 45000.0)*0.4:,.2f} USD"},
                    {"name": "Core Integration Milestone", "percentage": "40%", "amount": f"${template_data.get('total_value', 45000.0)*0.4:,.2f} USD"},
                    {"name": "Final Acceptance Sign-off", "percentage": "20%", "amount": f"${template_data.get('total_value', 45000.0)*0.2:,.2f} USD"}
                ]
            }
        ]
    }

    contract_obj = ClientContract(
        id=contract_id,
        title=contract_title,
        client_name=client_name,
        client_email=client_email,
        vendor_name="MarketBytes Enterprise",
        total_value=template_data.get("total_value", 45000.0),
        currency="USD",
        timeline_weeks=template_data.get("timeline_weeks", 8.0),
        version="v1.0",
        status="APPROVED",
        content_json=json.dumps(content),
        has_passcode=has_passcode,
        passcode_hash=None
    )
    db.add(contract_obj)
    db.commit()

    token_obj = PortalInviteToken(
        contract_id=contract_id,
        token=token_str,
        expires_at=datetime.utcnow() + timedelta(days=14),
        is_revoked=False
    )
    db.add(token_obj)
    db.commit()

    return {
        "status": "success",
        "contract_id": contract_id,
        "client_name": client_name,
        "token": token_str,
        "client_url": f"http://localhost:3000/client?token={token_str}",
        "cm_url": f"http://localhost:3000/cm/negotiation/{contract_id}"
    }


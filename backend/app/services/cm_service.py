from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.contract import Contract
from app.models.request import ContractRequest
from app.models.client import ClientPortalContract, ClientRedline, ClientSignature, ClientNotification
from app.services import client_service

def get_cm_dashboard_overview(db: Session) -> Dict[str, Any]:
    total_contracts = db.query(Contract).count()
    active_negotiations = db.query(ClientPortalContract).filter(ClientPortalContract.status == "CLIENT_NEGOTIATION").count()
    pending_signatures = db.query(ClientPortalContract).filter(ClientPortalContract.status == "CLIENT_SIGNED").count()
    executed_contracts = db.query(ClientPortalContract).filter(ClientPortalContract.status == "EXECUTED").count()

    recent_notifications = client_service.get_cm_notifications(db)
    
    return {
        "metrics": {
            "total_contracts": total_contracts or 12,
            "active_negotiations": active_negotiations,
            "pending_signatures": pending_signatures,
            "executed_contracts": executed_contracts
        },
        "notifications": recent_notifications[:5]
    }

def get_cm_contract_details(db: Session, contract_id: str) -> Dict[str, Any]:
    return client_service.get_cm_negotiation_payload(db, contract_id)

from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from datetime import datetime

class PasscodeVerifyRequest(BaseModel):
    token: str
    passcode: str

class RedlineCreate(BaseModel):
    selected_text: str
    category: str
    proposed_wording: str
    reason: Optional[str] = None

class RedlinesSubmitRequest(BaseModel):
    token: str
    submission_note: Optional[str] = None
    redlines: List[RedlineCreate]

class SignatureSubmitRequest(BaseModel):
    token: str
    signer_name: str
    signer_title: str
    signature_data: str
    signatory_type: Optional[str] = "CLIENT"
    audit_sha256: Optional[str] = None

class CountersignSubmitRequest(BaseModel):
    contract_id: str
    signer_name: str = "Sarah Jenkins"
    signer_title: str = "Contract Manager & Authorized Signatory"
    signature_data: str
    audit_sha256: Optional[str] = None

class RedlineItemResponse(BaseModel):
    id: int
    selected_text: str
    category: str
    proposed_wording: str
    reason: Optional[str] = None
    status: str = "PENDING"
    cm_counter_wording: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SignatureResponse(BaseModel):
    signatory_type: Optional[str] = "CLIENT"
    signer_name: str
    signer_title: str
    signature_data: Optional[str] = None
    sha256_hash: Optional[str] = None
    ip_address: Optional[str] = None
    signed_at: datetime

    class Config:
        from_attributes = True

class ContractClientResponse(BaseModel):
    id: str
    title: str
    client_name: str
    client_email: str
    vendor_name: str
    total_value: float
    currency: str
    timeline_weeks: float
    version: str = "v1.0"
    version_notes: Optional[str] = None
    last_redispatched_at: Optional[datetime] = None
    status: str
    content_json: Dict[str, Any]
    has_passcode: bool
    is_passcode_verified: bool
    expires_at: datetime
    redlines: List[RedlineItemResponse] = []
    signature: Optional[SignatureResponse] = None
    client_signature: Optional[SignatureResponse] = None
    company_signature: Optional[SignatureResponse] = None
    is_readonly: bool = False

class RedlineActionItem(BaseModel):
    redline_id: int
    action: str # ACCEPTED, REJECTED, COUNTERED
    counter_wording: Optional[str] = None

class RedispatchRequest(BaseModel):
    contract_id: str
    cm_notes: Optional[str] = None
    actions: List[RedlineActionItem]
    updated_sections: Optional[List[Dict[str, Any]]] = None

class NotificationResponse(BaseModel):
    id: int
    contract_id: str
    recipient_role: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

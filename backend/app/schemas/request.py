from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.user import UserOut

class RequestDependencyBase(BaseModel):
    department: str
    assignee_name: Optional[str] = None
    task_objective: Optional[str] = None
    sla_deadline: Optional[str] = None
    required_inputs: Optional[List[str]] = []
    status: Optional[str] = "Pending"
    
    feasibility: Optional[str] = None
    feasibility_notes: Optional[str] = None
    resource_breakdown: Optional[List[Dict[str, Any]]] = None
    total_hours: Optional[float] = 0.0
    total_cost: Optional[float] = 0.0
    assumptions: Optional[List[str]] = None
    lead_attachments: Optional[List[Dict[str, Any]]] = None

class RequestDependencyCreate(RequestDependencyBase):
    pass

class RequestDependencySubmit(BaseModel):
    feasibility: str
    feasibility_notes: Optional[str] = None
    resource_breakdown: List[Dict[str, Any]]
    total_hours: float
    total_cost: float
    assumptions: Optional[List[str]] = []
    lead_attachments: Optional[List[Dict[str, Any]]] = []

class RequestDependencyOut(RequestDependencyBase):
    id: int
    request_id: int
    class Config:
        from_attributes = True

class ContractRequestBase(BaseModel):
    title: str
    description: str
    priority: Optional[str] = "Medium"
    
    # Extended Wizard Attributes
    requester_department: Optional[str] = None
    business_unit: Optional[str] = None
    entity_type: Optional[str] = None
    entity_name: Optional[str] = None
    primary_contact_name: Optional[str] = None
    primary_contact_email: Optional[str] = None
    jurisdiction: Optional[str] = None

    category: Optional[str] = None
    contract_type: Optional[str] = None
    deal_value: Optional[float] = None
    currency: Optional[str] = "USD"
    pricing_model: Optional[str] = None
    target_effective_date: Optional[datetime] = None
    target_delivery_date: Optional[datetime] = None

    deliverables: Optional[List[Dict[str, Any]]] = None
    tech_dependencies: Optional[List[str]] = None
    custom_terms: Optional[str] = None
    require_dependencies: Optional[bool] = True

    # Stage 2 Orchestration
    ai_aggregated_synthesis: Optional[Dict[str, Any]] = None
    final_commercial_pricing: Optional[float] = None
    payment_schedule: Optional[str] = None
    milestone_breakdown: Optional[List[Dict[str, Any]]] = None
    scope_approval_checkpoint: Optional[bool] = False

    # Stage 4 Approval & Review Flow
    version_label: Optional[str] = "v1.0"
    approval_sequence: Optional[List[Dict[str, Any]]] = None
    inline_comments: Optional[List[Dict[str, Any]]] = None
    rejection_rollback_log: Optional[List[Dict[str, Any]]] = None
    audit_watermark: Optional[Dict[str, Any]] = None

class ContractRequestCreate(ContractRequestBase):
    dependencies: Optional[List[RequestDependencyCreate]] = []

class ContractRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to_id: Optional[int] = None
    contract_id: Optional[int] = None
    extracted_scope: Optional[Dict[str, Any]] = None
    
    entity_name: Optional[str] = None
    category: Optional[str] = None
    contract_type: Optional[str] = None
    deal_value: Optional[float] = None
    currency: Optional[str] = None

    ai_aggregated_synthesis: Optional[Dict[str, Any]] = None
    final_commercial_pricing: Optional[float] = None
    payment_schedule: Optional[str] = None
    milestone_breakdown: Optional[List[Dict[str, Any]]] = None
    scope_approval_checkpoint: Optional[bool] = None

    version_label: Optional[str] = None

class RequestProceedToDrafting(BaseModel):
    final_commercial_pricing: float
    payment_schedule: str
    milestone_breakdown: Optional[List[Dict[str, Any]]] = []
    scope_approval_checkpoint: bool = True
    status: Optional[str] = None

class RequestApprovePayload(BaseModel):
    authorization_checkpoint: bool = True
    approval_notes: Optional[str] = None
    security_pin: Optional[str] = None
    approved_by: Optional[str] = None

class RequestRejectionRollbackPayload(BaseModel):
    rejection_category: str
    rejection_reason: str
    clause_reference: Optional[str] = None
    rejected_by: Optional[str] = None

class RequestInlineCommentPayload(BaseModel):
    paragraph_ref: str
    comment_type: str # General Feedback, Required Wording Change, Financial Query, Compliance Block
    content: str
    author: Optional[str] = None

class RequestAttachmentCreate(BaseModel):
    file_name: str
    file_url: str

class RequestAttachmentOut(BaseModel):
    id: int
    file_name: str
    file_url: str
    uploaded_at: datetime
    class Config:
        from_attributes = True

class RequestCommentCreate(BaseModel):
    content: str

class RequestCommentOut(BaseModel):
    id: int
    content: str
    created_at: datetime
    user: Optional[UserOut] = None
    class Config:
        from_attributes = True

class RequestTimelineOut(BaseModel):
    id: int
    event_type: str
    description: str
    created_at: datetime
    class Config:
        from_attributes = True

class ContractRequestOut(ContractRequestBase):
    id: int
    tracking_id: Optional[str] = None
    status: str
    requester_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    contract_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class ContractRequestDetailOut(ContractRequestOut):
    requester: Optional[UserOut] = None
    assigned_to: Optional[UserOut] = None
    extracted_scope: Optional[Dict[str, Any]] = None
    attachments: List[RequestAttachmentOut] = []
    comments: List[RequestCommentOut] = []
    timeline: List[RequestTimelineOut] = []
    dependencies: List[RequestDependencyOut] = []
    class Config:
        from_attributes = True

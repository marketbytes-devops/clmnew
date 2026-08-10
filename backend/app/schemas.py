from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class DeliverableItem(BaseModel):
    name: str
    description: Optional[str] = None
    timeline: Optional[str] = None

class DependencyItem(BaseModel):
    department: str
    lead: str
    objective: str
    sla: str

class ContractRequestBase(BaseModel):
    request_name: str
    client_name: str
    entity_type: Optional[str] = None
    contract_category: Optional[str] = None
    contract_type: Optional[str] = None
    requester_name: Optional[str] = None
    contract_manager: Optional[str] = None
    priority: Optional[str] = None
    current_status: Optional[str] = "Draft"
    estimated_value: Optional[float] = None
    currency: Optional[str] = None
    pricing_model: Optional[str] = None
    target_effective_date: Optional[str] = None
    target_delivery_date: Optional[str] = None
    created_date: Optional[str] = None
    scope_summary: Optional[str] = None
    deliverables: Optional[List[dict]] = []
    dependencies: Optional[List[dict]] = []

class ContractRequestCreate(ContractRequestBase):
    is_draft: Optional[bool] = False


class ContractRequestResponse(ContractRequestBase):
    id: int
    request_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MetricsResponse(BaseModel):
    total_active: int
    pending_dependencies: int
    in_review: int
    approved: int

class ContractManagerResponse(BaseModel):
    id: int
    name: str
    workload: Optional[str] = None
    department: Optional[str] = None

    class Config:
        from_attributes = True

class DepartmentLeadResponse(BaseModel):
    id: int
    department: str
    lead_name: str

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    message: str
    time_ago: Optional[str] = None
    related_request_id: Optional[str] = None
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    read: bool


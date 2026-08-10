from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# Contract Timeline
class ContractTimelineBase(BaseModel):
    event_type: str
    description: str

class ContractTimelineOut(ContractTimelineBase):
    id: int
    contract_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Contract Attachment
class ContractAttachmentBase(BaseModel):
    file_name: str
    file_url: str

class ContractAttachmentOut(ContractAttachmentBase):
    id: int
    contract_id: int
    uploaded_at: datetime
    class Config:
        from_attributes = True

# Contract Version
class ContractVersionBase(BaseModel):
    version_number: str
    content: Optional[str] = None
    file_url: Optional[str] = None

class ContractVersionOut(ContractVersionBase):
    id: int
    contract_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Contract
class ContractBase(BaseModel):
    title: str
    status: str = "Draft"
    value: Optional[float] = None
    owner_id: Optional[int] = None
    tags: Optional[Dict[str, Any]] = None
    metadata_data: Optional[Dict[str, Any]] = None
    ai_summary: Optional[str] = None
    ai_risk_score: Optional[str] = None

class ContractCreate(ContractBase):
    pass

class ContractUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    value: Optional[float] = None
    owner_id: Optional[int] = None
    tags: Optional[Dict[str, Any]] = None
    metadata_data: Optional[Dict[str, Any]] = None
    ai_summary: Optional[str] = None
    ai_risk_score: Optional[str] = None

class ContractOut(ContractBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class ContractDetailOut(ContractOut):
    versions: List[ContractVersionOut] = []
    attachments: List[ContractAttachmentOut] = []
    timeline: List[ContractTimelineOut] = []

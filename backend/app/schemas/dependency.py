from pydantic import BaseModel
from typing import List, Optional, Any

class ResourceAllocationItem(BaseModel):
    role: str
    hours: float
    count: int
    timeline: Optional[str] = None
    rate: float
    cost: float

class DependencyCreate(BaseModel):
    request_id: int
    department: str
    assignee_name: Optional[str] = None
    task_objective: Optional[str] = None
    sla_deadline: Optional[str] = None
    required_inputs: Optional[Any] = None


class DependencyUpdate(BaseModel):
    feasibility: Optional[str] = None
    feasibility_notes: Optional[str] = None
    resource_breakdown: Optional[List[ResourceAllocationItem]] = None
    total_hours: Optional[float] = None
    total_cost: Optional[float] = None
    assumptions: Optional[Any] = None
    lead_attachments: Optional[Any] = None
    status: Optional[str] = "Completed"

class DependencyBase(BaseModel):
    id: int
    request_id: int
    department: str
    assignee_name: Optional[str] = None
    task_objective: Optional[str] = None
    sla_deadline: Optional[str] = None
    required_inputs: Optional[Any] = None
    status: str
    token: Optional[str] = None # Added token to return to frontend
    
    feasibility: Optional[str] = None
    feasibility_notes: Optional[str] = None
    resource_breakdown: Optional[List[ResourceAllocationItem]] = None
    total_hours: Optional[float] = None
    total_cost: Optional[float] = None
    assumptions: Optional[Any] = None
    lead_attachments: Optional[Any] = None
    normalized_value: Optional[str] = None

    class Config:
        from_attributes = True

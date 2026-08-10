from sqlalchemy import Column, Integer, String, Float, Text, JSON, Date, DateTime, Boolean
from sqlalchemy.sql import func
from .database import Base

class ContractRequest(Base):
    __tablename__ = "contract_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(50), unique=True, index=True, nullable=False)
    request_name = Column(String(255), nullable=False)
    client_name = Column(String(255), nullable=False)
    entity_type = Column(String(100), nullable=True)
    contract_category = Column(String(100), nullable=True)
    contract_type = Column(String(100), nullable=True)
    requester_name = Column(String(100), nullable=True)
    contract_manager = Column(String(100), nullable=True)
    priority = Column(String(50), nullable=True)
    current_status = Column(String(100), default="Draft")
    estimated_value = Column(Float, nullable=True)
    currency = Column(String(10), nullable=True)
    pricing_model = Column(String(100), nullable=True)
    target_effective_date = Column(String(50), nullable=True) # Storing as string to match frontend 'YYYY-MM-DD' exactly
    target_delivery_date = Column(String(50), nullable=True)
    created_date = Column(String(50), nullable=True)
    scope_summary = Column(Text, nullable=True)
    deliverables = Column(JSON, nullable=True) # Array of {name, description, timeline}
    dependencies = Column(JSON, nullable=True) # Array of {department, lead, objective, sla}

    # Meta
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ContractManager(Base):
    __tablename__ = "contract_managers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    workload = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)

class DepartmentLead(Base):
    __tablename__ = "department_leads"

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String(255), nullable=False)
    lead_name = Column(String(255), nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    time_ago = Column(String(100), nullable=True)
    related_request_id = Column(String(50), nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


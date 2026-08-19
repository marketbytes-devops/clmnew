from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class ContractRequest(Base):
    __tablename__ = "contract_requests"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False, default=1)
    tracking_id = Column(String(50), index=True, nullable=True) # e.g. REQ-2026-0891
    title = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), index=True, default="Draft") # Draft, Submitted, Dependency Gathering, Drafting In Progress, Internal Review, Re-Drafting (Internal Rejection), Approved - Ready for Hand-off, Rejected

    priority = Column(String(50), default="Medium") # Low, Medium, High, Urgent
    
    # Step 1: Requester & Beneficiary Details
    requester_id = Column(Integer, ForeignKey("users.id"))
    requester_department = Column(String(100), nullable=True)
    business_unit = Column(String(100), nullable=True)
    entity_type = Column(String(100), nullable=True) # Client / Customer, Vendor / Supplier, Internal Entity, Partner
    entity_name = Column(String(255), nullable=True)
    primary_contact_name = Column(String(255), nullable=True)
    primary_contact_email = Column(String(255), nullable=True)
    jurisdiction = Column(String(100), nullable=True)

    # Step 2: Category & Classification
    category = Column(String(100), nullable=True) # Revenue / Sales, Procurement / Expenses, Partnership, Employment
    contract_type = Column(String(100), nullable=True) # MSA, SOW, Proposal, NDA, etc.
    deal_value = Column(Float, nullable=True)
    currency = Column(String(20), default="USD")
    pricing_model = Column(String(100), nullable=True) # Fixed Bid, T&M, Retainer / Milestone Based, Non-Monetary
    target_effective_date = Column(DateTime, nullable=True)
    target_delivery_date = Column(DateTime, nullable=True)

    # Step 3: Scope & Deliverables
    deliverables = Column(JSON, nullable=True) # Array of deliverable objects
    tech_dependencies = Column(JSON, nullable=True) # Array of selected dependency check names
    custom_terms = Column(Text, nullable=True)
    extracted_scope = Column(JSON, nullable=True) # Placeholder for AI scope extraction

    # Step 4: Routing & Dependency Toggle
    require_dependencies = Column(Boolean, default=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    contract_id = Column(String(50), ForeignKey("contracts.id"), nullable=True) # Linked contract when drafted

    # Stage 2: Orchestration & Synthesis
    ai_aggregated_synthesis = Column(JSON, nullable=True) # { total_hours, blended_timeline, estimated_cost, recommended_pricing, risks }
    final_commercial_pricing = Column(Float, nullable=True)
    payment_schedule = Column(String(100), nullable=True)
    milestone_breakdown = Column(JSON, nullable=True)
    scope_approval_checkpoint = Column(Boolean, default=False)

    # Stage 4: Approval & Review Flow
    version_label = Column(String(50), default="v1.0")
    approval_sequence = Column(JSON, nullable=True) # Array of { step, role, name, status, timestamp }
    inline_comments = Column(JSON, nullable=True) # Array of { id, paragraph_ref, comment_type, author, content, timestamp }
    rejection_rollback_log = Column(JSON, nullable=True) # Array of rejection objects
    audit_watermark = Column(JSON, nullable=True) # Approved audit details

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    requester = relationship("User", foreign_keys=[requester_id], back_populates="submitted_requests")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned_requests")
    contract = relationship("Contract", back_populates="source_request")
    
    attachments = relationship("RequestAttachment", back_populates="request", cascade="all, delete-orphan")
    comments = relationship("RequestComment", back_populates="request", cascade="all, delete-orphan")
    timeline = relationship("RequestTimeline", back_populates="request", cascade="all, delete-orphan")
    dependencies = relationship("RequestDependency", back_populates="request", cascade="all, delete-orphan")


class RequestDependency(Base):
    __tablename__ = "request_dependencies"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("contract_requests.id"))
    department = Column(String(100), nullable=False)
    assignee_name = Column(String(255), nullable=True)
    task_objective = Column(Text, nullable=True)
    sla_deadline = Column(String(100), nullable=True)
    required_inputs = Column(JSON, nullable=True)
    status = Column(String(50), default="Pending") # Pending, Completed, Waived
    access_token = Column(String(100), unique=True, index=True, nullable=True)

    # Lead Submission Fields
    feasibility = Column(String(50), nullable=True) # Feasible, Feasible with Risks, Not Feasible
    feasibility_notes = Column(Text, nullable=True)
    resource_breakdown = Column(JSON, nullable=True) # Array of { role, hours, count, timeline, rate, cost }
    total_hours = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    assumptions = Column(JSON, nullable=True)
    lead_attachments = Column(JSON, nullable=True)
    normalized_value = Column(String(255), nullable=True)

    request = relationship("ContractRequest", back_populates="dependencies")


class RequestAttachment(Base):
    __tablename__ = "request_attachments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("contract_requests.id"))
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("ContractRequest", back_populates="attachments")


class RequestComment(Base):
    __tablename__ = "request_comments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("contract_requests.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("ContractRequest", back_populates="comments")
    user = relationship("User")


class RequestTimeline(Base):
    __tablename__ = "request_timeline"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("contract_requests.id"))
    event_type = Column(String(100), nullable=False) # e.g. Created, Status Changed, Assigned
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("ContractRequest", back_populates="timeline")

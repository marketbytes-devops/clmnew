from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, BigInteger, Enum, Text, TIMESTAMP, Date, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class DependencyTaskStatusEnum(str, enum.Enum):
    pending = 'pending'
    in_progress = 'in_progress'
    completed = 'completed'
    overdue = 'overdue'

class FeasibilityEnum(str, enum.Enum):
    feasible = 'feasible'
    feasible_with_risks = 'feasible_with_risks'
    not_feasible = 'not_feasible'

class NoteTypeEnum(str, enum.Enum):
    blocker = 'blocker'
    risk = 'risk'
    decision = 'decision'
    general = 'general'

class ApprovalStatusEnum(str, enum.Enum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'
    skipped = 'skipped'

class DecisionEnum(str, enum.Enum):
    approve = 'approve'
    reject = 'reject'

class DependencyTask(Base):
    __tablename__ = 'dependency_tasks'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    request_id = Column(BigInteger, ForeignKey('requests.id', ondelete='CASCADE'), nullable=False)
    department_id = Column(BigInteger, ForeignKey('departments.id'), nullable=False)
    assigned_to = Column(BigInteger, ForeignKey('users.id', ondelete='SET NULL'))
    task_objective = Column(Text, nullable=False)
    sla_deadline = Column(TIMESTAMP)
    status = Column(Enum(DependencyTaskStatusEnum), default=DependencyTaskStatusEnum.pending)
    created_by = Column(BigInteger)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    request = relationship("Request")
    department = relationship("Department")
    assignee = relationship("User", foreign_keys=[assigned_to])
    responses = relationship("DependencyResponse", back_populates="task", cascade="all, delete-orphan")
    comments = relationship("DependencyComment", back_populates="task", cascade="all, delete-orphan")
    attachments = relationship("DependencyAttachment", back_populates="task", cascade="all, delete-orphan")

class DependencyResponse(Base):
    __tablename__ = 'dependency_responses'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    task_id = Column(BigInteger, ForeignKey('dependency_tasks.id', ondelete='CASCADE'), nullable=False)
    feasibility = Column(Enum(FeasibilityEnum), nullable=False)
    risk_notes = Column(Text)
    estimated_hours = Column(Numeric(10, 2))
    resource_count = Column(Integer, default=1)
    internal_cost = Column(Numeric(10, 2))
    target_delivery = Column(Date)
    submitted_by = Column(BigInteger)
    submitted_at = Column(TIMESTAMP, server_default=func.now())

    task = relationship("DependencyTask", back_populates="responses")

class DependencyComment(Base):
    __tablename__ = 'dependency_comments'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    task_id = Column(BigInteger, ForeignKey('dependency_tasks.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    task = relationship("DependencyTask", back_populates="comments")
    user = relationship("User")

class DependencyAttachment(Base):
    __tablename__ = 'dependency_attachments'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    task_id = Column(BigInteger, ForeignKey('dependency_tasks.id', ondelete='CASCADE'), nullable=False)
    file_name = Column(String(255))
    file_path = Column(String(500))
    uploaded_by = Column(BigInteger)
    uploaded_at = Column(TIMESTAMP, server_default=func.now())

    task = relationship("DependencyTask", back_populates="attachments")

class ContractManagerNote(Base):
    __tablename__ = 'contract_manager_notes'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    request_id = Column(BigInteger, ForeignKey('requests.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    note = Column(Text, nullable=False)
    note_type = Column(Enum(NoteTypeEnum), default=NoteTypeEnum.general)
    created_at = Column(TIMESTAMP, server_default=func.now())

    request = relationship("Request")
    user = relationship("User")

class ApprovalWorkflow(Base):
    __tablename__ = 'approval_workflows'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    contract_type_id = Column(BigInteger, ForeignKey('contract_types.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    is_parallel = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    organization = relationship("Organization")
    contract_type = relationship("ContractType")
    steps = relationship("ApprovalWorkflowStep", back_populates="workflow", cascade="all, delete-orphan")

class ApprovalWorkflowStep(Base):
    __tablename__ = 'approval_workflow_steps'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    workflow_id = Column(BigInteger, ForeignKey('approval_workflows.id', ondelete='CASCADE'), nullable=False)
    step_order = Column(Integer, nullable=False)
    department_id = Column(BigInteger, ForeignKey('departments.id'))
    role_id = Column(BigInteger, ForeignKey('roles.id'))
    min_approvers = Column(Integer, default=1)
    can_skip = Column(Boolean, default=False)

    workflow = relationship("ApprovalWorkflow", back_populates="steps")
    department = relationship("Department")
    role = relationship("Role")

class ApprovalTask(Base):
    __tablename__ = 'approval_tasks'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    version_id = Column(BigInteger, ForeignKey('contract_versions.id', ondelete='CASCADE'), nullable=False)
    approver_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    step_id = Column(BigInteger, ForeignKey('approval_workflow_steps.id', ondelete='SET NULL'))
    status = Column(Enum(ApprovalStatusEnum), default=ApprovalStatusEnum.pending)
    assigned_at = Column(TIMESTAMP, server_default=func.now())
    responded_at = Column(TIMESTAMP)

    contract = relationship("Contract")
    version = relationship("ContractVersion")
    approver = relationship("User")
    step = relationship("ApprovalWorkflowStep")
    decisions = relationship("ApprovalDecision", back_populates="task", cascade="all, delete-orphan")

class ApprovalDecision(Base):
    __tablename__ = 'approval_decisions'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    task_id = Column(BigInteger, ForeignKey('approval_tasks.id', ondelete='CASCADE'), nullable=False)
    decision = Column(Enum(DecisionEnum), nullable=False)
    notes = Column(Text)
    signature_hash = Column(String(255))
    decision_at = Column(TIMESTAMP, server_default=func.now())

    task = relationship("ApprovalTask", back_populates="decisions")

class ApprovalRejectionReason(Base):
    __tablename__ = 'approval_rejection_reasons'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    category = Column(String(100), nullable=False)
    reason_text = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)

    organization = relationship("Organization")

class ContractTypeApprovalRule(Base):
    __tablename__ = 'contract_type_approval_rules'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_type_id = Column(BigInteger, ForeignKey('contract_types.id', ondelete='CASCADE'), nullable=False)
    department_id = Column(BigInteger, ForeignKey('departments.id', ondelete='CASCADE'), nullable=False)
    is_required = Column(Boolean, default=True)
    min_approvers = Column(Integer, default=1)

    contract_type = relationship("ContractType")
    department = relationship("Department")

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, BigInteger, Enum, Text, TIMESTAMP, Date, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class MilestoneStatusEnum(str, enum.Enum):
    not_started = 'not_started'
    in_progress = 'in_progress'
    pending_client = 'pending_client'
    completed = 'completed'
    delayed = 'delayed'

class ObligationTypeEnum(str, enum.Enum):
    deliverable = 'deliverable'
    report = 'report'
    audit = 'audit'
    support = 'support'
    compliance = 'compliance'

class ObligationStatusEnum(str, enum.Enum):
    pending = 'pending'
    in_progress = 'in_progress'
    completed = 'completed'
    overdue = 'overdue'

class RenewalStatusEnum(str, enum.Enum):
    pending = 'pending'
    negotiating = 'negotiating'
    renewed = 'renewed'
    expired = 'expired'

class ExpirationStatusEnum(str, enum.Enum):
    active = 'active'
    expiring_soon = 'expiring_soon'
    expired = 'expired'
    terminated = 'terminated'

class AlertTypeEnum(str, enum.Enum):
    days_30 = '30_days'
    days_14 = '14_days'
    days_7 = '7_days'
    days_1 = '1_day'

class AlertSentViaEnum(str, enum.Enum):
    email = 'email'
    slack = 'slack'
    in_app = 'in_app'

class AmendmentStatusEnum(str, enum.Enum):
    draft = 'draft'
    review = 'review'
    approved = 'approved'
    executed = 'executed'

class AmendmentApprovalStatusEnum(str, enum.Enum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'

class Milestone(Base):
    __tablename__ = 'milestones'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    version_id = Column(BigInteger, ForeignKey('contract_versions.id', ondelete='SET NULL'))
    milestone_name = Column(String(255), nullable=False)
    description = Column(Text)
    due_date = Column(Date, nullable=False)
    assignee_id = Column(BigInteger, ForeignKey('users.id', ondelete='SET NULL'))
    payment_value = Column(Numeric(10, 2))
    payment_percentage = Column(Numeric(5, 2))
    status = Column(Enum(MilestoneStatusEnum), default=MilestoneStatusEnum.not_started)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    contract = relationship("Contract")
    version = relationship("ContractVersion")
    assignee = relationship("User")
    status_updates = relationship("MilestoneStatusUpdate", back_populates="milestone", cascade="all, delete-orphan")

class MilestoneStatusUpdate(Base):
    __tablename__ = 'milestone_status_updates'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    milestone_id = Column(BigInteger, ForeignKey('milestones.id', ondelete='CASCADE'), nullable=False)
    previous_status = Column(String(50))
    new_status = Column(String(50), nullable=False)
    updated_by = Column(BigInteger, ForeignKey('users.id'))
    note = Column(Text)
    updated_at = Column(TIMESTAMP, server_default=func.now())

    milestone = relationship("Milestone", back_populates="status_updates")
    user = relationship("User")

class Obligation(Base):
    __tablename__ = 'obligations'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    obligation_type = Column(Enum(ObligationTypeEnum), nullable=False)
    description = Column(Text, nullable=False)
    due_date = Column(Date)
    assignee_id = Column(BigInteger, ForeignKey('users.id', ondelete='SET NULL'))
    status = Column(Enum(ObligationStatusEnum), default=ObligationStatusEnum.pending)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    contract = relationship("Contract")
    assignee = relationship("User")

class Renewal(Base):
    __tablename__ = 'renewals'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    auto_renew = Column(Boolean, default=False)
    renewal_terms = Column(Text)
    renewal_price = Column(Numeric(10, 2))
    renewal_date = Column(Date)
    status = Column(Enum(RenewalStatusEnum), default=RenewalStatusEnum.pending)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    contract = relationship("Contract")

class ExpirationTracking(Base):
    __tablename__ = 'expiration_tracking'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    effective_date = Column(Date, nullable=False)
    expiration_date = Column(Date, nullable=False)
    auto_renew = Column(Boolean, default=False)
    termination_notice_sent = Column(Boolean, default=False)
    notice_sent_date = Column(Date)
    status = Column(Enum(ExpirationStatusEnum), default=ExpirationStatusEnum.active)

    contract = relationship("Contract")

class RenewalAlert(Base):
    __tablename__ = 'renewal_alerts'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    alert_type = Column(Enum(AlertTypeEnum), nullable=False)
    sent_at = Column(TIMESTAMP, server_default=func.now())
    sent_to = Column(BigInteger, ForeignKey('users.id'))
    sent_via = Column(Enum(AlertSentViaEnum), default=AlertSentViaEnum.email)
    delivered = Column(Boolean, default=True)

    contract = relationship("Contract")
    user = relationship("User")

class Amendment(Base):
    __tablename__ = 'amendments'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    amendment_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    effective_date = Column(Date)
    reason = Column(Text)
    status = Column(Enum(AmendmentStatusEnum), default=AmendmentStatusEnum.draft)
    created_by = Column(BigInteger)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    contract = relationship("Contract")
    versions = relationship("AmendmentVersion", back_populates="amendment", cascade="all, delete-orphan")
    approvals = relationship("AmendmentApproval", back_populates="amendment", cascade="all, delete-orphan")

class AmendmentVersion(Base):
    __tablename__ = 'amendment_versions'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    amendment_id = Column(BigInteger, ForeignKey('amendments.id', ondelete='CASCADE'), nullable=False)
    version_number = Column(Integer, nullable=False)
    content = Column(Text) # LONGTEXT
    created_by = Column(BigInteger)
    created_at = Column(TIMESTAMP, server_default=func.now())

    amendment = relationship("Amendment", back_populates="versions")

class AmendmentApproval(Base):
    __tablename__ = 'amendment_approvals'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    amendment_id = Column(BigInteger, ForeignKey('amendments.id', ondelete='CASCADE'), nullable=False)
    approver_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    status = Column(Enum(AmendmentApprovalStatusEnum), default=AmendmentApprovalStatusEnum.pending)
    notes = Column(Text)
    approved_at = Column(TIMESTAMP)

    amendment = relationship("Amendment", back_populates="approvals")
    approver = relationship("User")

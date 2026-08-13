from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, BigInteger, JSON, Enum, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class RequestStatusEnum(str, enum.Enum):
    draft = 'draft'
    submitted = 'submitted'
    dependency_gathering = 'dependency_gathering'
    drafting_in_progress = 'drafting_in_progress'
    internal_review = 'internal_review'
    approved_ready = 'approved_ready'
    client_negotiation = 'client_negotiation'
    re_drafting = 're_drafting'
    executed = 'executed'
    archived = 'archived'

class PriorityEnum(str, enum.Enum):
    low = 'low'
    medium = 'medium'
    high = 'high'
    urgent = 'urgent'

class CommentTypeEnum(str, enum.Enum):
    internal = 'internal'
    client = 'client'
    system = 'system'

class Request(Base):
    __tablename__ = 'requests'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    form_id = Column(BigInteger, ForeignKey('request_forms.id'), nullable=False)
    request_id = Column(String(50), unique=True, nullable=False)
    title = Column(String(255))
    status = Column(Enum(RequestStatusEnum), default=RequestStatusEnum.draft)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium)
    created_by = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    assigned_to = Column(BigInteger, ForeignKey('users.id', ondelete='SET NULL'))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    submitted_at = Column(TIMESTAMP)

    organization = relationship("Organization")
    form = relationship("RequestForm")
    creator = relationship("User", foreign_keys=[created_by])
    assignee = relationship("User", foreign_keys=[assigned_to])
    field_values = relationship("RequestFieldValue", back_populates="request", cascade="all, delete-orphan")
    attachments = relationship("RequestAttachment", back_populates="request", cascade="all, delete-orphan")
    comments = relationship("RequestComment", back_populates="request", cascade="all, delete-orphan")
    status_history = relationship("RequestStatusHistory", back_populates="request", cascade="all, delete-orphan")
    # contracts = relationship("Contract", back_populates="request", cascade="all, delete-orphan")

class RequestFieldValue(Base):
    __tablename__ = 'request_field_values'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    request_id = Column(BigInteger, ForeignKey('requests.id', ondelete='CASCADE'), nullable=False)
    field_id = Column(BigInteger, ForeignKey('form_fields.id'), nullable=False)
    field_value = Column(Text)
    field_value_json = Column(JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    request = relationship("Request", back_populates="field_values")
    field = relationship("FormField")

class RequestAttachment(Base):
    __tablename__ = 'request_attachments'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    request_id = Column(BigInteger, ForeignKey('requests.id', ondelete='CASCADE'), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger)
    file_type = Column(String(100))
    uploaded_by = Column(BigInteger)
    uploaded_at = Column(TIMESTAMP, server_default=func.now())

    request = relationship("Request", back_populates="attachments")

class RequestComment(Base):
    __tablename__ = 'request_comments'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    request_id = Column(BigInteger, ForeignKey('requests.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    comment = Column(Text, nullable=False)
    comment_type = Column(Enum(CommentTypeEnum), default=CommentTypeEnum.internal)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    request = relationship("Request", back_populates="comments")
    user = relationship("User")

class RequestStatusHistory(Base):
    __tablename__ = 'request_status_history'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    request_id = Column(BigInteger, ForeignKey('requests.id', ondelete='CASCADE'), nullable=False)
    previous_status = Column(String(50))
    new_status = Column(String(50), nullable=False)
    changed_by = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    changed_at = Column(TIMESTAMP, server_default=func.now())
    note = Column(Text)

    request = relationship("Request", back_populates="status_history")
    user = relationship("User")

class RequestCloneLog(Base):
    __tablename__ = 'request_clone_log'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    original_request_id = Column(BigInteger, ForeignKey('requests.id'), nullable=False)
    new_request_id = Column(BigInteger, ForeignKey('requests.id'), nullable=False)
    cloned_by = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    cloned_at = Column(TIMESTAMP, server_default=func.now())

    original_request = relationship("Request", foreign_keys=[original_request_id])
    new_request = relationship("Request", foreign_keys=[new_request_id])
    user = relationship("User")

from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Contract(Base):
    __tablename__ = "contracts"
    __table_args__ = {'extend_existing': True}

    id = Column(String(50), primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False, default=1)
    title = Column(String(255), index=True, nullable=False)
    client_name = Column(String(255), nullable=True)
    client_email = Column(String(255), nullable=True)
    vendor_name = Column(String(255), nullable=True)
    total_value = Column(Float, nullable=True)
    currency = Column(String(10), nullable=True)
    timeline_weeks = Column(Float, nullable=True)
    status = Column(String(50), index=True, default="APPROVED")
    content_json = Column(Text, nullable=True)
    has_passcode = Column(Boolean, default=False)
    passcode_hash = Column(String(255), nullable=True)
    version = Column(String(20), nullable=True)
    version_notes = Column(Text, nullable=True)
    last_redispatched_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # owner = relationship("User", back_populates="contracts")
    versions = relationship("ContractVersion", back_populates="contract", cascade="all, delete-orphan")
    attachments = relationship("ContractAttachment", back_populates="contract", cascade="all, delete-orphan")
    timeline = relationship("ContractTimeline", back_populates="contract", cascade="all, delete-orphan")
    source_request = relationship("ContractRequest", back_populates="contract", uselist=False)

class ContractVersion(Base):
    __tablename__ = "contract_versions"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(String(50), ForeignKey("contracts.id"))
    version_number = Column(String(50), nullable=False) # e.g. v1.0
    content = Column(Text, nullable=True)
    file_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="versions")

class ContractAttachment(Base):
    __tablename__ = "contract_attachments"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(String(50), ForeignKey("contracts.id"))
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="attachments")

class ContractTimeline(Base):
    __tablename__ = "contract_timeline"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(String(50), ForeignKey("contracts.id"))
    event_type = Column(String(100), nullable=False) # e.g. "Status Changed", "Comment Added"
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="timeline")

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    status = Column(String(50), index=True, default="Draft") # Draft, Review, Negotiation, Executed, Expired
    value = Column(Float, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    tags = Column(JSON, nullable=True)
    metadata_data = Column(JSON, nullable=True) # Renamed from 'metadata' to avoid conflicts with SQLAlchemy's metadata
    
    ai_summary = Column(Text, nullable=True)
    ai_risk_score = Column(String(50), nullable=True) # Low, Medium, High
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="contracts")
    versions = relationship("ContractVersion", back_populates="contract", cascade="all, delete-orphan")
    attachments = relationship("ContractAttachment", back_populates="contract", cascade="all, delete-orphan")
    timeline = relationship("ContractTimeline", back_populates="contract", cascade="all, delete-orphan")
    source_request = relationship("ContractRequest", back_populates="contract", uselist=False)

class ContractVersion(Base):
    __tablename__ = "contract_versions"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    version_number = Column(String(50), nullable=False) # e.g. v1.0
    content = Column(Text, nullable=True)
    file_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="versions")

class ContractAttachment(Base):
    __tablename__ = "contract_attachments"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="attachments")

class ContractTimeline(Base):
    __tablename__ = "contract_timeline"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    event_type = Column(String(100), nullable=False) # e.g. "Status Changed", "Comment Added"
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="timeline")

from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, Text, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    client_name = Column(String(255), nullable=False)
    client_email = Column(String(255), nullable=False)
    vendor_name = Column(String(255), default="MarketBytes Enterprise")
    total_value = Column(Float, default=22000.0)
    currency = Column(String(10), default="USD")
    timeline_weeks = Column(Float, default=6.5)
    version = Column(String(20), default="v1.0")
    version_notes = Column(Text, nullable=True)
    last_redispatched_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="APPROVED") # APPROVED, CLIENT_NEGOTIATION, EXECUTED
    content_json = Column(Text, nullable=False)
    has_passcode = Column(Boolean, default=False)
    passcode_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tokens = relationship("PortalInviteToken", back_populates="contract", cascade="all, delete-orphan")
    redlines = relationship("ClientRedline", back_populates="contract", cascade="all, delete-orphan")
    signatures = relationship("ClientSignature", back_populates="contract", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="contract", cascade="all, delete-orphan")

class PortalInviteToken(Base):
    __tablename__ = "portal_invite_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    contract_id = Column(String(50), ForeignKey("contracts.id"), nullable=False)
    token = Column(String(128), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="tokens")

class ClientRedline(Base):
    __tablename__ = "client_redlines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    contract_id = Column(String(50), ForeignKey("contracts.id"), nullable=False)
    selected_text = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    proposed_wording = Column(Text, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(50), default="PENDING") # PENDING, ACCEPTED, REJECTED, COUNTERED
    cm_counter_wording = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="redlines")

class ClientSignature(Base):
    __tablename__ = "client_signatures"

    id = Column(Integer, primary_key=True, autoincrement=True)
    contract_id = Column(String(50), ForeignKey("contracts.id"), nullable=False)
    signer_name = Column(String(255), nullable=False)
    signer_title = Column(String(255), nullable=False)
    signature_data = Column(Text, nullable=False)
    ip_address = Column(String(100), nullable=True)
    signed_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="signatures")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    contract_id = Column(String(50), ForeignKey("contracts.id"), nullable=False)
    recipient_role = Column(String(50), nullable=False) # CM, CLIENT
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="notifications")

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, BigInteger, Enum, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class FeedbackCategoryEnum(str, enum.Enum):
    pricing = 'pricing'
    timeline = 'timeline'
    scope = 'scope'
    legal = 'legal'
    other = 'other'

class FeedbackStatusEnum(str, enum.Enum):
    pending = 'pending'
    accepted = 'accepted'
    rejected = 'rejected'
    counter_offered = 'counter_offered'

class NegotiationResponseTypeEnum(str, enum.Enum):
    accept = 'accept'
    reject = 'reject'
    counter_offer = 'counter_offer'

class PortalActionTypeEnum(str, enum.Enum):
    viewed = 'viewed'
    downloaded = 'downloaded'
    commented = 'commented'
    requested_change = 'requested_change'
    signed = 'signed'
    rejected = 'rejected'

class ClientFeedback(Base):
    __tablename__ = 'client_feedback'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    client_contact_id = Column(BigInteger, ForeignKey('client_contacts.id'), nullable=False)
    section_reference = Column(String(255))
    category = Column(Enum(FeedbackCategoryEnum), nullable=False)
    proposed_wording = Column(Text)
    reason = Column(Text)
    status = Column(Enum(FeedbackStatusEnum), default=FeedbackStatusEnum.pending)
    created_at = Column(TIMESTAMP, server_default=func.now())

    contract = relationship("Contract")
    client_contact = relationship("ClientContact")
    responses = relationship("NegotiationResponse", back_populates="feedback", cascade="all, delete-orphan")

class NegotiationResponse(Base):
    __tablename__ = 'negotiation_responses'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    feedback_id = Column(BigInteger, ForeignKey('client_feedback.id', ondelete='CASCADE'), nullable=False)
    response_type = Column(Enum(NegotiationResponseTypeEnum), nullable=False)
    response_text = Column(Text)
    internal_notes = Column(Text)
    responded_by = Column(BigInteger, ForeignKey('users.id'))
    responded_at = Column(TIMESTAMP, server_default=func.now())

    feedback = relationship("ClientFeedback", back_populates="responses")
    user = relationship("User")

class ClientPortalSession(Base):
    __tablename__ = 'client_portal_sessions'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    client_contact_id = Column(BigInteger, ForeignKey('client_contacts.id'), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    otp_code = Column(String(10))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    expires_at = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, server_default=func.now())

    contract = relationship("Contract")
    client_contact = relationship("ClientContact")

class PortalAccess(Base):
    __tablename__ = 'portal_access'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    client_contact_id = Column(BigInteger, ForeignKey('client_contacts.id'), nullable=False)
    can_view = Column(Boolean, default=True)
    can_comment = Column(Boolean, default=True)
    can_edit = Column(Boolean, default=False)
    can_sign = Column(Boolean, default=True)
    can_download = Column(Boolean, default=True)
    granted_at = Column(TIMESTAMP, server_default=func.now())
    granted_by = Column(BigInteger, ForeignKey('users.id'))

    contract = relationship("Contract")
    client_contact = relationship("ClientContact")
    user = relationship("User")

class PortalAction(Base):
    __tablename__ = 'portal_actions'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    client_contact_id = Column(BigInteger, ForeignKey('client_contacts.id'), nullable=False)
    action_type = Column(Enum(PortalActionTypeEnum), nullable=False)
    action_details = Column(Text)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    action_at = Column(TIMESTAMP, server_default=func.now())

    contract = relationship("Contract")
    client_contact = relationship("ClientContact")

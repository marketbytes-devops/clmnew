from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, BigInteger, Enum, Text, TIMESTAMP, Date, Numeric, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class AuditActionEnum(str, enum.Enum):
    insert = 'insert'
    update = 'update'
    delete = 'delete'
    view = 'view'
    export = 'export'
    approve = 'approve'
    reject = 'reject'
    sign = 'sign'

class NotificationChannelEnum(str, enum.Enum):
    email = 'email'
    slack = 'slack'
    in_app = 'in_app'
    sms = 'sms'

class NotificationStatusEnum(str, enum.Enum):
    sent = 'sent'
    failed = 'failed'
    pending = 'pending'

class WebhookEventStatusEnum(str, enum.Enum):
    pending = 'pending'
    sent = 'sent'
    failed = 'failed'
    retrying = 'retrying'

class SignatureProviderEnum(str, enum.Enum):
    docusign = 'docusign'
    adobesign = 'adobesign'
    builtin = 'builtin'

class SignatureStatusEnum(str, enum.Enum):
    pending = 'pending'
    sent = 'sent'
    viewed = 'viewed'
    signed = 'signed'
    declined = 'declined'
    expired = 'expired'

class VerificationMethodEnum(str, enum.Enum):
    otp = 'otp'
    biometric = 'biometric'
    _2fa = '2fa'
    certificate = 'certificate'

class AIHistoricalBenchmark(Base):
    __tablename__ = 'ai_historical_benchmarks'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    contract_type_id = Column(BigInteger, ForeignKey('contract_types.id'), nullable=False)
    estimated_hours = Column(Numeric(10, 2))
    actual_hours = Column(Numeric(10, 2))
    estimated_cost = Column(Numeric(10, 2))
    actual_cost = Column(Numeric(10, 2))
    project_name = Column(String(255))
    completed_at = Column(Date)

    organization = relationship("Organization")
    contract_type = relationship("ContractType")

class AIQuery(Base):
    __tablename__ = 'ai_queries'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    query = Column(Text, nullable=False)
    response = Column(Text)
    response_time_ms = Column(Integer)
    status = Column(Enum('success', 'failed'), default='success')
    created_at = Column(TIMESTAMP, server_default=func.now())

    organization = relationship("Organization")
    user = relationship("User")

class AnalyticsView(Base):
    __tablename__ = 'analytics_views'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    report_type = Column(String(100), nullable=False)
    report_date = Column(Date, nullable=False)
    data = Column(JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())

    organization = relationship("Organization")

class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.id', ondelete='SET NULL'))
    table_name = Column(String(100))
    record_id = Column(BigInteger)
    action = Column(Enum(AuditActionEnum), nullable=False)
    old_values = Column(JSON)
    new_values = Column(JSON)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

    organization = relationship("Organization")
    user = relationship("User")
    details = relationship("AuditLogDetail", back_populates="audit", cascade="all, delete-orphan")

class AuditLogDetail(Base):
    __tablename__ = 'audit_log_details'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    audit_id = Column(BigInteger, ForeignKey('audit_logs.id', ondelete='CASCADE'), nullable=False)
    field_name = Column(String(100))
    old_value = Column(Text)
    new_value = Column(Text)

    audit = relationship("AuditLog", back_populates="details")

class ComplianceReport(Base):
    __tablename__ = 'compliance_reports'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='SET NULL'))
    report_type = Column(String(100), nullable=False)
    report_content = Column(Text) # LONGTEXT
    file_path = Column(String(500))
    generated_by = Column(BigInteger)
    generated_at = Column(TIMESTAMP, server_default=func.now())

    organization = relationship("Organization")
    contract = relationship("Contract")

class NotificationLog(Base):
    __tablename__ = 'notification_logs'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.id', ondelete='SET NULL'))
    template_id = Column(BigInteger)
    event_type = Column(String(100))
    subject = Column(String(255))
    body = Column(Text)
    channel = Column(Enum(NotificationChannelEnum), default=NotificationChannelEnum.email)
    status = Column(Enum(NotificationStatusEnum), default=NotificationStatusEnum.pending)
    sent_at = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, server_default=func.now())

    organization = relationship("Organization")
    user = relationship("User")

class NotificationTemplate(Base):
    __tablename__ = 'notification_templates'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    event_type = Column(String(100), unique=True, nullable=False)
    subject_template = Column(String(255))
    body_template = Column(Text)
    channel = Column(Enum(NotificationChannelEnum), default=NotificationChannelEnum.email)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization")

class NotificationPreference(Base):
    __tablename__ = 'notification_preferences'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    event_type = Column(String(100), nullable=False)
    channel = Column(Enum(NotificationChannelEnum), default=NotificationChannelEnum.email)
    is_enabled = Column(Boolean, default=True)

    user = relationship("User")

class IntegrationConfig(Base):
    __tablename__ = 'integration_configs'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    integration_name = Column(String(100), nullable=False)
    api_key = Column(String(255))
    api_secret = Column(String(255))
    endpoint_url = Column(String(500))
    webhook_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    settings = Column(JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization")
    logs = relationship("IntegrationLog", back_populates="config", cascade="all, delete-orphan")

class IntegrationLog(Base):
    __tablename__ = 'integration_logs'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    integration_id = Column(BigInteger, ForeignKey('integration_configs.id', ondelete='CASCADE'), nullable=False)
    request_data = Column(JSON)
    response_data = Column(JSON)
    status_code = Column(Integer)
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    duration_ms = Column(Integer)
    created_at = Column(TIMESTAMP, server_default=func.now())

    config = relationship("IntegrationConfig", back_populates="logs")

class WebhookEvent(Base):
    __tablename__ = 'webhook_events'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    event_type = Column(String(100), nullable=False)
    payload = Column(JSON)
    status = Column(Enum(WebhookEventStatusEnum), default=WebhookEventStatusEnum.pending)
    retry_count = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())

    organization = relationship("Organization")

class DeletedRecord(Base):
    __tablename__ = 'deleted_records'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    table_name = Column(String(100), nullable=False)
    record_id = Column(BigInteger, nullable=False)
    deleted_at = Column(TIMESTAMP, server_default=func.now())
    deleted_by = Column(BigInteger)
    restore_token = Column(String(64))
    permanent_delete_at = Column(TIMESTAMP)

class ArchivedContract(Base):
    __tablename__ = 'archived_contracts'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    archive_reason = Column(String(255))
    archived_by = Column(BigInteger)
    archived_at = Column(TIMESTAMP, server_default=func.now())
    retention_date = Column(Date)

    contract = relationship("Contract")

class RecycleBin(Base):
    __tablename__ = 'recycle_bin'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    table_name = Column(String(100), nullable=False)
    record_id = Column(BigInteger, nullable=False)
    record_data = Column(JSON)
    deleted_by = Column(BigInteger)
    deleted_at = Column(TIMESTAMP, server_default=func.now())
    restore_expires_at = Column(TIMESTAMP)

class PermanentDeleteLog(Base):
    __tablename__ = 'permanent_delete_log'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    table_name = Column(String(100), nullable=False)
    record_id = Column(BigInteger, nullable=False)
    deleted_by = Column(BigInteger)
    deleted_at = Column(TIMESTAMP, server_default=func.now())
    reason = Column(Text)

class SignatureRequest(Base):
    __tablename__ = 'signature_requests'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    version_id = Column(BigInteger, ForeignKey('contract_versions.id', ondelete='CASCADE'), nullable=False)
    signer_id = Column(BigInteger)
    signer_email = Column(String(255))
    signer_name = Column(String(255))
    signature_provider = Column(Enum(SignatureProviderEnum), default=SignatureProviderEnum.builtin)
    provider_request_id = Column(String(255))
    status = Column(Enum(SignatureStatusEnum), default=SignatureStatusEnum.pending)
    sent_at = Column(TIMESTAMP)
    signed_at = Column(TIMESTAMP)
    expires_at = Column(TIMESTAMP)

    contract = relationship("Contract")
    version = relationship("ContractVersion")
    signatures = relationship("Signature", back_populates="request", cascade="all, delete-orphan")

class Signature(Base):
    __tablename__ = 'signatures'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    signature_request_id = Column(BigInteger, ForeignKey('signature_requests.id', ondelete='CASCADE'), nullable=False)
    signer_email = Column(String(255))
    signer_name = Column(String(255))
    signature_hash = Column(String(255), nullable=False)
    signature_data = Column(Text)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    signed_at = Column(TIMESTAMP, server_default=func.now())

    request = relationship("SignatureRequest", back_populates="signatures")
    verifications = relationship("SignatoryVerification", back_populates="signature", cascade="all, delete-orphan")

class SignatoryVerification(Base):
    __tablename__ = 'signatory_verification'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    signature_id = Column(BigInteger, ForeignKey('signatures.id', ondelete='CASCADE'), nullable=False)
    verification_method = Column(Enum(VerificationMethodEnum), nullable=False)
    otp_code = Column(String(10))
    verified_at = Column(TIMESTAMP, server_default=func.now())

    signature = relationship("Signature", back_populates="verifications")

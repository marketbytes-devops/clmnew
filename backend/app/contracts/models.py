from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, BigInteger, Enum, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class RiskLevelEnum(str, enum.Enum):
    low = 'low'
    medium = 'medium'
    high = 'high'

class ContractStatusEnum(str, enum.Enum):
    drafting = 'drafting'
    internal_review = 'internal_review'
    approved = 'approved'
    negotiation = 'negotiation'
    executed = 'executed'
    archived = 'archived'

class VersionLabelEnum(str, enum.Enum):
    draft = 'draft'
    internal_draft = 'internal_draft'
    approved = 'approved'
    executed = 'executed'
    archived = 'archived'

class ContractCommentTypeEnum(str, enum.Enum):
    internal = 'internal'
    reviewer = 'reviewer'
    client = 'client'

class ContractCategory(Base):
    __tablename__ = 'contract_categories'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)

    organization = relationship("Organization")
    contract_types = relationship("ContractType", back_populates="category", cascade="all, delete-orphan")

class ContractType(Base):
    __tablename__ = 'contract_types'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    category_id = Column(BigInteger, ForeignKey('contract_categories.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True)
    description = Column(Text)
    default_template_id = Column(BigInteger)

    organization = relationship("Organization")
    category = relationship("ContractCategory", back_populates="contract_types")
    templates = relationship("ContractTemplate", back_populates="contract_type", cascade="all, delete-orphan")
    custom_fields = relationship("ContractTypeCustomField", back_populates="contract_type", cascade="all, delete-orphan")

class ContractTemplate(Base):
    __tablename__ = 'contract_templates'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    contract_type_id = Column(BigInteger, ForeignKey('contract_types.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    file_path = Column(String(500))
    file_content = Column(Text) # LONGTEXT
    is_active = Column(Boolean, default=True)
    created_by = Column(BigInteger)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization")
    contract_type = relationship("ContractType", back_populates="templates")
    versions = relationship("TemplateVersion", back_populates="template", cascade="all, delete-orphan")

class TemplateVersion(Base):
    __tablename__ = 'template_versions'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    template_id = Column(BigInteger, ForeignKey('contract_templates.id', ondelete='CASCADE'), nullable=False)
    version_number = Column(Integer, nullable=False)
    file_content = Column(Text) # LONGTEXT
    changes = Column(Text)
    created_by = Column(BigInteger)
    created_at = Column(TIMESTAMP, server_default=func.now())

    template = relationship("ContractTemplate", back_populates="versions")

class ClauseCategory(Base):
    __tablename__ = 'clause_categories'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)

    organization = relationship("Organization")

class TemplateClause(Base):
    __tablename__ = 'template_clauses'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    category_id = Column(BigInteger, ForeignKey('clause_categories.id', ondelete='SET NULL'))
    title = Column(String(255), nullable=False)
    clause_text = Column(Text, nullable=False) # LONGTEXT
    standard_text = Column(Text) # LONGTEXT
    fallback_text = Column(Text) # LONGTEXT
    risk_level = Column(Enum(RiskLevelEnum), default=RiskLevelEnum.medium)
    is_approved = Column(Boolean, default=False)
    approved_by = Column(BigInteger)
    approved_at = Column(TIMESTAMP)

    organization = relationship("Organization")
    category = relationship("ClauseCategory")
    versions = relationship("ClauseVersion", back_populates="clause", cascade="all, delete-orphan")

class ClauseVersion(Base):
    __tablename__ = 'clause_versions'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    clause_id = Column(BigInteger, ForeignKey('template_clauses.id', ondelete='CASCADE'), nullable=False)
    version_number = Column(Integer, nullable=False)
    clause_text = Column(Text, nullable=False) # LONGTEXT
    changes = Column(Text)
    approved_by = Column(BigInteger)
    approved_at = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, server_default=func.now())

    clause = relationship("TemplateClause", back_populates="versions")

class ContractTypeCustomField(Base):
    __tablename__ = 'contract_type_custom_fields'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_type_id = Column(BigInteger, ForeignKey('contract_types.id', ondelete='CASCADE'), nullable=False)
    field_name = Column(String(100), nullable=False)
    field_type = Column(Enum('text', 'number', 'date', 'dropdown', 'checkbox'), nullable=False)
    is_required = Column(Boolean, default=False)
    default_value = Column(Text)

    contract_type = relationship("ContractType", back_populates="custom_fields")

class Contract(Base):
    __tablename__ = 'contracts'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    request_id = Column(BigInteger, ForeignKey('requests.id', ondelete='CASCADE'), nullable=False)
    contract_type_id = Column(BigInteger, ForeignKey('contract_types.id'), nullable=False)
    title = Column(String(255), nullable=False)
    contract_number = Column(String(50), unique=True)
    current_version_id = Column(BigInteger)
    status = Column(Enum(ContractStatusEnum), default=ContractStatusEnum.drafting)
    created_by = Column(BigInteger)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization")
    request = relationship("Request")
    contract_type = relationship("ContractType")
    versions = relationship("ContractVersion", back_populates="contract", cascade="all, delete-orphan", foreign_keys="[ContractVersion.contract_id]")
    # client_links = relationship("ClientContractsLink", back_populates="contract", cascade="all, delete-orphan")

class ContractVersion(Base):
    __tablename__ = 'contract_versions'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    version_number = Column(String(20), nullable=False)
    version_label = Column(Enum(VersionLabelEnum), default=VersionLabelEnum.draft)
    content = Column(Text, nullable=False) # LONGTEXT
    is_final = Column(Boolean, default=False)
    is_editable = Column(Boolean, default=True)
    created_by = Column(BigInteger)
    created_at = Column(TIMESTAMP, server_default=func.now())

    contract = relationship("Contract", back_populates="versions", foreign_keys=[contract_id])
    tags = relationship("ContractVersionTag", back_populates="version", cascade="all, delete-orphan")

class ContractVersionTag(Base):
    __tablename__ = 'contract_version_tags'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    version_id = Column(BigInteger, ForeignKey('contract_versions.id', ondelete='CASCADE'), nullable=False)
    tag = Column(String(50), nullable=False)
    tagged_by = Column(BigInteger)
    tagged_at = Column(TIMESTAMP, server_default=func.now())

    version = relationship("ContractVersion", back_populates="tags")

class ContractEdit(Base):
    __tablename__ = 'contract_edits'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    version_id = Column(BigInteger, ForeignKey('contract_versions.id', ondelete='SET NULL'))
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    field_name = Column(String(100))
    old_value = Column(Text)
    new_value = Column(Text)
    edited_at = Column(TIMESTAMP, server_default=func.now())

    contract = relationship("Contract")
    version = relationship("ContractVersion")
    user = relationship("User")

class ContractToken(Base):
    __tablename__ = 'contract_tokens'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    token_key = Column(String(100), nullable=False)
    token_value = Column(Text, nullable=False)
    source_table = Column(String(100))
    source_id = Column(BigInteger)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    contract = relationship("Contract")

class ContractTokenSource(Base):
    __tablename__ = 'contract_token_sources'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    token_key = Column(String(100), unique=True, nullable=False)
    source_table = Column(String(100), nullable=False)
    source_field = Column(String(100), nullable=False)
    description = Column(Text)

class ContractDiff(Base):
    __tablename__ = 'contract_diffs'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    from_version_id = Column(BigInteger, ForeignKey('contract_versions.id'), nullable=False)
    to_version_id = Column(BigInteger, ForeignKey('contract_versions.id'), nullable=False)
    diff_content = Column(Text) # LONGTEXT
    generated_at = Column(TIMESTAMP, server_default=func.now())

    contract = relationship("Contract")
    from_version = relationship("ContractVersion", foreign_keys=[from_version_id])
    to_version = relationship("ContractVersion", foreign_keys=[to_version_id])

class ContractComment(Base):
    __tablename__ = 'contract_comments'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    contract_id = Column(BigInteger, ForeignKey('contracts.id', ondelete='CASCADE'), nullable=False)
    version_id = Column(BigInteger, ForeignKey('contract_versions.id', ondelete='SET NULL'))
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    comment = Column(Text, nullable=False)
    section_reference = Column(String(255))
    comment_type = Column(Enum(ContractCommentTypeEnum), default=ContractCommentTypeEnum.internal)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    contract = relationship("Contract")
    version = relationship("ContractVersion")
    user = relationship("User")

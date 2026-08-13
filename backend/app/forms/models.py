from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, BigInteger, JSON, Enum, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class FieldTypeEnum(str, enum.Enum):
    text = 'text'
    textarea = 'textarea'
    email = 'email'
    phone = 'phone'
    date = 'date'
    datetime = 'datetime'
    currency = 'currency'
    number = 'number'
    dropdown = 'dropdown'
    multiselect = 'multiselect'
    checkbox = 'checkbox'
    file = 'file'
    rich_text = 'rich_text'
    radio = 'radio'

class ValidationTypeEnum(str, enum.Enum):
    required = 'required'
    min_length = 'min_length'
    max_length = 'max_length'
    min_value = 'min_value'
    max_value = 'max_value'
    regex = 'regex'
    email = 'email'
    phone = 'phone'
    custom = 'custom'

class ConditionTypeEnum(str, enum.Enum):
    equals = 'equals'
    not_equals = 'not_equals'
    contains = 'contains'
    not_contains = 'not_contains'
    greater_than = 'greater_than'
    less_than = 'less_than'

class ActionEnum(str, enum.Enum):
    show = 'show'
    hide = 'hide'
    enable = 'enable'
    disable = 'disable'

class FormStatusEnum(str, enum.Enum):
    draft = 'draft'
    published = 'published'
    archived = 'archived'

class RequestForm(Base):
    __tablename__ = 'request_forms'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    department_id = Column(BigInteger, ForeignKey('departments.id', ondelete='SET NULL'))
    is_active = Column(Boolean, default=True)
    created_by = Column(BigInteger)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization")
    department = relationship("Department")
    categories = relationship("FormCategory", back_populates="form", cascade="all, delete-orphan")
    fields = relationship("FormField", back_populates="form", cascade="all, delete-orphan")
    versions = relationship("FormVersion", back_populates="form", cascade="all, delete-orphan")
    publication_status = relationship("FormPublicationStatus", back_populates="form", cascade="all, delete-orphan")

class FormCategory(Base):
    __tablename__ = 'form_categories'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    form_id = Column(BigInteger, ForeignKey('request_forms.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    sort_order = Column(Integer, default=0)

    form = relationship("RequestForm", back_populates="categories")
    fields = relationship("FormField", back_populates="category")

class FormField(Base):
    __tablename__ = 'form_fields'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    form_id = Column(BigInteger, ForeignKey('request_forms.id', ondelete='CASCADE'), nullable=False)
    category_id = Column(BigInteger, ForeignKey('form_categories.id', ondelete='SET NULL'))
    field_name = Column(String(100), nullable=False)
    field_type = Column(Enum(FieldTypeEnum), nullable=False)
    is_required = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    placeholder = Column(Text)
    help_text = Column(Text)
    default_value = Column(Text)

    form = relationship("RequestForm", back_populates="fields")
    category = relationship("FormCategory", back_populates="fields")
    options = relationship("FormFieldOption", back_populates="field", cascade="all, delete-orphan")
    validations = relationship("FormFieldValidation", back_populates="field", cascade="all, delete-orphan")
    dependencies_as_parent = relationship("FormFieldDependency", foreign_keys='FormFieldDependency.field_id', back_populates="field", cascade="all, delete-orphan")
    dependencies_as_dependent = relationship("FormFieldDependency", foreign_keys='FormFieldDependency.dependent_field_id', back_populates="dependent_field", cascade="all, delete-orphan")

class FormFieldOption(Base):
    __tablename__ = 'form_field_options'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    field_id = Column(BigInteger, ForeignKey('form_fields.id', ondelete='CASCADE'), nullable=False)
    option_label = Column(String(255), nullable=False)
    option_value = Column(String(255), nullable=False)
    sort_order = Column(Integer, default=0)

    field = relationship("FormField", back_populates="options")

class FormFieldValidation(Base):
    __tablename__ = 'form_field_validations'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    field_id = Column(BigInteger, ForeignKey('form_fields.id', ondelete='CASCADE'), nullable=False)
    validation_type = Column(Enum(ValidationTypeEnum), nullable=False)
    validation_value = Column(Text)
    error_message = Column(Text)

    field = relationship("FormField", back_populates="validations")

class FormFieldDependency(Base):
    __tablename__ = 'form_field_dependencies'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    field_id = Column(BigInteger, ForeignKey('form_fields.id', ondelete='CASCADE'), nullable=False)
    dependent_field_id = Column(BigInteger, ForeignKey('form_fields.id', ondelete='CASCADE'), nullable=False)
    condition_type = Column(Enum(ConditionTypeEnum), nullable=False)
    condition_value = Column(Text)
    action = Column(Enum(ActionEnum), default=ActionEnum.show)

    field = relationship("FormField", foreign_keys=[field_id], back_populates="dependencies_as_parent")
    dependent_field = relationship("FormField", foreign_keys=[dependent_field_id], back_populates="dependencies_as_dependent")

class FormVersion(Base):
    __tablename__ = 'form_versions'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    form_id = Column(BigInteger, ForeignKey('request_forms.id', ondelete='CASCADE'), nullable=False)
    version_number = Column(Integer, nullable=False)
    data = Column(JSON)
    created_by = Column(BigInteger)
    created_at = Column(TIMESTAMP, server_default=func.now())

    form = relationship("RequestForm", back_populates="versions")

class FormPublicationStatus(Base):
    __tablename__ = 'form_publication_status'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    form_id = Column(BigInteger, ForeignKey('request_forms.id', ondelete='CASCADE'), nullable=False)
    status = Column(Enum(FormStatusEnum), default=FormStatusEnum.draft)
    published_at = Column(TIMESTAMP)
    published_by = Column(BigInteger)

    form = relationship("RequestForm", back_populates="publication_status")

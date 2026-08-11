from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, BigInteger, JSON, Enum, Numeric, Date, TIMESTAMP, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class SubscriptionTierEnum(str, enum.Enum):
    free = 'free'
    pro = 'pro'
    enterprise = 'enterprise'

class SubscriptionStatusEnum(str, enum.Enum):
    active = 'active'
    expired = 'expired'
    cancelled = 'cancelled'

class PendingRegistration(Base):
    __tablename__ = 'pending_registrations'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    org_name = Column(String(255), nullable=False)
    otp_code = Column(String(10), nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Organization(Base):
    __tablename__ = 'organizations'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    subdomain = Column(String(100), unique=True, nullable=False)
    logo_url = Column(String(500))
    branding_color = Column(String(20))
    timezone = Column(String(50), default='UTC')
    subscription_tier = Column(Enum(SubscriptionTierEnum), default=SubscriptionTierEnum.free)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    settings = relationship("OrganizationSetting", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    departments = relationship("Department", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="organization", cascade="all, delete-orphan")

class OrganizationSetting(Base):
    __tablename__ = 'organization_settings'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    enable_ai = Column(Boolean, default=False)
    enable_esign = Column(Boolean, default=False)
    enable_client_portal = Column(Boolean, default=False)
    enable_audit_logs = Column(Boolean, default=True)
    max_users = Column(Integer, default=10)
    max_contracts = Column(Integer, default=100)
    retention_days = Column(Integer, default=365)

    organization = relationship("Organization", back_populates="settings")

class SubscriptionPlan(Base):
    __tablename__ = 'subscription_plans'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    monthly_price = Column(Numeric(10, 2))
    yearly_price = Column(Numeric(10, 2))
    max_users = Column(Integer)
    max_contracts = Column(Integer)
    features = Column(JSON)

class SubscriptionHistory(Base):
    __tablename__ = 'subscription_history'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    plan_id = Column(BigInteger, ForeignKey('subscription_plans.id'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    status = Column(Enum(SubscriptionStatusEnum), default=SubscriptionStatusEnum.active)
    amount_paid = Column(Numeric(10, 2))

    organization = relationship("Organization")
    plan = relationship("SubscriptionPlan")

class Department(Base):
    __tablename__ = 'departments'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)

    organization = relationship("Organization", back_populates="departments")
    users = relationship("User", back_populates="department")

class UserRole(Base):
    __tablename__ = 'user_roles'

    user_id = Column(BigInteger, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    role_id = Column(BigInteger, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True)
    assigned_at = Column(TIMESTAMP, server_default=func.now())
    assigned_by = Column(BigInteger)

class User(Base):
    __tablename__ = 'users'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    department_id = Column(BigInteger, ForeignKey('departments.id', ondelete='SET NULL'))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    profile_pic_url = Column(String(500))
    last_login = Column(TIMESTAMP)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization", back_populates="users")
    department = relationship("Department", back_populates="users")
    roles = relationship("Role", secondary='user_roles', back_populates="users")

class Role(Base):
    __tablename__ = 'roles'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    org_id = Column(BigInteger, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_system_role = Column(Boolean, default=False)

    organization = relationship("Organization", back_populates="roles")
    permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")
    users = relationship("User", secondary='user_roles', back_populates="roles")

class RolePermission(Base):
    __tablename__ = 'role_permissions'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    role_id = Column(BigInteger, ForeignKey('roles.id', ondelete='CASCADE'), nullable=False)
    module_name = Column(String(100))
    can_create = Column(Boolean, default=False)
    can_read = Column(Boolean, default=False)
    can_update = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)
    can_approve = Column(Boolean, default=False)
    can_assign = Column(Boolean, default=False)

    role = relationship("Role", back_populates="permissions")

class UserLoginHistory(Base):
    __tablename__ = 'user_login_history'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    login_time = Column(TIMESTAMP, server_default=func.now())
    success = Column(Boolean, default=True)

    user = relationship("User")

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Integer, JSON, Enum, Numeric, Date, TIMESTAMP, Text, Table
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
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    org_name = Column(String(255), nullable=False)
    otp_code = Column(String(10), nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Organization(Base):
    __tablename__ = 'organizations'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    subdomain = Column(String(100), unique=True, nullable=False)
    logo_url = Column(String(500))
    branding_color = Column(String(20))
    timezone = Column(String(50), default='UTC')
    subscription_tier = Column(Enum(SubscriptionTierEnum), default=SubscriptionTierEnum.free)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    settings = relationship("app.core.models.OrganizationSetting", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    departments = relationship("app.core.models.Department", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("app.core.models.User", back_populates="organization", cascade="all, delete-orphan")
    roles = relationship("app.core.models.Role", back_populates="organization", cascade="all, delete-orphan")

class OrganizationSetting(Base):
    __tablename__ = 'organization_settings'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    org_id = Column(Integer, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    enable_ai = Column(Boolean, default=False)
    enable_esign = Column(Boolean, default=False)
    enable_client_portal = Column(Boolean, default=False)
    enable_audit_logs = Column(Boolean, default=True)
    max_users = Column(Integer, default=10)
    max_contracts = Column(Integer, default=100)
    retention_days = Column(Integer, default=365)

    organization = relationship("app.core.models.Organization", back_populates="settings")

class SubscriptionPlan(Base):
    __tablename__ = 'subscription_plans'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    monthly_price = Column(Numeric(10, 2))
    yearly_price = Column(Numeric(10, 2))
    max_users = Column(Integer)
    max_contracts = Column(Integer)
    features = Column(JSON)

class SubscriptionHistory(Base):
    __tablename__ = 'subscription_history'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    org_id = Column(Integer, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    plan_id = Column(Integer, ForeignKey('subscription_plans.id'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    status = Column(Enum(SubscriptionStatusEnum), default=SubscriptionStatusEnum.active)
    amount_paid = Column(Numeric(10, 2))

    organization = relationship("app.core.models.Organization")
    plan = relationship("app.core.models.SubscriptionPlan")

class Department(Base):
    __tablename__ = 'departments'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    org_id = Column(Integer, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)

    organization = relationship("app.core.models.Organization", back_populates="departments")
    users = relationship("app.core.models.User", back_populates="department", foreign_keys=lambda: User.department_id)

class UserRole(Base):
    __tablename__ = 'user_roles'
    __table_args__ = {'extend_existing': True}

    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    role_id = Column(Integer, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True)
    assigned_at = Column(TIMESTAMP, server_default=func.now())
    assigned_by = Column(Integer)

class User(Base):
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    org_id = Column(Integer, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    department_id = Column(Integer, ForeignKey('departments.id', ondelete='SET NULL'))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    profile_pic_url = Column(String(500))
    last_login = Column(TIMESTAMP)
    is_active = Column(Boolean, default=True)
    reset_token = Column(String(255), nullable=True, unique=True)
    reset_token_expires = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    organization = relationship("app.core.models.Organization", back_populates="users")
    department = relationship("app.core.models.Department", back_populates="users")
    roles = relationship("app.core.models.Role", secondary='user_roles', back_populates="users")

    @property
    def role(self):
        return self.roles[0].name if self.roles else "Requester"

    @property
    def role_id(self):
        return self.roles[0].id if self.roles else None

    @property
    def name(self):
        return self.full_name


    submitted_requests = relationship("app.models.request.ContractRequest", foreign_keys="[app.models.request.ContractRequest.requester_id]", back_populates="requester")
    assigned_requests = relationship("app.models.request.ContractRequest", foreign_keys="[app.models.request.ContractRequest.assigned_to_id]", back_populates="assigned_to")
    login_history = relationship("app.models.user.LoginHistory", back_populates="user", cascade="all, delete-orphan")

class Role(Base):
    __tablename__ = 'roles'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    org_id = Column(Integer, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_system_role = Column(Boolean, default=False)

    organization = relationship("app.core.models.Organization", back_populates="roles")
    permissions_json = Column(JSON, nullable=True)
    permissions = relationship("app.core.models.RolePermission", back_populates="role", cascade="all, delete-orphan")
    users = relationship("app.core.models.User", secondary='user_roles', back_populates="roles")

class RolePermission(Base):
    __tablename__ = 'role_permissions'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey('roles.id', ondelete='CASCADE'), nullable=False)
    module_name = Column(String(100))
    can_create = Column(Boolean, default=False)
    can_read = Column(Boolean, default=False)
    can_update = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)
    can_approve = Column(Boolean, default=False)
    can_assign = Column(Boolean, default=False)

    role = relationship("app.core.models.Role", back_populates="permissions")

class UserLoginHistory(Base):
    __tablename__ = 'user_login_history'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    login_time = Column(TIMESTAMP, server_default=func.now())
    success = Column(Boolean, default=True)

    user = relationship("app.core.models.User")

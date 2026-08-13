from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Table, Float, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(255))
    
    # Advanced Workflow Features
    department_head_id = Column(Integer, ForeignKey("users.id", use_alter=True, name="fk_department_head"), nullable=True)
    budget_allocated = Column(Float, default=0.0)
    sla_configuration = Column(JSON, nullable=True)
    approval_chain = Column(JSON, nullable=True)
    escalation_rules = Column(JSON, nullable=True)
    
    users = relationship("User", back_populates="department", foreign_keys="User.department_id")

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255))
    permissions = Column(JSON, nullable=True) # Role-Based Access Control matrix
    
    
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    profile_picture_url = Column(String(255), nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    role_id = Column(Integer, ForeignKey("roles.id"))
    role = relationship("Role", back_populates="users")
    
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    department = relationship("Department", back_populates="users", foreign_keys=[department_id])
    
    # contracts = relationship("Contract", back_populates="owner")
    submitted_requests = relationship("ContractRequest", foreign_keys="ContractRequest.requester_id", back_populates="requester")
    assigned_requests = relationship("ContractRequest", foreign_keys="ContractRequest.assigned_to_id", back_populates="assigned_to")
    login_history = relationship("LoginHistory", back_populates="user", cascade="all, delete-orphan")

class LoginHistory(Base):
    __tablename__ = "login_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    login_time = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), nullable=False) # Success, Failed
    
    user = relationship("User", back_populates="login_history")

class ContractManager(Base):
    __tablename__ = "contract_managers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    workload = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)

class DepartmentLead(Base):
    __tablename__ = "department_leads"

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String(255), nullable=False)
    lead_name = Column(String(255), nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    time_ago = Column(String(100), nullable=True)
    related_request_id = Column(String(50), nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


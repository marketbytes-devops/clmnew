from app.core.models import User, Role, Department, Organization
from sqlalchemy import Column, Integer, Integer, String, Boolean, ForeignKey, DateTime, Table, Float, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class LoginHistory(Base):
    __tablename__ = "login_history"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    login_time = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), nullable=False) # Success, Failed
    
    user = relationship("app.core.models.User", back_populates="login_history")

class ContractManager(Base):
    __tablename__ = "contract_managers"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    workload = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)

class DepartmentLead(Base):
    __tablename__ = "department_leads"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String(255), nullable=False)
    lead_name = Column(String(255), nullable=False)

class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    time_ago = Column(String(100), nullable=True)
    related_request_id = Column(String(50), nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


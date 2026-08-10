from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean
from datetime import datetime
from app.database import Base

class AIPrompt(Base):
    __tablename__ = "ai_prompts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False, unique=True)
    description = Column(String(255), nullable=True)
    prompt_template = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AIConfiguration(Base):
    __tablename__ = "ai_configurations"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False, default="openai") # openai, gemini, anthropic
    model_name = Column(String(100), nullable=False)
    api_key_env_var = Column(String(100), nullable=True)
    temperature = Column(String(10), nullable=True, default="0.7")
    max_tokens = Column(Integer, nullable=True, default=2000)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AIUsageLog(Base):
    __tablename__ = "ai_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True) # Could be a foreign key to users if we track it
    feature = Column(String(100), nullable=False) # e.g., "chat", "contract_generation"
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

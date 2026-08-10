from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Prompt Schemas
class AIPromptBase(BaseModel):
    name: str
    description: Optional[str] = None
    prompt_template: str
    is_active: bool = True

class AIPromptCreate(AIPromptBase):
    pass

class AIPromptResponse(AIPromptBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Config Schemas
class AIConfigurationBase(BaseModel):
    provider: str
    model_name: str
    api_key_env_var: Optional[str] = None
    temperature: Optional[str] = "0.7"
    max_tokens: Optional[int] = 2000
    is_active: bool = True

class AIConfigurationCreate(AIConfigurationBase):
    pass

class AIConfigurationResponse(AIConfigurationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Usage Schemas
class AIUsageLogBase(BaseModel):
    user_id: Optional[int] = None
    feature: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

class AIUsageLogCreate(AIUsageLogBase):
    pass

class AIUsageLogResponse(AIUsageLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Chat Request/Response
class AIChatMessage(BaseModel):
    role: str # user, assistant, system
    content: str

class AIChatRequest(BaseModel):
    messages: List[AIChatMessage]
    context: Optional[Dict[str, Any]] = None

class AIChatResponse(BaseModel):
    reply: str
    usage: Optional[AIUsageLogBase] = None

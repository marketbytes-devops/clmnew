import os
from sqlalchemy.orm import Session
from app.models.ai import AIConfiguration, AIUsageLog
from app.schemas.ai import AIChatRequest, AIChatMessage

class AIService:
    def __init__(self, db: Session):
        self.db = db
        # We will dynamically load the configuration in actual calls
    
    def _get_active_config(self) -> AIConfiguration:
        config = self.db.query(AIConfiguration).filter(AIConfiguration.is_active == True).first()
        if not config:
            raise Exception("No active AI Configuration found.")
        return config

    def _call_mock_llm(self, messages: list[AIChatMessage]) -> str:
        # Mock LLM response for now until a provider is selected
        return "This is a mocked response from the AI. Once configured with a real LLM, you'll see actual completions here."

    def chat(self, request: AIChatRequest, user_id: int = None) -> str:
        # 1. Load config
        try:
            config = self._get_active_config()
        except Exception as e:
            return str(e)
            
        # 2. Call the LLM provider (mocking for now)
        response_text = self._call_mock_llm(request.messages)
        
        # 3. Log usage
        usage = AIUsageLog(
            user_id=user_id,
            feature="chat",
            prompt_tokens=10, # Mock token count
            completion_tokens=20,
            total_tokens=30
        )
        self.db.add(usage)
        self.db.commit()
        
        return response_text

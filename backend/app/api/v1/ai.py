from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from app.database import get_db
from app.schemas.ai import (
    AIChatRequest, AIChatResponse, AIUsageLogBase,
    AIConfigurationCreate, AIConfigurationResponse,
    AIPromptCreate, AIPromptResponse
)
from app.models.ai import AIConfiguration, AIPrompt
from app.services.ai_service import AIService

router = APIRouter()

@router.post("/chat", response_model=AIChatResponse)
def ai_chat(request: AIChatRequest, db: Session = Depends(get_db)):
    """
    Endpoint for AI Chat Assistant
    """
    ai_service = AIService(db)
    try:
        reply = ai_service.chat(request)
        return AIChatResponse(
            reply=reply,
            usage=AIUsageLogBase(feature="chat", prompt_tokens=10, completion_tokens=20, total_tokens=30)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/config", response_model=List[AIConfigurationResponse])
def get_ai_configs(db: Session = Depends(get_db)):
    configs = db.query(AIConfiguration).all()
    return configs

@router.post("/config", response_model=AIConfigurationResponse)
def create_ai_config(config: AIConfigurationCreate, db: Session = Depends(get_db)):
    db_config = AIConfiguration(**config.dict())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

@router.get("/prompts", response_model=List[AIPromptResponse])
def get_prompts(db: Session = Depends(get_db)):
    prompts = db.query(AIPrompt).all()
    return prompts

@router.post("/prompts", response_model=AIPromptResponse)
def create_prompt(prompt: AIPromptCreate, db: Session = Depends(get_db)):
    db_prompt = AIPrompt(**prompt.dict())
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

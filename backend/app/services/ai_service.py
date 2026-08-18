import os
import io
import json
import pypdf
try:
    from google import genai
except ImportError:
    try:
        import google.generativeai as genai
    except ImportError:
        genai = None
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.models.ai import AIConfiguration, AIUsageLog
from app.schemas.ai import AIChatRequest, AIChatMessage

class AIService:
    def __init__(self, db: Session):
        self.db = db

    def _get_active_config(self) -> AIConfiguration:
        config = self.db.query(AIConfiguration).filter(AIConfiguration.is_active == True).first()
        return config

    def _get_api_key(self) -> str:
        # 1. Check environment variable first
        api_key = os.environ.get("GEMINI_API_KEY")
        
        # 2. If not in env, check database configuration
        config = self._get_active_config()
        if config and config.api_key_env_var:
            db_key = os.environ.get(config.api_key_env_var)
            if db_key:
                api_key = db_key
                
        return api_key

    def _call_mock_llm(self, messages: list[AIChatMessage]) -> str:
        return "This is a mocked response from the AI. Once configured with a real LLM, you'll see actual completions here."

    def chat(self, request: AIChatRequest, user_id: int = None) -> str:
        config = self._get_active_config()
        api_key = self._get_api_key()
        
        if not api_key:
            return "Error: Gemini API Key is not set in environment or database configuration."
            
        try:
            client = genai.Client(api_key=api_key)
            model_name = config.model_name if config else "gemini-1.5-flash"
            
            # Convert messages to Gemini format
            prompt = ""
            for msg in request.messages:
                prompt += f"{msg.role}: {msg.content}\n"
            prompt += "assistant: "
            
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            reply = response.text.strip()
            
            # Log usage
            usage = AIUsageLog(
                user_id=user_id,
                feature="chat",
                prompt_tokens=len(prompt) // 4,
                completion_tokens=len(reply) // 4,
                total_tokens=(len(prompt) + len(reply)) // 4
            )
            self.db.add(usage)
            self.db.commit()
            return reply
        except Exception as e:
            return f"Error calling Gemini: {str(e)}"

    def _extract_text_from_pdf(self, content_bytes: bytes) -> str:
        try:
            pdf_file = io.BytesIO(content_bytes)
            reader = pypdf.PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
        except Exception as e:
            print(f"Error reading PDF with pypdf: {e}")
            return ""

    async def parse_document(self, file: UploadFile) -> dict:
        """
        Reads the uploaded file (PDF, TXT, etc.) and uses Gemini structured JSON response
        to extract key metadata fields, deliverables, and dependencies.
        """
        content_bytes = await file.read()
        filename = file.filename.lower()
        
        # 1. Extract text from the file
        if filename.endswith(".pdf"):
            text_content = self._extract_text_from_pdf(content_bytes)
        else:
            text_content = content_bytes.decode("utf-8", errors="ignore")
            
        if not text_content or len(text_content.strip()) < 10:
            # If extraction failed or file is too small, use a default fallback content
            text_content = f"Objective: Parse new document: {file.filename}\nNo text extracted."

        # 2. Get API key and model config
        api_key = self._get_api_key()
        if not api_key:
            raise Exception("Gemini API key is not configured.")

        # 3. Prompt Gemini in JSON Mode
        prompt = f"""
        Analyze the following contract draft, RFP, statement of work (SOW), or client request, and extract metadata fields.
        You MUST return a JSON object with the exact keys:
        - "clientName": string, name of the client/customer (e.g. "Acme Corp")
        - "contractCategory": string, must be one of: "Revenue / Sales", "Procurement / Expenses", "Partnership / Non-Commercial", "Employment", "Real Estate / Facilities", "Intellectual Property", "Corporate / Governance", "Non-Disclosure (NDA)"
        - "contractType": string, the type of contract (e.g. "Statement of Work (SOW)", "Master Services Agreement (MSA)", "Non-Disclosure Agreement (NDA)", "Consulting & Contractor Agreement")
        - "scopeSummary": string, a concise summary of the project scope or business objective (around 2-3 sentences max)
        - "deliverables": array of objects, where each object represents a deliverable milestone with keys:
            - "name": string, title of the deliverable milestone (e.g. "UI/UX Design Prototypes", "API Integration", "Security Compliance Audit")
            - "description": string, brief details of what is included
            - "timeline": string, e.g. "Week 2", "Week 5", or a specific date in YYYY-MM-DD format if mentioned in the document
        - "suggestedDependencies": array of strings, chosen from: ["UI/UX Design", "Frontend Engineering", "Backend & APIs", "DevOps & Infrastructure", "Legal & Compliance Review", "Finance & Tax Review"]
        - "customClientTerms": string, specify any non-standard special terms, strict timelines, or payment schedules found in the text.
        
        If a field is not found or cannot be inferred, return an empty string or empty array for that field. Do not make up information, but infer logically from context.
        
        Document text:
        \"\"\"{text_content}\"\"\"
        """
        
        try:
            client = genai.Client(api_key=api_key)
            config = self._get_active_config()
            model_name = config.model_name if config else "gemini-1.5-flash"
            
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config={'response_mime_type': 'application/json'}
            )
            result = json.loads(response.text.strip())
            
            # Log usage
            usage = AIUsageLog(
                feature="parse_document",
                prompt_tokens=len(prompt) // 4,
                completion_tokens=len(response.text) // 4,
                total_tokens=(len(prompt) + len(response.text)) // 4
            )
            self.db.add(usage)
            self.db.commit()
            
            return result
        except Exception as e:
            print(f"Error calling Gemini in parse_document: {e}")
            # Robust fallback so frontend still receives something
            return {
                "clientName": "Acme Corp (Fallback)",
                "contractCategory": "Revenue / Sales",
                "contractType": "Statement of Work (SOW)",
                "scopeSummary": f"Auto-scanned file: {file.filename}. Error occurred during AI parsing: {str(e)}",
                "deliverables": [
                    { "name": "Initial Baseline Analysis", "description": "Review project parameters", "timeline": "Week 1" }
                ],
                "suggestedDependencies": ["UI/UX Design", "Backend & APIs"],
                "customClientTerms": "None parsed due to backend error."
            }

    def get_copilot_suggestions(self, request) -> dict:
        """
        Generates contextual recommendations and baseline estimates based on current form parameters.
        Returns a JSON object with:
        - "historicalMemory": HTML string summarizing similar contracts (e.g. past engineering hours)
        - "recommendedAction": String suggestion for sales rep
        - "deliverables": Array of recommended deliverables
        - "suggestedDependencies": Array of department names
        """
        api_key = self._get_api_key()
        if not api_key:
            # Fallback mock data when API key is missing
            return {
                "historicalMemory": "For similar E-Commerce agreements completed in 2025–2026 (e.g., <i>Project YoKoBaine Phase 1</i>), average UI design estimation was <b>45 hours</b> and Backend integration averaged <b>110 hours</b>.",
                "recommendedAction": "Click below to apply baseline deliverables and pre-select UI/UX and Engineering dependency teams.",
                "deliverables": [
                    { "name": "UI/UX Design Prototypes", "description": "Complete Figma visual identity and style guide", "timeline": "Week 2" },
                    { "name": "Full Stack Integration", "description": "Next.js application with cloud API backend", "timeline": "Week 5" }
                ],
                "suggestedDependencies": ["UI/UX Design", "Backend & APIs"]
            }

        prompt = f"""
        You are an AI contract lifecycle copilot. A sales rep is filling out a new contract request form in a wizard.
        Based on the current inputs, generate smart recommendations, baseline deliverables, and dependencies.
        
        Form Inputs:
        - Client Name: {request.client_name}
        - Contract Category: {request.contract_category}
        - Contract Type: {request.contract_type}
        - Estimated Deal Value: {request.estimated_value} USD
        - Scope Summary: {request.scope_summary}
        
        Analyze this request against typical scopes and timelines.
        You MUST return a JSON object with the exact keys:
        - "historicalMemory": string (formatted in HTML with <b> and <i> tags). It must summarize average engineering hours, design hours, or past successful timeline parameters for similar contracts (e.g., "For similar E-Commerce agreements completed in 2025-2026, average UI design estimation was <b>45 hours</b> and Backend integration averaged <b>110 hours</b>.").
        - "recommendedAction": string, suggesting the next best action in the wizard (e.g. "Click below to pre-select UI/UX and Engineering dependency teams for active SLA tracking.").
        - "deliverables": array of objects, containing 2-4 recommended baseline deliverables with keys:
            - "name": string, name of the deliverable milestone (e.g. "UI/UX Wireframing")
            - "description": string, what it includes
            - "timeline": string, e.g. "Week 2", "Week 6"
        - "suggestedDependencies": array of strings, chosen from: ["UI/UX Design", "Frontend Engineering", "Backend & APIs", "DevOps & Infrastructure", "Legal & Compliance Review", "Finance & Tax Review"]
        """
        
        try:
            client = genai.Client(api_key=api_key)
            config = self._get_active_config()
            model_name = config.model_name if config else "gemini-1.5-flash"
            
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config={'response_mime_type': 'application/json'}
            )
            result = json.loads(response.text.strip())
            
            # Log usage
            usage = AIUsageLog(
                feature="copilot_suggestions",
                prompt_tokens=len(prompt) // 4,
                completion_tokens=len(response.text) // 4,
                total_tokens=(len(prompt) + len(response.text)) // 4
            )
            self.db.add(usage)
            self.db.commit()
            
            return result
        except Exception as e:
            print(f"Error calling Gemini in get_copilot_suggestions: {e}")
            return {
                "historicalMemory": f"Error loading AI suggestions: {str(e)}",
                "recommendedAction": "Click below to apply baseline deliverables.",
                "deliverables": [
                    { "name": "UI/UX Design Prototypes", "description": "Figma layout design", "timeline": "Week 2" }
                ],
                "suggestedDependencies": ["UI/UX Design"]
            }

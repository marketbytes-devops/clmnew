from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.contract import Contract, ContractVersion, ContractAttachment, ContractTimeline
import time

class RepositoryService:
    def __init__(self, db: Session):
        self.db = db

    def search_contracts(self, query: str, include_archived: bool = False):
        """Mock AI Semantic Search for contracts."""
        db_query = self.db.query(Contract).filter(Contract.status == "Executed")
        
        if not include_archived:
            # We use a tag to denote archived for now, or just assume it's in the status
            db_query = db_query.filter(Contract.tags.op('NOT LIKE')('%"Archived"%') if self.db.bind.dialect.name == 'sqlite' else Contract.tags != 'Archived')

        if query:
            # Basic text search for now
            db_query = db_query.filter(or_(
                Contract.title.ilike(f"%{query}%"),
                Contract.ai_summary.ilike(f"%{query}%")
            ))
            
        contracts = db_query.all()
        
        # If no results and it's a semantic query, we can mock a response.
        # In a real app, this would use embeddings (e.g. OpenAI ada-002) and vector DB.
        if not contracts and query.lower() in ["vendor", "supplier", "nda", "risk"]:
            return [] # In a real implementation we might return semantic matches even if no exact text match
            
        return contracts

    def process_ocr(self, file_content: bytes, filename: str) -> str:
        """Mock OCR processing on a document."""
        # Simulating time taken for OCR
        time.sleep(1.5)
        
        # Mocking OCR output based on file name or generic
        return f"""
        [OCR Extracted Text - CONFIDENCE: 98%]
        Document: {filename}
        
        This agreement is entered into on this day between the parties.
        The supplier agrees to provide the services as outlined in Exhibit A.
        Confidentiality obligations shall survive the termination of this agreement for a period of 5 years.
        
        Jurisdiction: State of Delaware
        Governing Law: United States
        """

    def toggle_archive(self, contract_id: int) -> Contract:
        contract = self.db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            return None
            
        # We'll use a tag to denote archived state, since status might need to stay 'Executed'
        tags = contract.tags or []
        if type(tags) is list:
            if "Archived" in tags:
                tags.remove("Archived")
                action = "Restored"
            else:
                tags.append("Archived")
                action = "Archived"
        else:
            tags = ["Archived"]
            action = "Archived"
            
        contract.tags = tags
        
        # Add to audit trail
        timeline = ContractTimeline(
            contract_id=contract_id,
            event_type=action,
            description=f"Contract was {action.lower()} in the repository."
        )
        self.db.add(timeline)
        self.db.commit()
        self.db.refresh(contract)
        
        return contract

    def get_audit_trail(self, contract_id: int):
        return self.db.query(ContractTimeline).filter(ContractTimeline.contract_id == contract_id).order_by(ContractTimeline.created_at.desc()).all()

    def get_versions(self, contract_id: int):
        return self.db.query(ContractVersion).filter(ContractVersion.contract_id == contract_id).order_by(ContractVersion.created_at.desc()).all()

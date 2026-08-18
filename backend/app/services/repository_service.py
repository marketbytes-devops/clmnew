from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.contract import Contract, ContractVersion, ContractAttachment, ContractTimeline
import time

class RepositoryService:
    def __init__(self, db: Session):
        self.db = db

    def search_contracts(self, query: str = None, include_archived: bool = False):
        """AI Semantic Search & listing for executed contracts."""
        db_query = self.db.query(Contract)
        
        if query:
            db_query = db_query.filter(or_(
                Contract.title.ilike(f"%{query}%"),
                Contract.ai_summary.ilike(f"%{query}%")
            ))
            
        contracts = db_query.all()
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

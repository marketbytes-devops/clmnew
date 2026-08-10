from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.contract import Contract
from app.schemas.contract import ContractOut
from app.services.repository_service import RepositoryService
from app.core.dependencies import RoleChecker

router = APIRouter()

# Allow admins or those with specific repository access
# For now, we'll use a broad check, but later this will link to the new permissions matrix
allow_repo_access = RoleChecker(["Admin", "Legal", "Contract_Manager"])

@router.get("/search", response_model=List[ContractOut])
def search_repository(
    query: Optional[str] = None,
    include_archived: bool = False,
    db: Session = Depends(get_db)
    # dependencies=[Depends(allow_repo_access)]
):
    """Semantic search over executed contracts in the repository."""
    service = RepositoryService(db)
    return service.search_contracts(query, include_archived)

@router.post("/upload-ocr")
def upload_for_ocr(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a scanned contract and extract text using OCR."""
    service = RepositoryService(db)
    content = file.file.read()
    extracted_text = service.process_ocr(content, file.filename)
    return {"filename": file.filename, "extracted_text": extracted_text}

@router.post("/{contract_id}/archive", response_model=ContractOut)
def toggle_archive_contract(contract_id: int, db: Session = Depends(get_db)):
    """Archive or restore an executed contract."""
    service = RepositoryService(db)
    contract = service.toggle_archive(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

@router.get("/{contract_id}/audit")
def get_contract_audit(contract_id: int, db: Session = Depends(get_db)):
    """Get the full audit trail/timeline for a specific contract."""
    service = RepositoryService(db)
    audit = service.get_audit_trail(contract_id)
    return audit

@router.get("/{contract_id}/versions")
def get_contract_versions(contract_id: int, db: Session = Depends(get_db)):
    """Get all versions of a specific contract."""
    service = RepositoryService(db)
    versions = service.get_versions(contract_id)
    return versions

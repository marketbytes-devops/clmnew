from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.contract import Contract, ContractVersion, ContractAttachment, ContractTimeline
from app.schemas.contract import ContractCreate, ContractUpdate, ContractOut, ContractDetailOut
from app.core.dependencies import RoleChecker

router = APIRouter()

# Temporarily disabling auth for dev testing
allow_admin = RoleChecker(["Admin", "Contract_Manager"])

@router.get("/", response_model=List[ContractOut])
def list_contracts(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    owner_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Contract)
    
    # Advanced Filters
    if search:
        query = query.filter(or_(
            Contract.title.ilike(f"%{search}%"),
            Contract.tags.cast(str).ilike(f"%{search}%")
        ))
    if status:
        query = query.filter(Contract.status == status)
    if owner_id:
        query = query.filter(Contract.owner_id == owner_id)
        
    contracts = query.order_by(Contract.id.desc()).offset(skip).limit(limit).all()
    return contracts

@router.get("/{contract_id}", response_model=ContractDetailOut, dependencies=[Depends(allow_admin)])
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

@router.post("/", response_model=ContractOut)
def create_contract(contract: ContractCreate, db: Session = Depends(get_db)):
    db_contract = Contract(**contract.model_dump())
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    
    # Add timeline event
    timeline_event = ContractTimeline(
        contract_id=db_contract.id,
        event_type="Created",
        description=f"Contract '{db_contract.title}' created."
    )
    db.add(timeline_event)
    db.commit()
    
    return db_contract

@router.put("/{contract_id}", response_model=ContractOut)
def update_contract(contract_id: int, contract_update: ContractUpdate, db: Session = Depends(get_db)):
    db_contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not db_contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    update_data = contract_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_contract, key, value)
        
    db.commit()
    db.refresh(db_contract)
    return db_contract

@router.post("/bulk", dependencies=[Depends(allow_admin)])
def bulk_actions(action: str, contract_ids: List[int], db: Session = Depends(get_db)):
    if action == "delete":
        db.query(Contract).filter(Contract.id.in_(contract_ids)).delete(synchronize_session=False)
        db.commit()
        return {"message": f"Deleted {len(contract_ids)} contracts"}
    else:
        raise HTTPException(status_code=400, detail="Unsupported bulk action")

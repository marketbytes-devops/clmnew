import random
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy import or_

from app.database import get_db
from app.models.contract import Contract, ContractTimeline
from app.models.request import ContractRequest, RequestAttachment, RequestComment, RequestTimeline, RequestDependency
from app.schemas.request import (
    ContractRequestCreate, ContractRequestUpdate, ContractRequestOut, 
    ContractRequestDetailOut, RequestCommentCreate, RequestCommentOut,
    RequestAttachmentCreate, RequestAttachmentOut, RequestDependencySubmit,
    RequestProceedToDrafting, RequestApprovePayload, RequestRejectionRollbackPayload,
    RequestInlineCommentPayload
)

router = APIRouter()

# Temporary mock for currently logged-in user
def get_current_user_mock():
    return 1 # Admin User

@router.get("/", response_model=List[ContractRequestOut])
def list_requests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    contract_type: Optional[str] = None,
    requester_id: Optional[int] = None,
    assigned_to_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ContractRequest)

    if status and status != "All":
        query = query.filter(ContractRequest.status == status)
    if contract_type and contract_type != "All":
        query = query.filter(ContractRequest.contract_type == contract_type)
    if requester_id:
        query = query.filter(ContractRequest.requester_id == requester_id)
    if assigned_to_id:
        query = query.filter(ContractRequest.assigned_to_id == assigned_to_id)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                ContractRequest.title.ilike(search_fmt),
                ContractRequest.description.ilike(search_fmt),
                ContractRequest.tracking_id.ilike(search_fmt),
                ContractRequest.entity_name.ilike(search_fmt),
                ContractRequest.contract_type.ilike(search_fmt)
            )
        )
        
    return query.order_by(ContractRequest.id.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=ContractRequestOut)
def create_request(
    request_data: ContractRequestCreate, 
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_mock)
):
    req_dict = request_data.model_dump()
    dependencies_data = req_dict.pop("dependencies", [])

    # Determine status
    has_deps = bool(request_data.require_dependencies and dependencies_data)
    initial_status = "Dependency Gathering" if has_deps else "Submitted"

    # Generate Tracking ID
    rand_suffix = random.randint(1000, 9999)
    tracking_id = f"REQ-2026-{rand_suffix}"

    # Default approval sequence
    default_sequence = [
        {"step": 1, "role": "Operations", "name": "Alex Miller", "status": "Approved", "timestamp": "2026-08-06T14:30:00Z"},
        {"step": 2, "role": "Finance", "name": "Sarah Jenkins", "status": "Pending", "timestamp": None},
        {"step": 3, "role": "Legal", "name": "Elena Rostova", "status": "Queued", "timestamp": None},
        {"step": 4, "role": "Executive", "name": "David Chen", "status": "Queued", "timestamp": None}
    ]

    # Update req_dict to avoid duplicate argument errors in constructor
    req_dict.update({
        "tracking_id": tracking_id,
        "status": initial_status,
        "requester_id": current_user_id,
        "version_label": "v1.0",
        "approval_sequence": default_sequence,
        "inline_comments": []
    })

    db_request = ContractRequest(**req_dict)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    # Save dependencies
    if dependencies_data:
        for dep in dependencies_data:
            dep_obj = RequestDependency(
                request_id=db_request.id,
                department=dep.get("department", "General"),
                assignee_name=dep.get("assignee_name"),
                task_objective=dep.get("task_objective"),
                sla_deadline=dep.get("sla_deadline"),
                required_inputs=dep.get("required_inputs", []),
                status="Pending"
            )
            db.add(dep_obj)
        db.commit()
    
    # Add timeline event
    timeline_event = RequestTimeline(
        request_id=db_request.id,
        event_type="Created",
        description=f"Request submitted with tracking ID {tracking_id}."
    )
    db.add(timeline_event)

    if has_deps:
        dep_timeline = RequestTimeline(
            request_id=db_request.id,
            event_type="Dependency Gathering",
            description=f"{len(dependencies_data)} pre-drafting dependency tasks triggered for department leads."
        )
        db.add(dep_timeline)

    db.commit()
    return db_request

@router.get("/{request_id}", response_model=ContractRequestDetailOut)
def get_request(request_id: int, db: Session = Depends(get_db)):
    db_request = db.query(ContractRequest).filter(ContractRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    return db_request

@router.put("/{request_id}", response_model=ContractRequestOut)
def update_request(request_id: int, request_update: ContractRequestUpdate, db: Session = Depends(get_db)):
    db_request = db.query(ContractRequest).filter(ContractRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    update_data = request_update.model_dump(exclude_unset=True)
    
    # Track status change
    if "status" in update_data and update_data["status"] != db_request.status:
        timeline_event = RequestTimeline(
            request_id=db_request.id,
            event_type="Status Changed",
            description=f"Status changed from {db_request.status} to {update_data['status']}."
        )
        db.add(timeline_event)

    # Track assignment change
    if "assigned_to_id" in update_data and update_data["assigned_to_id"] != db_request.assigned_to_id:
        timeline_event = RequestTimeline(
            request_id=db_request.id,
            event_type="Assigned",
            description=f"Request reassigned."
        )
        db.add(timeline_event)
        
    for key, value in update_data.items():
        setattr(db_request, key, value)
        
    db.commit()
    db.refresh(db_request)
    return db_request

# --- Stage 4: Inline Commenting Endpoint ---
@router.post("/{request_id}/add-inline-comment")
def add_inline_comment(
    request_id: int,
    comment_payload: RequestInlineCommentPayload,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_mock)
):
    db_request = db.query(ContractRequest).filter(ContractRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")

    existing_comments = list(db_request.inline_comments or [])
    new_comment = {
        "id": len(existing_comments) + 1,
        "paragraph_ref": comment_payload.paragraph_ref,
        "comment_type": comment_payload.comment_type,
        "author": comment_payload.author or "Finance Reviewer (Sarah Jenkins)",
        "content": comment_payload.content,
        "timestamp": datetime.utcnow().isoformat()
    }
    existing_comments.append(new_comment)
    db_request.inline_comments = existing_comments
    flag_modified(db_request, "inline_comments")

    # Add timeline log
    timeline_event = RequestTimeline(
        request_id=db_request.id,
        event_type="Inline Redline Comment",
        description=f"Inline comment ({comment_payload.comment_type}) added by {comment_payload.author or 'Sarah Jenkins'} to {comment_payload.paragraph_ref}."
    )
    db.add(timeline_event)
    db.commit()

    return {"message": "Inline comment added successfully", "comment": new_comment}

# --- Stage 4: Rejection & Automated Rollback Endpoint ---
@router.post("/{request_id}/reject-rollback")
def reject_and_rollback(
    request_id: int,
    payload: RequestRejectionRollbackPayload,
    db: Session = Depends(get_db)
):
    db_request = db.query(ContractRequest).filter(ContractRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Increment version label (v1.0 -> v1.1)
    current_ver = db_request.version_label or "v1.0"
    try:
        ver_num = float(current_ver.replace("v", "")) + 0.1
        new_ver = f"v{ver_num:.1f}"
    except Exception:
        new_ver = "v1.1"

    db_request.version_label = new_ver
    db_request.status = "Re-Drafting (Internal Rejection)"

    # Record rejection log
    rejections = list(db_request.rejection_rollback_log or [])
    rejection_entry = {
        "id": len(rejections) + 1,
        "category": payload.rejection_category,
        "reason": payload.rejection_reason,
        "clause_ref": payload.clause_reference or "Section 4: Commercial Terms",
        "rejected_by": payload.rejected_by or "Finance Director (Sarah Jenkins)",
        "timestamp": datetime.utcnow().isoformat()
    }
    rejections.append(rejection_entry)
    db_request.rejection_rollback_log = rejections
    flag_modified(db_request, "rejection_rollback_log")

    # Update active step status to Rejected in the approval sequence
    sequence = list(db_request.approval_sequence or [])
    for item in sequence:
        if item.get("status") == "Pending":
            item["status"] = "Rejected"
            item["timestamp"] = datetime.utcnow().isoformat()
            if payload.rejected_by:
                item["name"] = payload.rejected_by
            break
    db_request.approval_sequence = sequence
    flag_modified(db_request, "approval_sequence")

    # Timeline event
    timeline_event = RequestTimeline(
        request_id=db_request.id,
        event_type="Rejection & Rollback",
        description=f"Rejected by {payload.rejected_by or 'Finance'}. Category: {payload.rejection_category}. Version incremented to {new_ver}. Status set to Re-Drafting."
    )
    db.add(timeline_event)
    db.commit()

    return {
        "message": "Rejection submitted and contract rolled back to Contract Manager",
        "new_version": new_ver,
        "status": db_request.status
    }

# --- Stage 4: Approve Contract Endpoint ---
@router.post("/{request_id}/approve")
def approve_contract(
    request_id: int,
    payload: RequestApprovePayload,
    db: Session = Depends(get_db)
):
    db_request = db.query(ContractRequest).filter(ContractRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Update approval sequence
    sequence = list(db_request.approval_sequence or [
        {"step": 1, "role": "Operations", "name": "Alex Miller", "status": "Approved", "timestamp": "2026-08-06T14:30:00Z"},
        {"step": 2, "role": "Finance", "name": "Sarah Jenkins", "status": "Pending", "timestamp": None},
        {"step": 3, "role": "Legal", "name": "Elena Rostova", "status": "Queued", "timestamp": None},
        {"step": 4, "role": "Executive", "name": "David Chen", "status": "Queued", "timestamp": None}
    ])

    approved_index = -1
    for i, item in enumerate(sequence):
        if item.get("status") == "Pending":
            item["status"] = "Approved"
            item["timestamp"] = datetime.utcnow().isoformat()
            if payload.approved_by:
                item["name"] = payload.approved_by
            approved_index = i
            break

    # Transition the next Queued step to Pending
    if approved_index != -1 and approved_index + 1 < len(sequence):
        next_item = sequence[approved_index + 1]
        if next_item.get("status") == "Queued":
            next_item["status"] = "Pending"

    # Check if all steps approved
    all_approved = all(item.get("status") == "Approved" for item in sequence)
    new_status = "Approved - Ready for Hand-off" if all_approved else "Internal Review"

    db_request.approval_sequence = sequence
    db_request.status = new_status
    flag_modified(db_request, "approval_sequence")

    if all_approved:
        db_request.audit_watermark = {
            "approved_at": datetime.utcnow().isoformat(),
            "digital_signature": f"SIG-{random.randint(10000, 99999)}-APPROVED",
            "version": f"{db_request.version_label or 'v1.0'}-APPROVED"
        }
        flag_modified(db_request, "audit_watermark")

    # Timeline event
    approved_by_name = payload.approved_by or "Sarah Jenkins"
    timeline_event = RequestTimeline(
        request_id=db_request.id,
        event_type="Internal Approval",
        description=f"Formal approval recorded by {approved_by_name}. New status: {new_status}."
    )
    db.add(timeline_event)
    db.commit()

    return {
        "message": "Approval recorded successfully",
        "status": new_status,
        "all_approved": all_approved
    }

@router.put("/dependencies/{dep_id}/submit")
def submit_dependency_response(
    dep_id: int,
    submission: RequestDependencySubmit,
    db: Session = Depends(get_db)
):
    dep = db.query(RequestDependency).filter(RequestDependency.id == dep_id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Dependency task not found")

    dep.feasibility = submission.feasibility
    dep.feasibility_notes = submission.feasibility_notes
    dep.resource_breakdown = submission.resource_breakdown
    dep.total_hours = submission.total_hours
    dep.total_cost = submission.total_cost
    dep.assumptions = submission.assumptions
    dep.lead_attachments = submission.lead_attachments
    dep.status = "Completed"

    db.commit()

    timeline_event = RequestTimeline(
        request_id=dep.request_id,
        event_type="Dependency Submitted",
        description=f"{dep.department} Lead submitted effort estimation ({dep.total_hours} hrs, Feasibility: {dep.feasibility})."
    )
    db.add(timeline_event)
    db.commit()

    return {"message": "Dependency submission saved successfully", "dependency_id": dep.id}

@router.get("/{request_id}/synthesize-dependencies")
def synthesize_dependencies(request_id: int, db: Session = Depends(get_db)):
    db_request = db.query(ContractRequest).filter(ContractRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")

    dependencies = db_request.dependencies or []
    completed = [d for d in dependencies if d.status == "Completed"]

    total_hours = sum(d.total_hours or 0 for d in completed) or 205.0
    total_cost = sum(d.total_cost or 0 for d in completed) or 14350.0
    recommended_pricing = round(total_cost / 0.65, 2) if total_cost > 0 else 22000.0
    blended_weeks = round(total_hours / 32.0, 1)

    risks = []
    for d in completed:
        if d.feasibility == "Feasible with Risks" and d.feasibility_notes:
            risks.append(f"{d.department}: {d.feasibility_notes}")
        elif d.feasibility == "Not Feasible":
            risks.append(f"CRITICAL ({d.department}): Marked Not Feasible - {d.feasibility_notes}")

    if not risks:
        risks = [
            "Backend team noted dependence on external client payment API documentation.",
            "Timeline is tight for target completion date."
        ]

    synthesis_result = {
        "total_aggregated_hours": total_hours,
        "blended_timeline_weeks": blended_weeks,
        "estimated_internal_cost": total_cost,
        "recommended_client_pricing": recommended_pricing,
        "target_margin_percent": 35,
        "flagged_risks": risks
    }

    db_request.ai_aggregated_synthesis = synthesis_result
    flag_modified(db_request, "ai_aggregated_synthesis")
    db.commit()

    return synthesis_result

@router.post("/{request_id}/proceed-to-drafting")
def proceed_to_drafting(
    request_id: int,
    payload: RequestProceedToDrafting,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_mock)
):
    db_request = db.query(ContractRequest).filter(ContractRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")

    db_request.final_commercial_pricing = payload.final_commercial_pricing
    db_request.payment_schedule = payload.payment_schedule
    db_request.milestone_breakdown = payload.milestone_breakdown
    db_request.scope_approval_checkpoint = payload.scope_approval_checkpoint
    if payload.milestone_breakdown:
        flag_modified(db_request, "milestone_breakdown")

    if payload.status in ["Review", "Internal Review"]:
        db_request.status = "Internal Review"
        # Reset/Initialize approval sequence for Stage 4 Review
        sequence = list(db_request.approval_sequence or [])
        if not sequence:
            sequence = [
                {"step": 1, "role": "Operations", "name": "Alex Miller", "status": "Approved", "timestamp": datetime.utcnow().isoformat()},
                {"step": 2, "role": "Finance", "name": "Sarah Jenkins", "status": "Pending", "timestamp": None},
                {"step": 3, "role": "Legal", "name": "Elena Rostova", "status": "Queued", "timestamp": None},
                {"step": 4, "role": "Executive", "name": "David Chen", "status": "Queued", "timestamp": None}
            ]
        else:
            for item in sequence:
                role = item.get("role")
                if role == "Operations":
                    item["status"] = "Approved"
                    if not item.get("timestamp"):
                        item["timestamp"] = datetime.utcnow().isoformat()
                elif role == "Finance":
                    item["status"] = "Pending"
                    item["timestamp"] = None
                else:
                    item["status"] = "Queued"
                    item["timestamp"] = None
        db_request.approval_sequence = sequence
        flag_modified(db_request, "approval_sequence")
    else:
        db_request.status = "Drafting In Progress"

    if not db_request.contract_id:
        new_contract = Contract(
            title=db_request.title,
            status="Draft",
            value=payload.final_commercial_pricing,
            owner_id=db_request.requester_id or current_user_id,
            ai_summary=f"Generated from REQ-{db_request.id}: {db_request.description[:200]}"
        )
        db.add(new_contract)
        db.commit()
        db.refresh(new_contract)
        db_request.contract_id = new_contract.id

    req_timeline = RequestTimeline(
        request_id=db_request.id,
        event_type="Proceeded to Drafting",
        description=f"Scope audit v0.1 locked. Final pricing: ${payload.final_commercial_pricing:,.2f}. Status updated to Drafting In Progress."
    )
    db.add(req_timeline)
    db.commit()

    return {
        "message": "Transitioned to Drafting In Progress successfully",
        "contract_id": db_request.contract_id,
        "request_id": db_request.id
    }

@router.post("/{request_id}/comments", response_model=RequestCommentOut)
def add_comment(
    request_id: int, 
    comment: RequestCommentCreate, 
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_mock)
):
    db_request = db.query(ContractRequest).filter(ContractRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    db_comment = RequestComment(
        request_id=request_id,
        user_id=current_user_id,
        content=comment.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return db_comment

@router.post("/{request_id}/attachments", response_model=RequestAttachmentOut)
def add_attachment(
    request_id: int,
    attachment: RequestAttachmentCreate,
    db: Session = Depends(get_db)
):
    db_request = db.query(ContractRequest).filter(ContractRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")

    db_attachment = RequestAttachment(
        request_id=request_id,
        file_name=attachment.file_name,
        file_url=attachment.file_url
    )
    db.add(db_attachment)

    timeline_event = RequestTimeline(
        request_id=request_id,
        event_type="Attachment Added",
        description=f"Attachment added: {attachment.file_name}"
    )
    db.add(timeline_event)

    db.commit()
    db.refresh(db_attachment)
    return db_attachment

@router.post("/{request_id}/convert-to-contract")
def convert_to_contract(
    request_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_mock)
):
    db_request = db.query(ContractRequest).filter(ContractRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")

    if db_request.contract_id:
        return {"contract_id": db_request.contract_id, "message": "Request already converted to contract"}

    new_contract = Contract(
        title=db_request.title,
        status="Draft",
        owner_id=db_request.requester_id or current_user_id,
        value=db_request.deal_value,
        ai_summary=f"Created from Contract Request #{db_request.tracking_id or db_request.id}: {db_request.description[:200]}"
    )
    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)

    db_request.contract_id = new_contract.id
    db_request.status = "Drafting In Progress"

    req_timeline = RequestTimeline(
        request_id=db_request.id,
        event_type="Moved to Drafting",
        description=f"Contract #{new_contract.id} created from this request."
    )
    db.add(req_timeline)

    contract_timeline = ContractTimeline(
        contract_id=new_contract.id,
        event_type="Created from Request",
        description=f"Draft contract generated from Request {db_request.tracking_id or ('REQ-' + str(db_request.id))}."
    )
    db.add(contract_timeline)

    db.commit()
    return {"contract_id": new_contract.id, "message": "Contract created successfully"}

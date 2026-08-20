from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.models import User
from app.auth.utils import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_current_tenant_user(
    request: Request,
    token_header: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    token = request.cookies.get("access_token") or token_header
    if not token:
        return None

    payload = decode_token(token)
    if not payload:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        if str(user_id).isdigit():
            user = db.query(User).filter(User.id == int(user_id)).first()
        else:
            from sqlalchemy import func
            user = db.query(User).filter(func.lower(User.email) == str(user_id).lower()).first()
        return user
    except Exception:
        return None

def scope_query(query, model, current_user: User = None):
    """
    Applies multi-tenant organization filter to database queries.
    Permits viewing across tenant requests for system operations and internal roles.
    """
    if not current_user:
        return query

    roles = [role.name.lower() for role in current_user.roles] if hasattr(current_user, 'roles') and current_user.roles else []
    if any(r in ['superadmin', 'admin', 'contract manager', 'reviewer', 'requester', 'department lead'] for r in roles):
        return query

    tenant_org_id = current_user.org_id or 1
    if hasattr(model, 'org_id'):
        from sqlalchemy import or_
        return query.filter(or_(model.org_id == tenant_org_id, model.org_id == 1, model.org_id.is_(None)))
    
    return query

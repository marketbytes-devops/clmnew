from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.models import User
from app.auth.utils import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_current_tenant_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        return None

    payload = decode_token(token)
    if not payload:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
        return user
    except Exception:
        return None

def scope_query(query, model, current_user: User = None):
    """
    Applies multi-tenant organization filter to database queries.
    If current_user is a Superadmin, cross-org viewing is permitted.
    Otherwise, filters strictly by current_user.org_id.
    """
    if not current_user:
        if hasattr(model, 'org_id'):
            return query.filter(model.org_id == 1)
        return query

    roles = [role.name.lower() for role in current_user.roles] if hasattr(current_user, 'roles') and current_user.roles else []
    if 'superadmin' in roles:
        return query

    tenant_org_id = current_user.org_id or 1
    if hasattr(model, 'org_id'):
        return query.filter(model.org_id == tenant_org_id)
    
    return query

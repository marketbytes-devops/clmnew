from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from typing import Optional
import re
import random
import string
from datetime import datetime, timedelta
import secrets

from sqlalchemy.orm import Session
from ..database import get_db
from app.core.models import User, Organization, Department, Role, PendingRegistration
from . import schemas, utils
from .dependencies import get_current_admin_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register/initiate", response_model=schemas.MessageResponse)
def initiate_registration(user: schemas.UserCreate, db: Session = Depends(get_db)):
    from sqlalchemy import func
    clean_email = user.email.strip().lower() if user.email else ""
    if not clean_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is required"
        )
        
    clean_org = user.org_name.strip() if user.org_name else ""
    if not clean_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization name is required"
        )

    # Check if user with this email already exists
    db_user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered. Please log in instead."
        )
        
    # Check if organization with same name already exists
    db_org = db.query(Organization).filter(func.lower(Organization.name) == clean_org.lower()).first()
    if db_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An organization with this name already exists. Please choose a unique organization name."
        )
    
    # Generate 6-digit OTP
    otp_code = ''.join(random.choices(string.digits, k=6))
    
    # Hash password
    hashed_password = utils.get_password_hash(user.password)
    
    # Check if a pending registration already exists for this email
    pending = db.query(PendingRegistration).filter(func.lower(PendingRegistration.email) == clean_email).first()
    
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    if pending:
        pending.password_hash = hashed_password
        pending.full_name = user.full_name.strip() if user.full_name else ""
        pending.org_name = clean_org
        pending.otp_code = otp_code
        pending.expires_at = expires_at
    else:
        pending = PendingRegistration(
            email=clean_email,
            password_hash=hashed_password,
            full_name=user.full_name.strip() if user.full_name else "",
            org_name=clean_org,
            otp_code=otp_code,
            expires_at=expires_at
        )
        db.add(pending)
        
    db.commit()
    
    # Send email
    utils.send_otp_email(clean_email, otp_code)
    
    return {"message": "OTP sent to your email. Please verify to complete registration."}

@router.post("/register/verify", response_model=schemas.UserResponse)
def verify_registration(otp_data: schemas.OTPVerify, db: Session = Depends(get_db)):
    from sqlalchemy import func
    clean_email = otp_data.email.strip().lower() if otp_data.email else ""
    pending = db.query(PendingRegistration).filter(func.lower(PendingRegistration.email) == clean_email).first()
    
    if not pending:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No pending registration found for this email")
        
    if pending.otp_code != otp_data.otp_code.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code")
        
    if pending.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP code has expired")

    # Final uniqueness check before creating user and org
    if db.query(User).filter(func.lower(User.email) == clean_email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")
        
    # Create Organization
    subdomain = re.sub(r'[^a-zA-Z0-9]', '', pending.org_name.lower())
    
    # Ensure unique subdomain
    base_subdomain = subdomain
    counter = 1
    while db.query(Organization).filter(Organization.subdomain == subdomain).first():
        subdomain = f"{base_subdomain}{counter}"
        counter += 1

    new_org = Organization(
        name=pending.org_name,
        subdomain=subdomain
    )
    db.add(new_org)
    db.flush() # flush to get org id

    # Create default departments
    default_depts = ["sales", "marketing", "finance", "legal", "contract_manager", "operations"]
    for dept_name in default_depts:
        dept = Department(org_id=new_org.id, name=dept_name, description=f"{dept_name.capitalize()} Department")
        db.add(dept)
    
    # Create admin role for this organization
    admin_role = Role(org_id=new_org.id, name="admin", description="Organization Administrator")
    db.add(admin_role)
    db.flush()

    # Create new user
    new_user = User(
        org_id=new_org.id,
        email=clean_email,
        password_hash=pending.password_hash,
        full_name=pending.full_name
    )
    new_user.roles.append(admin_role)
    db.add(new_user)
    
    # Delete pending registration
    db.delete(pending)
    
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=schemas.LoginResponse)
def login(user: schemas.UserLogin, response: Response, db: Session = Depends(get_db)):
    # Find user by email (case-insensitive and trimmed)
    from sqlalchemy import func
    clean_email = user.email.strip().lower() if user.email else ""
    db_user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not db_user:
        print(f"[AUTH LOGIN DEBUG] User not found: '{user.email}' (cleaned: '{clean_email}')")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    plain_pw = user.password if user.password is not None else ""
    if not utils.verify_password(plain_pw, db_user.password_hash) and not utils.verify_password(plain_pw.strip(), db_user.password_hash):
        print(f"[AUTH LOGIN DEBUG] Password mismatch for email: '{clean_email}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user roles
    roles = [role.name for role in db_user.roles]
    
    # Build token payload
    token_data = {
        "sub": str(db_user.id),
        "email": db_user.email,
        "roles": roles,
    }
    
    # Superadmin does not need org restriction in token
    if "superadmin" not in roles:
        token_data["org_id"] = db_user.org_id
        if db_user.organization:
            token_data["org_name"] = db_user.organization.name
            
    # Create tokens
    access_token = utils.create_access_token(data=token_data)
    refresh_token = utils.create_refresh_token(data=token_data)
    
    # Set HttpOnly cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True, # Set to True if using HTTPS
        samesite="lax",
        max_age=7 * 24 * 60 * 60 # 7 days
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@router.post("/admin/users", response_model=schemas.UserResponse)
def create_user_as_admin(
    user: schemas.AdminUserCreate, 
    db: Session = Depends(get_db)
):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Use provided password or generate a dummy one
    password_to_hash = user.password if user.password else secrets.token_urlsafe(16)
    hashed_password = utils.get_password_hash(password_to_hash)
    
    # Generate reset token for invitation
    reset_token = secrets.token_urlsafe(32)
    reset_token_expires = datetime.utcnow() + timedelta(hours=24)
    
    # Create new user with specific role
    new_user = User(
        email=user.email,
        full_name=user.full_name,
        password_hash=hashed_password,
        org_id=user.org_id,
        reset_token=reset_token,
        reset_token_expires=reset_token_expires
    )
    
    if user.role_id:
        role = db.query(Role).filter(Role.id == user.role_id).first()
        if role:
            new_user.roles.append(role)
            
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send invitation email
    invite_link = f"http://localhost:3000/set-password?token={reset_token}"
    utils.send_invite_email(new_user.email, invite_link)
    
    return new_user

@router.get("/verify-token/{token}")
def verify_token(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid token")
    if user.reset_token_expires:
        expires = user.reset_token_expires.replace(tzinfo=None) if hasattr(user.reset_token_expires, 'tzinfo') and user.reset_token_expires.tzinfo else user.reset_token_expires
        if expires < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token has expired")
    return {"message": "Token is valid", "email": user.email}

@router.post("/set-password", response_model=schemas.MessageResponse)
def set_password(data: schemas.SetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == data.token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid token")
    if user.reset_token_expires:
        expires = user.reset_token_expires.replace(tzinfo=None) if hasattr(user.reset_token_expires, 'tzinfo') and user.reset_token_expires.tzinfo else user.reset_token_expires
        if expires < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token has expired")
        
    user.password_hash = utils.get_password_hash(data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    
    db.commit()
    return {"message": "Password updated successfully"}
@router.post("/refresh", response_model=schemas.TokenRefreshResponse)
def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )
        
    payload = utils.decode_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
        
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
        
    db_user = db.query(User).filter(User.id == int(user_id)).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
        
    # Get user roles
    roles = [role.name for role in db_user.roles]
    
    # Build token payload
    token_data = {
        "sub": str(db_user.id),
        "email": db_user.email,
        "roles": roles,
    }
    
    if "superadmin" not in roles:
        token_data["org_id"] = db_user.org_id
        if db_user.organization:
            token_data["org_name"] = db_user.organization.name

    # Create new tokens
    access_token = utils.create_access_token(data=token_data)
    new_refresh_token = utils.create_refresh_token(data=token_data)
    
    # Set new HttpOnly cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

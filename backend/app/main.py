from fastapi import FastAPI, Depends
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from contextlib import asynccontextmanager
import logging

from app import database
from app.models import user, contract, request
from app.api.v1 import admin, contracts, users, departments, ai, analytics, repository, requests, client, dependencies, cm
from app.auth.router import router as auth_router
from app.api.v1.portal import router as portal_router

logger = logging.getLogger("uvicorn.error")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Attempting to connect to the database...")
    try:
        from app.database import engine, Base
        import app.models  # noqa: F401
        from app.core import models as core_models  # noqa: F401
        
        # Automatically create any missing tables (users, organizations, pending_registrations, roles, etc.)
        Base.metadata.create_all(bind=engine)
        
        # Auto-seed standard roles and base org if DB is fresh
        from app.database import SessionLocal
        from app.core.models import Organization, Role, User
        from app.core.security import get_password_hash
        import json
        
        db = SessionLocal()
        try:
            base_org = db.query(Organization).filter(Organization.id == 1).first()
            if not base_org:
                base_org = Organization(id=1, name="Marketbytes", subdomain="marketbytes")
                db.add(base_org)
                db.commit()
                
            standard_roles = [
                ("Admin", "Organization Administrator with full access", True, {"all": True}),
                ("Contract Manager", "Full control over contract drafting, review, negotiation, and execution", True, {"contracts": {"view": True, "create": True, "edit": True, "delete": True, "approve": True, "reject": True}}),
                ("Requester", "Create, submit, and track contract requests", True, {"contracts": {"view": True, "create": True, "edit": True}}),
                ("Reviewer", "Review, redline, and provide department feedback on contracts", True, {"contracts": {"view": True, "edit": True, "comment": True}}),
                ("Department Lead", "Approve dependencies and assign department reviewers", True, {"dependencies": {"approve": True, "assign": True}}),
                ("Approver", "Signatory and final executive contract approver", True, {"contracts": {"approve": True, "sign": True}})
            ]
            
            for r_name, r_desc, is_sys, perms in standard_roles:
                existing_role = db.query(Role).filter(Role.org_id == 1, Role.name.ilike(r_name)).first()
                if not existing_role:
                    created_role = Role(
                        org_id=1,
                        name=r_name,
                        description=r_desc,
                        is_system_role=is_sys,
                        permissions_json=perms
                    )
                    db.add(created_role)
            
            # Ensure superadmin user exists
            admin_user = db.query(User).filter(User.email == "admin@clm.com").first()
            if not admin_user:
                admin_role = db.query(Role).filter(Role.org_id == 1, Role.name.ilike("Admin")).first()
                admin_user = User(
                    org_id=1,
                    email="admin@clm.com",
                    password_hash=get_password_hash("admin123"),
                    full_name="System Administrator",
                    is_active=True
                )
                if admin_role:
                    admin_user.roles.append(admin_role)
                db.add(admin_user)
                
            db.commit()
        except Exception as seed_err:
            logger.warning(f"Notice on DB auto-seed: {seed_err}")
        finally:
            db.close()

        logger.info("✅ Database connected and all tables verified successfully!")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")
    yield
    logger.info("Application shutdown complete.")

app = FastAPI(
    title="CLM Backend API",
    description="Contract Lifecycle Management Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.40:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with both /api/v1 and /api prefixes to support both Requester and Admin Portals
app.include_router(auth_router, tags=["auth"])  # Root level to handle /auth/... directly from frontend
app.include_router(auth_router, prefix="/api/v1", tags=["auth"])
app.include_router(auth_router, prefix="/api", tags=["auth"])

app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

app.include_router(contracts.router, prefix="/api/v1/admin/contracts", tags=["contracts"])
app.include_router(contracts.router, prefix="/api/admin/contracts", tags=["contracts"])
app.include_router(contracts.router, prefix="/admin/contracts", tags=["contracts"])

app.include_router(users.router, prefix="/api/users", tags=["users"])

app.include_router(departments.router, prefix="/api/v1/departments", tags=["departments"])
app.include_router(departments.router, prefix="/api/departments", tags=["departments"])
app.include_router(departments.router, prefix="/api/v1/admin/departments", tags=["departments"])
app.include_router(departments.router, prefix="/api/admin/departments", tags=["departments"])

app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

app.include_router(repository.router, prefix="/api/v1/repository", tags=["repository"])

app.include_router(requests.router, prefix="/api/v1/requests", tags=["requests"])
app.include_router(requests.router, prefix="/api/contracts/requests", tags=["requests"])

app.include_router(dependencies.router, prefix="/api/v1")

# Register Contract Manager Router
app.include_router(cm.router)

# Portal Router for general Requester Portal features (/metrics, /notifications, /managers, /leads)
app.include_router(portal_router, prefix="/api/contracts", tags=["portal"])

# Register Client Portal Router (contains its own prefixes /api/client)
app.include_router(client.router)

@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <html>
        <head>
            <title>App Home</title>
            <style>
                body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f2f5; }
                .container { text-align: center; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                a { display: inline-block; margin: 10px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to the CLM Backend API</h1>
                <p>Please register or login to continue.</p>
                <a href="/docs">Go to API Docs (Swagger UI)</a>
            </div>
        </body>
    </html>
    """

@app.get("/test-db")
def test_db_connection(db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Successfully connected to the clmnew database!"}
    except Exception as e:
        return {"status": "error", "message": f"Failed to connect: {str(e)}"}

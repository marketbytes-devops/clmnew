from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app import database
from app.models import user, contract, request
from app.api.v1 import auth, admin, contracts, users, departments, ai, analytics, repository, requests

# Create tables if they don't exist yet
database.Base.metadata.create_all(bind=database.engine)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CLM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(contracts.router, prefix="/api/v1/admin/contracts", tags=["contracts"])
app.include_router(users.router, prefix="/api/v1/admin/users", tags=["users"])
app.include_router(departments.router, prefix="/api/v1/admin/departments", tags=["departments"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(repository.router, prefix="/api/v1/repository", tags=["repository"])
app.include_router(requests.router, prefix="/api/v1/requests", tags=["requests"])

@app.get("/")
def root():
    return {"message": "FastAPI is running!"}

@app.get("/test-db")
def test_db_connection(db: Session = Depends(database.get_db)):
    try:
        # Try to execute a simple query to verify connection
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Successfully connected to the clmnew MySQL database!"}
    except Exception as e:
        return {"status": "error", "message": f"Failed to connect: {str(e)}"}
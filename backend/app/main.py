from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from . import database
from app.client import models as client_models
from app.client.routes import router as client_router

# Create tables if they don't exist yet
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="CLM Backend API",
    description="Contract Lifecycle Management Platform API",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Client Portal Router
app.include_router(client_router)

@app.get("/")
def root():
    return {"message": "CLM FastAPI Backend is running!", "client_portal_docs": "/docs"}

@app.get("/test-db")
def test_db_connection(db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Successfully connected to the clmnew database!"}
    except Exception as e:
        return {"status": "error", "message": f"Failed to connect: {str(e)}"}
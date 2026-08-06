from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from . import database

# Create tables if they don't exist yet
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

@app.get("/")
def root():
    return {"message": "FastAPI is running!"}

from sqlalchemy import text

@app.get("/test-db")
def test_db_connection(db: Session = Depends(database.get_db)):
    try:
        # Try to execute a simple query to verify connection
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Successfully connected to the clmnew MySQL database!"}
    except Exception as e:
        return {"status": "error", "message": f"Failed to connect: {str(e)}"}
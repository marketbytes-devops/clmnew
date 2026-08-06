from fastapi import FastAPI, Depends
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import database
from .auth.router import router as auth_router
from .middleware.jwt_middleware import JWTMiddleware

# Create tables if they don't exist yet
# (Disabled because we use Alembic for migrations)
# database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(JWTMiddleware)
app.include_router(auth_router)

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
                <h1>Welcome to the API</h1>
                <p>Please register or login to continue.</p>
                <a href="/docs">Go to API Docs (Swagger UI)</a>
            </div>
        </body>
    </html>
    """

from sqlalchemy import text

@app.get("/test-db")
def test_db_connection(db: Session = Depends(database.get_db)):
    try:
        # Try to execute a simple query to verify connection
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Successfully connected to the clmnew MySQL database!"}
    except Exception as e:
        return {"status": "error", "message": f"Failed to connect: {str(e)}"}
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv() # Load variables from .env

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def auto_migrate():
    try:
        with engine.connect() as conn:
            cols_to_add = [
                ("contracts", "version", "VARCHAR(20) DEFAULT 'v1.0'"),
                ("contracts", "version_notes", "TEXT NULL"),
                ("contracts", "last_redispatched_at", "DATETIME NULL"),
                ("client_redlines", "status", "VARCHAR(50) DEFAULT 'PENDING'"),
                ("client_redlines", "cm_counter_wording", "TEXT NULL"),
                ("request_dependencies", "normalized_value", "VARCHAR(255) NULL")
            ]
            for table, col, col_def in cols_to_add:
                try:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_def}"))
                    conn.commit()
                except Exception:
                    pass
    except Exception:
        pass

# Run schema migration helper on load
auto_migrate()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

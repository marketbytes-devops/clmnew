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
                ("contract_requests", "org_id", "INT DEFAULT 1"),
                ("contracts", "org_id", "INT DEFAULT 1"),
                ("contracts", "version", "VARCHAR(20) DEFAULT 'v1.0'"),
                ("contracts", "version_notes", "TEXT NULL"),
                ("contracts", "last_redispatched_at", "DATETIME NULL"),
                ("client_redlines", "status", "VARCHAR(50) DEFAULT 'PENDING'"),
                ("client_redlines", "cm_counter_wording", "TEXT NULL"),
                ("contract_requests", "tracking_id", "VARCHAR(100) NULL"),
                ("contract_requests", "requester_department", "VARCHAR(100) NULL"),
                ("contract_requests", "business_unit", "VARCHAR(100) NULL"),
                ("contract_requests", "entity_type", "VARCHAR(100) NULL"),
                ("contract_requests", "entity_name", "VARCHAR(255) NULL"),
                ("contract_requests", "primary_contact_name", "VARCHAR(255) NULL"),
                ("contract_requests", "primary_contact_email", "VARCHAR(255) NULL"),
                ("contract_requests", "jurisdiction", "VARCHAR(255) NULL"),
                ("contract_requests", "category", "VARCHAR(255) NULL"),
                ("contract_requests", "contract_type", "VARCHAR(255) NULL"),
                ("contract_requests", "deal_value", "FLOAT NULL"),
                ("contract_requests", "currency", "VARCHAR(10) NULL"),
                ("contract_requests", "pricing_model", "VARCHAR(100) NULL"),
                ("contract_requests", "target_effective_date", "DATETIME NULL"),
                ("contract_requests", "target_delivery_date", "DATETIME NULL"),
                ("contract_requests", "deliverables", "JSON NULL"),
                ("contract_requests", "tech_dependencies", "JSON NULL"),
                ("contract_requests", "custom_terms", "TEXT NULL"),
                ("contract_requests", "extracted_scope", "TEXT NULL"),
                ("contract_requests", "require_dependencies", "BOOLEAN DEFAULT FALSE"),
                ("contract_requests", "ai_aggregated_synthesis", "JSON NULL"),
                ("contract_requests", "final_commercial_pricing", "FLOAT NULL"),
                ("contract_requests", "payment_schedule", "VARCHAR(255) NULL"),
                ("contract_requests", "milestone_breakdown", "JSON NULL"),
                ("contract_requests", "scope_approval_checkpoint", "BOOLEAN DEFAULT FALSE"),
                ("contract_requests", "version_label", "VARCHAR(50) NULL"),
                ("contract_requests", "approval_sequence", "JSON NULL"),
                ("contract_requests", "inline_comments", "JSON NULL"),
                ("contract_requests", "rejection_rollback_log", "JSON NULL"),
                ("contract_requests", "audit_watermark", "VARCHAR(255) NULL"),
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

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "mysql+pymysql://root:india123@localhost:3306/clmnewdb"

try:
    print("Connecting to DB...")
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    print("Connected. Executing test query...")
    # Try querying models or raw sql
    from sqlalchemy import text
    res = session.execute(text("SELECT 1")).fetchall()
    print(f"Result: {res}")
    print("Testing tables query...")
    # Check if we can query contract requests
    from app.models import ContractRequest
    count = session.query(ContractRequest).count()
    print(f"ContractRequest Count: {count}")
    print("Success!")
except Exception as e:
    print(f"DB Error: {e}")

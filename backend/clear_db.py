from app import database, models

db = database.SessionLocal()
try:
    deleted = db.query(models.ContractRequest).delete()
    db.commit()
    print(f"Successfully deleted {deleted} contract requests from the database.")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()

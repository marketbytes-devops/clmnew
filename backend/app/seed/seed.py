import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.auth import models, utils

def seed_database():
    print("Starting database seed...")
    
    # Create tables (if they don't exist, though alembic should handle this)
    models.Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Check if users already exist
        user_count = db.query(models.User).count()
        if user_count == 0:
            print("No users found. Creating users...")
            hashed_password = utils.get_password_hash("password123")
            
            # Normal user
            test_user = models.User(
                email="test@example.com",
                password=hashed_password,
                role="user"
            )
            db.add(test_user)
            
            # Admin user
            admin_password = utils.get_password_hash("admin123")
            admin_user = models.User(
                email="admin@clm.com",
                password=admin_password,
                role="admin"
            )
            db.add(admin_user)
            
            db.commit()
            print("Test user created successfully! Email: test@example.com, Password: password123")
            print("Admin user created successfully! Email: admin@clm.com, Password: admin123")
        else:
            print(f"Database already seeded with {user_count} users.")
    finally:
        db.close()
    
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_database()

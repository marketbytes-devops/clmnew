from sqlalchemy import text
from app.database import engine

with engine.connect() as conn:
    # Disable foreign key checks temporarily for clean cascade deletion
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
    
    # Delete test users
    conn.execute(text("DELETE FROM users WHERE id IN (2, 6, 11, 15, 16);"))
    conn.execute(text("DELETE FROM user_roles WHERE user_id IN (2, 6, 11, 15, 16);"))
    
    # Delete org 14 (and its roles and departments)
    conn.execute(text("DELETE FROM roles WHERE org_id = 14;"))
    conn.execute(text("DELETE FROM departments WHERE org_id = 14;"))
    conn.execute(text("DELETE FROM organizations WHERE id = 14;"))
    
    # Re-enable foreign key checks
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
    conn.commit()
    print("Successfully deleted all test usernames, passwords, and organizations!")

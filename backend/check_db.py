from app.database import SessionLocal
from app.core.models import Organization, User
db = SessionLocal()
org = db.query(Organization).first()
if org:
    print(f"Found org: {org.id}, {org.name}")
else:
    print("No organizations found!")

users = db.query(User).all()
print(f"Number of users: {len(users)}")
for u in users[-5:]:
    print(f"User: {u.id}, {u.email}, org: {u.org_id}, reset_token: {u.reset_token}")

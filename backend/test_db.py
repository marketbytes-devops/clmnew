from app.main import app
from app.database import SessionLocal
from app.core.models import User
db = SessionLocal()
u = db.query(User).filter(User.email=="risvanperayil@gmail.com").first()
print(u.reset_token)

from app.database import SessionLocal
import app.models.user
import app.models.contract
import app.models.request
from app.core.models import User, Organization, Department, Role
from app.auth import utils

def seed_multitenants():
    db = SessionLocal()
    try:
        # 1. Organization 1: Acme Corp
        acme = db.query(Organization).filter(Organization.id == 1).first()
        if not acme:
            acme = Organization(id=1, name="Acme Corp", subdomain="acmecorp")
            db.add(acme)
            db.flush()
        else:
            acme.name = "Acme Corp"
            acme.subdomain = "acmecorp"

        # 2. Organization 2: Hooli Inc
        hooli = db.query(Organization).filter(Organization.subdomain == "hooli").first()
        if not hooli:
            hooli = Organization(name="Hooli Inc", subdomain="hooli")
            db.add(hooli)
            db.flush()

        # 3. Create roles for Hooli
        hooli_admin_role = db.query(Role).filter(Role.org_id == hooli.id, Role.name == "admin").first()
        if not hooli_admin_role:
            hooli_admin_role = Role(org_id=hooli.id, name="admin", description="Hooli Administrator")
            db.add(hooli_admin_role)
            db.flush()

        hooli_req_role = db.query(Role).filter(Role.org_id == hooli.id, Role.name == "requester").first()
        if not hooli_req_role:
            hooli_req_role = Role(org_id=hooli.id, name="requester", description="Hooli Requester")
            db.add(hooli_req_role)
            db.flush()

        # 4. Create Hooli users
        hooli_admin = db.query(User).filter(User.email == "admin@hooli.com").first()
        if not hooli_admin:
            hooli_admin = User(
                org_id=hooli.id,
                email="admin@hooli.com",
                full_name="Hooli Admin",
                password_hash=utils.get_password_hash("password123"),
                is_active=True
            )
            hooli_admin.roles.append(hooli_admin_role)
            db.add(hooli_admin)

        hooli_user = db.query(User).filter(User.email == "sarah@hooli.com").first()
        if not hooli_user:
            hooli_user = User(
                org_id=hooli.id,
                email="sarah@hooli.com",
                full_name="Sarah Hooli",
                password_hash=utils.get_password_hash("password123"),
                is_active=True
            )
            hooli_user.roles.append(hooli_req_role)
            db.add(hooli_user)

        # 5. Create Acme Corp users
        acme_admin = db.query(User).filter(User.email == "admin@acmecorp.com").first()
        if not acme_admin:
            acme_role = db.query(Role).filter(Role.org_id == acme.id, Role.name == "admin").first()
            if not acme_role:
                acme_role = Role(org_id=acme.id, name="admin", description="Acme Administrator")
                db.add(acme_role)
                db.flush()
            acme_admin = User(
                org_id=acme.id,
                email="admin@acmecorp.com",
                full_name="Acme Admin",
                password_hash=utils.get_password_hash("password123"),
                is_active=True
            )
            acme_admin.roles.append(acme_role)
            db.add(acme_admin)

        db.commit()
        print("✅ Successfully seeded Multi-Tenant Organization Demo Data!")
        print(f"   Acme Corp (ID={acme.id}): admin@acmecorp.com / password123")
        print(f"   Hooli Inc (ID={hooli.id}): admin@hooli.com / password123, sarah@hooli.com / password123")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding multi-tenant data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_multitenants()

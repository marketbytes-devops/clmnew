import sys
import os

# Append parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models import (
    User, Role, Department, ContractManager, DepartmentLead, AIConfiguration, Notification
)

def seed_database():
    print("Starting database seed...")
    db: Session = SessionLocal()
    try:
        # Check if roles already exist
        role_count = db.query(Role).count()
        if role_count == 0:
            print("Creating Roles...")
            cm_default_perms = [
              {
                "category": "CONTRACT MANAGER & WORKBENCH OPERATIONS",
                "modules": [
                  { "id": "cm_workbench", "name": "Internal Negotiation Workbench", "view": True, "add": True, "edit": True, "delete": True },
                  { "id": "cm_intake_triage", "name": "Contract Intake Triage & Assignment", "view": True, "add": True, "edit": True, "delete": True },
                  { "id": "cm_redline_decision", "name": "Client Redline Decisioning & Versioning", "view": True, "add": True, "edit": True, "delete": True },
                  { "id": "cm_countersign", "name": "Countersign & Execution Management", "view": True, "add": True, "edit": True, "delete": True }
                ]
              }
            ]
            admin_role = Role(name="Admin", description="Administrator with full access", permissions={"all": True})
            manager_role = Role(name="Contract_Manager", description="Contract Manager", permissions=cm_default_perms)
            requester_role = Role(name="Requester", description="Contract Requester")
            reviewer_role = Role(name="Reviewer", description="Department Reviewer")
            db.add_all([admin_role, manager_role, requester_role, reviewer_role])
            db.commit()
        else:
            admin_role = db.query(Role).filter(Role.name == "Admin").first()
            requester_role = db.query(Role).filter(Role.name == "Requester").first()

        # Departments
        dept_count = db.query(Department).count()
        if dept_count == 0:
            print("Creating Departments...")
            legal_dept = Department(name="Legal Operations", description="Legal Operations Department")
            finance_dept = Department(name="Commercial Finance", description="Finance Department")
            db.add_all([legal_dept, finance_dept])
            db.commit()
        else:
            finance_dept = db.query(Department).filter(Department.name == "Commercial Finance").first()

        # Users
        user_count = db.query(User).count()
        if user_count == 0:
            print("Creating Users...")
            admin_user = User(
                email="admin@clm.com",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                is_active=True,
                role_id=admin_role.id
            )
            john_sales = User(
                email="john.sales@marketbytes.com",
                hashed_password=get_password_hash("password123"),
                full_name="John Sales",
                is_active=True,
                role_id=requester_role.id,
                department_id=finance_dept.id
            )
            db.add_all([admin_user, john_sales])
            db.commit()

        # Contract Managers
        mgr_count = db.query(ContractManager).count()
        if mgr_count == 0:
            print("Creating Contract Managers...")
            mgr1 = ContractManager(name="Sarah Jenkins", workload="Normal (3 active contracts)", department="Legal & Operations")
            mgr2 = ContractManager(name="Mark Thompson", workload="High (7 active contracts)", department="Finance & Procurement")
            mgr3 = ContractManager(name="Elena Rostova", workload="Low (1 active contract)", department="Enterprise Sales Support")
            mgr4 = ContractManager(name="Auto-Assign based on Region & Workload", workload="AI Optimized", department="System Default")
            db.add_all([mgr1, mgr2, mgr3, mgr4])
            db.commit()

        # Department Leads
        lead_count = db.query(DepartmentLead).count()
        if lead_count == 0:
            print("Creating Department Leads...")
            leads_data = [
                ("UI/UX Design", "Alex Miller - Design Lead"),
                ("UI/UX Design", "Samantha Wu - Principal UX Designer"),
                ("Frontend Engineering", "Marcus Brody - Lead Frontend Architect"),
                ("Frontend Engineering", "Liam O'Connor - Senior UI Engineer"),
                ("Backend & APIs", "David Chen - Tech Lead"),
                ("Backend & APIs", "Priya Patel - Principal Systems Architect"),
                ("DevOps & Infrastructure", "Jordan Tyler - Cloud Architect Lead"),
                ("Legal & Compliance Review", "Rachel Green - VP Legal Counsel"),
                ("Finance & Tax Review", "Robert Sterling - Director of Financial Controls")
            ]
            for dept, lead_name in leads_data:
                db.add(DepartmentLead(department=dept, lead_name=lead_name))
            db.commit()

        # AI Configuration
        ai_count = db.query(AIConfiguration).count()
        if ai_count == 0:
            print("Creating AI Configuration...")
            ai_config = AIConfiguration(
                provider="gemini",
                model_name="gemini-1.5-flash",
                api_key_env_var="GEMINI_API_KEY",
                temperature="0.7",
                max_tokens=2000,
                is_active=True
            )
            db.add(ai_config)
            db.commit()
            
        print("Database seed check complete.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

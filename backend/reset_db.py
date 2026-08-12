import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Append parent dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, SessionLocal
from app.core.security import get_password_hash

# Import all models to register them on Base.metadata
from app.models import (
    User, Role, Department, LoginHistory, ContractManager, DepartmentLead, Notification,
    Contract, ContractVersion, ContractAttachment, ContractTimeline,
    ContractRequest, RequestAttachment, RequestComment, RequestTimeline, RequestDependency,
    AIConfiguration, AIPrompt, AIUsageLog
)
from app.client.models import (
    ClientContract, PortalInviteToken, ClientRedline, ClientSignature, ClientNotification
)

def reset_and_seed_db():
    print("Connecting to DB and dropping existing tables...")
    with engine.connect() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        # Fetch and drop all tables
        result = conn.execute(text("SHOW TABLES;")).fetchall()
        for row in result:
            table_name = row[0]
            conn.execute(text(f"DROP TABLE IF EXISTS `{table_name}`;"))
            print(f"Dropped table: {table_name}")
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        conn.commit()
        
    print("Recreating database tables...")
    Base.metadata.create_all(bind=engine)
        
    print("Database schema recreation successful!")
    
    db = SessionLocal()
    try:
        print("Seeding Roles...")
        admin_role = Role(name="Admin", description="Administrator with full access")
        manager_role = Role(name="Contract_Manager", description="Contract Manager")
        requester_role = Role(name="Requester", description="Contract Requester")
        reviewer_role = Role(name="Reviewer", description="Department Reviewer")
        db.add_all([admin_role, manager_role, requester_role, reviewer_role])
        db.commit()
        
        print("Seeding Departments...")
        legal_dept = Department(name="Legal Operations", description="Legal Operations Department")
        finance_dept = Department(name="Commercial Finance", description="Finance Department")
        db.add_all([legal_dept, finance_dept])
        db.commit()
        
        print("Seeding Users...")
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
        
        print("Seeding Contract Managers...")
        mgr1 = ContractManager(name="Sarah Jenkins", workload="Normal (3 active contracts)", department="Legal & Operations")
        mgr2 = ContractManager(name="Mark Thompson", workload="High (7 active contracts)", department="Finance & Procurement")
        mgr3 = ContractManager(name="Elena Rostova", workload="Low (1 active contract)", department="Enterprise Sales Support")
        mgr4 = ContractManager(name="Auto-Assign based on Region & Workload", workload="AI Optimized", department="System Default")
        db.add_all([mgr1, mgr2, mgr3, mgr4])
        db.commit()
        
        print("Seeding Department Leads...")
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
        
        print("Seeding AI Configuration...")
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
        
        print("Seeding Notifications...")
        notif1 = Notification(message="New contract request REQ-2026-4521 submitted by John Sales", time_ago="10 mins ago", related_request_id="REQ-2026-4521", read=False)
        notif2 = Notification(message="Sarah Jenkins assigned as Contract Manager for Hooli Inc SOW", time_ago="1 hour ago", related_request_id="REQ-2026-4521", read=True)
        db.add_all([notif1, notif2])
        db.commit()
        
        print("Seeding Contract Requests...")
        req1 = ContractRequest(
            tracking_id="REQ-2026-4521",
            title="Hooli Inc - Statement of Work (SOW)",
            description="Core portal development for Hooli",
            status="Draft",
            priority="Medium",
            requester_id=john_sales.id,
            requester_department="Sales",
            business_unit="Software Services",
            entity_type="Client / Customer",
            entity_name="Hooli Inc",
            primary_contact_name="Gavin Belson",
            primary_contact_email="gavin@hooli.xyz",
            jurisdiction="United States - Delaware",
            category="Revenue / Sales",
            contract_type="Statement of Work (SOW)",
            deal_value=25000.0,
            currency="USD",
            pricing_model="Milestone Based",
            deliverables=[
                {"name": "UI/UX Design Prototypes", "description": "Figma visual identity", "timeline": "Week 2"},
                {"name": "Full Stack Integration", "description": "Next.js application build", "timeline": "Week 5"}
            ],
            tech_dependencies=["UI/UX Design", "Backend & APIs"],
            require_dependencies=True,
            assigned_to_id=admin_user.id
        )
        
        req2 = ContractRequest(
            tracking_id="REQ-2026-1089",
            title="YoKoBaine Retail - Statement of Work (SOW)",
            description="E-Commerce catalog portal and Android mobile application development.",
            status="Dependency Gathering",
            priority="High",
            requester_id=john_sales.id,
            requester_department="Sales",
            business_unit="Software Services",
            entity_type="Client / Customer",
            entity_name="YoKoBaine Retail",
            primary_contact_name="Akihiro Tanaka",
            primary_contact_email="tanaka@yokobaine.co.jp",
            jurisdiction="Japan",
            category="Revenue / Sales",
            contract_type="Statement of Work (SOW)",
            deal_value=120000.0,
            currency="USD",
            pricing_model="Milestone Based",
            deliverables=[
                {"name": "UI wireframing and screen designs in Figma", "description": "Figma layout design", "timeline": "Week 2"},
                {"name": "E-Commerce storefront frontend React pages", "description": "React storefront implementation", "timeline": "Week 4"},
                {"name": "Backend inventory and payment API integration", "description": "API payment integrations", "timeline": "Week 6"}
            ],
            tech_dependencies=["UI/UX Design", "Frontend Engineering", "Backend & APIs"],
            require_dependencies=True,
            assigned_to_id=admin_user.id
        )
        
        req3 = ContractRequest(
            tracking_id="REQ-2026-9005",
            title="Globex Corp - Master Services Agreement (MSA)",
            description="Consulting and engineering services contract for Globex Corp migration",
            status="Internal Review",
            priority="High",
            requester_id=john_sales.id,
            requester_department="Sales",
            business_unit="Software Services",
            entity_type="Client / Customer",
            entity_name="Globex Corp",
            primary_contact_name="Hank Scorpio",
            primary_contact_email="hank@globex.com",
            jurisdiction="United States - Virginia",
            category="Revenue / Sales",
            contract_type="Master Services Agreement (MSA)",
            deal_value=250000.0,
            currency="USD",
            pricing_model="Milestone Based",
            deliverables=[
                {"name": "Security audits & certification", "description": "Verify encryption key storage", "timeline": "Week 3"}
            ],
            tech_dependencies=["UI/UX Design", "Backend & APIs"],
            require_dependencies=True,
            assigned_to_id=admin_user.id,
            approval_sequence=[
                {"step": 1, "role": "Operations", "name": "Alex Miller", "status": "Approved", "timestamp": "2026-08-11T10:00:00Z"},
                {"step": 2, "role": "Finance", "name": "Sarah Jenkins", "status": "Pending", "timestamp": None},
                {"step": 3, "role": "Legal", "name": "Elena Rostova", "status": "Queued", "timestamp": None}
            ]
        )
        
        req4 = ContractRequest(
            tracking_id="REQ-2026-0891",
            title="Proposal_E-Commerce_Web_App_v1.0.docx",
            description="Acme Corp Proposal for E-Commerce Web Application",
            status="Internal Review",
            priority="High",
            requester_id=john_sales.id,
            requester_department="Sales",
            business_unit="Software Services",
            entity_type="Client / Customer",
            entity_name="Acme Corp",
            primary_contact_name="Jane Doe",
            primary_contact_email="jane@acme.com",
            jurisdiction="United States - California",
            category="Revenue / Sales",
            contract_type="Proposal / SOW",
            deal_value=22000.0,
            currency="USD",
            pricing_model="Fixed Bid",
            version_label="v1.0",
            deliverables=[
                {"name": "UI/UX Design Prototypes", "description": "Figma screens", "timeline": "Week 2"},
                {"name": "Backend & Stripe Integration", "description": "Stripe API setup", "timeline": "Week 5"}
            ],
            tech_dependencies=["UI/UX Design", "Backend & APIs"],
            require_dependencies=True,
            assigned_to_id=admin_user.id,
            ai_aggregated_synthesis={
                "target_margin_percent": 34.77,
                "flagged_risks": ["Financial Warning: Payment terms set to Net-60. Company baseline target is Net-30."]
            },
            approval_sequence=[
                {"step": 1, "role": "Operations", "name": "Alex Miller", "status": "Approved", "timestamp": "2026-08-06T14:30:00Z"},
                {"step": 2, "role": "Finance", "name": "Sarah Jenkins", "status": "Pending", "timestamp": None},
                {"step": 3, "role": "Legal", "name": "Elena Rostova", "status": "Queued", "timestamp": None}
            ]
        )

        req5 = ContractRequest(
            tracking_id="REQ-2026-1042",
            title="MSA_Vendor_Onboarding_Hooli_v1.0.docx",
            description="Master Services Agreement for Vendor Onboarding with Hooli",
            status="Internal Review",
            priority="Urgent",
            requester_id=john_sales.id,
            requester_department="Sales",
            business_unit="Software Services",
            entity_type="Client / Customer",
            entity_name="Hooli Inc",
            primary_contact_name="Gavin Belson",
            primary_contact_email="gavin@hooli.xyz",
            jurisdiction="United States - Delaware",
            category="Revenue / Sales",
            contract_type="Master Services Agreement (MSA)",
            deal_value=85000.0,
            currency="USD",
            pricing_model="Fixed Bid",
            version_label="v1.0",
            deliverables=[
                {"name": "Vendor Onboarding Flow", "description": "Setup onboarding page", "timeline": "Week 3"}
            ],
            tech_dependencies=["Backend & APIs"],
            require_dependencies=True,
            assigned_to_id=admin_user.id,
            ai_aggregated_synthesis={
                "target_margin_percent": 42.10,
                "flagged_risks": ["Finance Checkpoint: Contract value > $50,000 flags required executive signoff."]
            },
            approval_sequence=[
                {"step": 1, "role": "Operations", "name": "Alex Miller", "status": "Approved", "timestamp": "2026-08-07T15:00:00Z"},
                {"step": 2, "role": "Finance", "name": "Sarah Jenkins", "status": "Approved", "timestamp": "2026-08-08T09:15:00Z"},
                {"step": 3, "role": "Legal", "name": "Elena Rostova", "status": "Pending", "timestamp": None}
            ]
        )

        req6 = ContractRequest(
            tracking_id="REQ-2026-1215",
            title="NDA_Partner_Consulting_Globex_v1.0.docx",
            description="Mutual Non-Disclosure Agreement for partner consulting services with Globex",
            status="Internal Review",
            priority="Low",
            requester_id=john_sales.id,
            requester_department="Sales",
            business_unit="Corporate",
            entity_type="Partner",
            entity_name="Globex Corp",
            primary_contact_name="Hank Scorpio",
            primary_contact_email="hank@globex.com",
            jurisdiction="United States - Virginia",
            category="Non-Disclosure (NDA)",
            contract_type="Non-Disclosure Agreement (NDA)",
            deal_value=0.0,
            currency="USD",
            pricing_model="Non-Monetary",
            version_label="v1.0",
            deliverables=[],
            tech_dependencies=[],
            require_dependencies=False,
            assigned_to_id=admin_user.id,
            ai_aggregated_synthesis={
                "target_margin_percent": 100.0,
                "flagged_risks": []
            },
            approval_sequence=[
                {"step": 1, "role": "Operations", "name": "Alex Miller", "status": "Pending", "timestamp": None},
                {"step": 2, "role": "Finance", "name": "Sarah Jenkins", "status": "Queued", "timestamp": None},
                {"step": 3, "role": "Legal", "name": "Elena Rostova", "status": "Queued", "timestamp": None}
            ]
        )

        req7 = ContractRequest(
            tracking_id="REQ-2026-0562",
            title="SOW_Cloud_Migration_Phase2_v1.2.docx",
            description="Statement of Work for Cloud Migration Phase 2",
            status="Approved - Ready for Hand-off",
            priority="High",
            requester_id=john_sales.id,
            requester_department="Sales",
            business_unit="Software Services",
            entity_type="Client / Customer",
            entity_name="Initech Inc",
            primary_contact_name="Peter Gibbons",
            primary_contact_email="peter@initech.com",
            jurisdiction="United States - Texas",
            category="Revenue / Sales",
            contract_type="Statement of Work (SOW)",
            deal_value=120000.0,
            currency="USD",
            pricing_model="Milestone Based",
            version_label="v1.2",
            deliverables=[],
            tech_dependencies=[],
            require_dependencies=False,
            assigned_to_id=admin_user.id,
            ai_aggregated_synthesis={
                "target_margin_percent": 38.50,
                "flagged_risks": []
            },
            approval_sequence=[
                {"step": 1, "role": "Operations", "name": "Alex Miller", "status": "Approved", "timestamp": "2026-08-02T16:00:00Z"},
                {"step": 2, "role": "Finance", "name": "Sarah Jenkins", "status": "Approved", "timestamp": "2026-08-03T10:00:00Z"},
                {"step": 3, "role": "Legal", "name": "Elena Rostova", "status": "Approved", "timestamp": "2026-08-04T11:30:00Z"}
            ]
        )
        
        db.add_all([req1, req2, req3, req4, req5, req6, req7])
        db.commit()
        
        print("Seeding Request Dependencies...")
        dep1 = RequestDependency(
            request_id=req2.id,
            department="UI/UX Design",
            assignee_name="Alex Miller - Design Lead",
            task_objective="Provide technical estimation & SLA feasibility breakdown for UI/UX Design",
            sla_deadline="24 Hours",
            required_inputs=["Hours Estimate", "Feasibility Note"],
            status="Pending"
        )
        dep2 = RequestDependency(
            request_id=req2.id,
            department="Backend & APIs",
            assignee_name="David Chen - Tech Lead",
            task_objective="Provide technical estimation & SLA feasibility breakdown for Backend & APIs",
            sla_deadline="24 Hours",
            required_inputs=["Hours Estimate", "Feasibility Note"],
            status="Pending"
        )
        db.add_all([dep1, dep2])
        db.commit()
        
        print("All Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    from sqlalchemy import text
    reset_and_seed_db()

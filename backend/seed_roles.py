import json
from sqlalchemy import text
from app.database import engine

STANDARD_ROLES = [
    ("Admin", "Organization Administrator with full access", True, {"all": True}),
    ("Contract Manager", "Full control over contract drafting, review, negotiation, and execution", True, {"contracts": {"view": True, "create": True, "edit": True, "delete": True, "approve": True, "reject": True}}),
    ("Requester", "Create, submit, and track contract requests", True, {"contracts": {"view": True, "create": True, "edit": True}}),
    ("Reviewer", "Review, redline, and provide department feedback on contracts", True, {"contracts": {"view": True, "edit": True, "comment": True}}),
    ("Department Lead", "Approve dependencies and assign department reviewers", True, {"dependencies": {"approve": True, "assign": True}}),
    ("Approver", "Signatory and final executive contract approver", True, {"contracts": {"approve": True, "sign": True}})
]

with engine.connect() as conn:
    org_ids = [row[0] for row in conn.execute(text("SELECT id FROM organizations;")).fetchall()]
    print("Found organizations:", org_ids)
    
    for org_id in org_ids:
        existing_role_names = [r[0].lower().replace("_", " ") for r in conn.execute(text(f"SELECT name FROM roles WHERE org_id = {org_id};")).fetchall()]
        for name, desc, is_sys, perms in STANDARD_ROLES:
            if name.lower() not in existing_role_names:
                conn.execute(
                    text("INSERT INTO roles (org_id, name, description, is_system_role, permissions_json) VALUES (:org_id, :name, :description, :is_sys, :perms)"),
                    {"org_id": org_id, "name": name, "description": desc, "is_sys": is_sys, "perms": json.dumps(perms)}
                )
                print(f"Added role '{name}' to org {org_id}")
                
    conn.commit()
    print("Done! Standard roles seeded successfully.")

with open("app/core/models.py", "r") as f:
    content = f.read()

relationships_to_add = """
    submitted_requests = relationship("app.models.request.ContractRequest", foreign_keys="[app.models.request.ContractRequest.requester_id]", back_populates="requester")
    assigned_requests = relationship("app.models.request.ContractRequest", foreign_keys="[app.models.request.ContractRequest.assigned_to_id]", back_populates="assigned_to")
    login_history = relationship("app.models.user.LoginHistory", back_populates="user", cascade="all, delete-orphan")
"""

# Insert these inside class User(Base):
# Find class User(Base):
user_class_start = content.find("class User(Base):")
# Find the next class to insert before it
next_class_start = content.find("class ", user_class_start + 10)

content = content[:next_class_start] + relationships_to_add + "\n" + content[next_class_start:]

with open("app/core/models.py", "w") as f:
    f.write(content)

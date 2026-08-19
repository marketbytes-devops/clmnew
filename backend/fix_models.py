with open("app/core/models.py", "r") as f:
    core_content = f.read()

# Add extend_existing to all models in app/core/models.py
lines = core_content.split('\n')
new_lines = []
for line in lines:
    new_lines.append(line)
    if line.strip().startswith('__tablename__ = '):
        new_lines.append("    __table_args__ = {'extend_existing': True}")
core_content = '\n'.join(new_lines)

# Fix relationships in core_content
core_content = core_content.replace('relationship("Organization"', 'relationship("app.core.models.Organization"')
core_content = core_content.replace('relationship("User"', 'relationship("app.core.models.User"')
core_content = core_content.replace('relationship("Department"', 'relationship("app.core.models.Department"')
core_content = core_content.replace('relationship("Role"', 'relationship("app.core.models.Role"')
core_content = core_content.replace('relationship("RolePermission"', 'relationship("app.core.models.RolePermission"')
core_content = core_content.replace('relationship("OrganizationSetting"', 'relationship("app.core.models.OrganizationSetting"')
core_content = core_content.replace('relationship("SubscriptionPlan"', 'relationship("app.core.models.SubscriptionPlan"')

with open("app/core/models.py", "w") as f:
    f.write(core_content)

with open("app/models/user.py", "r") as f:
    user_content = f.read()

# Add extend_existing
lines = user_content.split('\n')
new_lines = []
for line in lines:
    new_lines.append(line)
    if line.strip().startswith('__tablename__ = '):
        new_lines.append("    __table_args__ = {'extend_existing': True}")
user_content = '\n'.join(new_lines)

# Fix conflict with core permissions
user_content = user_content.replace('permissions = Column(JSON, nullable=True)', 'permissions_json = Column(JSON, nullable=True)')

# Fix relationships in user_content
user_content = user_content.replace('relationship("User"', 'relationship("app.models.user.User"')
user_content = user_content.replace('relationship("Role"', 'relationship("app.models.user.Role"')
user_content = user_content.replace('relationship("Department"', 'relationship("app.models.user.Department"')

with open("app/models/user.py", "w") as f:
    f.write(user_content)

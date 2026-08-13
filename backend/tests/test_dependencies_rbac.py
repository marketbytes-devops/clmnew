import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User, Role
from app.models.request import RequestDependency, ContractRequest
from app.core.dependencies import get_current_user

# Test users setup
class MockUser:
    def __init__(self, role_name, full_name="Mock User"):
        self.role = type('Role', (), {'name': role_name})()
        self.full_name = full_name
        self.is_active = True

def override_get_cm_user():
    return MockUser("Contract Manager", "Jane CM")

def override_get_approver_1():
    return MockUser("Approver", "Alex Approver")

def override_get_approver_2():
    return MockUser("Approver", "Bob Approver")

def override_get_requester():
    return MockUser("Requester", "Sally Sales")

client = TestClient(app)

# Helper to override the dependency dynamically
def set_user(user_func):
    app.dependency_overrides[get_current_user] = user_func

def test_non_cm_cannot_create_dependency():
    set_user(override_get_requester)
    response = client.post("/api/v1/dependencies/", json={
        "request_id": 1,
        "department": "Engineering",
        "assignee_name": "Alex Approver",
        "task_objective": "Test",
        "sla_deadline": "24 Hours"
    })
    # Since we use RoleChecker, it should return 403
    assert response.status_code == 403

def test_cm_can_create_dependency(mocker):
    set_user(override_get_cm_user)
    # Mock db.add and commit to not actually write to db during test
    mocker.patch('sqlalchemy.orm.Session.add')
    mocker.patch('sqlalchemy.orm.Session.commit')
    def mock_refresh(obj):
        obj.id = 1
    mocker.patch('sqlalchemy.orm.Session.refresh', side_effect=mock_refresh)
    
    response = client.post("/api/v1/dependencies/", json={
        "request_id": 1,
        "department": "Engineering",
        "assignee_name": "Alex Approver",
        "task_objective": "Test",
        "sla_deadline": "24 Hours"
    })
    assert response.status_code == 201

def test_approver_cannot_access_others_dependency(mocker):
    set_user(override_get_approver_2) # Bob trying to access Alex's dependency
    
    # Mock DB query
    mock_dep = RequestDependency(id=1, request_id=1, assignee_name="Alex Approver", department="Engineering", status="Pending")
    mocker.patch('sqlalchemy.orm.Query.first', return_value=mock_dep)
    
    response = client.get("/api/v1/dependencies/1")
    # Must be 404 to hide resource existence
    assert response.status_code == 404

def test_approver_can_access_own_dependency(mocker):
    set_user(override_get_approver_1) # Alex accessing Alex's dependency
    
    mock_dep = RequestDependency(id=1, request_id=1, assignee_name="Alex Approver", department="Engineering", status="Pending")
    mock_req = ContractRequest(id=1, title="Test Req")
    
    # Mocking first() to return dep then req
    mocker.patch('sqlalchemy.orm.Query.first', side_effect=[mock_dep, mock_req])
    
    response = client.get("/api/v1/dependencies/1")
    assert response.status_code == 200

def test_cm_can_access_any_dependency(mocker):
    set_user(override_get_cm_user) # CM accessing Alex's dependency
    
    mock_dep = RequestDependency(id=1, request_id=1, assignee_name="Alex Approver", department="Engineering", status="Pending")
    mock_req = ContractRequest(id=1, title="Test Req")
    
    mocker.patch('sqlalchemy.orm.Query.first', side_effect=[mock_dep, mock_req])
    
    response = client.get("/api/v1/dependencies/1")
    assert response.status_code == 200

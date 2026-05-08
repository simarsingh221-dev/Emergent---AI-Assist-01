"""Backend tests for User Management + Visual Workflow Builder + regression."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"

DEMO_EMAIL = "demo@flowpilot.ai"
DEMO_PASS = "Demo@1234"

state = {}


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# -------------------- AUTH (regression) --------------------
def test_demo_login_supervisor(s):
    r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS}, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["user"]["role"] == "supervisor"
    state["sup_token"] = d["token"]
    state["sup_id"] = d["user"]["id"]


def _hsup():
    return {"Authorization": f"Bearer {state['sup_token']}"}


def _hagent():
    return {"Authorization": f"Bearer {state['agent_token']}"}


# -------------------- USER MANAGEMENT --------------------
def test_users_list_requires_supervisor(s):
    # First create a plain agent (via supervisor-gated /auth/register) to test 403 path
    email = f"test_agent_{uuid.uuid4().hex[:8]}@flowpilot.ai"
    r = s.post(f"{API}/auth/register", headers=_hsup(),
               json={"email": email, "password": "Test1234", "name": "T Agent", "role": "agent"}, timeout=30)
    assert r.status_code == 200
    state["agent_id"] = r.json()["user"]["id"]
    state["agent_email"] = email
    # Login the new agent to get a token
    r_login = s.post(f"{API}/auth/login", json={"email": email, "password": "Test1234"}, timeout=30)
    assert r_login.status_code == 200
    state["agent_token"] = r_login.json()["token"]
    # Agent should be forbidden from listing users
    r2 = s.get(f"{API}/users", headers=_hagent(), timeout=30)
    assert r2.status_code == 403


def test_users_list_no_password_field(s):
    r = s.get(f"{API}/users", headers=_hsup(), timeout=30)
    assert r.status_code == 200
    users = r.json()
    assert isinstance(users, list) and len(users) >= 1
    for u in users:
        assert "password" not in u
        assert "email" in u and "role" in u


def test_create_user(s):
    email = f"test_cu_{uuid.uuid4().hex[:8]}@flowpilot.ai"
    r = s.post(f"{API}/users", headers=_hsup(),
               json={"email": email, "password": "Pass1234", "name": "TEST_New User", "role": "agent"}, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["email"] == email
    assert d["role"] == "agent"
    assert d["active"] is True
    assert "id" in d
    state["created_user_id"] = d["id"]
    state["created_user_email"] = email
    # Verify persistence by listing
    r2 = s.get(f"{API}/users", headers=_hsup(), timeout=30)
    assert any(u["id"] == d["id"] for u in r2.json())


def test_create_user_duplicate_email(s):
    r = s.post(f"{API}/users", headers=_hsup(),
               json={"email": state["created_user_email"], "password": "Pass1234", "name": "Dup", "role": "agent"}, timeout=30)
    assert r.status_code == 400


def test_create_user_invalid_role(s):
    email = f"test_bad_role_{uuid.uuid4().hex[:8]}@flowpilot.ai"
    r = s.post(f"{API}/users", headers=_hsup(),
               json={"email": email, "password": "Pass1234", "name": "X", "role": "ceo"}, timeout=30)
    # backend accepts agent/supervisor/admin only.
    assert r.status_code == 400


def test_create_user_admin_role(s):
    email = f"test_admin_{uuid.uuid4().hex[:8]}@flowpilot.ai"
    r = s.post(f"{API}/users", headers=_hsup(),
               json={"email": email, "password": "Pass1234", "name": "TEST_Admin", "role": "admin"}, timeout=30)
    assert r.status_code == 200, r.text
    assert r.json()["role"] == "admin"
    # Cleanup: delete the admin user
    s.delete(f"{API}/users/{r.json()['id']}", headers=_hsup(), timeout=30)


def test_create_user_login_works(s):
    r = s.post(f"{API}/auth/login", json={"email": state["created_user_email"], "password": "Pass1234"}, timeout=30)
    assert r.status_code == 200, r.text


def test_update_user_name_and_role(s):
    uid = state["created_user_id"]
    r = s.patch(f"{API}/users/{uid}", headers=_hsup(), json={"name": "TEST_Updated", "role": "supervisor"}, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["name"] == "TEST_Updated"
    assert d["role"] == "supervisor"


def test_update_user_invalid_role(s):
    r = s.patch(f"{API}/users/{state['created_user_id']}", headers=_hsup(), json={"role": "owner"}, timeout=30)
    assert r.status_code == 400


def test_update_user_no_fields(s):
    r = s.patch(f"{API}/users/{state['created_user_id']}", headers=_hsup(), json={}, timeout=30)
    assert r.status_code == 400


def test_update_user_not_found(s):
    r = s.patch(f"{API}/users/does-not-exist", headers=_hsup(), json={"name": "X"}, timeout=30)
    assert r.status_code == 404


def test_update_user_deactivate_then_login_blocked(s):
    uid = state["created_user_id"]
    r = s.patch(f"{API}/users/{uid}", headers=_hsup(), json={"active": False}, timeout=30)
    assert r.status_code == 200
    assert r.json()["active"] is False
    # Login should be blocked
    r2 = s.post(f"{API}/auth/login", json={"email": state["created_user_email"], "password": "Pass1234"}, timeout=30)
    assert r2.status_code == 403
    # reactivate
    r3 = s.patch(f"{API}/users/{uid}", headers=_hsup(), json={"active": True}, timeout=30)
    assert r3.status_code == 200


def test_reset_password(s):
    uid = state["created_user_id"]
    r = s.post(f"{API}/users/{uid}/reset-password", headers=_hsup(), json={"new_password": "NewPass99"}, timeout=30)
    assert r.status_code == 200
    # Old password should fail
    r2 = s.post(f"{API}/auth/login", json={"email": state["created_user_email"], "password": "Pass1234"}, timeout=30)
    assert r2.status_code == 401
    # New password should work
    r3 = s.post(f"{API}/auth/login", json={"email": state["created_user_email"], "password": "NewPass99"}, timeout=30)
    assert r3.status_code == 200


def test_reset_password_too_short(s):
    r = s.post(f"{API}/users/{state['created_user_id']}/reset-password", headers=_hsup(), json={"new_password": "abc"}, timeout=30)
    assert r.status_code == 400


def test_reset_password_user_not_found(s):
    r = s.post(f"{API}/users/missing/reset-password", headers=_hsup(), json={"new_password": "abcdef"}, timeout=30)
    assert r.status_code == 404


def test_delete_self_blocked(s):
    r = s.delete(f"{API}/users/{state['sup_id']}", headers=_hsup(), timeout=30)
    assert r.status_code == 400


def test_delete_user(s):
    uid = state["created_user_id"]
    r = s.delete(f"{API}/users/{uid}", headers=_hsup(), timeout=30)
    assert r.status_code == 200
    # Should no longer appear in list
    r2 = s.get(f"{API}/users", headers=_hsup(), timeout=30)
    assert all(u["id"] != uid for u in r2.json())
    # Login with deleted user should fail
    r3 = s.post(f"{API}/auth/login", json={"email": state["created_user_email"], "password": "NewPass99"}, timeout=30)
    assert r3.status_code == 401


# -------------------- WORKFLOW BUILDER --------------------
def test_list_workflows_seeds(s):
    r = s.get(f"{API}/workflows", headers=_hagent(), timeout=30)
    assert r.status_code == 200
    wfs = r.json()
    ids = {w["id"] for w in wfs}
    # Code seeds: kyc, loan, claims, retention, general (request misc text mentioned 'Refund Request' which is incorrect)
    assert {"kyc", "loan", "claims", "retention", "general"} <= ids
    # Validate shape
    sample = next(w for w in wfs if w["id"] == "kyc")
    assert "steps" in sample and isinstance(sample["steps"], list) and len(sample["steps"]) > 0
    assert "compliance_items" in sample and isinstance(sample["compliance_items"], list)
    assert sample.get("active") is True


def test_get_workflow_by_id(s):
    r = s.get(f"{API}/workflows/kyc", headers=_hagent(), timeout=30)
    assert r.status_code == 200
    assert r.json()["id"] == "kyc"


def test_get_workflow_not_found(s):
    r = s.get(f"{API}/workflows/bogus-xyz", headers=_hagent(), timeout=30)
    assert r.status_code == 404


def test_create_workflow_requires_supervisor(s):
    r = s.post(f"{API}/workflows", headers=_hagent(), json={
        "name": "TEST_Refund Request", "description": "", "category": "CX",
        "steps": [{"label": "Greet", "required": True}],
        "compliance_items": ["Recording consent"], "active": True
    }, timeout=30)
    assert r.status_code == 403


def test_create_workflow(s):
    r = s.post(f"{API}/workflows", headers=_hsup(), json={
        "name": "TEST_Refund Request", "description": "Process customer refunds", "category": "CX",
        "steps": [
            {"label": "Greet customer", "description": "Warm intro", "trigger_keywords": ["hi", "hello"], "required": True},
            {"label": "Collect order ID", "description": "", "trigger_keywords": ["order"], "required": True},
            {"label": "Verify eligibility", "description": "", "trigger_keywords": [], "required": True}
        ],
        "compliance_items": ["Privacy policy disclosure", "Recording consent"],
        "active": True
    }, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["name"] == "TEST_Refund Request"
    assert len(d["steps"]) == 3
    assert d["is_seed"] is False
    state["wf_id"] = d["id"]


def test_update_workflow(s):
    wid = state["wf_id"]
    r = s.patch(f"{API}/workflows/{wid}", headers=_hsup(), json={
        "name": "TEST_Refund Request v2", "description": "v2", "category": "CX",
        "steps": [
            {"label": "Greet customer", "required": True},
            {"label": "Collect order ID", "required": True},
            {"label": "Issue refund", "required": True},
            {"label": "Confirm via email", "required": False}
        ],
        "compliance_items": ["Recording consent"],
        "active": True
    }, timeout=30)
    assert r.status_code == 200
    d = r.json()
    assert d["name"] == "TEST_Refund Request v2"
    assert len(d["steps"]) == 4


def test_update_workflow_not_found(s):
    r = s.patch(f"{API}/workflows/no-such-wf", headers=_hsup(), json={
        "name": "X", "steps": [], "compliance_items": [], "active": True
    }, timeout=30)
    assert r.status_code == 404


def test_delete_seed_workflow_soft_disables(s):
    r = s.delete(f"{API}/workflows/general", headers=_hsup(), timeout=30)
    assert r.status_code == 200
    body = r.json()
    assert body.get("deactivated") is True
    # Should not appear in active list anymore
    r2 = s.get(f"{API}/workflows", headers=_hagent(), timeout=30)
    ids = {w["id"] for w in r2.json()}
    assert "general" not in ids
    # But GET by id should still return doc (just inactive)
    r3 = s.get(f"{API}/workflows/general", headers=_hagent(), timeout=30)
    assert r3.status_code == 200
    assert r3.json().get("active") is False
    # Re-activate to leave seed clean (PATCH back active)
    s.patch(f"{API}/workflows/general", headers=_hsup(), json={
        "name": r3.json()["name"], "description": r3.json().get("description", ""),
        "category": r3.json().get("category", "CX"),
        "steps": r3.json()["steps"], "compliance_items": r3.json()["compliance_items"], "active": True
    }, timeout=30)


def test_delete_custom_workflow_hard_deletes(s):
    wid = state["wf_id"]
    r = s.delete(f"{API}/workflows/{wid}", headers=_hsup(), timeout=30)
    assert r.status_code == 200
    body = r.json()
    assert body.get("deleted") is True
    r2 = s.get(f"{API}/workflows/{wid}", headers=_hagent(), timeout=30)
    assert r2.status_code == 404


# -------------------- REGRESSION --------------------
def test_regression_kb_list(s):
    r = s.get(f"{API}/kb/documents", headers=_hagent(), timeout=30)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_regression_create_call_and_analyze(s):
    r = s.post(f"{API}/calls", headers=_hagent(),
               json={"channel": "voice", "customer_name": "RegTest", "workflow": "retention"}, timeout=30)
    assert r.status_code == 200
    cid = r.json()["id"]
    for sp, tx in [("agent", "Hello, thanks for calling. How can I help?"),
                   ("customer", "I want to cancel my credit card."),
                   ("agent", "I understand. Let me verify your identity.")]:
        ru = s.post(f"{API}/calls/{cid}/utterance", headers=_hagent(),
                    json={"speaker": sp, "text": tx}, timeout=30)
        assert ru.status_code == 200
    ra = s.post(f"{API}/calls/{cid}/analyze", headers=_hagent(), timeout=120)
    assert ra.status_code == 200, ra.text
    a = ra.json()
    assert "intent" in a and "compliance" in a and "next_best_actions" in a

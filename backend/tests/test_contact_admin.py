"""Backend tests for new Contact endpoints + Admin role + Settings/assist access."""
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


def _hsup():
    return {"Authorization": f"Bearer {state['sup_token']}"}


def _hagent():
    return {"Authorization": f"Bearer {state['agent_token']}"}


def _hadmin():
    return {"Authorization": f"Bearer {state['admin_token']}"}


# ---------- Setup: get supervisor + agent tokens ----------
def test_setup_supervisor_login(s):
    r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS}, timeout=30)
    assert r.status_code == 200
    state["sup_token"] = r.json()["token"]
    state["sup_id"] = r.json()["user"]["id"]


def test_setup_create_agent(s):
    email = f"test_agent_{uuid.uuid4().hex[:8]}@flowpilot.ai"
    r = s.post(f"{API}/auth/register",
               json={"email": email, "password": "Pass1234", "name": "T Agent", "role": "agent"}, timeout=30)
    assert r.status_code == 200
    state["agent_token"] = r.json()["token"]
    state["agent_id"] = r.json()["user"]["id"]


# ---------- /api/contact (PUBLIC) ----------
def test_contact_submit_ok(s):
    payload = {
        "name": "TEST_Alice",
        "email": f"test_contact_{uuid.uuid4().hex[:6]}@example.com",
        "company": "Acme",
        "phone": "+91-9999999999",
        "message": "Want a demo of FlowPilot."
    }
    r = s.post(f"{API}/contact", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d.get("ok") is True
    assert isinstance(d.get("id"), str) and len(d["id"]) > 0
    state["contact_id"] = d["id"]
    state["contact_email"] = payload["email"]


def test_contact_no_auth_required(s):
    # Verify it is truly public (no auth header)
    payload = {"name": "TEST_Pub", "email": "pub@example.com", "message": "Hi"}
    r = requests.post(f"{API}/contact", json=payload, timeout=30)
    assert r.status_code == 200


def test_contact_missing_name(s):
    r = s.post(f"{API}/contact", json={"name": "  ", "email": "x@y.com", "message": "hello"}, timeout=30)
    assert r.status_code == 400


def test_contact_missing_message(s):
    r = s.post(f"{API}/contact", json={"name": "X", "email": "x@y.com", "message": ""}, timeout=30)
    assert r.status_code == 400


def test_contact_invalid_email(s):
    r = s.post(f"{API}/contact", json={"name": "X", "email": "not-an-email", "message": "hi"}, timeout=30)
    assert r.status_code == 422


# ---------- /api/contacts (auth) ----------
def test_contacts_list_no_auth_blocked(s):
    r = requests.get(f"{API}/contacts", timeout=30)
    assert r.status_code == 401


def test_contacts_list_agent_forbidden(s):
    r = s.get(f"{API}/contacts", headers=_hagent(), timeout=30)
    assert r.status_code == 403


def test_contacts_list_supervisor(s):
    r = s.get(f"{API}/contacts", headers=_hsup(), timeout=30)
    assert r.status_code == 200
    contacts = r.json()
    assert isinstance(contacts, list)
    # Should contain our created contact
    assert any(c.get("id") == state["contact_id"] for c in contacts)
    # Most-recent first: check created_at descending
    if len(contacts) > 1:
        for i in range(len(contacts) - 1):
            assert contacts[i]["created_at"] >= contacts[i + 1]["created_at"]
    # No mongo _id leaked
    for c in contacts:
        assert "_id" not in c


# ---------- ADMIN ROLE ----------
def test_create_user_admin_role(s):
    email = f"test_admin_{uuid.uuid4().hex[:8]}@flowpilot.ai"
    r = s.post(f"{API}/users", headers=_hsup(),
               json={"email": email, "password": "Admin1234", "name": "TEST_Admin", "role": "admin"}, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["role"] == "admin"
    assert d["active"] is True
    state["admin_id"] = d["id"]
    state["admin_email"] = email


def test_create_user_invalid_role_ceo(s):
    email = f"test_ceo_{uuid.uuid4().hex[:8]}@flowpilot.ai"
    r = s.post(f"{API}/users", headers=_hsup(),
               json={"email": email, "password": "Pass1234", "name": "X", "role": "ceo"}, timeout=30)
    assert r.status_code == 400


def test_admin_can_login(s):
    r = s.post(f"{API}/auth/login", json={"email": state["admin_email"], "password": "Admin1234"}, timeout=30)
    assert r.status_code == 200
    state["admin_token"] = r.json()["token"]
    assert r.json()["user"]["role"] == "admin"


def test_admin_can_list_users(s):
    r = s.get(f"{API}/users", headers=_hadmin(), timeout=30)
    assert r.status_code == 200
    assert isinstance(r.json(), list) and len(r.json()) >= 1


def test_admin_can_list_contacts(s):
    r = s.get(f"{API}/contacts", headers=_hadmin(), timeout=30)
    assert r.status_code == 200


def test_admin_can_update_settings_assist(s):
    r = s.put(f"{API}/settings/assist", headers=_hadmin(), json={"mode": "click"}, timeout=30)
    assert r.status_code == 200, r.text
    assert r.json().get("mode") == "click"
    # Toggle back
    r2 = s.put(f"{API}/settings/assist", headers=_hadmin(), json={"mode": "auto"}, timeout=30)
    assert r2.status_code == 200


def test_agent_cannot_update_settings_assist(s):
    r = s.put(f"{API}/settings/assist", headers=_hagent(), json={"mode": "click"}, timeout=30)
    assert r.status_code == 403


def test_patch_user_agent_to_admin_and_back(s):
    # Create a temp agent, promote to admin, then back to agent
    email = f"test_promote_{uuid.uuid4().hex[:8]}@flowpilot.ai"
    r = s.post(f"{API}/users", headers=_hsup(),
               json={"email": email, "password": "Pass1234", "name": "TEST_Promote", "role": "agent"}, timeout=30)
    assert r.status_code == 200
    uid = r.json()["id"]
    r2 = s.patch(f"{API}/users/{uid}", headers=_hsup(), json={"role": "admin"}, timeout=30)
    assert r2.status_code == 200
    assert r2.json()["role"] == "admin"
    r3 = s.patch(f"{API}/users/{uid}", headers=_hsup(), json={"role": "agent"}, timeout=30)
    assert r3.status_code == 200
    assert r3.json()["role"] == "agent"
    s.delete(f"{API}/users/{uid}", headers=_hsup(), timeout=30)


def test_register_admin_role(s):
    email = f"test_radm_{uuid.uuid4().hex[:8]}@flowpilot.ai"
    r = s.post(f"{API}/auth/register",
               json={"email": email, "password": "Pass1234", "name": "TEST_RegAdmin", "role": "admin"}, timeout=30)
    assert r.status_code == 200, r.text
    assert r.json()["user"]["role"] == "admin"


# ---------- Cleanup ----------
def test_zz_cleanup_admin(s):
    if state.get("admin_id"):
        s.delete(f"{API}/users/{state['admin_id']}", headers=_hsup(), timeout=30)

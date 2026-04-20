"""VanguardCX backend E2E tests."""
import os
import io
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://assist-flow.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

AGENT_EMAIL = f"test_agent_{uuid.uuid4().hex[:8]}@vanguard.ai"
SUP_EMAIL = f"test_sup_{uuid.uuid4().hex[:8]}@vanguard.ai"
PASSWORD = "Test1234"

state = {}


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# Auth
def test_register_agent(s):
    r = s.post(f"{API}/auth/register", json={"email": AGENT_EMAIL, "password": PASSWORD, "name": "Tester", "role": "agent"}, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "token" in d and d["user"]["role"] == "agent"
    state["agent_token"] = d["token"]
    state["agent_id"] = d["user"]["id"]


def test_register_supervisor(s):
    r = s.post(f"{API}/auth/register", json={"email": SUP_EMAIL, "password": PASSWORD, "name": "Sup", "role": "supervisor"}, timeout=30)
    assert r.status_code == 200
    state["sup_token"] = r.json()["token"]


def test_register_duplicate(s):
    r = s.post(f"{API}/auth/register", json={"email": AGENT_EMAIL, "password": PASSWORD, "name": "X"}, timeout=30)
    assert r.status_code == 400


def test_login(s):
    r = s.post(f"{API}/auth/login", json={"email": AGENT_EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200
    assert "token" in r.json()


def test_login_bad(s):
    r = s.post(f"{API}/auth/login", json={"email": AGENT_EMAIL, "password": "wrong"}, timeout=30)
    assert r.status_code == 401


def test_me(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.get(f"{API}/auth/me", headers=h, timeout=30)
    assert r.status_code == 200
    assert r.json()["email"] == AGENT_EMAIL


def test_me_no_token(s):
    r = s.get(f"{API}/auth/me", timeout=30)
    assert r.status_code == 401


# KB
def test_kb_seed(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.post(f"{API}/kb/seed", headers=h, timeout=30)
    assert r.status_code == 200
    assert "seeded" in r.json()


def test_kb_list(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.get(f"{API}/kb/documents", headers=h, timeout=30)
    assert r.status_code == 200
    docs = r.json()
    assert isinstance(docs, list) and len(docs) >= 5


def test_kb_upload(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    files = {"file": ("test.txt", io.BytesIO(b"TEST_ This is a test KB document for refund policy. Refund within 30 days."), "text/plain")}
    data = {"title": "TEST_Refund Policy", "category": "CX"}
    r = s.post(f"{API}/kb/upload", headers=h, files=files, data=data, timeout=30)
    assert r.status_code == 200, r.text
    state["kb_doc_id"] = r.json()["id"]


def test_kb_search(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.post(f"{API}/kb/search", headers=h, json={"query": "retention credit card fee waiver"}, timeout=60)
    assert r.status_code == 200
    d = r.json()
    assert "answer" in d and "sources" in d


def test_kb_delete(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.delete(f"{API}/kb/documents/{state['kb_doc_id']}", headers=h, timeout=30)
    assert r.status_code == 200


# Calls
def test_create_call(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.post(f"{API}/calls", headers=h, json={"channel": "voice", "customer_name": "John Doe", "workflow": "retention"}, timeout=30)
    assert r.status_code == 200
    c = r.json()
    assert c["status"] == "active"
    state["call_id"] = c["id"]


def test_list_calls(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.get(f"{API}/calls", headers=h, timeout=30)
    assert r.status_code == 200
    assert any(c["id"] == state["call_id"] for c in r.json())


def test_active_calls(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.get(f"{API}/calls/active", headers=h, timeout=30)
    assert r.status_code == 200


def test_get_call(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.get(f"{API}/calls/{state['call_id']}", headers=h, timeout=30)
    assert r.status_code == 200
    assert r.json()["id"] == state["call_id"]


def test_add_utterances(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    for sp, tx in [("agent", "Hello, thanks for calling VanguardCX. How can I help?"),
                   ("customer", "I want to close my credit card because the annual fee is too high."),
                   ("agent", "I understand. Let me verify your identity first.")]:
        r = s.post(f"{API}/calls/{state['call_id']}/utterance", headers=h, json={"speaker": sp, "text": tx}, timeout=30)
        assert r.status_code == 200


def test_analyze_call(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.post(f"{API}/calls/{state['call_id']}/analyze", headers=h, timeout=90)
    assert r.status_code == 200, r.text
    a = r.json()
    assert "intent" in a and "sentiment" in a
    assert "next_best_actions" in a
    assert "compliance" in a


def test_summary(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.post(f"{API}/calls/{state['call_id']}/summary", headers=h, timeout=90)
    assert r.status_code == 200, r.text
    out = r.json()
    assert "summary" in out


def test_end_call(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    # Create fresh call to test end independently
    r0 = s.post(f"{API}/calls", headers=h, json={"channel": "chat"}, timeout=30)
    cid = r0.json()["id"]
    r = s.post(f"{API}/calls/{cid}/end", headers=h, timeout=30)
    assert r.status_code == 200


# Analytics
def test_analytics(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.get(f"{API}/analytics/overview", headers=h, timeout=30)
    assert r.status_code == 200
    d = r.json()
    for k in ["total_calls", "active_calls", "completed_calls", "sentiment", "escalation", "channels"]:
        assert k in d


# Workflows
def test_workflows(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.get(f"{API}/workflows", headers=h, timeout=30)
    assert r.status_code == 200
    wfs = r.json()
    ids = {w["id"] for w in wfs}
    assert {"kyc", "loan", "claims", "retention", "general"} <= ids


# Integrations
def test_providers(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.get(f"{API}/integrations/providers", headers=h, timeout=30)
    assert r.status_code == 200
    assert len(r.json()) == 8


def test_webhook_crud(s):
    h = {"Authorization": f"Bearer {state['agent_token']}"}
    r = s.post(f"{API}/integrations/webhooks", headers=h, json={"name": "TEST_hook", "url": "https://example.com/hk", "events": ["call.ended"]}, timeout=30)
    assert r.status_code == 200
    wid = r.json()["id"]
    r2 = s.get(f"{API}/integrations/webhooks", headers=h, timeout=30)
    assert r2.status_code == 200 and any(w["id"] == wid for w in r2.json())
    r3 = s.delete(f"{API}/integrations/webhooks/{wid}", headers=h, timeout=30)
    assert r3.status_code == 200

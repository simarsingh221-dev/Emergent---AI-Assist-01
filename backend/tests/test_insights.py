"""Tests for FlowPilot Conversation Intelligence (insights.py).

Covers: Categories CRUD + RBAC, Explorer search/detail + agent scoping,
Scorecard agents/agent + RBAC, Analytics trends, Auto-tagging on call end,
Recompute, and confirmation that Copilot endpoints are removed.
"""
import os
import uuid
import pytest
import requests

BASE_URL = (os.environ.get('REACT_APP_BACKEND_URL')
            or open('/app/frontend/.env').read().split('REACT_APP_BACKEND_URL=')[1].split()[0]).rstrip('/')
API = f"{BASE_URL}/api"

SUP_EMAIL = "demo@flowpilot.ai"
SUP_PASSWORD = "Demo@1234"
ADMIN_EMAIL = "admin@flowpilot.co.in"
ADMIN_PASSWORD = "Admin@2026!"
AGENT_EMAIL = "copilot_agent@flowpilot.ai"
AGENT_PASSWORD = "Agent1234"


def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, f"login failed for {email}: {r.text}"
    return r.json()


@pytest.fixture(scope="module")
def sup():
    d = _login(SUP_EMAIL, SUP_PASSWORD)
    return {"token": d["token"], "id": d["user"]["id"], "h": {"Authorization": f"Bearer {d['token']}"}}


@pytest.fixture(scope="module")
def admin():
    d = _login(ADMIN_EMAIL, ADMIN_PASSWORD)
    return {"token": d["token"], "id": d["user"]["id"], "h": {"Authorization": f"Bearer {d['token']}"}}


@pytest.fixture(scope="module")
def agent():
    d = _login(AGENT_EMAIL, AGENT_PASSWORD)
    return {"token": d["token"], "id": d["user"]["id"], "h": {"Authorization": f"Bearer {d['token']}"}}


# ============================== COPILOT REMOVAL ==============================
class TestCopilotRemoved:
    def test_copilot_chat_404(self, sup):
        r = requests.post(f"{API}/copilot/chat", headers=sup["h"], json={"message": "hi"}, timeout=15)
        assert r.status_code == 404

    def test_copilot_sessions_404(self, sup):
        r = requests.get(f"{API}/copilot/sessions", headers=sup["h"], timeout=15)
        assert r.status_code == 404


# ============================== CATEGORIES ==============================
class TestCategories:
    def test_list_seeds_six(self, sup):
        r = requests.get(f"{API}/categories", headers=sup["h"], timeout=30)
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list)
        names = {c["name"] for c in cats}
        expected = {"Refund Request", "Cancellation", "Complaint",
                    "KYC / Identity", "Retention Save", "Tech Issue"}
        assert expected.issubset(names), f"missing: {expected - names}"
        for c in cats:
            if c["name"] in expected:
                assert c.get("is_seed") is True
                assert "id" in c and "color" in c and isinstance(c.get("keywords"), list)

    def test_agent_can_list(self, agent):
        r = requests.get(f"{API}/categories", headers=agent["h"], timeout=30)
        assert r.status_code == 200
        assert len(r.json()) >= 6

    def test_create_requires_supervisor(self, agent):
        r = requests.post(f"{API}/categories", headers=agent["h"],
                          json={"name": "TEST_blocked", "keywords": ["x"]}, timeout=30)
        assert r.status_code == 403

    def test_create_update_delete_custom(self, sup):
        name = f"TEST_cat_{uuid.uuid4().hex[:6]}"
        r = requests.post(f"{API}/categories", headers=sup["h"],
                          json={"name": name, "keywords": ["foo", "bar baz"],
                                "color": "#123456", "description": "desc"}, timeout=30)
        assert r.status_code == 200
        cat = r.json()
        assert cat["name"] == name
        assert cat["keywords"] == ["foo", "bar baz"]
        assert cat["color"] == "#123456"
        assert cat.get("is_seed") is False
        cid = cat["id"]

        # Verify via GET
        r2 = requests.get(f"{API}/categories", headers=sup["h"], timeout=30)
        assert any(c["id"] == cid and c["name"] == name for c in r2.json())

        # PATCH
        r3 = requests.patch(f"{API}/categories/{cid}", headers=sup["h"],
                            json={"name": name + "_upd", "color": "#abcdef"}, timeout=30)
        assert r3.status_code == 200
        upd = r3.json()
        assert upd["name"] == name + "_upd"
        assert upd["color"] == "#abcdef"
        assert upd["keywords"] == ["foo", "bar baz"]  # unchanged

        # PATCH empty body -> 400
        r3b = requests.patch(f"{API}/categories/{cid}", headers=sup["h"], json={}, timeout=30)
        assert r3b.status_code == 400

        # DELETE (custom -> hard)
        r4 = requests.delete(f"{API}/categories/{cid}", headers=sup["h"], timeout=30)
        assert r4.status_code == 200
        body = r4.json()
        assert body.get("ok") is True
        assert body.get("soft") is False

        # Verify gone
        r5 = requests.get(f"{API}/categories", headers=sup["h"], timeout=30)
        assert not any(c["id"] == cid for c in r5.json())

    def test_patch_404(self, sup):
        r = requests.patch(f"{API}/categories/does-not-exist-{uuid.uuid4().hex[:6]}",
                           headers=sup["h"], json={"name": "x"}, timeout=30)
        assert r.status_code == 404

    def test_delete_seed_soft_disables(self, sup):
        # Get a seed category
        cats = requests.get(f"{API}/categories", headers=sup["h"], timeout=30).json()
        seed = next((c for c in cats if c.get("is_seed")), None)
        assert seed, "no seed category found"
        seed_id = seed["id"]
        r = requests.delete(f"{API}/categories/{seed_id}", headers=sup["h"], timeout=30)
        assert r.status_code == 200
        body = r.json()
        assert body.get("ok") is True
        assert body.get("soft") is True
        # Now hidden from list (active=false)
        cats2 = requests.get(f"{API}/categories", headers=sup["h"], timeout=30).json()
        assert not any(c["id"] == seed_id for c in cats2)
        # Re-enable for other tests
        r_re = requests.patch(f"{API}/categories/{seed_id}", headers=sup["h"],
                              json={"active": True}, timeout=30)
        assert r_re.status_code == 200

    def test_delete_404(self, sup):
        r = requests.delete(f"{API}/categories/nope-{uuid.uuid4().hex[:6]}",
                            headers=sup["h"], timeout=30)
        assert r.status_code == 404

    def test_recompute_requires_supervisor(self, agent):
        r = requests.post(f"{API}/categories/recompute", headers=agent["h"], timeout=60)
        assert r.status_code == 403

    def test_recompute_returns_counts(self, sup):
        r = requests.post(f"{API}/categories/recompute", headers=sup["h"], timeout=120)
        assert r.status_code == 200
        d = r.json()
        assert "updated" in d and "categories" in d
        assert isinstance(d["updated"], int) and isinstance(d["categories"], int)
        assert d["categories"] >= 6


# ============================== EXPLORER ==============================
class TestExplorer:
    def test_search_no_query(self, sup):
        r = requests.post(f"{API}/explorer/search", headers=sup["h"],
                          json={"q": "", "days": 0, "page": 1, "page_size": 5}, timeout=60)
        assert r.status_code == 200
        d = r.json()
        for k in ["total", "page", "page_size", "results"]:
            assert k in d
        assert isinstance(d["results"], list)
        assert d["page"] == 1 and d["page_size"] == 5
        assert d["total"] >= 0
        if d["results"]:
            row = d["results"][0]
            for k in ["id", "channel", "started_at", "sentiment", "categories"]:
                assert k in row

    def test_search_pagination(self, sup):
        r1 = requests.post(f"{API}/explorer/search", headers=sup["h"],
                           json={"q": "", "days": 0, "page": 1, "page_size": 2}, timeout=60).json()
        if r1["total"] > 2:
            r2 = requests.post(f"{API}/explorer/search", headers=sup["h"],
                               json={"q": "", "days": 0, "page": 2, "page_size": 2}, timeout=60).json()
            assert r2["page"] == 2
            ids1 = {r["id"] for r in r1["results"]}
            ids2 = {r["id"] for r in r2["results"]}
            assert ids1.isdisjoint(ids2), "pagination overlap"

    def test_search_filters(self, sup):
        r = requests.post(f"{API}/explorer/search", headers=sup["h"],
                          json={"q": "", "days": 0, "sentiment": ["negative"],
                                "page": 1, "page_size": 50}, timeout=60)
        assert r.status_code == 200
        for row in r.json()["results"]:
            if row.get("sentiment") is not None:
                assert row["sentiment"] == "negative"

    def test_search_with_query_returns_snippet(self, sup):
        r = requests.post(f"{API}/explorer/search", headers=sup["h"],
                          json={"q": "refund", "days": 0, "page": 1, "page_size": 5}, timeout=60)
        assert r.status_code == 200
        results = r.json()["results"]
        for row in results:
            # If transcript matched query, snippet should be present
            if row.get("transcript_len", 0) > 0:
                assert "snippet" in row

    def test_search_category_filter(self, sup):
        cats = requests.get(f"{API}/categories", headers=sup["h"], timeout=30).json()
        if not cats:
            pytest.skip("no categories")
        cid = cats[0]["id"]
        r = requests.post(f"{API}/explorer/search", headers=sup["h"],
                          json={"q": "", "days": 0, "categories": [cid],
                                "page": 1, "page_size": 50}, timeout=60)
        assert r.status_code == 200
        for row in r.json()["results"]:
            assert cid in (row.get("categories") or [])

    def test_search_agent_scoped(self, agent):
        r = requests.post(f"{API}/explorer/search", headers=agent["h"],
                          json={"q": "", "days": 0, "page": 1, "page_size": 100}, timeout=60)
        assert r.status_code == 200
        for row in r.json()["results"]:
            assert row.get("agent_id") == agent["id"], "agent saw another agent's call"

    def test_call_detail(self, sup):
        s = requests.post(f"{API}/explorer/search", headers=sup["h"],
                          json={"q": "", "days": 0, "page": 1, "page_size": 1}, timeout=60).json()
        if not s["results"]:
            pytest.skip("no calls")
        cid = s["results"][0]["id"]
        r = requests.get(f"{API}/explorer/call/{cid}", headers=sup["h"], timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == cid
        assert "_id" not in d  # mongo ObjectId excluded

    def test_call_detail_404(self, sup):
        r = requests.get(f"{API}/explorer/call/does-not-exist-{uuid.uuid4().hex[:8]}",
                         headers=sup["h"], timeout=30)
        assert r.status_code == 404

    def test_call_detail_agent_scope_blocks_others(self, sup, agent):
        # Find a call NOT belonging to agent
        s = requests.post(f"{API}/explorer/search", headers=sup["h"],
                          json={"q": "", "days": 0, "page": 1, "page_size": 100}, timeout=60).json()
        other = next((r for r in s["results"] if r.get("agent_id") and r["agent_id"] != agent["id"]), None)
        if not other:
            pytest.skip("no other-agent call to test scope")
        r = requests.get(f"{API}/explorer/call/{other['id']}", headers=agent["h"], timeout=30)
        assert r.status_code == 404


# ============================== SCORECARD ==============================
class TestScorecard:
    def test_agents_requires_supervisor(self, agent):
        r = requests.get(f"{API}/scorecard/agents?days=30", headers=agent["h"], timeout=30)
        assert r.status_code == 403

    def test_agents_rollup(self, sup):
        r = requests.get(f"{API}/scorecard/agents?days=30", headers=sup["h"], timeout=60)
        assert r.status_code == 200
        rows = r.json()
        assert isinstance(rows, list) and len(rows) >= 1
        for row in rows:
            for k in ["agent_id", "agent_name", "total_calls", "negative_pct",
                      "high_escalation_pct", "avg_duration_sec"]:
                assert k in row
            assert 0 <= row["negative_pct"] <= 100
            assert 0 <= row["high_escalation_pct"] <= 100
        # sorted desc by volume
        vols = [r["total_calls"] for r in rows]
        assert vols == sorted(vols, reverse=True)

    def test_agent_scorecard_self(self, agent):
        r = requests.get(f"{API}/scorecard/agent/{agent['id']}?days=30",
                         headers=agent["h"], timeout=60)
        assert r.status_code == 200
        d = r.json()
        for k in ["agent", "total_calls", "avg_duration_sec", "sentiment",
                  "escalation", "top_categories", "window_days"]:
            assert k in d
        assert d["window_days"] == 30
        assert set(d["sentiment"].keys()) >= {"positive", "neutral", "negative", "frustrated"}
        assert set(d["escalation"].keys()) >= {"low", "medium", "high"}

    def test_agent_cannot_view_other(self, sup, agent):
        # Find another agent_id (any user with role agent that isn't this one)
        users = requests.get(f"{API}/users", headers=sup["h"], timeout=30)
        if users.status_code != 200:
            pytest.skip("/api/users not accessible")
        other = next((u for u in users.json() if u.get("role") == "agent" and u["id"] != agent["id"]), None)
        if not other:
            pytest.skip("no other agent")
        r = requests.get(f"{API}/scorecard/agent/{other['id']}?days=30",
                         headers=agent["h"], timeout=30)
        assert r.status_code == 403

    def test_supervisor_can_view_any_agent(self, sup, agent):
        r = requests.get(f"{API}/scorecard/agent/{agent['id']}?days=30",
                         headers=sup["h"], timeout=30)
        assert r.status_code == 200


# ============================== TRENDS ==============================
class TestTrends:
    def test_trends_supervisor(self, sup):
        r = requests.get(f"{API}/analytics/trends?days=14", headers=sup["h"], timeout=60)
        assert r.status_code == 200
        d = r.json()
        for k in ["window_days", "sentiment_trend", "category_mix",
                  "top_compliance_misses", "total_calls"]:
            assert k in d
        assert d["window_days"] == 14
        assert isinstance(d["sentiment_trend"], list)
        assert isinstance(d["category_mix"], list)
        # Each sentiment bucket has expected shape
        for b in d["sentiment_trend"]:
            for k in ["date", "total", "positive", "neutral", "negative",
                      "frustrated", "low", "medium", "high"]:
                assert k in b
        # Category mix has color/name
        for cm in d["category_mix"]:
            assert "id" in cm and "name" in cm and "color" in cm and "count" in cm

    def test_trends_agent_scoped(self, agent, sup):
        r_sup = requests.get(f"{API}/analytics/trends?days=90", headers=sup["h"], timeout=60).json()
        r_ag = requests.get(f"{API}/analytics/trends?days=90", headers=agent["h"], timeout=60).json()
        assert r_ag["total_calls"] <= r_sup["total_calls"]


# ============================== AUTO-TAGGING ==============================
class TestAutoTagging:
    def test_categories_auto_set_on_end_call(self, sup):
        # Create a call as supervisor, add utterances mentioning refund + cancel,
        # then end it and verify categories[] is populated by tag_call_with_categories.
        r = requests.post(f"{API}/calls", headers=sup["h"],
                          json={"channel": "voice", "customer_name": "TEST_AutoTag"}, timeout=30)
        assert r.status_code == 200
        cid = r.json()["id"]
        for sp, tx in [("customer", "I would like a refund please, return my money."),
                       ("customer", "Actually please cancel and close my account."),
                       ("agent", "Sure I can help with the refund.")]:
            requests.post(f"{API}/calls/{cid}/utterance", headers=sup["h"],
                          json={"speaker": sp, "text": tx}, timeout=30)
        r2 = requests.post(f"{API}/calls/{cid}/end", headers=sup["h"], timeout=30)
        assert r2.status_code == 200
        # Fetch via explorer detail
        det = requests.get(f"{API}/explorer/call/{cid}", headers=sup["h"], timeout=30).json()
        cats = det.get("categories") or []
        # Map seed names to ids
        all_cats = requests.get(f"{API}/categories", headers=sup["h"], timeout=30).json()
        by_name = {c["name"]: c["id"] for c in all_cats}
        assert by_name["Refund Request"] in cats, f"refund not auto-tagged, got: {cats}"
        assert by_name["Cancellation"] in cats, f"cancel not auto-tagged, got: {cats}"

    def test_recompute_after_keyword_change(self, sup):
        # Create custom category, recompute, verify call tagged
        name = f"TEST_unique_{uuid.uuid4().hex[:6]}"
        marker = f"zzzmarker{uuid.uuid4().hex[:6]}"
        c_resp = requests.post(f"{API}/categories", headers=sup["h"],
                               json={"name": name, "keywords": [marker]}, timeout=30)
        assert c_resp.status_code == 200
        cat_id = c_resp.json()["id"]
        try:
            # Create call containing the marker, end it
            r = requests.post(f"{API}/calls", headers=sup["h"],
                              json={"channel": "chat", "customer_name": "TEST_R"}, timeout=30)
            cid = r.json()["id"]
            requests.post(f"{API}/calls/{cid}/utterance", headers=sup["h"],
                          json={"speaker": "customer", "text": f"hello {marker} world"}, timeout=30)
            requests.post(f"{API}/calls/{cid}/end", headers=sup["h"], timeout=30)
            det = requests.get(f"{API}/explorer/call/{cid}", headers=sup["h"], timeout=30).json()
            assert cat_id in (det.get("categories") or [])
            # Now delete category — verify pulled from call
            d = requests.delete(f"{API}/categories/{cat_id}", headers=sup["h"], timeout=30)
            assert d.status_code == 200
            det2 = requests.get(f"{API}/explorer/call/{cid}", headers=sup["h"], timeout=30).json()
            assert cat_id not in (det2.get("categories") or [])
        finally:
            # cleanup in case delete didn't happen
            requests.delete(f"{API}/categories/{cat_id}", headers=sup["h"], timeout=30)

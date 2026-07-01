"""Iteration 6 — Blog/Articles, Rank webhook, Day-level analytics, Workflow assignments."""
import os
import uuid
from pathlib import Path

import pytest
import requests


def _load_base_url() -> str:
    url = os.environ.get("REACT_APP_BACKEND_URL")
    if not url:
        env_path = Path("/app/frontend/.env")
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if line.startswith("REACT_APP_BACKEND_URL="):
                    url = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    if not url:
        raise RuntimeError("REACT_APP_BACKEND_URL must be set")
    return url.rstrip("/")


BASE_URL = _load_base_url()
API = f"{BASE_URL}/api"
RANK_SECRET = "flowpilot-rank-2026-CHANGEME"

SUPERVISOR = {"email": "demo@flowpilot.ai", "password": "Demo@1234"}
ADMIN = {"email": "admin@flowpilot.co.in", "password": "Admin@2026!"}
AGENT = {"email": "copilot_agent@flowpilot.ai", "password": "Agent1234"}


# ---------- helpers ----------
def _login(creds):
    r = requests.post(f"{API}/auth/login", json=creds, timeout=30)
    assert r.status_code == 200, f"login failed for {creds['email']}: {r.status_code} {r.text}"
    return r.json()["token"]


def _hdr(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def sup_token():
    return _login(SUPERVISOR)


@pytest.fixture(scope="module")
def admin_token():
    return _login(ADMIN)


@pytest.fixture(scope="module")
def agent_token():
    return _login(AGENT)


# ============================================================
#  BLOG / ARTICLES
# ============================================================
class TestArticlesPublicRead:
    def test_list_articles_public_no_auth(self):
        r = requests.get(f"{API}/blog/articles", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)

    def test_get_assist_flow_article(self):
        r = requests.get(f"{API}/blog/articles/how-real-time-agent-assist-cuts-wrap-up-time-by-60", timeout=15)
        # may or may not be seeded — both 200 and 404 acceptable, but we just verify shape
        assert r.status_code in (200, 404)
        if r.status_code == 200:
            doc = r.json()
            assert "title" in doc and "content_html" in doc and "slug" in doc

    def test_get_missing_article_404(self):
        r = requests.get(f"{API}/blog/articles/does-not-exist-{uuid.uuid4().hex[:6]}", timeout=15)
        assert r.status_code == 404


class TestArticlesRBAC:
    @pytest.fixture
    def title(self):
        return f"TEST_Article_{uuid.uuid4().hex[:8]}"

    def test_agent_cannot_create(self, agent_token, title):
        payload = {"title": title, "content_html": "<p>nope</p>"}
        r = requests.post(f"{API}/blog/articles", json=payload, headers=_hdr(agent_token), timeout=15)
        assert r.status_code == 403

    def test_supervisor_can_create_and_slug_auto(self, sup_token, title):
        payload = {"title": title, "content_html": "<p>hello</p>", "excerpt": "x"}
        r = requests.post(f"{API}/blog/articles", json=payload, headers=_hdr(sup_token), timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        slug = body["slug"]
        # slugifier converts underscores to hyphens, so "TEST_Article_xxx" -> "test-article-xxx"
        assert slug and "test-article" in slug
        assert body.get("updated") is False
        # cleanup
        requests.delete(f"{API}/blog/articles/{slug}", headers=_hdr(sup_token), timeout=15)

    def test_upsert_same_slug_returns_updated_true(self, sup_token, title):
        slug = f"test-upsert-{uuid.uuid4().hex[:6]}"
        p1 = {"title": title, "slug": slug, "content_html": "<p>v1</p>"}
        r1 = requests.post(f"{API}/blog/articles", json=p1, headers=_hdr(sup_token), timeout=15)
        assert r1.status_code == 200
        assert r1.json()["updated"] is False

        p2 = {"title": title + " v2", "slug": slug, "content_html": "<p>v2</p>"}
        r2 = requests.post(f"{API}/blog/articles", json=p2, headers=_hdr(sup_token), timeout=15)
        assert r2.status_code == 200
        assert r2.json()["updated"] is True

        # verify GET returns v2
        g = requests.get(f"{API}/blog/articles/{slug}", timeout=15)
        assert g.status_code == 200
        assert "v2" in g.json()["content_html"]

        requests.delete(f"{API}/blog/articles/{slug}", headers=_hdr(sup_token), timeout=15)

    def test_patch_updates_existing(self, sup_token, title):
        slug = f"test-patch-{uuid.uuid4().hex[:6]}"
        requests.post(f"{API}/blog/articles",
                      json={"title": title, "slug": slug, "content_html": "<p>orig</p>"},
                      headers=_hdr(sup_token), timeout=15)
        r = requests.patch(f"{API}/blog/articles/{slug}",
                           json={"title": title, "slug": slug, "content_html": "<p>patched</p>"},
                           headers=_hdr(sup_token), timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["updated"] is True
        g = requests.get(f"{API}/blog/articles/{slug}", timeout=15)
        assert "patched" in g.json()["content_html"]
        requests.delete(f"{API}/blog/articles/{slug}", headers=_hdr(sup_token), timeout=15)

    def test_delete_soft_disables(self, sup_token, title):
        slug = f"test-del-{uuid.uuid4().hex[:6]}"
        requests.post(f"{API}/blog/articles",
                      json={"title": title, "slug": slug, "content_html": "<p>x</p>"},
                      headers=_hdr(sup_token), timeout=15)
        d = requests.delete(f"{API}/blog/articles/{slug}", headers=_hdr(sup_token), timeout=15)
        assert d.status_code == 200
        # subsequent get must be 404 because active=false
        g = requests.get(f"{API}/blog/articles/{slug}", timeout=15)
        assert g.status_code == 404


class TestRankWebhook:
    def test_webhook_missing_secret_401(self):
        r = requests.post(f"{API}/blog/webhook",
                          json={"title": "x", "content_html": "<p>x</p>"},
                          timeout=15)
        assert r.status_code == 401

    def test_webhook_wrong_secret_401(self):
        r = requests.post(f"{API}/blog/webhook",
                          json={"title": "x", "content_html": "<p>x</p>"},
                          headers={"X-Webhook-Secret": "wrong"},
                          timeout=15)
        assert r.status_code == 401

    def test_webhook_flat_payload_inserts(self, sup_token):
        slug = f"test-rank-flat-{uuid.uuid4().hex[:6]}"
        body = {"title": "Rank flat", "slug": slug, "content_html": "<p>flat</p>"}
        r = requests.post(f"{API}/blog/webhook",
                          json=body,
                          headers={"X-Webhook-Secret": RANK_SECRET},
                          timeout=15)
        assert r.status_code == 200, r.text
        # verify source=rank.ai via list
        g = requests.get(f"{API}/blog/articles/{slug}", timeout=15)
        assert g.status_code == 200
        assert g.json().get("source") == "rank.ai"
        requests.delete(f"{API}/blog/articles/{slug}", headers=_hdr(sup_token), timeout=15)

    def test_webhook_envelope_payload(self, sup_token):
        slug = f"test-rank-env-{uuid.uuid4().hex[:6]}"
        body = {"data": {"title": "Rank env", "slug": slug, "content_html": "<p>env</p>"}}
        r = requests.post(f"{API}/blog/webhook",
                          json=body,
                          headers={"X-Webhook-Secret": RANK_SECRET},
                          timeout=15)
        assert r.status_code == 200, r.text
        g = requests.get(f"{API}/blog/articles/{slug}", timeout=15)
        assert g.status_code == 200
        assert g.json().get("source") == "rank.ai"
        requests.delete(f"{API}/blog/articles/{slug}", headers=_hdr(sup_token), timeout=15)


# ============================================================
#  DAY-LEVEL ANALYTICS
# ============================================================
class TestAnalyticsHeatmap:
    def test_supervisor_heatmap(self, sup_token):
        r = requests.get(f"{API}/analytics/heatmap?days=30", headers=_hdr(sup_token), timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("peak", "grid", "total_calls", "window_days"):
            assert k in d
        assert d["window_days"] == 30
        assert len(d["grid"]) == 7
        assert all(len(row) == 24 for row in d["grid"])
        assert isinstance(d["peak"], int) and d["peak"] >= 0

    def test_agent_heatmap_scope(self, agent_token):
        r = requests.get(f"{API}/analytics/heatmap?days=30", headers=_hdr(agent_token), timeout=20)
        assert r.status_code == 200
        assert len(r.json()["grid"]) == 7


class TestAnalyticsDod:
    def test_supervisor_dod(self, sup_token):
        r = requests.get(f"{API}/analytics/dod", headers=_hdr(sup_token), timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("today", "yesterday", "day_before", "yesterday_vs_db_pct", "last_7_total", "trail"):
            assert k in d, f"missing {k}"
        assert isinstance(d["trail"], list)
        assert isinstance(d["last_7_total"], int)

    def test_agent_dod_own_only(self, agent_token):
        r = requests.get(f"{API}/analytics/dod", headers=_hdr(agent_token), timeout=20)
        assert r.status_code == 200
        assert "trail" in r.json()


class TestAnalyticsAgentDaily:
    def test_supervisor_agent_daily(self, sup_token):
        r = requests.get(f"{API}/analytics/agent-daily?days=14", headers=_hdr(sup_token), timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "dates" in d and "agents" in d
        assert isinstance(d["agents"], list)
        assert isinstance(d["dates"], list)

    def test_agent_forbidden(self, agent_token):
        r = requests.get(f"{API}/analytics/agent-daily?days=14", headers=_hdr(agent_token), timeout=20)
        assert r.status_code == 403


# ============================================================
#  WORKFLOW ASSIGNMENT
# ============================================================
class TestWorkflowAssignment:
    @pytest.fixture
    def workflows(self, sup_token):
        r = requests.get(f"{API}/workflows", headers=_hdr(sup_token), timeout=15)
        assert r.status_code == 200
        wfs = r.json()
        assert isinstance(wfs, list) and len(wfs) >= 1
        return wfs

    def test_create_user_with_allowed_workflows(self, sup_token, workflows):
        wid = workflows[0]["id"]
        email = f"TEST_wfagent_{uuid.uuid4().hex[:6]}@example.com"
        payload = {"email": email, "password": "Test@1234", "name": "WF agent",
                   "role": "agent", "allowed_workflows": [wid]}
        r = requests.post(f"{API}/users", json=payload, headers=_hdr(sup_token), timeout=15)
        assert r.status_code in (200, 201), r.text
        body = r.json()
        assert body.get("allowed_workflows") == [wid]
        user_id = body["id"]
        # cleanup
        requests.delete(f"{API}/users/{user_id}", headers=_hdr(sup_token), timeout=15)

    def test_patch_user_allowed_workflows_and_agent_get_filters(self, sup_token, workflows):
        if len(workflows) < 2:
            pytest.skip("need >=2 workflows")
        wid = workflows[0]["id"]

        # find the existing test agent's id
        users = requests.get(f"{API}/users", headers=_hdr(sup_token), timeout=15).json()
        agent_user = next((u for u in users if u.get("email") == AGENT["email"]), None)
        assert agent_user, "test agent user not present"
        uid = agent_user["id"]

        # Restrict to just one workflow
        r = requests.patch(f"{API}/users/{uid}",
                           json={"allowed_workflows": [wid]},
                           headers=_hdr(sup_token), timeout=15)
        assert r.status_code == 200, r.text

        # Agent re-login to get fresh JWT then GET /workflows
        agent_tok = _login(AGENT)
        wfs = requests.get(f"{API}/workflows", headers=_hdr(agent_tok), timeout=15).json()
        ids = [w["id"] for w in wfs]
        assert ids == [wid], f"expected only [{wid}], got {ids}"

        # Supervisor still sees all
        sup_wfs = requests.get(f"{API}/workflows", headers=_hdr(sup_token), timeout=15).json()
        assert len(sup_wfs) >= len(workflows)

        # Reset: empty list = all
        requests.patch(f"{API}/users/{uid}",
                       json={"allowed_workflows": []},
                       headers=_hdr(sup_token), timeout=15)
        agent_tok2 = _login(AGENT)
        wfs2 = requests.get(f"{API}/workflows", headers=_hdr(agent_tok2), timeout=15).json()
        assert len(wfs2) == len(workflows)

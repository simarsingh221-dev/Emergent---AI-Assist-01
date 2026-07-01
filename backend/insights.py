"""FlowPilot Conversation Intelligence (CallMiner-style).

Pure-DB analytics surfaces — no LLM calls in this module:
- Explorer: full-text transcript search + multi-dim filters
- Categories: keyword-rule based auto-tagging
- Scorecard: per-agent KPIs and drill-down
- Trends: chart-ready time series + breakdowns

LLM-derived signals (sentiment, escalation, churn, compliance) are *consumed* from
analysis docs already produced by the workspace; this module does not call any LLM.
"""
import re
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, field_validator
from motor.motor_asyncio import AsyncIOMotorDatabase


# ============================== HELPERS ==============================
def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _scope_filter(user: Dict[str, Any]) -> Dict[str, Any]:
    """Agents only see own data; supervisors/admins see all."""
    return {"agent_id": user["id"]} if user.get("role") == "agent" else {}


def _timeframe(days: Optional[int]) -> Optional[Dict[str, Any]]:
    if not days or days <= 0:
        return None
    start = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    return {"$gte": start}


def _tokens(text: str) -> List[str]:
    return [t.lower() for t in re.findall(r"\w+", text or "") if len(t) > 1]


def _transcript_text(call: Dict[str, Any]) -> str:
    return " ".join(t.get("text", "") for t in (call.get("transcript") or []))


def _match_category(transcript_lc: str, keywords: List[str]) -> int:
    """Return total hit count of any keyword/phrase in transcript. 0 = no match."""
    if not transcript_lc:
        return 0
    return sum(transcript_lc.count(kw.lower()) for kw in keywords if kw.strip())


SEED_CATEGORIES = [
    {"id": "refund", "name": "Refund Request", "color": "#FF4FD8",
     "keywords": ["refund", "money back", "reimburse", "return my money", "cashback"]},
    {"id": "cancel", "name": "Cancellation", "color": "#EF4444",
     "keywords": ["cancel", "close my account", "stop service", "terminate"]},
    {"id": "complaint", "name": "Complaint", "color": "#F59E0B",
     "keywords": ["complaint", "unhappy", "frustrated", "terrible", "worst", "escalate", "manager"]},
    {"id": "kyc", "name": "KYC / Identity", "color": "#7B61FF",
     "keywords": ["KYC", "PAN", "aadhaar", "verify identity", "OTP", "date of birth"]},
    {"id": "retention", "name": "Retention Save", "color": "#10B981",
     "keywords": ["loyalty", "discount", "offer", "stay", "waive", "credit"]},
    {"id": "tech", "name": "Tech Issue", "color": "#06B6D4",
     "keywords": ["not working", "error", "broken", "login", "reset password", "app crash"]},
]


# ============================== MODELS ==============================
_HEX_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")


def _validate_hex(v):
    if v is None:
        return v
    if not _HEX_RE.match(v):
        raise ValueError("color must be a 6-digit hex code like #7B61FF")
    return v


class CategoryReq(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    keywords: List[str] = Field(default_factory=list)
    color: Optional[str] = "#7B61FF"
    description: Optional[str] = ""

    @field_validator("color")
    @classmethod
    def _v_color(cls, v):
        return _validate_hex(v)


class CategoryPatchReq(BaseModel):
    name: Optional[str] = None
    keywords: Optional[List[str]] = None
    color: Optional[str] = None
    description: Optional[str] = None
    active: Optional[bool] = None

    @field_validator("color")
    @classmethod
    def _v_color(cls, v):
        return _validate_hex(v)


class SearchReq(BaseModel):
    q: Optional[str] = ""
    days: Optional[int] = 30  # 0 = all
    sentiment: Optional[List[str]] = None
    escalation: Optional[List[str]] = None
    channels: Optional[List[str]] = None
    categories: Optional[List[str]] = None  # category IDs
    agent_id: Optional[str] = None
    page: int = 1
    page_size: int = 25


# ============================== ROUTER FACTORY ==============================
def build_router(db: AsyncIOMotorDatabase, get_current_user) -> APIRouter:
    router = APIRouter(tags=["insights"])

    # ---------- CATEGORIES ----------
    async def _ensure_seed_categories() -> None:
        existing = await db.categories.count_documents({})
        if existing == 0:
            for c in SEED_CATEGORIES:
                await db.categories.insert_one({**c, "active": True,
                                                "created_at": _now(), "is_seed": True})

    @router.get("/categories")
    async def list_categories(user=Depends(get_current_user)):
        await _ensure_seed_categories()
        cats = await db.categories.find({"active": {"$ne": False}}, {"_id": 0}).sort("created_at", 1).to_list(200)
        return cats

    @router.post("/categories")
    async def create_category(req: CategoryReq, user=Depends(get_current_user)):
        if user.get("role") == "agent":
            raise HTTPException(403, "Supervisor or admin required")
        doc = {
            "id": str(uuid.uuid4()),
            "name": req.name.strip(),
            "keywords": [k.strip() for k in req.keywords if k.strip()],
            "color": req.color or "#7B61FF",
            "description": (req.description or "").strip(),
            "active": True,
            "is_seed": False,
            "created_at": _now(),
            "created_by": user["id"],
        }
        await db.categories.insert_one(dict(doc))
        return doc

    @router.patch("/categories/{cat_id}")
    async def update_category(cat_id: str, req: CategoryPatchReq, user=Depends(get_current_user)):
        if user.get("role") == "agent":
            raise HTTPException(403, "Supervisor or admin required")
        updates: Dict[str, Any] = {}
        if req.name is not None:
            updates["name"] = req.name.strip()
        if req.keywords is not None:
            updates["keywords"] = [k.strip() for k in req.keywords if k.strip()]
        if req.color is not None:
            updates["color"] = req.color
        if req.description is not None:
            updates["description"] = req.description.strip()
        if req.active is not None:
            updates["active"] = req.active
        if not updates:
            raise HTTPException(400, "No fields to update")
        r = await db.categories.update_one({"id": cat_id}, {"$set": updates})
        if r.matched_count == 0:
            raise HTTPException(404, "Category not found")
        return await db.categories.find_one({"id": cat_id}, {"_id": 0})

    @router.delete("/categories/{cat_id}")
    async def delete_category(cat_id: str, user=Depends(get_current_user)):
        if user.get("role") == "agent":
            raise HTTPException(403, "Supervisor or admin required")
        cat = await db.categories.find_one({"id": cat_id})
        if not cat:
            raise HTTPException(404, "Category not found")
        if cat.get("is_seed"):
            await db.categories.update_one({"id": cat_id}, {"$set": {"active": False}})
            return {"ok": True, "soft": True}
        await db.categories.delete_one({"id": cat_id})
        # Remove the category tag from any calls
        await db.calls.update_many({}, {"$pull": {"categories": cat_id}})
        return {"ok": True, "soft": False}

    @router.post("/categories/recompute")
    async def recompute_categories(user=Depends(get_current_user)):
        """Re-tag all historical calls against current category keyword rules."""
        if user.get("role") == "agent":
            raise HTTPException(403, "Supervisor or admin required")
        cats = await db.categories.find({"active": {"$ne": False}}, {"_id": 0}).to_list(200)
        if not cats:
            return {"updated": 0, "categories": 0}
        calls = await db.calls.find({}, {"_id": 0, "id": 1, "transcript": 1}).to_list(5000)
        updated = 0
        for c in calls:
            text = _transcript_text(c).lower()
            tagged = []
            for cat in cats:
                if _match_category(text, cat.get("keywords") or []) > 0:
                    tagged.append(cat["id"])
            await db.calls.update_one({"id": c["id"]}, {"$set": {"categories": tagged}})
            updated += 1
        return {"updated": updated, "categories": len(cats)}

    # ---------- EXPLORER ----------
    @router.post("/explorer/search")
    async def search(req: SearchReq, user=Depends(get_current_user)):
        q: Dict[str, Any] = {**_scope_filter(user)}
        tf = _timeframe(req.days)
        if tf:
            q["started_at"] = tf
        if req.agent_id and user.get("role") != "agent":
            q["agent_id"] = req.agent_id
        if req.sentiment:
            q["analysis.sentiment"] = {"$in": req.sentiment}
        if req.escalation:
            q["analysis.escalation_risk"] = {"$in": req.escalation}
        if req.channels:
            q["channel"] = {"$in": req.channels}
        if req.categories:
            q["categories"] = {"$in": req.categories}

        # Pull a window then filter by transcript text in Python (no Mongo $text index yet)
        all_results = await db.calls.find(q, {"_id": 0}).sort("started_at", -1).to_list(2000)
        query_terms = _tokens(req.q or "")
        if query_terms:
            scored = []
            for c in all_results:
                text = _transcript_text(c).lower()
                if not text:
                    continue
                # Phrase match first
                full_q = (req.q or "").lower().strip()
                phrase_hits = text.count(full_q) if len(full_q) > 2 else 0
                token_hits = sum(text.count(t) for t in query_terms)
                if phrase_hits + token_hits > 0:
                    scored.append((phrase_hits * 5 + token_hits, c))
            scored.sort(key=lambda x: (-x[0], x[1].get("started_at", "")))
            filtered = [c for _, c in scored]
        else:
            filtered = all_results

        total = len(filtered)
        start = (req.page - 1) * req.page_size
        page = filtered[start:start + req.page_size]

        # Build lightweight result rows with snippet
        results = []
        for c in page:
            text = _transcript_text(c)
            snippet = ""
            if query_terms:
                lc = text.lower()
                pos = -1
                for t in query_terms:
                    pos = lc.find(t)
                    if pos >= 0:
                        break
                if pos >= 0:
                    start_i = max(0, pos - 60)
                    end_i = min(len(text), pos + 140)
                    snippet = ("…" if start_i > 0 else "") + text[start_i:end_i] + ("…" if end_i < len(text) else "")
            results.append({
                "id": c.get("id"),
                "customer_name": c.get("customer_name"),
                "agent_name": c.get("agent_name"),
                "agent_id": c.get("agent_id"),
                "channel": c.get("channel"),
                "started_at": c.get("started_at"),
                "ended_at": c.get("ended_at"),
                "status": c.get("status"),
                "duration_sec": _duration_sec(c),
                "sentiment": (c.get("analysis") or {}).get("sentiment"),
                "escalation_risk": (c.get("analysis") or {}).get("escalation_risk"),
                "intent": (c.get("analysis") or {}).get("intent"),
                "categories": c.get("categories") or [],
                "summary": c.get("summary"),
                "snippet": snippet,
                "transcript_len": len(c.get("transcript") or []),
            })
        return {"total": total, "page": req.page, "page_size": req.page_size, "results": results}

    @router.get("/explorer/call/{call_id}")
    async def get_call_detail(call_id: str, user=Depends(get_current_user)):
        q = {"id": call_id, **_scope_filter(user)}
        doc = await db.calls.find_one(q, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Call not found")
        return doc

    # ---------- SCORECARD ----------
    @router.get("/scorecard/agent/{agent_id}")
    async def agent_scorecard(agent_id: str, days: int = 30, user=Depends(get_current_user)):
        # Agents can only see their own scorecard
        if user.get("role") == "agent" and user.get("id") != agent_id:
            raise HTTPException(403, "Agents can only view their own scorecard")
        q: Dict[str, Any] = {"agent_id": agent_id}
        tf = _timeframe(days)
        if tf:
            q["started_at"] = tf
        calls = await db.calls.find(q, {"_id": 0}).to_list(2000)
        total = len(calls)
        sentiment = {"positive": 0, "neutral": 0, "negative": 0, "frustrated": 0}
        escalation = {"low": 0, "medium": 0, "high": 0}
        cat_counts: Dict[str, int] = {}
        compliance_total = 0
        compliance_met = 0
        durations = []
        for c in calls:
            a = c.get("analysis") or {}
            if (s := a.get("sentiment")) in sentiment:
                sentiment[s] += 1
            if (e := a.get("escalation_risk")) in escalation:
                escalation[e] += 1
            for cid in (c.get("categories") or []):
                cat_counts[cid] = cat_counts.get(cid, 0) + 1
            for item in (a.get("compliance") or []):
                if isinstance(item, dict):
                    compliance_total += 1
                    if item.get("status") == "met":
                        compliance_met += 1
            d = _duration_sec(c)
            if d > 0:
                durations.append(d)
        agent = await db.users.find_one({"id": agent_id}, {"_id": 0, "password": 0})
        if not agent:
            agent = {"id": agent_id, "name": calls[0].get("agent_name") if calls else "Unknown", "role": "agent"}
        return {
            "agent": agent,
            "window_days": days,
            "total_calls": total,
            "avg_duration_sec": round(sum(durations) / len(durations)) if durations else 0,
            "sentiment": sentiment,
            "escalation": escalation,
            "compliance_score": round(compliance_met / compliance_total * 100) if compliance_total else None,
            "top_categories": sorted(
                [{"id": k, "count": v} for k, v in cat_counts.items()], key=lambda x: -x["count"]
            )[:8],
        }

    @router.get("/scorecard/agents")
    async def all_agents_scorecard(days: int = 30, user=Depends(get_current_user)):
        if user.get("role") == "agent":
            raise HTTPException(403, "Supervisor or admin required")
        q: Dict[str, Any] = {}
        tf = _timeframe(days)
        if tf:
            q["started_at"] = tf
        calls = await db.calls.find(q, {"_id": 0}).to_list(5000)
        per_agent: Dict[str, Dict[str, Any]] = {}
        for c in calls:
            aid = c.get("agent_id") or "unknown"
            row = per_agent.setdefault(aid, {
                "agent_id": aid, "agent_name": c.get("agent_name") or "Unknown",
                "total_calls": 0, "negative": 0, "high_escalation": 0,
                "compliance_total": 0, "compliance_met": 0, "duration_sum": 0,
            })
            row["total_calls"] += 1
            a = c.get("analysis") or {}
            if a.get("sentiment") in ("negative", "frustrated"):
                row["negative"] += 1
            if a.get("escalation_risk") == "high":
                row["high_escalation"] += 1
            for item in (a.get("compliance") or []):
                if isinstance(item, dict):
                    row["compliance_total"] += 1
                    if item.get("status") == "met":
                        row["compliance_met"] += 1
            row["duration_sum"] += _duration_sec(c)
        out = []
        for r in per_agent.values():
            tc = r["total_calls"]
            out.append({
                "agent_id": r["agent_id"],
                "agent_name": r["agent_name"],
                "total_calls": tc,
                "negative_pct": round(r["negative"] / tc * 100) if tc else 0,
                "high_escalation_pct": round(r["high_escalation"] / tc * 100) if tc else 0,
                "compliance_score": round(r["compliance_met"] / r["compliance_total"] * 100) if r["compliance_total"] else None,
                "avg_duration_sec": round(r["duration_sum"] / tc) if tc else 0,
            })
        out.sort(key=lambda x: -x["total_calls"])
        return out

    # ---------- TRENDS ----------
    @router.get("/analytics/heatmap")
    async def heatmap(days: int = 30, user=Depends(get_current_user)):
        """Day-of-week × hour-of-day call density. Returns 7×24 grid."""
        q = {**_scope_filter(user)}
        tf = _timeframe(days)
        if tf:
            q["started_at"] = tf
        calls = await db.calls.find(q, {"_id": 0, "started_at": 1}).to_list(10000)
        # 7x24 matrix; row 0 = Monday per ISO weekday convention
        grid = [[0 for _ in range(24)] for _ in range(7)]
        peak = 0
        for c in calls:
            ts = c.get("started_at")
            if not ts:
                continue
            try:
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except Exception:
                continue
            dow = dt.weekday()  # 0=Mon
            hod = dt.hour
            grid[dow][hod] += 1
            if grid[dow][hod] > peak:
                peak = grid[dow][hod]
        return {"window_days": days, "peak": peak, "grid": grid, "total_calls": len(calls)}

    @router.get("/analytics/agent-daily")
    async def agent_daily(days: int = 14, limit: int = 10, user=Depends(get_current_user)):
        """Per-agent daily call count. For supervisor/admin only. `limit` caps top-N agents (default 10)."""
        if user.get("role") == "agent":
            raise HTTPException(403, "Supervisor or admin required")
        limit = max(1, min(limit, 100))
        tf = _timeframe(days)
        q = {}
        if tf:
            q["started_at"] = tf
        calls = await db.calls.find(q, {"_id": 0, "started_at": 1, "agent_id": 1, "agent_name": 1}).to_list(10000)
        # Build {agent_name: {date: count}}
        per_agent: Dict[str, Dict[str, Any]] = {}
        all_dates = set()
        for c in calls:
            d = (c.get("started_at") or "")[:10]
            if not d:
                continue
            all_dates.add(d)
            name = c.get("agent_name") or c.get("agent_id") or "Unknown"
            row = per_agent.setdefault(name, {"agent": name, "total": 0, "by_date": {}})
            row["by_date"][d] = row["by_date"].get(d, 0) + 1
            row["total"] += 1
        dates_sorted = sorted(all_dates)
        rows = []
        for name, row in sorted(per_agent.items(), key=lambda x: -x[1]["total"])[:limit]:
            series = [{"date": d, "count": row["by_date"].get(d, 0)} for d in dates_sorted]
            rows.append({"agent": name, "total": row["total"], "series": series})
        return {"window_days": days, "dates": dates_sorted, "agents": rows}

    @router.get("/analytics/dod")
    async def day_over_day(user=Depends(get_current_user)):
        """Day-over-day deltas: yesterday vs day-before, last 7d vs prior 7d."""
        q = {**_scope_filter(user)}
        now = datetime.now(timezone.utc)
        # 15-day window covers today + last 7 + prior 7 for true WoW comparison
        start = (now - timedelta(days=15)).isoformat()
        q["started_at"] = {"$gte": start}
        calls = await db.calls.find(q, {"_id": 0, "started_at": 1, "analysis": 1}).to_list(10000)
        today = now.date()
        buckets = {(today - timedelta(days=i)).isoformat(): {
            "date": (today - timedelta(days=i)).isoformat(),
            "total": 0, "negative": 0, "high_escalation": 0,
        } for i in range(15)}
        for c in calls:
            d = (c.get("started_at") or "")[:10]
            if d in buckets:
                buckets[d]["total"] += 1
                a = c.get("analysis") or {}
                if a.get("sentiment") in ("negative", "frustrated"):
                    buckets[d]["negative"] += 1
                if a.get("escalation_risk") == "high":
                    buckets[d]["high_escalation"] += 1
        ordered = [buckets[d] for d in sorted(buckets.keys(), reverse=True)]

        def delta(curr, prev):
            if prev == 0:
                return 100 if curr > 0 else 0
            return round((curr - prev) / prev * 100)

        last_7 = sum(b["total"] for b in ordered[1:8])   # yesterday .. 7 days ago
        prev_7 = sum(b["total"] for b in ordered[8:15])  # 8 .. 14 days ago
        return {
            "today": ordered[0],
            "yesterday": ordered[1] if len(ordered) > 1 else None,
            "day_before": ordered[2] if len(ordered) > 2 else None,
            "yesterday_vs_db_pct": delta(ordered[1]["total"], ordered[2]["total"]) if len(ordered) > 2 else 0,
            "last_7_total": last_7,
            "prev_7_total": prev_7,
            "last_7_vs_prev_pct": delta(last_7, prev_7),
            "trail": ordered[:8],
        }

    @router.get("/analytics/trends")
    async def trends(days: int = 14, user=Depends(get_current_user)):
        q = {**_scope_filter(user)}
        tf = _timeframe(days)
        if tf:
            q["started_at"] = tf
        calls = await db.calls.find(q, {"_id": 0,
                                        "started_at": 1, "analysis": 1,
                                        "channel": 1, "categories": 1}).to_list(5000)
        # Build per-day buckets
        buckets: Dict[str, Dict[str, int]] = {}
        for c in calls:
            day = (c.get("started_at") or "")[:10]  # YYYY-MM-DD
            if not day:
                continue
            b = buckets.setdefault(day, {"date": day, "total": 0, "positive": 0, "neutral": 0,
                                         "negative": 0, "frustrated": 0,
                                         "low": 0, "medium": 0, "high": 0})
            b["total"] += 1
            a = c.get("analysis") or {}
            if (s := a.get("sentiment")) in ("positive", "neutral", "negative", "frustrated"):
                b[s] += 1
            if (e := a.get("escalation_risk")) in ("low", "medium", "high"):
                b[e] += 1
        sentiment_trend = sorted(buckets.values(), key=lambda x: x["date"])

        # Category mix
        cat_counts: Dict[str, int] = {}
        for c in calls:
            for cid in (c.get("categories") or []):
                cat_counts[cid] = cat_counts.get(cid, 0) + 1
        cats = await db.categories.find({}, {"_id": 0}).to_list(200)
        cat_lookup = {c["id"]: c for c in cats}
        category_mix = [{
            "id": cid, "name": cat_lookup.get(cid, {}).get("name", cid),
            "color": cat_lookup.get(cid, {}).get("color", "#7B61FF"),
            "count": cnt,
        } for cid, cnt in sorted(cat_counts.items(), key=lambda x: -x[1])]

        # Top compliance misses
        miss_counts: Dict[str, int] = {}
        for c in calls:
            for item in ((c.get("analysis") or {}).get("compliance") or []):
                if isinstance(item, dict) and item.get("status") == "missed":
                    miss_counts[item.get("item", "Unknown")] = miss_counts.get(item.get("item", "Unknown"), 0) + 1
        top_misses = [{"item": k, "count": v} for k, v in sorted(miss_counts.items(), key=lambda x: -x[1])][:6]

        return {
            "window_days": days,
            "sentiment_trend": sentiment_trend,
            "category_mix": category_mix,
            "top_compliance_misses": top_misses,
            "total_calls": len(calls),
        }

    return router


def _duration_sec(c: Dict[str, Any]) -> int:
    s = c.get("started_at")
    e = c.get("ended_at")
    if not s or not e:
        return 0
    try:
        return max(0, int((datetime.fromisoformat(e) - datetime.fromisoformat(s)).total_seconds()))
    except Exception:
        return 0


async def tag_call_with_categories(db: AsyncIOMotorDatabase, call_id: str) -> List[str]:
    """Auto-tag a single call against current active categories. Call this after
    transcript updates or call completion. Returns the new category id list."""
    call = await db.calls.find_one({"id": call_id}, {"_id": 0, "transcript": 1})
    if not call:
        return []
    text = _transcript_text(call).lower()
    if not text:
        return []
    cats = await db.categories.find({"active": {"$ne": False}}, {"_id": 0}).to_list(200)
    tagged = [c["id"] for c in cats if _match_category(text, c.get("keywords") or []) > 0]
    await db.calls.update_one({"id": call_id}, {"$set": {"categories": tagged}})
    return tagged

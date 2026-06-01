"""FlowPilot Copilot — conversational operational intelligence for contact centers.

Cost-optimized 3-stage pipeline:
  1) Intent classifier — Gemini 2.5 Flash (~$0.0001/turn)
  2) Deterministic data fetch — MongoDB, RBAC-filtered (zero LLM cost)
  3) Synthesis — Flash for simple/follow-up; GPT-5.2 for explain/recommend

Sessions persist in MongoDB with 24h application-level expiry.
"""
import os
import re
import json
import uuid
import hashlib
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorDatabase

from emergentintegrations.llm.chat import LlmChat, UserMessage


logger = logging.getLogger("flowpilot.copilot")

MAX_HISTORY_TURNS = 6           # turns sent to LLM (last N user+assistant pairs)
MAX_STORED_TURNS = 20           # turns kept in DB
SESSION_TTL_HOURS = 24
CACHE_TTL_MINUTES = 5
KB_TOP_K = 3
KB_SNIPPET_CHARS = 1500

# Model strings (via emergentintegrations + EMERGENT_LLM_KEY)
MODEL_FLASH = ("gemini", "gemini-2.5-flash")
MODEL_PREMIUM = ("openai", "gpt-5.2")


# ============================== MODELS ==============================
class CopilotChatReq(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: Optional[str] = None


class CopilotMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    ts: str
    intent: Optional[str] = None
    sources: Optional[List[Dict[str, Any]]] = None
    model_used: Optional[str] = None


# ============================== HELPERS ==============================
def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _expires_at() -> str:
    return (datetime.now(timezone.utc) + timedelta(hours=SESSION_TTL_HOURS)).isoformat()


def _cache_key(user_role: str, scope_id: str, intent: str, payload: str) -> str:
    raw = f"{user_role}|{scope_id}|{intent}|{payload}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


async def _from_cache(db: AsyncIOMotorDatabase, key: str) -> Optional[Dict[str, Any]]:
    doc = await db.copilot_cache.find_one({"key": key}, {"_id": 0})
    if not doc:
        return None
    if datetime.fromisoformat(doc["expires_at"]) < datetime.now(timezone.utc):
        return None
    return doc["value"]


async def _to_cache(db: AsyncIOMotorDatabase, key: str, value: Dict[str, Any]) -> None:
    await db.copilot_cache.update_one(
        {"key": key},
        {"$set": {
            "key": key,
            "value": value,
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=CACHE_TTL_MINUTES)).isoformat(),
        }},
        upsert=True,
    )


def _keyword_score(query: str, text: str) -> float:
    q_tokens = [t.lower() for t in re.findall(r"\w+", query) if len(t) > 2]
    if not q_tokens:
        return 0.0
    t_low = text.lower()
    hits = sum(t_low.count(t) for t in q_tokens)
    return hits / max(len(t_low.split()), 1) * 1000


# ============================== STAGE 1: INTENT ==============================
INTENT_SYSTEM = (
    "You are a query classifier for a contact-center operations copilot. "
    "Classify the user question. Respond STRICT JSON only, shape: "
    "{\"intent\": \"analytics\"|\"kb\"|\"qa\"|\"coaching\"|\"followup\"|\"smalltalk\", "
    "\"complexity\": \"simple\"|\"explain\", "
    "\"timeframe\": \"today\"|\"week\"|\"month\"|\"all\"|null, "
    "\"keywords\": [string]}. "
    "Use 'explain' for why/how/root-cause/recommend questions. "
    "Use 'simple' for raw lookup/list/count. "
    "Use 'followup' when the message is short and references prior context like 'why', 'show more', 'what changed'."
)


async def classify_intent(api_key: str, session_id: str, message: str, has_history: bool) -> Dict[str, Any]:
    hint = " (note: previous turns exist in this session)" if has_history else ""
    try:
        chat = LlmChat(api_key=api_key, session_id=f"intent-{session_id}",
                       system_message=INTENT_SYSTEM).with_model(*MODEL_FLASH)
        resp = await chat.send_message(UserMessage(text=f"User question{hint}: {message}"))
        m = re.search(r"\{[\s\S]*\}", resp.strip())
        if m:
            data = json.loads(m.group(0))
            data.setdefault("intent", "smalltalk")
            data.setdefault("complexity", "simple")
            data.setdefault("timeframe", "week")
            data.setdefault("keywords", [])
            return data
    except Exception as e:
        logger.warning("intent classify failed, defaulting: %s", e)
    return {"intent": "smalltalk", "complexity": "simple", "timeframe": "week", "keywords": []}


# ============================== STAGE 2: DETERMINISTIC FETCH (RBAC) ==============================
def _scope_filter(user: Dict[str, Any]) -> Dict[str, Any]:
    """RBAC scope for call queries.

    Agent: own calls only.
    Supervisor / Admin: all calls (team partitioning is future work).
    """
    role = user.get("role", "agent")
    if role == "agent":
        return {"agent_id": user["id"]}
    return {}


def _timeframe_filter(timeframe: Optional[str]) -> Dict[str, Any]:
    if not timeframe or timeframe == "all":
        return {}
    now = datetime.now(timezone.utc)
    if timeframe == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif timeframe == "week":
        start = now - timedelta(days=7)
    elif timeframe == "month":
        start = now - timedelta(days=30)
    else:
        return {}
    return {"started_at": {"$gte": start.isoformat()}}


async def fetch_analytics(db: AsyncIOMotorDatabase, user: Dict[str, Any], timeframe: Optional[str]) -> Dict[str, Any]:
    """Aggregate analytics for the user's scope + timeframe. Pure DB, no LLM."""
    q = {**_scope_filter(user), **_timeframe_filter(timeframe)}
    cursor = db.calls.find(q, {"_id": 0, "analysis": 1, "summary": 1, "channel": 1, "started_at": 1,
                               "status": 1, "compliance": 1, "agent_id": 1, "agent_name": 1})
    calls = await cursor.to_list(500)
    total = len(calls)
    sentiment = {"positive": 0, "neutral": 0, "negative": 0, "frustrated": 0}
    escalation = {"low": 0, "medium": 0, "high": 0}
    churn = {"low": 0, "medium": 0, "high": 0}
    channels: Dict[str, int] = {}
    compliance_misses: Dict[str, int] = {}
    agent_counts: Dict[str, int] = {}
    for c in calls:
        a = c.get("analysis") or {}
        if (s := a.get("sentiment")) in sentiment:
            sentiment[s] += 1
        if (e := a.get("escalation_risk")) in escalation:
            escalation[e] += 1
        if (k := a.get("churn_risk")) in churn:
            churn[k] += 1
        ch = c.get("channel", "voice")
        channels[ch] = channels.get(ch, 0) + 1
        for item in a.get("compliance", []) or []:
            if isinstance(item, dict) and item.get("status") == "missed":
                key = item.get("item", "unknown")
                compliance_misses[key] = compliance_misses.get(key, 0) + 1
        nm = c.get("agent_name") or c.get("agent_id") or "unknown"
        agent_counts[nm] = agent_counts.get(nm, 0) + 1
    top_compliance_misses = sorted(compliance_misses.items(), key=lambda x: -x[1])[:5]
    top_agents = sorted(agent_counts.items(), key=lambda x: -x[1])[:5]
    return {
        "scope": "self" if user.get("role") == "agent" else "team",
        "timeframe": timeframe or "all",
        "total_calls": total,
        "sentiment": sentiment,
        "escalation_risk": escalation,
        "churn_risk": churn,
        "channels": channels,
        "top_compliance_misses": [{"item": k, "count": v} for k, v in top_compliance_misses],
        "top_agents_by_volume": [{"agent": k, "calls": v} for k, v in top_agents],
    }


async def fetch_kb(db: AsyncIOMotorDatabase, query: str) -> List[Dict[str, Any]]:
    """Retrieve top-K KB docs by keyword score. Truncated to KB_SNIPPET_CHARS."""
    docs = await db.kb_docs.find({}, {"_id": 0}).to_list(500)
    scored = sorted(
        [(_keyword_score(query, d.get("title", "") + " " + d.get("content", "")), d) for d in docs],
        key=lambda x: -x[0],
    )
    top = [d for s, d in scored if s > 0][:KB_TOP_K]
    return [{
        "title": d["title"],
        "category": d.get("category", "General"),
        "id": d.get("id"),
        "snippet": (d.get("content") or "")[:KB_SNIPPET_CHARS],
    } for d in top]


# ============================== STAGE 3: SYNTHESIS ==============================
SYNTH_SYSTEM_BASE = (
    "You are FlowPilot Copilot — an enterprise operational-intelligence assistant for contact centers. "
    "Tone: concise, insightful, action-oriented. Avoid filler. "
    "Cite KB sources by title in square brackets when you use them. "
    "If data is insufficient, say so plainly. Never fabricate numbers."
)


def _role_block(user: Dict[str, Any]) -> str:
    r = user.get("role", "agent")
    name = user.get("name", "User")
    if r == "agent":
        return f"User: {name} (Agent). Can only see their OWN data. Never reference other agents or team-level metrics."
    if r == "supervisor":
        return f"User: {name} (Supervisor). Can see team-level data and individual agent performance within their scope."
    return f"User: {name} (Admin). Can see organization-wide data across all teams and programs."


def _format_history(messages: List[Dict[str, Any]]) -> str:
    """Compact recent turn history for the LLM prompt (last MAX_HISTORY_TURNS)."""
    recent = messages[-(MAX_HISTORY_TURNS * 2):]  # user+assistant pairs
    if not recent:
        return ""
    lines = []
    for m in recent:
        role = "U" if m["role"] == "user" else "A"
        content = m["content"][:400]
        lines.append(f"{role}: {content}")
    return "Prior turns:\n" + "\n".join(lines)


async def synthesize(api_key: str, user: Dict[str, Any], session_id: str, message: str,
                     history: List[Dict[str, Any]], intent_data: Dict[str, Any],
                     analytics: Optional[Dict[str, Any]], kb_sources: List[Dict[str, Any]],
                     use_premium: bool) -> str:
    role_block = _role_block(user)
    history_block = _format_history(history)
    data_block_parts = []
    if analytics:
        data_block_parts.append("Analytics (deterministic, RBAC-filtered):\n" + json.dumps(analytics, indent=2))
    if kb_sources:
        kb_text = "\n\n---\n\n".join(f"[{s['title']}] ({s['category']})\n{s['snippet']}" for s in kb_sources)
        data_block_parts.append("Knowledge base context:\n" + kb_text)
    data_block = "\n\n".join(data_block_parts) if data_block_parts else "(No additional data retrieved for this question.)"

    system = SYNTH_SYSTEM_BASE + "\n\n" + role_block
    user_text = (
        f"{history_block}\n\n"
        f"Current question: {message}\n\n"
        f"Intent: {intent_data.get('intent')} · complexity: {intent_data.get('complexity')} · timeframe: {intent_data.get('timeframe')}\n\n"
        f"{data_block}\n\n"
        "Respond in 2-6 sentences. If recommending actions, use a short bulleted list (max 4 bullets). "
        "If sources from KB were used, end with a short 'Sources:' line listing the titles."
    )
    provider, model = MODEL_PREMIUM if use_premium else MODEL_FLASH
    chat = LlmChat(api_key=api_key, session_id=f"synth-{session_id}",
                   system_message=system).with_model(provider, model)
    return (await chat.send_message(UserMessage(text=user_text))).strip()


# ============================== SUGGESTED FOLLOW-UPS ==============================
def _suggested_followups(intent: str, user_role: str) -> List[str]:
    base = {
        "analytics": ["Why is that happening?", "Compare with last week", "Which agents are most affected?"],
        "kb": ["Give me the exact wording", "Show me the related workflow", "Any compliance items I should mention?"],
        "qa": ["How can I improve it?", "Which calls dragged my score down?", "Show me a coaching example"],
        "coaching": ["Recommend training resources", "Give me a script to practice", "What is best practice?"],
        "followup": ["Show more details", "Compare across teams", "What changed this week?"],
        "smalltalk": ["What can you help me with?", "Show me my key metrics", "Find an SOP"],
    }
    out = base.get(intent, base["smalltalk"])
    # Agents shouldn't see team-comparison followups
    if user_role == "agent":
        out = [q for q in out if "agent" not in q.lower() and "team" not in q.lower()]
        if not out:
            out = base["smalltalk"]
    return out[:3]


# ============================== ROUTER FACTORY ==============================
def build_router(db: AsyncIOMotorDatabase, get_current_user, emergent_llm_key: str) -> APIRouter:
    """Build the copilot APIRouter — wired into the main /api prefix in server.py."""
    router = APIRouter(prefix="/copilot", tags=["copilot"])

    async def _load_or_create_session(session_id: Optional[str], user_id: str) -> Dict[str, Any]:
        if session_id:
            doc = await db.copilot_sessions.find_one({"id": session_id, "user_id": user_id}, {"_id": 0})
            if doc:
                return doc
        # Create new
        new = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": None,
            "messages": [],
            "created_at": _now(),
            "updated_at": _now(),
            "expires_at": _expires_at(),
        }
        await db.copilot_sessions.insert_one(dict(new))
        return new

    @router.post("/chat")
    async def chat(req: CopilotChatReq, user=Depends(get_current_user)):
        session = await _load_or_create_session(req.session_id, user["id"])
        messages = session.get("messages", []) or []
        has_history = len(messages) > 0

        # Stage 1: classify intent (Flash, tiny cost)
        intent_data = await classify_intent(emergent_llm_key, session["id"], req.message, has_history)
        intent = intent_data["intent"]

        # Stage 2: deterministic fetch
        analytics_data = None
        kb_sources: List[Dict[str, Any]] = []
        if intent in ("analytics", "qa", "coaching"):
            analytics_data = await fetch_analytics(db, user, intent_data.get("timeframe"))
        if intent in ("kb", "coaching") or any(kw in req.message.lower() for kw in ("sop", "policy", "script", "procedure", "workflow", "compliance")):
            kw_query = " ".join(intent_data.get("keywords") or []) or req.message
            kb_sources = await fetch_kb(db, kw_query)

        # Cache lookup on (role, scope, normalized_message) — intent/timeframe excluded so
        # LLM-classifier non-determinism doesn't bust the cache key. Still skipped for follow-ups
        # which depend on prior turn history.
        scope_id = user["id"] if user.get("role") == "agent" else user.get("role", "")
        cache_payload = json.dumps({"msg": req.message.lower().strip()}, sort_keys=True)
        ck = _cache_key(user.get("role", ""), scope_id, "v1", cache_payload)
        cached = None if intent == "followup" else await _from_cache(db, ck)

        # Stage 3: synthesis
        use_premium = intent_data.get("complexity") == "explain" or intent in ("qa", "coaching")
        model_used = "gpt-5.2" if use_premium else "gemini-2.5-flash"
        try:
            if cached:
                reply = cached["reply"]
                model_used = cached.get("model_used", model_used) + " (cached)"
            else:
                reply = await synthesize(emergent_llm_key, user, session["id"], req.message,
                                         messages, intent_data, analytics_data, kb_sources, use_premium)
                if intent != "followup":
                    await _to_cache(db, ck, {"reply": reply, "model_used": model_used})
        except Exception as e:
            logger.error("synthesis failed: %s", e)
            raise HTTPException(500, f"Copilot synthesis failed: {str(e)[:200]}")

        # Persist turns
        user_msg = {"role": "user", "content": req.message, "ts": _now()}
        asst_msg = {
            "role": "assistant",
            "content": reply,
            "ts": _now(),
            "intent": intent,
            "model_used": model_used,
            "sources": [{"title": s["title"], "id": s.get("id"), "category": s.get("category")} for s in kb_sources] or None,
        }
        new_messages = (messages + [user_msg, asst_msg])[-(MAX_STORED_TURNS * 2):]
        title = session.get("title") or req.message[:60]
        await db.copilot_sessions.update_one(
            {"id": session["id"]},
            {"$set": {
                "messages": new_messages, "updated_at": _now(),
                "expires_at": _expires_at(), "title": title,
            }},
        )

        return {
            "session_id": session["id"],
            "reply": reply,
            "intent": intent,
            "model_used": model_used,
            "sources": asst_msg["sources"] or [],
            "suggested_followups": _suggested_followups(intent, user.get("role", "agent")),
        }

    @router.get("/sessions")
    async def list_sessions(user=Depends(get_current_user)):
        now_iso = datetime.now(timezone.utc).isoformat()
        docs = await db.copilot_sessions.find(
            {"user_id": user["id"], "expires_at": {"$gt": now_iso}},
            {"_id": 0, "messages": 0},
        ).sort("updated_at", -1).to_list(50)
        return docs

    @router.get("/sessions/{session_id}")
    async def get_session(session_id: str, user=Depends(get_current_user)):
        doc = await db.copilot_sessions.find_one(
            {"id": session_id, "user_id": user["id"]}, {"_id": 0},
        )
        if not doc:
            raise HTTPException(404, "Session not found")
        return doc

    @router.delete("/sessions/{session_id}")
    async def delete_session(session_id: str, user=Depends(get_current_user)):
        await db.copilot_sessions.delete_one({"id": session_id, "user_id": user["id"]})
        return {"ok": True}

    @router.post("/sessions/{session_id}/clear")
    async def clear_session(session_id: str, user=Depends(get_current_user)):
        result = await db.copilot_sessions.update_one(
            {"id": session_id, "user_id": user["id"]},
            {"$set": {"messages": [], "updated_at": _now(), "title": None}},
        )
        if result.matched_count == 0:
            raise HTTPException(404, "Session not found")
        return {"ok": True}

    return router

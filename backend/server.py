"""FlowPilot - Real-Time Agent Assist Backend (FastAPI)."""
import os
import re
import io
import json
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from pypdf import PdfReader
import hashlib
import base64

from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAISpeechToText, OpenAITextToSpeech


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer(auto_error=False)

app = FastAPI(title="FlowPilot Agent Assist")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("vanguardcx")


# ========== MODELS ==========
class RegisterReq(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "agent"  # agent | supervisor


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str


class TranscriptUtterance(BaseModel):
    speaker: str  # agent | customer
    text: str
    ts: Optional[str] = None


class CallCreateReq(BaseModel):
    channel: str = "voice"  # voice | chat | email
    customer_name: Optional[str] = "Customer"
    customer_id: Optional[str] = None
    workflow: Optional[str] = "general"


class AnalyzeReq(BaseModel):
    call_id: str


class AddUtteranceReq(BaseModel):
    speaker: str
    text: str


class KBSearchReq(BaseModel):
    query: str


class WebhookReq(BaseModel):
    name: str
    url: str
    events: List[str] = []


# ========== HELPERS ==========
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def make_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer)) -> Dict[str, Any]:
    if not cred:
        raise HTTPException(401, "Missing auth")
    try:
        payload = jwt.decode(cred.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except JWTError:
        raise HTTPException(401, "Invalid token")


async def llm_json(system: str, user_text: str, session_id: str) -> Dict[str, Any]:
    """Call LLM and parse JSON response safely."""
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id,
                   system_message=system).with_model("openai", "gpt-5.2")
    resp = await chat.send_message(UserMessage(text=user_text))
    # Extract JSON
    txt = resp.strip()
    m = re.search(r"\{[\s\S]*\}", txt)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            pass
    return {}


def extract_pdf_text(raw: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(raw))
        return "\n".join((p.extract_text() or "") for p in reader.pages)
    except Exception as e:
        logger.warning(f"pdf parse failed: {e}")
        return ""


def keyword_score(query: str, text: str) -> float:
    q_tokens = [t.lower() for t in re.findall(r"\w+", query) if len(t) > 2]
    if not q_tokens:
        return 0.0
    t_low = text.lower()
    hits = sum(t_low.count(t) for t in q_tokens)
    return hits / max(len(t_low.split()), 1) * 1000


# ========== SEED KB ==========
SEED_KB_DOCS = [
    {
        "title": "Credit Card Retention Policy",
        "category": "Banking",
        "content": """Retention offers for credit card churn:
- Offer 5000 bonus reward points if customer has spent > 50000 in last 3 months.
- Offer annual fee waiver for 1 year if tenure > 2 years.
- Always verify KYC (PAN + Aadhaar last 4 digits) before closing account.
- Mandatory disclosure: Read the privacy policy statement and confirm consent for recording.
- If customer cites high interest rate, offer a 3-month APR reduction to 1.5%.
- Escalate to retention specialist if customer mentions competitor by name."""
    },
    {
        "title": "KYC Verification Workflow",
        "category": "Compliance",
        "content": """KYC Verification Steps:
1. Greet customer and verify full name and date of birth.
2. Ask for registered mobile number and last 4 digits of PAN.
3. Send OTP and confirm receipt.
4. Verify address on file (city + pincode is sufficient).
5. Read the mandatory privacy policy disclosure verbatim.
6. Document verification in CRM before proceeding with any transaction.
Required disclosures:
- "This call is being recorded for quality and compliance purposes."
- "Your personal data is protected under our privacy policy."
"""
    },
    {
        "title": "Loan Processing SOP",
        "category": "Banking",
        "content": """Loan Origination Steps:
1. Capture loan type (personal, auto, home), amount, and tenure.
2. Verify KYC as per standard workflow.
3. Check credit score threshold (CIBIL > 700 for personal loan).
4. Collect income proof: last 3 salary slips OR last 6 months bank statement.
5. Offer loan products aligned with tenure: < 3 yrs personal, 3-7 yrs auto, >7 yrs home.
6. Quote indicative EMI. Never confirm final rate without underwriter approval.
Cross-sell: Offer credit life insurance to all loan customers above 2 lakhs.
"""
    },
    {
        "title": "Claims Handling Procedure",
        "category": "Insurance",
        "content": """Insurance Claims Intake:
1. Express empathy. "I'm sorry to hear about this incident."
2. Capture policy number and incident date.
3. Classify claim: motor, health, property.
4. For health claims: hospital name, admission date, diagnosis, estimated amount.
5. Raise claim in CRM and share claim ID with customer.
6. Inform customer of SLAs: 48 hours for initial review, 7 days for decision.
Mandatory disclosure: "All claims are subject to policy terms and conditions. The final decision rests with the claims committee."
"""
    },
    {
        "title": "Complaint Resolution Framework",
        "category": "CX",
        "content": """Complaint handling:
- Acknowledge within 30 seconds of customer raising issue.
- Use the LEAP framework: Listen, Empathize, Apologize (if appropriate), Propose solution.
- Offer goodwill gesture for service failures: waiver, extra reward points, or free month of service.
- Escalate to supervisor if: customer requests escalation, threat of legal action, media mention.
"""
    }
]


# ========== AUTH ROUTES ==========
@api.post("/auth/register")
async def register(req: RegisterReq):
    existing = await db.users.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")
    role = req.role if req.role in ("agent", "supervisor") else "agent"
    uid = str(uuid.uuid4())
    doc = {
        "id": uid,
        "email": req.email.lower(),
        "name": req.name,
        "role": role,
        "password": pwd_ctx.hash(req.password),
        "created_at": now_iso()
    }
    await db.users.insert_one(doc)
    token = make_token(uid, role)
    return {"token": token, "user": {"id": uid, "email": req.email.lower(), "name": req.name, "role": role}}


@api.post("/auth/login")
async def login(req: LoginReq):
    user = await db.users.find_one({"email": req.email.lower()})
    if not user or not pwd_ctx.verify(req.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")
    token = make_token(user["id"], user["role"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


# ========== KB ROUTES ==========
@api.post("/kb/upload")
async def kb_upload(file: UploadFile = File(...), title: str = Form(...), category: str = Form("General"),
                    user=Depends(get_current_user)):
    raw = await file.read()
    fname = file.filename or "doc"
    if fname.lower().endswith(".pdf"):
        content = extract_pdf_text(raw)
    else:
        try:
            content = raw.decode("utf-8", errors="ignore")
        except Exception:
            content = ""
    if not content.strip():
        raise HTTPException(400, "Could not extract text from file")
    doc = {
        "id": str(uuid.uuid4()),
        "title": title,
        "category": category,
        "content": content[:100000],
        "filename": fname,
        "uploaded_by": user["id"],
        "uploaded_at": now_iso()
    }
    await db.kb_docs.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/kb/documents")
async def kb_list(user=Depends(get_current_user)):
    docs = await db.kb_docs.find({}, {"_id": 0, "content": 0}).sort("uploaded_at", -1).to_list(500)
    return docs


@api.delete("/kb/documents/{doc_id}")
async def kb_delete(doc_id: str, user=Depends(get_current_user)):
    await db.kb_docs.delete_one({"id": doc_id})
    return {"ok": True}


@api.post("/kb/search")
async def kb_search(req: KBSearchReq, user=Depends(get_current_user)):
    docs = await db.kb_docs.find({}, {"_id": 0}).to_list(500)
    scored = []
    for d in docs:
        s = keyword_score(req.query, d["title"] + " " + d["content"])
        if s > 0:
            scored.append((s, d))
    scored.sort(key=lambda x: -x[0])
    top = [d for _, d in scored[:3]]
    if not top:
        return {"answer": "No relevant knowledge found.", "sources": []}
    context = "\n\n---\n\n".join([f"[{d['title']}]\n{d['content'][:3000]}" for d in top])
    try:
        out = await llm_json(
            system="You are an enterprise knowledge assistant. Answer strictly from the provided context. Reply JSON: {\"answer\": string, \"citations\": [string]}",
            user_text=f"Question: {req.query}\n\nContext:\n{context}",
            session_id=f"kb-{user['id']}"
        )
        answer = out.get("answer") or top[0]["content"][:500]
    except Exception as e:
        logger.error(f"kb_search llm fail: {e}")
        answer = top[0]["content"][:500]
    return {"answer": answer, "sources": [{"title": d["title"], "category": d["category"], "id": d["id"]} for d in top]}


@api.post("/kb/seed")
async def kb_seed(user=Depends(get_current_user)):
    count = 0
    for d in SEED_KB_DOCS:
        exists = await db.kb_docs.find_one({"title": d["title"]})
        if exists:
            continue
        doc = {
            "id": str(uuid.uuid4()),
            "title": d["title"],
            "category": d["category"],
            "content": d["content"],
            "filename": "seed.txt",
            "uploaded_by": user["id"],
            "uploaded_at": now_iso()
        }
        await db.kb_docs.insert_one(doc)
        count += 1
    return {"seeded": count}


# ========== CALL ROUTES ==========
@api.post("/calls")
async def create_call(req: CallCreateReq, user=Depends(get_current_user)):
    cid = str(uuid.uuid4())
    doc = {
        "id": cid,
        "agent_id": user["id"],
        "agent_name": user["name"],
        "channel": req.channel,
        "customer_name": req.customer_name or "Customer",
        "customer_id": req.customer_id,
        "workflow": req.workflow or "general",
        "status": "active",
        "transcript": [],
        "analysis": None,
        "summary": None,
        "compliance": [],
        "started_at": now_iso(),
        "ended_at": None
    }
    await db.calls.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/calls")
async def list_calls(user=Depends(get_current_user)):
    q = {} if user["role"] == "supervisor" else {"agent_id": user["id"]}
    calls = await db.calls.find(q, {"_id": 0}).sort("started_at", -1).to_list(200)
    return calls


@api.get("/calls/active")
async def list_active(user=Depends(get_current_user)):
    calls = await db.calls.find({"status": "active"}, {"_id": 0}).sort("started_at", -1).to_list(100)
    return calls


@api.get("/calls/{call_id}")
async def get_call(call_id: str, user=Depends(get_current_user)):
    c = await db.calls.find_one({"id": call_id}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Call not found")
    return c


@api.post("/calls/{call_id}/utterance")
async def add_utterance(call_id: str, req: AddUtteranceReq, user=Depends(get_current_user)):
    utt = {"speaker": req.speaker, "text": req.text, "ts": now_iso()}
    await db.calls.update_one({"id": call_id}, {"$push": {"transcript": utt}})
    return utt


@api.post("/calls/{call_id}/audio")
async def upload_audio(call_id: str, speaker: str = Form("customer"),
                       file: UploadFile = File(...), user=Depends(get_current_user)):
    raw = await file.read()
    fname = file.filename or "audio.webm"
    try:
        stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
        bio = io.BytesIO(raw)
        bio.name = fname
        response = await stt.transcribe(file=bio, model="whisper-1", response_format="json", language="en")
        text = response.text if hasattr(response, "text") else str(response)
    except Exception as e:
        logger.error(f"whisper fail: {e}")
        raise HTTPException(500, f"Transcription failed: {str(e)[:200]}")
    if not text.strip():
        return {"text": "", "utterance": None}
    utt = {"speaker": speaker, "text": text.strip(), "ts": now_iso()}
    await db.calls.update_one({"id": call_id}, {"$push": {"transcript": utt}})
    return {"text": text, "utterance": utt}


@api.post("/calls/{call_id}/analyze")
async def analyze_call(call_id: str, user=Depends(get_current_user)):
    call = await db.calls.find_one({"id": call_id}, {"_id": 0})
    if not call:
        raise HTTPException(404, "Call not found")
    transcript = call.get("transcript", [])
    if not transcript:
        raise HTTPException(400, "Empty transcript")
    conv = "\n".join(f"{t['speaker'].upper()}: {t['text']}" for t in transcript[-30:])
    workflow = call.get("workflow", "general")
    system = (
        "You are a real-time agent assist AI for contact centers. Analyze the conversation so far "
        "and respond ONLY with strict JSON (no prose) of shape: {"
        "\"intent\": string, \"intent_confidence\": number(0-1), "
        "\"sentiment\": \"positive\"|\"neutral\"|\"negative\"|\"frustrated\", "
        "\"sentiment_score\": number(-1 to 1), "
        "\"escalation_risk\": \"low\"|\"medium\"|\"high\", "
        "\"churn_risk\": \"low\"|\"medium\"|\"high\", "
        "\"next_best_actions\": [{\"title\": string, \"reason\": string, \"type\": \"response\"|\"question\"|\"action\"|\"upsell\"}], "
        "\"suggested_response\": string, "
        "\"compliance\": [{\"item\": string, \"status\": \"done\"|\"pending\"|\"missed\", \"note\": string}], "
        "\"kb_query\": string }"
    )
    user_text = f"Workflow: {workflow}\n\nConversation so far:\n{conv}\n\nCompliance items to check: privacy policy disclosure, KYC verification, recording consent."
    try:
        analysis = await llm_json(system, user_text, session_id=f"analyze-{call_id}")
    except Exception as e:
        logger.error(f"analyze fail: {e}")
        raise HTTPException(500, f"LLM failed: {str(e)[:200]}")
    await db.calls.update_one({"id": call_id}, {"$set": {"analysis": analysis, "analyzed_at": now_iso()}})
    # Run KB lookup if suggested
    kb_result = None
    kq = analysis.get("kb_query")
    if kq:
        try:
            docs = await db.kb_docs.find({}, {"_id": 0}).to_list(500)
            scored = sorted(
                [(keyword_score(kq, d["title"] + " " + d["content"]), d) for d in docs],
                key=lambda x: -x[0]
            )[:3]
            kb_result = {"query": kq, "sources": [{"title": d["title"], "category": d["category"], "snippet": d["content"][:400]} for s, d in scored if s > 0]}
        except Exception:
            pass
    analysis["kb_result"] = kb_result
    return analysis


@api.post("/calls/{call_id}/summary")
async def summarize_call(call_id: str, user=Depends(get_current_user)):
    call = await db.calls.find_one({"id": call_id}, {"_id": 0})
    if not call:
        raise HTTPException(404)
    transcript = call.get("transcript", [])
    if not transcript:
        raise HTTPException(400, "Empty transcript")
    conv = "\n".join(f"{t['speaker'].upper()}: {t['text']}" for t in transcript)
    system = (
        "You are an AI call summarizer. Output JSON only: {"
        "\"summary\": string, \"customer_intent\": string, "
        "\"key_points\": [string], \"next_steps\": [string], "
        "\"resolution\": string, \"tags\": [string]}"
    )
    out = await llm_json(system, f"Transcript:\n{conv}", session_id=f"sum-{call_id}")
    await db.calls.update_one({"id": call_id}, {
        "$set": {"summary": out, "status": "completed", "ended_at": now_iso()}
    })
    return out


@api.post("/calls/{call_id}/end")
async def end_call(call_id: str, user=Depends(get_current_user)):
    await db.calls.update_one({"id": call_id}, {"$set": {"status": "completed", "ended_at": now_iso()}})
    return {"ok": True}


# ========== ANALYTICS ==========
@api.get("/analytics/overview")
async def analytics_overview(user=Depends(get_current_user)):
    total = await db.calls.count_documents({})
    active = await db.calls.count_documents({"status": "active"})
    completed = await db.calls.count_documents({"status": "completed"})
    calls = await db.calls.find({}, {"_id": 0, "analysis": 1, "summary": 1, "channel": 1, "started_at": 1}).to_list(500)
    sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0, "frustrated": 0}
    escalation_counts = {"low": 0, "medium": 0, "high": 0}
    channel_counts: Dict[str, int] = {}
    for c in calls:
        a = c.get("analysis") or {}
        s = a.get("sentiment")
        if s in sentiment_counts:
            sentiment_counts[s] += 1
        e = a.get("escalation_risk")
        if e in escalation_counts:
            escalation_counts[e] += 1
        ch = c.get("channel", "voice")
        channel_counts[ch] = channel_counts.get(ch, 0) + 1
    return {
        "total_calls": total,
        "active_calls": active,
        "completed_calls": completed,
        "sentiment": sentiment_counts,
        "escalation": escalation_counts,
        "channels": channel_counts
    }


# ========== WORKFLOWS ==========
@api.get("/workflows")
async def list_workflows(user=Depends(get_current_user)):
    return [
        {"id": "kyc", "name": "KYC Verification", "steps": [
            "Greet & verify name + DOB", "Ask registered mobile + PAN last 4",
            "Send & confirm OTP", "Verify address (city + pincode)",
            "Read privacy disclosure", "Document in CRM"
        ]},
        {"id": "loan", "name": "Loan Processing", "steps": [
            "Capture loan type, amount, tenure", "Complete KYC",
            "Check credit score (>700)", "Collect income proof",
            "Offer suitable product", "Quote indicative EMI", "Cross-sell credit life insurance"
        ]},
        {"id": "claims", "name": "Claims Handling", "steps": [
            "Express empathy", "Capture policy # + incident date",
            "Classify claim", "Collect claim details",
            "Raise in CRM + share claim ID", "Inform SLAs"
        ]},
        {"id": "retention", "name": "Credit Card Retention", "steps": [
            "Acknowledge intent to close", "Verify KYC",
            "Probe reason", "Offer retention incentive",
            "Confirm decision", "Close or retain with CRM note"
        ]},
        {"id": "general", "name": "General Inquiry", "steps": [
            "Greet + verify identity", "Listen to query",
            "Search knowledge base", "Provide resolution", "Confirm satisfaction"
        ]}
    ]


# ========== INTEGRATIONS / WEBHOOKS ==========
@api.get("/integrations/webhooks")
async def list_webhooks(user=Depends(get_current_user)):
    hooks = await db.webhooks.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return hooks


@api.post("/integrations/webhooks")
async def add_webhook(req: WebhookReq, user=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": req.name,
        "url": req.url,
        "events": req.events,
        "created_at": now_iso()
    }
    await db.webhooks.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.delete("/integrations/webhooks/{wh_id}")
async def delete_webhook(wh_id: str, user=Depends(get_current_user)):
    await db.webhooks.delete_one({"id": wh_id, "user_id": user["id"]})
    return {"ok": True}


@api.get("/integrations/providers")
async def list_providers(user=Depends(get_current_user)):
    return [
        {"id": "genesys", "name": "Genesys Cloud CX", "status": "available"},
        {"id": "five9", "name": "Five9", "status": "available"},
        {"id": "nice", "name": "NICE CXone", "status": "available"},
        {"id": "amazon_connect", "name": "Amazon Connect", "status": "available"},
        {"id": "twilio_flex", "name": "Twilio Flex", "status": "available"},
        {"id": "webex_cc", "name": "Cisco Webex Contact Center", "status": "available"},
        {"id": "zendesk_talk", "name": "Zendesk Talk", "status": "available"},
        {"id": "salesforce_sc", "name": "Salesforce Service Cloud Voice", "status": "available"}
    ]


# ========== HEALTH ==========
@api.get("/")
async def root():
    return {"service": "FlowPilot Agent Assist", "version": "1.0.0", "status": "healthy"}


# ========== DEMO (TTS + LEAD CAPTURE) ==========
class TTSReq(BaseModel):
    text: str
    voice: str = "coral"


class LeadReq(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = ""
    message: Optional[str] = ""


@api.post("/demo/tts")
async def demo_tts(req: TTSReq):
    """Public TTS for the demo player. Caches audio by sha256(text+voice) to avoid regenerating."""
    if not req.text or len(req.text) > 4000:
        raise HTTPException(400, "Text required (max 4000 chars)")
    key = hashlib.sha256(f"{req.voice}|{req.text}".encode("utf-8")).hexdigest()
    cached = await db.tts_cache.find_one({"key": key}, {"_id": 0, "audio_b64": 1})
    if cached and cached.get("audio_b64"):
        return {"audio_b64": cached["audio_b64"], "cached": True}
    try:
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        audio_bytes = await tts.generate_speech(
            text=req.text, model="tts-1-hd", voice=req.voice, response_format="mp3", speed=1.0
        )
        b64 = base64.b64encode(audio_bytes).decode("ascii")
        await db.tts_cache.update_one(
            {"key": key},
            {"$set": {
                "key": key, "voice": req.voice, "text": req.text[:200],
                "audio_b64": b64, "created_at": now_iso()
            }},
            upsert=True
        )
        return {"audio_b64": b64, "cached": False}
    except Exception as e:
        logger.error(f"tts fail: {e}")
        raise HTTPException(500, f"TTS failed: {str(e)[:200]}")


@api.post("/demo/lead")
async def demo_lead(req: LeadReq):
    doc = {
        "id": str(uuid.uuid4()),
        "name": req.name,
        "email": req.email.lower(),
        "company": req.company or "",
        "message": req.message or "",
        "created_at": now_iso()
    }
    await db.leads.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True, "id": doc["id"]}


@api.get("/demo/leads")
async def list_leads(user=Depends(get_current_user)):
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return leads


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

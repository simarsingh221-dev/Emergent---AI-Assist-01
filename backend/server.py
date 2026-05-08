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
logger = logging.getLogger("flowpilot")


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
        "active": True,
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
    if user.get("active") is False:
        raise HTTPException(403, "Account is deactivated")
    token = make_token(user["id"], user["role"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


# ========== USER MANAGEMENT (supervisor only) ==========
class UserCreateReq(BaseModel):
    email: EmailStr
    name: str
    role: str = "agent"
    password: str


class UserUpdateReq(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    active: Optional[bool] = None


class PasswordResetReq(BaseModel):
    new_password: str


def require_supervisor(user: Dict[str, Any]) -> None:
    if user.get("role") != "supervisor":
        raise HTTPException(403, "Supervisor role required")


@api.get("/users")
async def list_users(user=Depends(get_current_user)):
    require_supervisor(user)
    users = await db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(1000)
    return users


@api.post("/users")
async def create_user(req: UserCreateReq, user=Depends(get_current_user)):
    require_supervisor(user)
    if req.role not in ("agent", "supervisor"):
        raise HTTPException(400, "role must be agent or supervisor")
    existing = await db.users.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid, "email": req.email.lower(), "name": req.name, "role": req.role,
        "password": pwd_ctx.hash(req.password), "active": True,
        "created_at": now_iso(), "created_by": user["id"]
    }
    await db.users.insert_one(doc)
    return {"id": uid, "email": doc["email"], "name": doc["name"], "role": doc["role"], "active": True, "created_at": doc["created_at"]}


@api.patch("/users/{user_id}")
async def update_user(user_id: str, req: UserUpdateReq, user=Depends(get_current_user)):
    require_supervisor(user)
    updates: Dict[str, Any] = {}
    if req.name is not None:
        updates["name"] = req.name
    if req.role is not None:
        if req.role not in ("agent", "supervisor"):
            raise HTTPException(400, "role must be agent or supervisor")
        updates["role"] = req.role
    if req.active is not None:
        updates["active"] = req.active
    if not updates:
        raise HTTPException(400, "No fields to update")
    result = await db.users.update_one({"id": user_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(404, "User not found")
    doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    return doc


@api.post("/users/{user_id}/reset-password")
async def reset_password(user_id: str, req: PasswordResetReq, user=Depends(get_current_user)):
    require_supervisor(user)
    if len(req.new_password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    result = await db.users.update_one({"id": user_id}, {"$set": {"password": pwd_ctx.hash(req.new_password)}})
    if result.matched_count == 0:
        raise HTTPException(404, "User not found")
    return {"ok": True}


@api.delete("/users/{user_id}")
async def delete_user(user_id: str, user=Depends(get_current_user)):
    require_supervisor(user)
    if user_id == user["id"]:
        raise HTTPException(400, "Cannot delete your own account")
    await db.users.delete_one({"id": user_id})
    return {"ok": True}


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
        "\"suggested_response\": string (STRICT 160-250 characters; concise empathetic, action-oriented; no preamble), "
        "\"compliance\": [{\"item\": string, \"status\": \"done\"|\"pending\"|\"missed\", \"note\": string}], "
        "\"kb_query\": string }"
    )
    user_text = f"Workflow: {workflow}\n\nConversation so far:\n{conv}\n\nCompliance items to check: privacy policy disclosure, KYC verification, recording consent."
    try:
        analysis = await llm_json(system, user_text, session_id=f"analyze-{call_id}")
    except Exception as e:
        logger.error(f"analyze fail: {e}")
        raise HTTPException(500, f"LLM failed: {str(e)[:200]}")
    # Hard cap suggested_response to 250 chars (LLM should respect, but enforce)
    sr = analysis.get("suggested_response") or ""
    if isinstance(sr, str) and len(sr) > 250:
        cut = sr[:247].rsplit(" ", 1)[0]
        analysis["suggested_response"] = (cut + "…") if cut else sr[:250]
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


# ========== WORKFLOWS (DB-backed, supervisor-editable) ==========
class WorkflowStep(BaseModel):
    label: str
    description: Optional[str] = ""
    trigger_keywords: List[str] = []
    required: bool = False


class WorkflowReq(BaseModel):
    name: str
    description: Optional[str] = ""
    category: Optional[str] = "General"
    steps: List[WorkflowStep] = []
    compliance_items: List[str] = []
    active: bool = True


SEED_WORKFLOWS = [
    {"id": "kyc", "name": "KYC Verification", "category": "Compliance", "description": "Verify customer identity before account-specific actions.",
     "steps": [
         {"label": "Verify name and date of birth", "description": "Confirm full legal name + DOB.", "trigger_keywords": ["name", "date of birth", "DOB"], "required": True},
         {"label": "Capture mobile and PAN last 4", "description": "", "trigger_keywords": ["mobile", "PAN"], "required": True},
         {"label": "Send and confirm OTP", "description": "", "trigger_keywords": ["OTP"], "required": True},
         {"label": "Verify address (city + pincode)", "description": "", "trigger_keywords": ["address", "pincode"], "required": True},
         {"label": "Read privacy disclosure", "description": "Mandatory by law.", "trigger_keywords": ["privacy", "disclosure"], "required": True},
         {"label": "Document in CRM", "description": "", "trigger_keywords": [], "required": False}
     ],
     "compliance_items": ["Privacy policy disclosure", "Recording consent", "KYC verification"]},
    {"id": "loan", "name": "Loan Processing", "category": "Banking", "description": "Originate a personal, auto or home loan.",
     "steps": [
         {"label": "Capture loan type, amount, tenure", "description": "", "trigger_keywords": ["loan", "lakhs", "years"], "required": True},
         {"label": "Complete KYC", "description": "See KYC workflow.", "trigger_keywords": [], "required": True},
         {"label": "Check credit score (>700)", "description": "", "trigger_keywords": ["CIBIL", "credit score"], "required": True},
         {"label": "Collect income proof", "description": "Last 3 salary slips or 6-mo bank stmt.", "trigger_keywords": ["salary", "income"], "required": True},
         {"label": "Offer suitable product", "description": "", "trigger_keywords": [], "required": False},
         {"label": "Quote indicative EMI", "description": "", "trigger_keywords": ["EMI"], "required": False},
         {"label": "Cross-sell credit life insurance", "description": "", "trigger_keywords": ["insurance"], "required": False}
     ],
     "compliance_items": ["Privacy policy disclosure", "Recording consent", "Credit score consent"]},
    {"id": "claims", "name": "Claims Handling", "category": "Insurance", "description": "Insurance claim intake and escalation.",
     "steps": [
         {"label": "Express empathy", "description": "", "trigger_keywords": [], "required": True},
         {"label": "Capture policy # + incident date", "description": "", "trigger_keywords": ["policy", "incident"], "required": True},
         {"label": "Classify claim (motor/health/property)", "description": "", "trigger_keywords": ["claim", "motor", "health", "property"], "required": True},
         {"label": "Collect claim details", "description": "", "trigger_keywords": [], "required": True},
         {"label": "Raise in CRM + share claim ID", "description": "", "trigger_keywords": ["claim ID"], "required": True},
         {"label": "Inform SLAs", "description": "48 hrs initial, 7 days decision.", "trigger_keywords": ["SLA", "timeline"], "required": False}
     ],
     "compliance_items": ["Privacy policy disclosure", "Recording consent", "Policy T&C disclosure"]},
    {"id": "retention", "name": "Credit Card Retention", "category": "Banking", "description": "Retain at-risk credit card customers.",
     "steps": [
         {"label": "Acknowledge intent to close", "description": "", "trigger_keywords": ["close", "cancel"], "required": True},
         {"label": "Verify KYC", "description": "", "trigger_keywords": [], "required": True},
         {"label": "Probe reason", "description": "", "trigger_keywords": ["reason", "why"], "required": False},
         {"label": "Offer retention incentive", "description": "5K points / fee waiver / APR reduction.", "trigger_keywords": [], "required": False},
         {"label": "Confirm decision", "description": "", "trigger_keywords": [], "required": True},
         {"label": "Close or retain with CRM note", "description": "", "trigger_keywords": [], "required": True}
     ],
     "compliance_items": ["Privacy policy disclosure", "Recording consent", "KYC verification"]},
    {"id": "general", "name": "General Inquiry", "category": "CX", "description": "Default fallback for unclassified queries.",
     "steps": [
         {"label": "Greet + verify identity", "description": "", "trigger_keywords": [], "required": True},
         {"label": "Listen to query", "description": "", "trigger_keywords": [], "required": True},
         {"label": "Search knowledge base", "description": "", "trigger_keywords": [], "required": False},
         {"label": "Provide resolution", "description": "", "trigger_keywords": [], "required": True},
         {"label": "Confirm satisfaction", "description": "", "trigger_keywords": ["satisfied", "resolved"], "required": False}
     ],
     "compliance_items": ["Privacy policy disclosure", "Recording consent"]}
]


async def _ensure_workflows_seeded() -> None:
    count = await db.workflows.count_documents({})
    if count == 0:
        for w in SEED_WORKFLOWS:
            doc = dict(w)
            doc["active"] = True
            doc["created_at"] = now_iso()
            doc["is_seed"] = True
            await db.workflows.insert_one(doc)


@api.get("/workflows")
async def list_workflows(user=Depends(get_current_user)):
    await _ensure_workflows_seeded()
    docs = await db.workflows.find({"active": True}, {"_id": 0}).sort("name", 1).to_list(200)
    return docs


@api.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str, user=Depends(get_current_user)):
    await _ensure_workflows_seeded()
    doc = await db.workflows.find_one({"id": workflow_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Workflow not found")
    return doc


@api.post("/workflows")
async def create_workflow(req: WorkflowReq, user=Depends(get_current_user)):
    require_supervisor(user)
    wid = re.sub(r"[^a-z0-9]+", "-", req.name.lower()).strip("-") or str(uuid.uuid4())
    exists = await db.workflows.find_one({"id": wid})
    if exists:
        wid = wid + "-" + str(uuid.uuid4())[:6]
    doc = {
        "id": wid, "name": req.name, "description": req.description or "",
        "category": req.category or "General",
        "steps": [s.model_dump() for s in req.steps],
        "compliance_items": req.compliance_items,
        "active": req.active, "is_seed": False,
        "created_at": now_iso(), "created_by": user["id"]
    }
    await db.workflows.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.patch("/workflows/{workflow_id}")
async def update_workflow(workflow_id: str, req: WorkflowReq, user=Depends(get_current_user)):
    require_supervisor(user)
    updates = {
        "name": req.name, "description": req.description or "",
        "category": req.category or "General",
        "steps": [s.model_dump() for s in req.steps],
        "compliance_items": req.compliance_items,
        "active": req.active, "updated_at": now_iso()
    }
    result = await db.workflows.update_one({"id": workflow_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(404, "Workflow not found")
    doc = await db.workflows.find_one({"id": workflow_id}, {"_id": 0})
    return doc


@api.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str, user=Depends(get_current_user)):
    require_supervisor(user)
    doc = await db.workflows.find_one({"id": workflow_id})
    if not doc:
        raise HTTPException(404, "Workflow not found")
    if doc.get("is_seed"):
        # soft-disable seeded workflows instead of hard delete
        await db.workflows.update_one({"id": workflow_id}, {"$set": {"active": False}})
        return {"ok": True, "deactivated": True}
    await db.workflows.delete_one({"id": workflow_id})
    return {"ok": True, "deleted": True}


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


# ========== APP SETTINGS (assist mode) ==========
class AssistModeReq(BaseModel):
    mode: str  # "auto" or "click"


@api.get("/settings/assist")
async def get_assist_mode(user=Depends(get_current_user)):
    doc = await db.app_settings.find_one({"id": "assist_mode"}, {"_id": 0})
    return {"mode": (doc or {}).get("mode", "auto")}


@api.put("/settings/assist")
async def set_assist_mode(req: AssistModeReq, user=Depends(get_current_user)):
    if user["role"] != "supervisor":
        raise HTTPException(403, "Only supervisors can change assist mode")
    if req.mode not in ("auto", "click"):
        raise HTTPException(400, "mode must be 'auto' or 'click'")
    await db.app_settings.update_one(
        {"id": "assist_mode"},
        {"$set": {"id": "assist_mode", "mode": req.mode, "updated_at": now_iso(), "updated_by": user["id"]}},
        upsert=True
    )
    return {"mode": req.mode}


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


# CORS — when allow_credentials is True, allow_origin_regex is required because
# the literal "*" is rejected by browsers in credentialed-style preflight.
# We accept all origins via regex (safe — auth is JWT in Authorization header,
# not cookies) so custom domains (e.g. flowpilot.co.in) work in production.
_cors_env = os.environ.get('CORS_ORIGINS', '*').strip()
if _cors_env in ('', '*'):
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in _cors_env.split(',') if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

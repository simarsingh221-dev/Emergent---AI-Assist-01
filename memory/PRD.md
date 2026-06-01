# FlowPilot — Real-Time Agent Assist

## Original Problem Statement
A webapp that integrates with existing Call Monitoring / CCaaS solutions to provide Real-Time Agent Assist. lars: (1) real-time listening + intent, (2) live NBA suggestions, (3) instant KB retrieval, (4) auto note-taking & summarization, (5) real-time compliance (AutoQA), (6) live analytics & sentiment, (7) workflow guidance, (8) omnichannel low-latency. UI/UX must be great and smooth, integration-ready.

## User Choices
- LLM: **Emergent LLM Key** (GPT-5.2 for chat/analysis)
- STT: **OpenAI Whisper** (whisper-1) via Emergent key
- KB: Upload **+** seeded demo
- Auth: **JWT email/password** (agent + supervisor roles)
- Channel priority: **Voice + Chat in unified workspace**

## Architecture
- **Backend**: FastAPI on :8001, MongoDB (motor), JWT (python-jose + passlib[bcrypt]), emergentintegrations (LlmChat + OpenAISpeechToText), pypdf for PDF text extraction.
- **Frontend**: React 19 + react-router 7, Tailwind + shadcn/ui, `@phosphor-icons/react`, `framer-motion`, `recharts`, `sonner`.
- **Design**: Swiss high-contrast ("FlowPilot"), Cabinet Grotesk / IBM Plex Sans / JetBrains Mono, brand gradient Purple #7B61FF → Cyan #00D4FF → Pink #FF4FD8 on black/white.

## Personas
- **Agent**: frontline rep, uses Agent Workspace during calls/chats.
- **Supervisor**: ops lead, monitors live calls and analytics.

## Implemented (2026-02)
- JWT auth (`/api/auth/register|login|me`)
- Call lifecycle: create, list, active, get, utterance (text), audio → Whisper, analyze (GPT-5.2 JSON), summary, end
- KB: upload (PDF/TXT), list, delete, seed (5 demo SOPs), semantic-like search with LLM answer
- Analytics overview: counts, sentiment buckets, escalation buckets, channel mix
- Workflows: 5 canned (KYC, Loan, Claims, Retention, General)
- Integrations: 8 CCaaS providers listed, webhook CRUD
- Frontend pages: Landing, Login, Register, Agent Workspace (4-pane), Supervisor Dashboard, Knowledge Base, Analytics, Settings, Call History
- Mic recording → upload → Whisper transcription in workspace
- AI Assist panel: intent, sentiment, escalation, churn risk, NBA cards, suggested response (click to use), compliance checklist, KB suggestions
- **Demo Mode** (`/demo`): 3-min self-running narrated tour with 3 scenarios (retention / KYC / frustrated claim), OpenAI TTS-1-HD voice (`coral`), brand-gradient progress, server-side TTS caching, CTA + lead capture (`/api/demo/lead`)
- **User Management** (2026-02-05): DB-backed CRUD at `/api/users` (list/create/patch/delete + reset-password), supervisor-gated, self-delete blocked. UI at `/app/users`.
- **Visual Workflow Builder** (2026-02-05): DB-backed workflows at `/api/workflows` replacing hardcoded ones. 5 default workflows auto-seeded (kyc/loan/claims/retention/general). Soft-disable for seeded entries, hard delete for custom. UI at `/app/workflows` with steps + compliance items editor and pipeline diagram.
- **Public registration removed** (2026-02-08): Landing page CTAs replaced with "Contact us" / "Talk to sales". Login removes "Create an account". `/register` route redirects to `/contact`. `/api/auth/register` now requires supervisor/admin auth (was public). Accounts are exclusively provisioned by supervisor/admin via `/app/users`.
- **Contact Us** (2026-02-08): New `/contact` page + `POST /api/contact` (public, no auth) → `db.contacts` collection. Supervisors/admins list via `GET /api/contacts`. Email integration was deliberately deferred per user choice.
- **Privacy & Terms** (2026-02-08): New `/privacy` and `/terms` pages with full legal content, linked from a new shared `Footer` component on Landing/Contact/Privacy/Terms.
- **Admin role** (2026-02-08): Backend accepts `admin` alongside `agent`/`supervisor`; `require_supervisor` now also accepts admin (admin = full supervisor access). UserManagement UI shows Admin in Create/Edit role dropdown. AppShell sidebar grants admins access to Users + Supervisor sections. Settings AI Assist toggle works for admin role too.
- **CORS hardened** (2026-02-08): Replaced `allow_origins=['*']` + `allow_credentials=True` (invalid combo silently rejected by browsers) with `allow_origin_regex='.*'` so custom domains like `flowpilot.co.in` work in production with credentialed-style preflight.
- **Resend email** (2026-02-08): `POST /api/contact` now fires a Resend notification to `contactus@flowpilot.co.in` (HTML email, reply-to set to submitter). `flowpilot.co.in` domain verified, `notifications@flowpilot.co.in` sender. Fire-and-forget via `asyncio.create_task` so submission API stays fast.
- **FlowPilot Copilot** (2026-02-12): Conversational operational intelligence module. New backend `copilot.py` (350 LOC, separate router under `/api/copilot`) with **cost-optimized 3-stage pipeline** — (1) Intent classifier on Gemini 2.5 Flash (~$0.0001/turn) (2) Deterministic MongoDB fetch with RBAC scope (zero LLM cost) (3) Synthesis on Flash for simple/follow-up, GPT-5.2 only for `complexity=explain` or `intent in (qa, coaching)`. 5-min response cache keyed on `(role, scope, normalized_message)`. Sessions persisted with 24h expiry, max 20 stored turns, last 6 sent to LLM. RBAC: agents see own data only, supervisors/admins see team+org. Frontend slide-over `CopilotPanel` triggered from a fixed top-right "Ask Copilot" button on Supervisor/History/KB/Analytics/Workflows/Users/Settings pages (hidden on `/app/workspace` to avoid crowding the 4-pane). Tabs: Analytics / Knowledge / QA Insights / Coaching. Tested via QA agent (16/17 backend + 7/7 frontend flows pass on iter4 2026-02-12).

## Test Results
- Backend: 24/24 + 28/28 pytest pass (`backend_test.py`, `test_users_workflows.py`) — re-run 2026-02-05 after code-review fixes.
- Frontend: full Playwright E2E pass — landing, login, workspace, KB, settings, analytics, history, **users CRUD, workflows CRUD** (iter2 2026-02-05).
- Code-review hygiene pass (2026-02-05): hardcoded test password → env var; empty `catch{}` blocks → logged; missing React-hook deps fixed via `useCallback` for `load` (UserManagement / WorkflowBuilder / Settings / KnowledgeBase / AgentWorkspace); WorkflowBuilder editor steps now use stable `_key` UUIDs (not array index) so reordering doesn't corrupt state. Backend lint (ruff) and frontend lint (ESLint) clean.

## Backlog
### P0
- Real embeddings for KB (OpenAI text-embedding-3) instead of keyword scoring
- WebSocket / SSE streaming for live analyze while agent speaks
- Role-gated supervisor barge-in / whisper coaching

### P1
- Email channel ingestion (IMAP webhook)
- CRM two-way sync (Salesforce SCV, Zendesk Talk) — currently providers are "available" placeholders
- Auto language detection + multi-lingual assist
- Post-call CSAT link auto-send
- Rate limiting on LLM endpoints

### P2
- Multi-tenant orgs with invites
- Custom compliance templates per tenant
- Call recording storage (object storage)
- Exportable analytics (CSV/PDF)

## Deploy Notes
- `EMERGENT_LLM_KEY` + `JWT_SECRET` in `/app/backend/.env`
- `REACT_APP_BACKEND_URL` preserved (preview URL)
- Single supervisor restart applied after initial setup; hot reload for iterations

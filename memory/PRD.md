# FlowPilot — Real-Time Agent Assist

## Original Problem Statement
A webapp that integrates with existing Call Monitoring / CCaaS solutions to provide Real-Time Agent Assist. Eight pillars: (1) real-time listening + intent, (2) live NBA suggestions, (3) instant KB retrieval, (4) auto note-taking & summarization, (5) real-time compliance (AutoQA), (6) live analytics & sentiment, (7) workflow guidance, (8) omnichannel low-latency. UI/UX must be great and smooth, integration-ready.

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

## Test Results
- Backend: 24/24 pytest pass (`/app/backend/tests/backend_test.py`)
- Frontend: full Playwright E2E pass — landing, login, workspace flow (start → utter → analyze → end/summary), KB seed/search/upload, settings webhook CRUD, analytics, history.

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

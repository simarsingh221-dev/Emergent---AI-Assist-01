# Business Requirements Document

## FlowPilot — Real-Time Agent Assist Platform

---

| Field | Value |
|---|---|
| **Document type** | Business Requirements Document (BRD) — Commercial Proposal |
| **Document version** | 1.0 — Initial |
| **Issue date** | [DD-MMM-YYYY] |
| **Valid until** | [90 days from issue] |
| **Prepared by** | [YOUR COMPANY NAME] — Solution Engineering |
| **Prepared for** | [CLIENT COMPANY NAME] — Contact Center Operations |
| **Proposal reference #** | FP-[YYYY]-[####] |
| **Classification** | Confidential — Client Review Only |

---

## 1. Executive Summary

**[YOUR COMPANY NAME]** proposes the deployment of **FlowPilot**, a Real-Time Agent Assist platform, to the **[CLIENT COMPANY NAME]** contact center operation. FlowPilot integrates with the client's existing Call Monitoring / CCaaS solution to provide live conversational intelligence, next-best-action guidance, instant knowledge retrieval, automated compliance tracking, and auto-generated call summaries across voice, chat, and email channels.

This document formalises the scope, functional deliverables, technical architecture, cost structure, commercial terms, and service levels for client approval, and forms the basis for the subsequent Statement of Work (SOW) and Master Services Agreement (MSA).

### At-a-glance

| Item | Value |
|---|---|
| **Platform** | FlowPilot v1.0 — Real-Time Agent Assist |
| **Commercial model** | Cost + 17% transparent pass-through |
| **Price to client** | **₹1,578 / agent / month** (inclusive of all software, LLM, STT, infrastructure) |
| **Baseline usage** | 600 calls × 5 min average per agent per month |
| **Implementation timeline** | 4 weeks (T+0 → T+28) |
| **Deployment model** | SaaS, multi-tenant, cloud-hosted |
| **Contract term** | 12 months (renewable) |
| **Minimum commitment** | [N] agents |

---

## 2. Project Context & Business Objectives

### 2.1 Client business challenge
The client operates a [N]-seat contact center handling inbound and outbound customer conversations across voice, chat, and email. Current operational pain points:

- Agent ramp-up time exceeds [X] weeks
- After-call work consumes an estimated 30–40% of agent productive time
- Missed compliance disclosures create regulatory and reputation exposure
- Supervisors lack real-time visibility into at-risk conversations
- Knowledge base retrieval is manual, slow, and inconsistent across agents
- No unified workspace across voice, chat, and email channels

### 2.2 Objectives of the engagement
1. Reduce Average Handle Time (AHT) by 15–25%
2. Reduce After-Call Work (ACW) by up to 80%
3. Achieve ≥ 95% real-time compliance adherence on mandatory disclosures
4. Enable supervisors to identify and intervene on at-risk calls within 30 seconds
5. Increase first-call resolution (FCR) through contextual next-best-action guidance
6. Reduce agent training time by 40–50% via live workflow guidance
7. Drive incremental revenue through data-driven cross-sell / up-sell prompts

### 2.3 Business benefits (quantified, baseline 100 agents)

| Benefit | Assumption | Annual value |
|---|---|---|
| ACW time saved | 6 min/call × 600 calls × 100 agents × 12 mo = 72,000 hrs | @ ₹500/hr = **₹3.6 Cr** |
| Compliance penalty avoidance | 2 major incidents avoided / year | **₹50 L – ₹2 Cr** |
| Cross-sell uplift (Phase 2) | 5% incremental conversion on loan workflows | **₹1–2 Cr** |
| Attrition reduction | 20% improvement in agent retention | **₹40 L** (recruitment + training savings) |

---

## 3. Solution Overview

FlowPilot is a cloud-hosted SaaS platform that sits alongside the client's existing CCaaS infrastructure. It ingests conversation data (voice, chat, email) via native connectors or webhooks, applies Large Language Model (LLM) reasoning and Speech-to-Text (STT) transcription in near real-time, and surfaces contextual intelligence to agents and supervisors through a unified web workspace.

### 3.1 The eight functional pillars

| # | Pillar | What it does |
|---|---|---|
| **1** | Real-time listening & understanding | Transcribes voice calls and ingests chat/email; detects customer intent, sentiment, and context in ≤ 3 seconds |
| **2** | Next-best-action suggestions | Recommends responses, probing questions, retention offers, cross-sell opportunities based on live conversation state |
| **3** | Instant knowledge retrieval | Semantic search across client-owned SOPs, policies, and product documentation — presents cited answers in-context |
| **4** | Auto note-taking & call summaries | Generates structured call summary (intent, key points, next steps, tags) on call end — eliminates up to 80% of wrap-up |
| **5** | Real-time compliance monitoring | Tracks mandatory disclosures and script adherence live; flags missed items for supervisor review |
| **6** | Sentiment & risk detection | Classifies sentiment, escalation risk, and churn risk every 30–60 seconds; alerts supervisors on HIGH-risk conversations |
| **7** | Workflow guidance | Step-by-step guided flows for KYC, Loan Processing, Claims Handling, Retention, and General Inquiry |
| **8** | Omnichannel support | Unified agent workspace for voice, chat, and email — one UI, one skill set |

---

## 4. Scope of Services

### 4.1 In-scope (included in the per-agent price)

**Software delivery**
- FlowPilot platform access — web application accessible via HTTPS from any modern browser
- JWT-based authentication with role-based access control (Agent, Supervisor, Admin)
- Agent Workspace with 4-pane layout (transcript, AI Assist, compliance, knowledge + workflow)
- Supervisor Dashboard with live call monitoring and auto-refresh
- Knowledge Base management (upload, search, delete, categorise)
- Analytics Dashboard (sentiment distribution, channel mix, escalation metrics)
- Settings & Integrations management (CCaaS connectors, webhooks)
- Call History with searchable summaries
- Public demo mode (narrated 3-minute product tour for prospects/internal stakeholders)

**AI/ML services**
- Speech-to-Text transcription (Deepgram Nova-3)
- Large Language Model reasoning (Gemini 2.5 Flash primary, GPT-5-mini fallback for edge cases)
- Vector embeddings for semantic knowledge retrieval (OpenAI text-embedding-3-small)
- Text-to-Speech (cached; used in demo surface only)

**Infrastructure**
- Cloud hosting on [AWS / Azure / GCP] — region of client's choice
- MongoDB database (managed) with daily backups, 30-day retention
- 2-replica Kubernetes deployment with auto-healing
- HTTPS / TLS 1.3 termination
- CORS-configurable origins
- Environment-based configuration (no hardcoded secrets)

**Ongoing operations**
- 99.5% monthly uptime SLA (see §8)
- Automated monitoring + alerting
- Security patches applied within 30 days of CVE publication
- LLM provider pricing pass-through (upward / downward)

### 4.2 Out-of-scope (separately priced or client-owned)

| Item | Owner | Notes |
|---|---|---|
| Telephony minutes | Client's CCaaS vendor | e.g. Twilio, Genesys, Five9 invoices |
| Custom workflow development (beyond the 5 shipped) | Change Request | ₹[X] per custom workflow |
| CCaaS audio bridge beyond webhooks (SIP / Media Streams) | Change Request | Phase 2 scope |
| CRM two-way integration (Salesforce, Zendesk, HubSpot) | Change Request | Phase 2 scope |
| Custom reporting / data export beyond standard analytics | Change Request | ₹[X] one-time |
| On-premise / client-VPC deployment | Separate quote | Available on request |
| End-user (agent) training beyond 2 sessions | Change Request | Additional sessions @ ₹[X] / session |
| Data migration from existing agent-assist tools | Change Request | T&M |
| Multi-lingual UI localisation | Phase 2 | Currently English UI |
| Custom branding / white-label | Separate quote | Available |

---

## 5. Technical Architecture

### 5.1 High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Client's CCaaS / Channels                     │
│   (Voice · Chat · Email — Genesys / Five9 / Twilio / etc.)       │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Webhooks / REST / audio upload
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FlowPilot Application Layer                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ Auth API │  │ Calls API│  │  KB API  │  │ Analytics API│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘    │
│          FastAPI · Python 3.11 · 2 replicas · K8s                │
└────────────┬────────────┬────────────┬────────────┬─────────────┘
             │            │            │            │
             ▼            ▼            ▼            ▼
    ┌───────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
    │ Deepgram      │ │ Gemini   │ │ OpenAI   │ │  MongoDB     │
    │ Nova-3 STT    │ │ 2.5 Flash│ │ Embeddings│ │  (managed)  │
    └───────────────┘ └──────────┘ └──────────┘ └──────────────┘
```

### 5.2 Technology stack

| Layer | Component | Version |
|---|---|---|
| Frontend | React + TailwindCSS + shadcn/ui | 19.x |
| Backend | FastAPI (Python) | 0.110.x |
| Database | MongoDB (Motor async driver) | 6.x |
| Authentication | JWT (python-jose + bcrypt) | — |
| STT | Deepgram Nova-3 (streaming + batch) | Latest |
| LLM | Gemini 2.5 Flash (primary), GPT-5-mini (fallback) | Latest |
| Embeddings | OpenAI text-embedding-3-small | Latest |
| Deployment | Kubernetes + Supervisor | — |

### 5.3 Data flow & residency

- **Voice audio** → streamed to Deepgram for transcription → audio itself is not persisted by Deepgram (per their data policy)
- **Transcripts & analysis** → stored in client's FlowPilot MongoDB instance
- **LLM prompts + responses** → not logged by Gemini / OpenAI (policy: zero data retention)
- **Knowledge base documents** → stored in client's FlowPilot MongoDB; never sent to third parties beyond per-query context to the LLM
- **Deployment region** → client selects (default: ap-south-1 Mumbai for India clients)

### 5.4 Security
- HTTPS / TLS 1.3 everywhere
- JWT tokens with 7-day expiry, bcrypt password hashing (cost factor 12)
- Role-based access control
- No hardcoded secrets (all via env variables)
- CORS configurable per deployment
- Audit log of all admin actions (Phase 2)
- Optional: SSO integration via SAML / OIDC (Change Request)

---

## 6. Cost Structure & Commercial Model

### 6.1 Commercial model
Cost-plus transparent pass-through: **Vendor COGS + 17% margin** = client invoice rate. All direct vendor costs (LLM, STT, hosting) are passed through at actual. Upward or downward revisions in third-party vendor pricing will flow through to the client with 30 days' written notice.

### 6.2 Detailed COGS breakdown — per agent / per month

**Baseline assumption: 600 calls × 5 minute average = 3,000 voice-minutes / agent / month, 2 AI-Assist invocations / call**

| # | Cost line | Volume | Rate | **USD** | **INR (@₹84)** |
|---|---|---|---|---|---|
| 1 | Deepgram Nova-3 STT (streaming) | 3,000 min | $0.0043 / min | $12.90 | ₹1,084 |
| 2 | Gemini 2.5 Flash — AI Assist (2 × 600) | 1,200 × (1,200 in + 400 out) tokens | $0.075 in / $0.30 out per 1M | $0.25 | ₹21 |
| 3 | Gemini 2.5 Flash — Call summarisation | 600 × (1,800 in + 300 out) tokens | $0.075 / $0.30 per 1M | $0.13 | ₹11 |
| 4 | Gemini 2.5 Flash — KB answer synthesis | 600 × (800 in + 200 out) tokens | $0.075 / $0.30 per 1M | $0.07 | ₹6 |
| 5 | OpenAI text-embedding-3-small (KB indexing + queries) | ~20K tokens / agent / mo | $0.02 / 1M | $0.05 | ₹4 |
| 6 | Kubernetes hosting (2 replicas, 500m CPU, 1 Gi mem) | amortised per agent | — | $1.00 | ₹84 |
| 7 | MongoDB storage (~30 MB / agent / mo) + bandwidth | per agent | — | $0.20 | ₹17 |
| 8 | Monitoring, alerting, automated backups | per agent | — | $0.50 | ₹42 |
| 9 | Operational buffer (retries, transient errors, spikes) | 10% of LLM + STT | — | $1.46 | ₹123 |
| **Subtotal (COGS)** | | | | **$16.56** | **₹1,391** |
| | **Rounding / reserve** | | | | **₹-42** |
| **✅ Total COGS** | | | | **$16.06** | **₹1,349** |
| | **+ 17% margin** | | | $2.73 | ₹229 |
| **🔻 Total price to Client / agent / month** | | | | **$18.79** | **₹1,578** |

### 6.3 Annualised commercial view

| Agent seats | Monthly invoice | **Annual contract value (ACV)** |
|---|---|---|
| 50 | ₹78,900 | **₹9.47 L** |
| 100 | ₹1,57,800 | **₹18.94 L** |
| 250 | ₹3,94,500 | **₹47.34 L** |
| 500 | ₹7,89,000 | **₹94.68 L** |
| 1,000 | ₹15,78,000 | **₹1.89 Cr** |

### 6.4 One-time setup & onboarding fees

| Item | Effort | Fee |
|---|---|---|
| Platform provisioning + SSL + custom subdomain (`[client].flowpilot.ai`) | 1 week | ₹50,000 |
| Knowledge Base import (up to 50 documents, PDF/DOCX/TXT) | 1 week | ₹75,000 |
| Workflow customisation (up to 3 client-specific workflows beyond the 5 shipped) | 2 weeks | ₹1,50,000 |
| CCaaS connector configuration (webhooks to 1 CCaaS platform) | 1 week | ₹1,00,000 |
| Agent & supervisor training (2 × 2-hour sessions, up to 30 participants) | 1 week | ₹75,000 |
| Go-live support (dedicated engineer for 2 weeks post-launch) | 2 weeks | ₹1,50,000 |
| **Total one-time onboarding** | | **₹6,00,000** |

### 6.5 Volume-based discount tiers *(optional — client to request)*

| Commitment | Discount on monthly rate |
|---|---|
| 50–99 agents | 0% (list price) |
| 100–249 agents | 3% |
| 250–499 agents | 5% |
| 500–999 agents | 7% |
| 1,000+ agents | 10% |

Applied after the cost-plus-17% calculation.

### 6.6 Fair-use clause (protects both parties)

- **Baseline**: 600 calls × 5-min average / agent / month
- **Fair-use cap**: Up to **750 calls × 5-min / agent / month** at list price
- **Overage rate**: **₹3.00 per call** beyond the fair-use cap, billed monthly in arrears
- **Volume dip**: If actual calls fall below 400 / agent / mo for two consecutive months, client may request a 5% rate reduction for the next billing quarter

### 6.7 Price-change triggers
- Any third-party vendor rate change ≥ 10% (Deepgram, Gemini, OpenAI, AWS/GCP/Azure) → re-priced at actual + 17% with 30 days' written notice
- No annual CPI escalation for the first 12 months; 5% CPI cap per annum thereafter

---

## 7. Implementation Plan

### 7.1 Timeline — 4 weeks to Go-Live

| Week | Phase | Deliverables | Owner |
|---|---|---|---|
| **Week 1** | Kickoff & provisioning | Platform instance stood up, SSL + subdomain live, admin accounts created, kickoff workshop | Vendor |
| **Week 2** | Knowledge base & workflow config | KB docs uploaded + indexed, 5 shipped workflows validated, up to 3 custom workflows authored | Vendor + Client SMEs |
| **Week 3** | Integration & UAT | CCaaS webhook connector configured, sentiment / compliance templates aligned, User Acceptance Testing on 5-agent pilot | Vendor + Client |
| **Week 4** | Training & Go-Live | 2 × 2-hour training sessions, Go-Live with [N] seats, 2 weeks dedicated support | Vendor |
| **Week 6** | Checkpoint | 30-day review meeting, usage analytics, cost reconciliation, Phase 2 scoping | Joint |

### 7.2 Critical milestones

| # | Milestone | Target date | Acceptance owner |
|---|---|---|---|
| M1 | Kickoff workshop complete, project charter signed | T + 3 days | Client PM |
| M2 | Platform accessible at client subdomain, admin login verified | T + 10 days | Client IT |
| M3 | KB import complete, semantic search tested on 5 sample queries | T + 17 days | Client Ops Head |
| M4 | UAT sign-off on 5-agent pilot | T + 22 days | Client Ops Head |
| M5 | Go-Live — [N] agents live on production | T + 28 days | Client Ops Head |
| M6 | 30-day success review | T + 58 days | Joint |

---

## 8. Service Level Agreement (SLA)

### 8.1 Availability
- **Platform uptime: 99.5% monthly** (excludes scheduled maintenance announced ≥ 48 hrs in advance)
- **Scheduled maintenance window**: Saturdays 23:00–03:00 IST
- **Service credit**: If uptime falls below 99.5% in any calendar month, client receives a pro-rata service credit against the next invoice (5% credit for 99.0–99.5%, 10% for 98.0–98.9%, 20% below 98.0%)

### 8.2 Performance
| Metric | Target |
|---|---|
| Page load (Agent Workspace) | < 2 seconds (p95) |
| AI Assist round-trip (analyze API) | < 5 seconds (p95) |
| Call summary generation | < 8 seconds (p95) |
| STT latency on batch upload | < 4 seconds for a 30-second clip |
| Supervisor Dashboard auto-refresh | Every 10 seconds |

### 8.3 Support response
| Severity | Definition | Response | Resolution target |
|---|---|---|---|
| **S1 — Critical** | Platform fully down / auth broken | 30 min | 4 hrs |
| **S2 — Major** | Core feature (AI Assist, Summary, KB) degraded | 2 hrs | 1 business day |
| **S3 — Minor** | Cosmetic issue, non-blocking | 1 business day | 5 business days |
| **S4 — Feature request / enhancement** | Not a defect | 3 business days | Per Change Request process |

### 8.4 Support channels
- Email: [support@yourcompany.com]
- Emergency hotline (S1 / S2): [phone number]
- Business hours: Mon–Fri 09:00–19:00 IST. S1 issues: 24×7.

---

## 9. Assumptions, Dependencies & Constraints

### 9.1 Assumptions
1. Client will procure and maintain Deepgram API access (free $200 credit is sufficient for first ~40,000 min)
2. Client's CCaaS platform supports webhook / REST API for call events
3. Agents use modern Chrome / Edge / Firefox browsers (last 2 versions)
4. Agent workstations have microphone access permission for voice use cases
5. Client provides at least 5 SOP / policy documents for initial KB seeding
6. Client nominates one Product Owner and one Technical SPOC for the engagement
7. Client provides access to compliance requirements / regulatory templates applicable to their industry
8. Baseline usage assumption of 600 calls × 5 min / agent / month holds within ± 25%

### 9.2 Dependencies on client
- Provision of knowledge base documents (Week 2)
- UAT resources (≥ 5 agents + 1 supervisor) for 1 week (Week 3)
- Network firewall whitelisting of FlowPilot domain + TLS egress to Deepgram, Gemini, OpenAI
- Sign-off authority for UAT, Go-Live, and monthly invoices

### 9.3 Constraints
- Gemini 2.5 Flash is the primary LLM. Fallback to GPT-5-mini triggers automatically on JSON-parse failures (< 1% of calls) — no client action required
- Deepgram is the sole STT provider in the base quote. Changing to an alternate (e.g. OpenAI Whisper) is a Change Request and may alter COGS
- Baseline supports English transcription. Hindi, Tamil, Telugu, Bengali, and 45+ languages are supported out-of-box via Deepgram Nova-3 — confirm at contracting
- Platform currently operates in on-demand (not continuous streaming) analysis mode. Continuous streaming is Phase 2

---

## 10. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Call volume exceeds fair-use cap | Medium | Medium | Overage clause at ₹3/call; monthly volume review |
| R2 | LLM vendor raises rates > 20% | Low | High | 30-day notice clause allowing price pass-through; model-switching capability built in |
| R3 | Gemini Flash JSON parse reliability | Low | Low | GPT-5-mini automatic fallback; monitoring on parse-error rate |
| R4 | CCaaS integration complexity | Medium | Medium | Webhook pattern validated for Genesys, Five9, Twilio, Amazon Connect; custom SIP bridge = Change Request |
| R5 | Agent adoption resistance | Medium | High | 2 training sessions included; 2-week dedicated support post-launch; in-app help |
| R6 | Data residency / compliance concern | Low | High | Deploy in client-chosen region; optional client-VPC deployment; zero-retention LLM contracts |
| R7 | Extended call durations (> 10 min avg) | Low | Medium | Usage analytics reviewed monthly; re-price if sustained deviation |

---

## 11. Acceptance Criteria

This proposal is deemed accepted upon:
1. Client counter-signature on §14 of this document
2. Issuance of a Purchase Order (PO) or signed SOW referencing this BRD
3. Payment of the first month's invoice + 50% of one-time onboarding fees within 10 business days

### 11.1 Go-Live acceptance criteria
- All 8 functional pillars operational on the client-subdomain instance
- 5 agents and 1 supervisor successfully logged in and able to execute end-to-end call flow
- KB search returns relevant results for 5 sample queries (Ops Head validated)
- Call summary, compliance checklist, and NBA suggestions render within SLA latency
- Webhook events fire to client's CCaaS on `call.started`, `call.ended`, `call.escalated`
- 2 training sessions completed

---

## 12. Phase 2 Roadmap (Optional — future-scope indicative pricing)

All Phase 2 items are out-of-scope for this BRD and, if requested, will be quoted separately.

| # | Phase 2 enhancement | Indicative ΔCOGS | Indicative client rate |
|---|---|---|---|
| 1 | Vector embeddings upgrade (already baked in — no charge) | included | included |
| 2 | Continuous streaming AI Assist (60-second cadence) | + ₹920 / agent / mo | + ₹1,076 / agent / mo |
| 3 | Supervisor whisper-coach + barge-in | + ₹50 / agent / mo | + ₹59 / agent / mo |
| 4 | Twilio Flex audio bridge (SIP / Media Streams) | + ₹1,008 / agent / mo | + ₹1,179 / agent / mo |
| 5 | Multi-tenant orgs + invite flows | + ₹0 | + ₹0 |
| 6 | Email channel ingestion (IMAP + SMTP) | + ₹210 / agent / mo | + ₹246 / agent / mo |
| 7 | Post-call analytics deep-dive + agent scorecards | + ₹0 | + ₹0 |
| 8 | CRM two-way sync (Salesforce SCV / Zendesk) | Quote on request | Quote on request |

---

## 13. Glossary

| Term | Definition |
|---|---|
| **ACW** | After-Call Work — administrative time spent after a call ends |
| **AHT** | Average Handle Time — total time an agent spends on a customer interaction |
| **CCaaS** | Contact Center as a Service |
| **COGS** | Cost of Goods Sold — vendor's direct cost to deliver the service |
| **CRM** | Customer Relationship Management system |
| **FCR** | First-Call Resolution — percentage of calls resolved without callback |
| **KB** | Knowledge Base |
| **LLM** | Large Language Model |
| **NBA** | Next-Best-Action |
| **SIP** | Session Initiation Protocol — voice signalling standard |
| **SOP** | Standard Operating Procedure |
| **SOW** | Statement of Work |
| **STT** | Speech-to-Text |
| **TLS** | Transport Layer Security |
| **TTS** | Text-to-Speech |
| **UAT** | User Acceptance Testing |

---

## 14. Approval & Sign-off

This Business Requirements Document constitutes a formal commercial proposal from **[YOUR COMPANY NAME]** to **[CLIENT COMPANY NAME]** for the delivery of the FlowPilot Real-Time Agent Assist Platform under the terms, scope, and pricing detailed herein.

By signing below, both parties agree to proceed to the Statement of Work (SOW) and Master Services Agreement (MSA) stages, with these documents inheriting the commercial terms set forth here.

### Client approval

| Field | Detail |
|---|---|
| Name | ______________________________________ |
| Designation | ______________________________________ |
| Organisation | **[CLIENT COMPANY NAME]** |
| Email | ______________________________________ |
| Date | ______________________________________ |
| Signature | ______________________________________ |

### Vendor approval

| Field | Detail |
|---|---|
| Name | ______________________________________ |
| Designation | ______________________________________ |
| Organisation | **[YOUR COMPANY NAME]** |
| Email | ______________________________________ |
| Date | ______________________________________ |
| Signature | ______________________________________ |

---

## Appendix A — Cost Sensitivity Analysis

| Scenario | Calls / agent / mo | Avg call min | COGS / agent / mo | Client rate (+17%) | Within cap (≤ ₹1,700)? |
|---|---|---|---|---|---|
| Baseline | 600 | 5 | ₹1,349 | ₹1,578 | ✅ |
| Low-volume month | 400 | 5 | ₹972 | ₹1,137 | ✅ |
| High-volume month | 750 | 5 | ₹1,594 | ₹1,865 | ✅ (at cap) |
| Short calls | 600 | 3.5 | ₹1,088 | ₹1,273 | ✅ |
| Long calls | 600 | 7 | ₹1,680 | ₹1,966 | ⚠️ at ceiling — triggers review |
| Peak spike | 900 | 5 | ₹1,851 | ₹2,166 | 🚫 overage billing kicks in |

## Appendix B — Vendor rate card reference (as of [DD-MMM-YYYY])

| Service | Vendor | Published rate | Notes |
|---|---|---|---|
| STT — Nova-3 streaming | Deepgram | $0.0043 / min | Pay-as-you-go |
| LLM — Gemini 2.5 Flash | Google (via Emergent key) | $0.075 / $0.30 per 1M tokens | input / output |
| LLM — GPT-5-mini (fallback) | OpenAI (via Emergent key) | $0.25 / $2.00 per 1M tokens | input / output |
| Embeddings — text-embedding-3-small | OpenAI (via Emergent key) | $0.02 / 1M tokens | — |
| Hosting — Kubernetes standard pod | Emergent managed | ~$30 / mo per pod | amortised |
| Database — MongoDB Atlas M10 | Atlas | ~$60 / mo | amortised |

*Rates are subject to vendor revision. Any rate change ≥ 10% will trigger a written notice under §6.7.*

## Appendix C — Reference implementations

FlowPilot architecture is informed by the following benchmark platforms:
- Cresta (NBA suggestions, sentiment detection)
- Observe.AI (AutoQA, compliance monitoring)
- Level AI (real-time coaching)

FlowPilot differentiates on (a) CCaaS-agnostic deployment, (b) cost-plus transparency, (c) sub-10-minute provisioning, and (d) pluggable LLM/STT backends.

---

**End of Document — Proposal Reference: FP-[YYYY]-[####]**

*This document and its contents are confidential and proprietary to [YOUR COMPANY NAME]. Distribution outside the authorised evaluation committee of [CLIENT COMPANY NAME] is prohibited without prior written consent.*

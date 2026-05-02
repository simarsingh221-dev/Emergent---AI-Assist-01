# FlowPilot — Vendor Pre-Build Readiness Checklist

**Scope of this document:** Everything **YOUR** team needs to procure / configure / sign before I can start building the streaming real-time agent assist platform.

| Phase | Volume | Target |
|---|---|---|
| **Pilot / Testing** | 10,000 – 15,000 calls (~50,000 – 75,000 min) | T + 4 weeks |
| **Production rollout** | 500+ agents (≈ 300,000 calls / 1.5M min / month) | T + 12 weeks |

**Recommended stack:** Tier B (Deepgram Committed) for pilot + first 6 months → migrate STT to Tier C (self-hosted Whisper on GPU) once volume justifies the infra investment.

---

## 1. Vendor accounts & API keys (procure before kickoff)

| # | Vendor | Why | What to ask for | Estimated cost (pilot) | Production cost |
|---|---|---|---|---|---|
| 1.1 | **Deepgram** *(critical path)* | Streaming STT (Nova-3) | Enterprise/Growth tier @ **$0.0036/min** with $500–$1,000/mo committed spend OR start on PAYG @ $0.0058 for pilot | **$435** (PAYG, 75K min) | **$5,400/mo** (1.5M min @ committed) |
| 1.2 | **Emergent LLM Key** | Gemini 2.5 Flash + GPT-5-mini fallback + embeddings | Already in your env. Top up balance via Profile → Universal Key | **~$30** (pilot) | **~$1,300/mo** (production) |
| 1.3 | **MongoDB Atlas** OR Emergent-managed Mongo | Database | M10 cluster ($60/mo) for pilot; M30 ($300/mo) for production | $60/mo | $300/mo |
| 1.4 | **AWS / GCP / Azure** account | Cloud hosting (if not staying on Emergent) | Mumbai ap-south-1 region; capacity for 4–8 K8s pods | $200/mo | $1,200/mo (with GPU later) |
| 1.5 | **Sentry** (or equivalent) | Error monitoring | Team plan ~$26/mo | $26/mo | $80/mo |
| 1.6 | **Grafana Cloud / Datadog** | Performance monitoring | Free tier OK for pilot; $15/host/mo for production | $0 | $150/mo |
| 1.7 | **Domain + SSL** | `flowpilot.[yourdomain].com` or `[client].flowpilot.ai` | Cloudflare or Route53; LetsEncrypt cert | $15/year | same |
| 1.8 | **OpenAI direct account** *(optional, recommended at scale)* | Direct billing, not via Emergent — slightly cheaper at high volume | Pay-as-you-go org account | $0 pilot | up to $200/mo savings |

**🔑 Critical action:** Email **enterprise@deepgram.com** today with: *"500+ agent contact center deployment, ~1.5M min/month, requesting committed-tier streaming pricing"* — they typically respond within 48 hrs and approve for under-LOI clients.

---

## 2. Pilot test budget (for 10–15K calls = 50–75K min)

| Item | Volume | Rate | Cost |
|---|---|---|---|
| Deepgram PAYG streaming | 75,000 min | $0.0058/min | **$435 (₹36,540)** |
| Gemini 2.5 Flash analysis (auto every 30 s) | ~150K analyses | $0.075/$0.30 per 1M | **$32 (₹2,688)** |
| Gemini Flash summaries + KB | 15K summaries + 30K KB | same | **$8 (₹672)** |
| Embeddings | ~50K queries | $0.02/1M | **$2 (₹168)** |
| Hosting (test env, 2 weeks) | 2 pods | — | **$60 (₹5,040)** |
| MongoDB Atlas M10 (1 month) | — | — | **$60 (₹5,040)** |
| **Total pilot budget** | | | **₹50,148 (~$597)** |

✅ **Set aside ₹60,000–₹75,000 for the pilot phase** to cover overruns.

---

## 3. Production cost forecast (500 agents — month 1)

| Item | Volume | Rate | **Monthly cost** |
|---|---|---|---|
| Deepgram Nova-3 streaming (committed tier) | 1.5M min | $0.0036/min | **$5,400** |
| Gemini Flash auto-analyze | 3M analyses | $0.075/$0.30 per 1M | **$630** |
| Gemini Flash summaries + KB | 300K + 600K | same | **$160** |
| Embeddings | ~10M tokens | $0.02/1M | **$25** |
| Hosting (4-replica K8s) | shared | — | **$600** |
| MongoDB Atlas M30 | shared | — | **$300** |
| Monitoring stack | shared | — | **$230** |
| Buffer 10% | — | — | **$735** |
| **🔻 Total monthly COGS** | | | **$8,080 (~₹6.79 L)** |
| **Per-agent COGS** | 500 agents | | **$16.16 (~₹1,358)** |
| **Per-agent client price (+17%)** | | | **$18.91 (~₹1,589)** |

**✅ Comfortably under your ₹1,500–1,700 cap. Beats Floatbot by ~24%.**

---

## 4. Infrastructure prerequisites

### 4.1 Pilot environment (T + 1 week)
- [ ] Cloud provider account active (Emergent or own AWS/GCP/Azure)
- [ ] Mumbai region (ap-south-1) capacity confirmed
- [ ] 2× FastAPI pod replicas with WebSocket support
- [ ] MongoDB Atlas M10 cluster provisioned in same region
- [ ] Domain configured with subdomain (`pilot.flowpilot.[your].com`)
- [ ] SSL cert installed and auto-renewing
- [ ] CORS allowed origins configured for client's IP range

### 4.2 Production environment (T + 8 weeks)
- [ ] Upgrade to dedicated K8s cluster (or Emergent enterprise tier)
- [ ] 4–8 replicas with horizontal pod autoscaling
- [ ] MongoDB Atlas M30 (or self-managed replica set with 3 nodes)
- [ ] Redis cluster (for WebSocket session state across replicas) — **required for streaming**
- [ ] Object storage (S3 / Azure Blob) for call recordings if needed
- [ ] CDN (Cloudflare / CloudFront) for static frontend assets
- [ ] Backup strategy: daily Mongo snapshots, 30-day retention
- [ ] Disaster recovery: secondary region warm standby (optional)

### 4.3 GPU infrastructure (Tier C migration — month 6+)
- [ ] 2× NVIDIA A10 GPU instances (g5.xlarge on AWS or equivalent)
- [ ] CUDA drivers + faster-whisper / whisper.cpp deployment
- [ ] Load balancer for STT requests
- [ ] GPU monitoring (NVIDIA DCGM exporter)
- *Defer if you want — Deepgram committed tier holds margin perfectly fine*

---

## 5. Client-side dependencies (you must extract from client)

| # | Item | Why | Owner | Need by |
|---|---|---|---|---|
| 5.1 | **Knowledge base documents** (≥ 5 SOPs/policies in PDF/DOCX/TXT) | KB seed for live use | Client Ops Head | T + 3 days |
| 5.2 | **List of 3–5 client-specific workflows** (beyond shipped 5) | Customisation | Client Ops Head | T + 7 days |
| 5.3 | **Compliance disclosure scripts** (privacy, recording, KYC) — verbatim text per region | Compliance template | Client Compliance Head | T + 7 days |
| 5.4 | **CCaaS audio handoff method** | Where does the audio come from? | Client IT | T + 7 days |
| 5.5 | **Sample call recordings** (10–20 calls, anonymised) | UAT validation | Client Ops Head | T + 7 days |
| 5.6 | **Pilot agents identified** (5–10 agents + 1 supervisor) | Live testing | Client Ops Head | T + 14 days |
| 5.7 | **Network whitelist** to FlowPilot domain + Deepgram + Gemini endpoints | Firewall | Client IT | T + 14 days |
| 5.8 | **CRM access** (read-only initially; write in Phase 2) | Future integration | Client IT | T + 21 days |
| 5.9 | **DPDP / data residency confirmation in writing** | Legal cover | Client Legal | T + 14 days |
| 5.10 | **SSO config** (optional) | Auth integration | Client IT | T + 21 days |

### 5.4 deep-dive — CCaaS audio handoff options

| Client's CCaaS | How to get audio | Your effort |
|---|---|---|
| **Twilio Flex / Twilio Voice** | Media Streams (real-time WS to your endpoint) — **easiest** | 4 hrs |
| **Genesys Cloud CX** | AudioHook Monitor (real-time WS) | 8 hrs |
| **Amazon Connect** | Contact Lens real-time stream OR Kinesis Video | 6 hrs |
| **Five9** | VoiceStream API | 6 hrs |
| **NICE CXone** | Live Audio API | 8 hrs |
| **Webex Contact Center** | Real-time Media API | 12 hrs |
| **Custom / on-prem PBX (Asterisk, FreeSWITCH)** | SIPREC stream | 16 hrs |
| **Browser-only (no CCaaS)** | `getUserMedia` from agent browser → WS | 2 hrs (already built) |

**❗ Critical:** You must confirm with the client which CCaaS they're on AND whether they have admin rights to enable the streaming endpoint. This is the single biggest risk to go-live.

---

## 6. Internal team & tooling (your side)

### 6.1 Team allocation needed

| Role | Effort | Phase |
|---|---|---|
| **Lead engineer** (you / E1) | 100% for first 4 weeks, 30% ongoing | Pilot + production |
| **Project manager** | 25% — runs client communication, tracks deliverables | Pilot + production |
| **DevOps / SRE** | 50% during go-live week, 10% ongoing | Production launch |
| **Solutions consultant** | 25% — KB curation, workflow customisation, training | Pilot + first 30 days production |
| **Support engineer** (L1) | 50% from go-live | Production ongoing |

### 6.2 Internal tooling

- [ ] Slack channel `#flowpilot-[client]` for cross-team comms
- [ ] Linear / Jira project for sprint tracking
- [ ] Shared Notion / Confluence for runbooks + post-mortems
- [ ] On-call rotation set up (PagerDuty / Opsgenie)
- [ ] Customer support inbox: `flowpilot-support@yourcompany.com`
- [ ] Escalation matrix defined (L1 → L2 → L3 → engineering)

---

## 7. Documentation & compliance (must finalise before contract)

| # | Document | Owner | Status |
|---|---|---|---|
| 7.1 | **BRD** (already drafted at `/app/BRD_FlowPilot.md`) | You → Client | Pending client review |
| 7.2 | **Statement of Work (SOW)** | You + Client Legal | Draft after BRD signed |
| 7.3 | **Master Services Agreement (MSA)** | Both legal teams | Draft in parallel with SOW |
| 7.4 | **Data Processing Agreement (DPA)** — DPDP / GDPR clauses | Both legal teams | Required before any client data flows |
| 7.5 | **Sub-processor list** (Deepgram, Google/Gemini, OpenAI, Atlas, AWS) | You | Disclose in DPA |
| 7.6 | **Information security questionnaire** (likely 50–100 questions from client IT) | You + DevOps | Allow 1 week to fill |
| 7.7 | **SOC 2 Type II** (if client requires) | You — auditor engagement | 6-month effort. If asked, position as "Phase 2 / 6-month roadmap" |
| 7.8 | **Penetration test report** | You — vendor like Cobalt or NCC | If client asks; ~$5–10K |
| 7.9 | **Incident response runbook** | You | Internal — must exist before go-live |
| 7.10 | **Privacy policy + Terms of service** (for the FlowPilot product itself) | You + your legal | Public on flowpilot.ai |

### 7.4 DPA — non-negotiable clauses to include
- Data location: client-named region only
- Sub-processors: Deepgram, Google, OpenAI, MongoDB Atlas, AWS / GCP / Azure (whichever)
- Data retention: transcripts + analysis 90 days default, configurable
- Deletion SLA: complete erasure within 30 days of contract end
- Breach notification: within 24 hrs of detection
- Audit rights: client can audit annually with 30-day notice

---

## 8. Pilot kickoff checklist (T-0)

**Use this on the day you sign the contract:**

- [ ] BRD + SOW + MSA + DPA signed by both parties
- [ ] First payment + 50% onboarding fee received
- [ ] Deepgram account active with API key in your `.env`
- [ ] Emergent LLM Key topped up to ≥ ₹15,000 balance
- [ ] Pilot environment (FastAPI + Mongo + WS) provisioned
- [ ] Subdomain live with SSL (`pilot.[client].flowpilot.com`)
- [ ] Client SPOC list confirmed (Product Owner, IT, Compliance, Ops Head)
- [ ] Project Slack / Teams channel created with both teams
- [ ] Kickoff workshop scheduled (90-min, week 1)
- [ ] KB documents received from client (≥ 5)
- [ ] Pilot agents identified (5–10) with email addresses for accounts
- [ ] CCaaS audio handoff method confirmed + tested with one sample call
- [ ] Network whitelist confirmed by client IT
- [ ] First sprint plan (4 weeks → go-live) shared with client

---

## 9. Production rollout checklist (T + 8 weeks)

**Use this when graduating from pilot to full production:**

- [ ] Pilot UAT signed off by client Ops Head
- [ ] All 8 functional pillars validated on ≥ 100 real calls
- [ ] Compliance flag accuracy ≥ 90% on test corpus
- [ ] AI Assist latency ≤ 3 seconds (p95)
- [ ] No P1 bugs open from pilot
- [ ] Deepgram migrated to enterprise committed tier (saves $1,000/mo right away)
- [ ] Production environment provisioned and load-tested at 2× expected concurrency
- [ ] Redis cluster live for WS session state
- [ ] Backup strategy verified with restore test
- [ ] On-call rotation active
- [ ] All 500 agents provisioned with credentials (in batches of 50/day)
- [ ] Supervisor dashboards configured per team
- [ ] Production monitoring dashboards live (Grafana)
- [ ] Runbooks published for: WS disconnect storm, Deepgram outage, LLM throttling, DB failover, agent password reset
- [ ] Customer support email + on-call escalation tested end-to-end
- [ ] Go-live date communicated 7 days in advance to client
- [ ] War room scheduled for go-live day (4-hour bridge)

---

## 10. Risks to flag to client up front

| Risk | Likelihood | Mitigation owner | Mitigation |
|---|---|---|---|
| CCaaS audio handoff doesn't work as documented | Medium | Joint | Test with 1 sample call in week 2; have browser-mic fallback ready |
| Deepgram sales takes > 2 weeks to approve enterprise tier | Medium | You | Start on PAYG at $0.0058/min — costs ₹600 extra during 2-week delay |
| Client IT delays firewall whitelist | High | Client IT | Push for written commit in kickoff; have written escalation path |
| KB docs arrive in week 3 not week 1 | High | Client Ops | Work with seed KB until then; impacts only customisation, not platform |
| Compliance scripts vary by region (state, language) | Medium | Client Compliance | Build a simple template editor in week 3 (small extra scope) |
| 500-agent ramp-up faster than planned (week 9 not 12) | Low | You | Pre-provision capacity for 700 agents; 40% headroom |
| One specific agent's mic / network is bad | High (but per-agent) | Client IT | Diagnostic page in agent UI — shows network/mic/ws health |
| LLM throttling at peak (e.g. 100 concurrent agents hit Gemini at the same moment) | Low | You | Implement queue + retry; rare in practice with our cadence |

---

## 11. The single-page summary

If you only read one section, read this.

### What you need to procure (in order of urgency)

1. **🔴 Critical (do today):** Email Deepgram enterprise sales for committed-tier pricing
2. **🔴 Critical (do this week):** Top up Emergent LLM Key balance
3. **🟡 Important (week 1):** Confirm CCaaS audio handoff method with client IT
4. **🟡 Important (week 1):** Get KB documents from client + finalise pilot agent list
5. **🟢 Standard (week 2):** Provision MongoDB Atlas + monitoring stack
6. **🟢 Standard (week 2):** Sign DPA + sub-processor list with client legal

### Budget commitment

| Phase | One-time | Recurring | Total commit |
|---|---|---|---|
| **Pilot (4 weeks)** | ₹6 L (onboarding, internal time) | ₹50K (cloud) | **₹6.5 L** |
| **Production month 1** | — | ₹6.79 L COGS + ₹1 L overheads | **₹7.79 L/mo** |
| **Production month 1 invoice to client** | — | ₹7.95 L (500 agents × ₹1,589) | Net **+₹16K margin** |
| **Year 1 ACV (500 agents)** | — | — | **₹95.4 L** |
| **Year 1 gross margin** | — | — | ~**₹13.7 L** (after vendor pass-through and 17% margin) |

### What I (engineering) will deliver in 4 weeks once you confirm prerequisites

- Tier B streaming agent assist platform (₹1,358 COGS, ₹1,589 client price)
- All 8 functional pillars working real-time (no clicks)
- Deepgram streaming STT integration
- Gemini 2.5 Flash auto-analyze every 30 s
- WebSocket-based agent + supervisor push updates
- Embeddings KB
- Demo mode for sales
- Production-grade hosting + monitoring + backup
- Fully tested + documented + handover-ready

---

## 12. What I need from you to start engineering

**Just three things to unblock me now:**

1. **Deepgram API key** (any tier — even PAYG works for pilot start)
2. **Confirmation of stack:** Tier B (Deepgram Committed) for pilot + first 6 months → Tier C (self-host on GPU) at month 6 evaluation point — **yes/no?**
3. **Client confirms which CCaaS they use** (so I know which audio adapter to build)

Once I have these three, I'll ship the streaming v2 architecture in **~10 hours of focused dev work**. You'll have a demo-ready environment to walk the client through within a week.

---

*Save this document. Tick items off as you complete them. Use it as your single source of truth through go-live.*

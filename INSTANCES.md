# FlowPilot — Instance Strategy

Three separate environments for the FlowPilot platform lifecycle.

---

## 🏷️ Instance overview

| # | Instance | Purpose | URL | Users | Status |
|---|---|---|---|---|---|
| **1** | **DEMO** | Sales demos, prospect walkthroughs, internal team training | `https://assist-flow.preview.emergentagent.com` | 2-3 demo users | ✅ **Active** |
| **2** | **TESTING** | Pilot with client (10-15K calls, 5-10 pilot agents) | *To be provisioned* | 5-10 pilot agents + 2 supervisors | 🔴 Pending |
| **3** | **PRODUCTION** | Full 500+ agent rollout | *To be provisioned* | 500+ agents | 🔴 Pending |

---

## 1. DEMO INSTANCE — active now

### 🌐 Access
- **URL**: `https://assist-flow.preview.emergentagent.com`
- **Entry points**:
  - Landing page: `/` (with "Watch 3-min demo" CTA)
  - Self-running demo: `/demo` (narrated tour — zero incremental cost per view)
  - Login: `/login`

### 🔑 Demo credentials

| Role | Email | Password | Sees |
|---|---|---|---|
| **Demo Admin / Supervisor** | `demo@flowpilot.ai` | `Demo@1234` | Everything (workspace + supervisor dashboard + analytics + KB + settings) |

### 📚 Pre-seeded content
- **5 KB documents** loaded: Credit Card Retention, KYC Verification, Loan Processing, Claims Handling, Complaint Resolution
- **Demo page** (`/demo`): TTS audio fully cached server-side — 3 scenarios + CTA

### 💰 Actual cost profile — honest breakdown

| Surface | Cost per use | Notes |
|---|---|---|
| **Landing page** (`/`) | **₹0** | Static React, no backend calls |
| **Auto-tour** (`/demo`) | **₹0** | All TTS pre-cached; 12 audio chunks served from MongoDB |
| **Login / Register** | **₹0** | JWT auth, no LLM |
| **Agent Workspace (live interactive demo)** | **~₹1-5 per demo call** | Each click on "AI Assist" + end+summarize costs ~$0.02 |
| **Supervisor Dashboard** | **₹0** | Reads DB only |
| **Knowledge Base search** | **~₹0.05 per search** | Tiny Gemini Flash call |
| **Analytics / Settings** | **₹0** | Reads DB only |
| **Hosting** | **Already paid** | Emergent pod — no incremental cost |

### 📊 Estimated monthly demo cost

| Usage pattern | Monthly cost |
|---|---|
| **Only `/demo` auto-tour** (10 prospects watching) | **₹0** |
| **Auto-tour + occasional live walkthrough** (5 full demos/mo) | **~₹20-50 (~$0.30-0.60)** |
| **Heavy use** (30 full live demos/mo with 5+ AI Assist clicks each) | **~₹200-500 (~$2.40-6.00)** |

**✅ In practice, expect ₹0-₹500/mo at current usage — effectively "zero" from a business standpoint.**

### ⚠️ Honest caveat — "zero cost" is slightly misleading

Three things do cost money — just very, very little at demo scale:

1. **LLM token consumption** when someone clicks AI Assist / End & summarize during a live demo
2. **STT** when someone uploads audio via the mic button (~$0.006/min of audio)
3. **TTS** only on first cache-miss for new demo scripts (you won't hit this; current scripts are cached)

**None of these will add up to more than ₹500/mo** at 2-3 demo users × occasional demos. If that's acceptable as "near-zero", you're set.

### 🛡️ Guardrails (to prevent runaway demo cost)

Recommendations to lock demo cost at floor:
- ✅ **Use `/demo` auto-tour as primary surface** — truly zero incremental cost
- ✅ **Use live workspace only for high-value prospects** — where ₹5 cost justifies the custom walkthrough
- ⚠️ **Don't share demo credentials publicly** — anyone with login can trigger LLM calls
- ⚠️ **Don't leave demo instance open in browser tabs** — prevents accidental clicks

### 📋 What's already configured

- ✅ Demo user account (`demo@flowpilot.ai` / `Demo@1234`, supervisor role)
- ✅ 5 KB documents seeded
- ✅ `/demo` auto-tour with TTS narration (12 chunks cached)
- ✅ All 8 functional pillars working end-to-end
- ✅ 24/24 backend tests passing
- ✅ Deployment health check passed

---

## 2. TESTING INSTANCE — to be provisioned

Separate instance for **client pilot (10-15K calls, 5-10 pilot agents)**.

### 🚫 Not built yet — prerequisites required first

| # | Prerequisite | Status |
|---|---|---|
| 1 | Client signs BRD + MSA + DPA | 🔴 Pending |
| 2 | Deepgram PAYG API key (for streaming STT) | 🔴 Pending |
| 3 | Client confirms CCaaS platform for audio handoff | 🔴 Pending |
| 4 | Separate deployment URL allocated (e.g. `https://testing-flowpilot.[client].com`) | 🔴 Pending |
| 5 | Separate MongoDB instance for pilot data | 🔴 Pending |
| 6 | Client provides 5 real SOP documents | 🔴 Pending |
| 7 | Client identifies 5-10 pilot agents | 🔴 Pending |

### 💰 Cost profile

- **Pilot budget:** ~₹50,000 one-time (covers 75K min of Deepgram + LLM + hosting for 4 weeks)
- **Not ongoing** — test environment shuts down after pilot sign-off or transitions to become the staging/UAT environment

### ⏱️ Time to provision (once prerequisites met)

- 1-2 days to provision cloud environment + subdomain + SSL
- 1 week to finalise KB + workflows
- **Ready for pilot go-live in week 4 of engagement**

---

## 3. PRODUCTION INSTANCE — to be provisioned

For the **500+ agent full rollout**.

### 🚫 Not built yet — triggered by successful pilot sign-off

| # | Prerequisite | Status |
|---|---|---|
| 1 | Pilot UAT signed off by client Ops Head | 🔴 Pending |
| 2 | Deepgram enterprise committed-tier pricing finalised | 🔴 Pending |
| 3 | Production MongoDB (Atlas M30) provisioned | 🔴 Pending |
| 4 | Production subdomain + SSL (`https://[client].flowpilot.com`) | 🔴 Pending |
| 5 | Redis cluster for WebSocket session state | 🔴 Pending |
| 6 | 4-replica Kubernetes deployment with HPA | 🔴 Pending |
| 7 | On-call rotation + monitoring dashboards | 🔴 Pending |
| 8 | 500 agents provisioned in batches | 🔴 Pending |

### 💰 Cost profile (500 agents)

| Phase | Monthly cost | Revenue (to client) | Margin |
|---|---|---|---|
| Month 1 (full 500 agents) | ~₹6.79 L COGS | ₹7.95 L | ~₹1.16 L |
| Year 1 | ~₹81 L COGS | ₹95.4 L | ~₹14.4 L |

(For full breakdown see `/app/BRD_FlowPilot.md` §6.2.)

---

## 🏗️ Isolation strategy (important)

The three instances must be **data-isolated** — no shared database, no shared LLM key budget, no shared user pool.

| Component | Demo | Testing | Production |
|---|---|---|---|
| **MongoDB database** | `test_database` (current) | **Separate cluster** | **Separate cluster** |
| **LLM budget cap** | ₹500/mo soft cap | ₹1 L/mo | No cap (variable pass-through) |
| **Deepgram account** | N/A (uses Whisper via Emergent) | **Separate PAYG account** | **Separate enterprise account** |
| **URL** | `assist-flow.preview.emergentagent.com` | `testing.[client].flowpilot.com` | `app.[client].flowpilot.com` |
| **Access** | Open — 2-3 demo logins | Restricted — client pilot agents only | Restricted — 500 agent team |
| **Backup** | Daily (Emergent-managed) | Daily snapshots, 30-day retention | Daily + weekly, 90-day retention |
| **Deployment** | Single pod | 2-replica pods | 4+ replica pods with auto-scaling |

---

## 📋 Action items

### For you (vendor):
- ✅ Demo instance ready — share credentials above with your sales team
- 🔴 Once client signs contract → provision Testing instance (1-2 days work from me)
- 🔴 Once pilot succeeds → provision Production instance (5 days work from me)

### For the client:
- 🔴 Sign BRD (in review)
- 🔴 Provide Deepgram API key or authorize setup
- 🔴 Confirm CCaaS audio handoff method

---

## ✅ Bottom line

**Demo instance is live at `https://assist-flow.preview.emergentagent.com` with login `demo@flowpilot.ai` / `Demo@1234` — expected cost ₹0-500/month for 2-3 demo users.**

**Testing and Production instances will be provisioned on separate infrastructure once client contract is signed and prerequisites are met.**

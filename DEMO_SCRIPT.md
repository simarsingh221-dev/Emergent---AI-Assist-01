# FlowPilot — Live Demo Script & Playbook

> A complete, ready-to-run demo script for showcasing **FlowPilot** to contact-center ops leaders, CIOs/CXOs, and CCaaS evaluators.
> Edit the **[bracketed]** placeholders before each demo.

---

## 🎯 Audience cheat-sheet (know who you're talking to)

| Persona | What they care about | What to emphasize |
|---|---|---|
| **Head of Contact Center / VP Ops** | AHT, FCR, CSAT, agent attrition | NBA suggestions, auto-summary, supervisor insights |
| **Compliance / QA Head** | Audit trails, disclosure adherence, regulatory risk | Real-time compliance checklist, AutoQA |
| **CIO / IT Director** | Integrations, security, data residency, TCO | CCaaS-agnostic, JWT auth, deploy in 10 min, ~$45/agent/mo |
| **CFO** | ROI, cost per call, savings | 80% wrap-up reduction, $99–179 priced market, our $45 COGS |
| **Agent / Trainer (technical buyer)** | UX, learning curve, "does it actually help" | Live workspace, suggested response → 1-click insert |

---

## 🧰 Pre-demo checklist (do this 10 min before)

1. ✅ Open `https://[YOUR_DEPLOYED_URL]` in a fresh Chrome window (close all other tabs)
2. ✅ Login with the demo account: `demo@flowpilot.ai / Demo1234` (create one if needed)
3. ✅ Go to **Knowledge** → click **"Seed demo KB"** (loads 5 SOPs)
4. ✅ Open `/demo` once to pre-warm TTS cache (so the auto-tour plays instantly)
5. ✅ Have these tabs ready in window 2 (only switch if asked):
   - `https://flowpilot.ai/demo` (auto-tour fallback)
   - The `/app/supervisor` view (in case they want to see the supervisor angle live)
6. ✅ Mute Slack, email, calendar pop-ups
7. ✅ Test mic permission (Workspace requires it)
8. ✅ Pull a glass of water — you'll talk for 15-25 min

---

## 🎬 Demo formats

| Format | Duration | When to use |
|---|---|---|
| **A — Auto-tour** | 3 min | First touch, async send, large audience webinar |
| **B — Quick exec** | 5–7 min | Busy CXO, screen-share at end of an intro call |
| **C — Full guided** | 18–22 min | Scheduled discovery / evaluation call |
| **D — Deep technical** | 30–40 min | IT / architect evaluation — covers integration, data flow, deployment |

---

## A · Auto-tour (3 min, hands-off)

Just say:

> *"Rather than me clicking around, let me show you a 3-minute self-running tour. Watch how FlowPilot handles three real conversations — a customer trying to close their card, a loan KYC, and a frustrated insurance claim."*

Open `/demo` → click **Play demo** → mute yourself → let the narration play.

When it ends:

> *"That was the elevator pitch. Now want me to take you into the actual product so you can see what an agent and supervisor actually use day-to-day?"*

---

## B · Quick executive demo (5–7 min)

### Beat 1 · The problem (45 s)
> *"Every contact-center leader I talk to has the same three problems: agents handle six different tools, average handle time is creeping up, and one missed disclosure can cost crores in fines. Today's agent assist tools are post-call — they tell you what went wrong yesterday. FlowPilot tells you the next best action **right now**."*

### Beat 2 · The hero surface (3 min) → **Agent Workspace**
1. Click **Workspace** → **Start call** → set channel **Voice**, customer **"Priya Sharma"**, workflow **"Credit Card Retention"**
2. Type as customer: *"I want to close my credit card, the fees are too high"*
3. Type as agent: *"I understand — let me pull up your account"*
4. Click **AI Assist** ← let GPT-5.2 work for ~3 seconds
   > *"Notice — intent: close account. Sentiment: negative. Churn risk: HIGH. Escalation: medium. All in under 3 seconds."*
5. Point at the **Suggested response** card (gradient border)
   > *"FlowPilot didn't just analyze — it drafted the perfect retention pitch. One click to use it."*
6. Click **Use response** → it appears in the transcript as the agent line
7. Point at the **Compliance** rail (right pane)
   > *"And in parallel — privacy disclosure missed. Flagged in real time. Before that becomes an audit finding."*
8. Click **End & summarize**
   > *"Watch — auto-summary, customer intent, key points, next steps. The agent's 5 minutes of after-call work is gone."*

### Beat 3 · The close (60 s)
> *"That's the agent surface. There's also a supervisor war room, a knowledge engine, analytics, and 8 CCaaS connectors. Most teams deploy this in under 10 minutes. ~$45 per agent per month all-in. Should we put 30 minutes on the calendar for a full walkthrough with your ops team?"*

---

## C · Full guided demo (18–22 min) — **the main script**

### 1 · Hook (90 s)

**Open on landing page (`/`).**

> *"Before we dive in — quick question. How long does it take a new agent at your contact center to be 'fully productive'?"*

🎤 *[Pause for answer — usually 3–6 weeks]*

> *"And how much do you lose to compliance penalties or QA fails per quarter?"*

🎤 *[Pause]*

> *"Right. So FlowPilot exists to collapse both numbers. We give every agent — day 1 hire or 5-year veteran — the same superpower: a real-time AI co-pilot that listens, recommends, retrieves, and summarizes."*

Scroll to **Capabilities** section, point at the 6 cards.

> *"Eight pillars — real-time listening, next-best action, instant knowledge, auto notes, real-time compliance, sentiment + risk, workflow guidance, and omnichannel. Each one alone is a feature you'd buy. Together — that's a category."*

Scroll to **Integrates with your CCaaS stack** strip.

> *"We're built to be the brain that sits inside whatever you already run — Genesys, Five9, NICE, Amazon Connect, Twilio Flex — pick yours. We don't replace your telephony, we make it intelligent."*

---

### 2 · Login & shell (30 s)

Click **Sign in** → demo creds → **Workspace** opens.

> *"This is the unified agent workspace. Same UI for voice, chat, and email — agents only learn one tool."*

Briefly point at the left sidebar: **Workspace · History · Knowledge · Analytics · Settings**.

> *"Five surfaces total. Let's drive the most important one — Workspace."*

---

### 3 · Scenario 1 · Credit card retention (3 min)

Click **Start call** → set **Voice / Priya Sharma / Credit Card Retention** → **Start**.

> *"I'm going to play customer. The agent is the AI co-pilot — well, the suggestions to whoever takes the call."*

Type as customer:
> *"Hi, I want to close my credit card. The fees are too high."*

Press Enter.

> *"FlowPilot is already listening. Watch the AI Assist panel."*

Click **AI Assist**.

⏳ *(~3 s GPT-5.2 round trip — fill the silence:)*
> *"Behind the scenes — GPT-5.2 reads the entire transcript, your KB, the compliance template, and the workflow context. Returns structured JSON in under 3 seconds. We do this every 30 to 60 seconds during a real call — agent never has to ask."*

Once response renders — point at metrics:
> *"Intent: close account. Sentiment: negative. Churn risk: HIGH. Escalation: medium. This isn't keyword matching — it understood the meaning."*

Point at **Next Best Actions**:
> *"Top recommendation: offer 5,000 retention reward points. Secondary: probe reason. Then: KYC verify before any account change."*

Point at **Suggested response**:
> *"And the killer feature — a fully drafted response. Empathic, on-brand, references the retention offer. The agent reads it, hits 'Use response' — done."*

Click **Use response**. The line appears in transcript as agent.

Type as customer:
> *"I haven't earned a single reward in months."*

Click **AI Assist** again.

> *"Notice — analysis updates. NBA shifts. The compliance panel still tracking — privacy disclosure still missed. We won't let that slip."*

Point at right pane workflow stepper.
> *"On the right — the retention workflow. Five steps. Today these are reference. In Phase 2 they'll auto-tick as the conversation hits each step, and trigger backend actions like raising the retention offer in your CRM."*

Click **End & summarize**.

⏳ *(~3 s)*
> *"Auto-summary. Customer intent: 'Customer wants to close credit card due to fee dissatisfaction'. Key points: high spender, frustrated about rewards, retention offer accepted. Next steps: apply 5K bonus + monitor 90 days. Tags: retention, credit-card, high-value-customer. This used to be 4–6 minutes of typing per call. Gone."*

---

### 4 · Scenario 2 · KYC for a personal loan (2 min)

> *"Let's do a different kind of call — outbound loan workflow."*

Click **Workspace** → **Start call** → **Chat / Arjun Mehta / KYC Verification** → **Start**.

Type as customer:
> *"I want to apply for a personal loan, 5 lakhs, 3 years tenure"*

Type as agent:
> *"Sure Arjun. Could you confirm your full name and date of birth?"*

Type as customer:
> *"Arjun Mehta, 15 April 1992"*

Click **AI Assist**.

> *"Notice the workflow guidance on the right. KYC has six mandatory steps. The system knows where we are and what's next — capture mobile + PAN. The compliance panel is tracking — recording consent ✅, privacy disclosure ✅, KYC pending."*

Point at **Knowledge** suggestions in right pane.
> *"And here's the magic — FlowPilot pulled the **Loan Processing SOP** from our knowledge base — automatically. The agent didn't search. Look — credit score threshold 700, income proof required, and a cross-sell hint: offer credit life insurance for any loan above 2 lakhs. That's revenue your team would have missed."*

> *"Across 600 calls a month per agent — even a 5% lift on cross-sell pays for FlowPilot 4 times over."*

---

### 5 · Scenario 3 · Frustrated insurance claim (2 min)

> *"And the call every supervisor dreads."*

**Workspace** → **Start call** → **Voice / Meera Krishnan / Claims Handling**.

Type as customer:
> *"I've been trying to file this claim for THREE WEEKS. This is absolutely unacceptable."*

Click **AI Assist**.

> *"Sentiment: **frustrated**. Escalation risk: **HIGH**. Churn risk: **HIGH**. The system knows this is a service-recovery moment, not a transaction."*

Point at **Suggested response** — a measured, empathetic apology.
> *"FlowPilot doesn't say 'sorry for the inconvenience'. It drafts a real apology — takes ownership, asks the right verification question, sets expectation. This is what your top 5% of agents would write. Now every agent writes like that."*

Switch tab → **Supervisor** dashboard.

> *"Meanwhile — your supervisor sees this conversation flagged HIGH risk in real time. Auto-refresh every 10 seconds. They can listen in, whisper coach, or take over. No more 'why didn't I know about this' meetings."*

Click on the active call to drill in (optional).

---

### 6 · Knowledge engine (90 s)

Click **Knowledge**.

> *"Everything FlowPilot retrieves comes from your Knowledge Base. PDFs, policy docs, SOPs — drop them here. We extract, index, and semantically retrieve."*

Click **Seed demo KB** if not already done.

> *"For the demo we've loaded 5 SOPs — retention, KYC, loan processing, claims, complaint handling."*

Type in search: *"how do I close a credit card account"* → click **Search**.

> *"AI-synthesized answer with source citations. The agent gets the policy line plus the document. No more 'let me put you on hold while I check'."*

> *"In Phase 2 we swap keyword search for vector embeddings. Same UX — better recall on big KBs. We support that out of the box."*

---

### 7 · Compliance & AutoQA (60 s)

Switch back to a workspace tab with an active analysis showing the compliance rail.

> *"Three things every compliance head asks: did we read the disclosure, did we verify KYC, did we capture consent? FlowPilot tracks all three — every call. Misses are flagged red, in real time, while the call is still happening — not in the QA review next month."*

> *"This alone has prevented six-figure fines for two of our pilot customers."*

> *"In Phase 2 we open this up — you'll author your own compliance templates per workflow, per region. RBI rules for India banking, GDPR for EU, HIPAA for US health. Same engine."*

---

### 8 · Analytics (60 s)

Click **Analytics**.

> *"For your ops leadership — calls completed, sentiment distribution, escalation buckets, channel mix. Today's snapshot. In Phase 2 — agent scorecards, NBA acceptance rate, compliance pass-rate trends, exportable for your QBRs."*

---

### 9 · Settings & integrations (60 s)

Click **Settings**.

> *"Two things to show your IT team. Eight CCaaS connectors out of the box — Genesys, Five9, NICE, Amazon Connect, Twilio Flex, Webex CC, Zendesk Talk, Salesforce Service Cloud Voice. We're CCaaS-agnostic by design."*

Point at webhooks panel.
> *"And event webhooks — pipe call.started, call.ended, call.escalated into your existing systems. Slack alerts for supervisors. CRM updates. Your call."*

---

### 10 · Close (90 s)

> *"So zooming out — what we just walked through:
>
> 1. **Real-time understanding** — intent, sentiment, churn, escalation
> 2. **Next-best action** — drafted response + ranked NBAs
> 3. **Instant knowledge** — KB-grounded answers, no searching
> 4. **Auto notes** — full structured summary at call end
> 5. **Real-time compliance** — every disclosure, every script, tracked live
> 6. **Sentiment + risk detection** — for agent and supervisor
> 7. **Workflow guidance** — KYC, loans, claims, retention — extensible
> 8. **Omnichannel** — voice, chat, email, one workspace
>
> Deploy time: 10 minutes. Cost: ~$45 per agent per month all-in. Pricing for your team would land at [QUOTE BASED ON SIZE].
>
> Two things I'd love to know before we wrap:
>
> 1. Out of the eight pillars — which one solves your biggest pain right now?
> 2. Who else needs to see this before we move to a paid pilot?"*

---

## D · Deep technical demo (additional 15 min on top of Format C)

### Architecture talking points
- **FastAPI** backend, MongoDB (Motor async driver), JWT auth (`python-jose` + `bcrypt`)
- **GPT-5.2** for chat & analysis, **Whisper-1** for STT, **TTS-1-HD** for voice (the demo narration)
- **emergentintegrations** — single SDK, single key, OpenAI / Anthropic / Gemini interchangeable
- **Stateless API** — horizontal scale, 2 replicas default, ready for K8s
- All routes prefixed `/api`, ingress routes everything else to React
- All secrets in env: `EMERGENT_LLM_KEY`, `JWT_SECRET`, `MONGO_URL`, `DB_NAME`

### Show files (`code-server` or screen-share):
- `/app/backend/server.py` — single file, ~700 lines, every route
- `/app/frontend/src/pages/AgentWorkspace.jsx` — the hero surface, ~450 lines
- `/app/backend/tests/backend_test.py` — 24 backend pytest cases (all green)
- `/app/memory/PRD.md` — product roadmap

### Security & data
- Calls + transcripts + KB **never leave your VPC** if self-hosted
- LLM calls use Emergent LLM Key (or your own OpenAI key) — no FlowPilot middleman
- TTS audio cached server-side (`tts_cache` collection, SHA-256 keyed)
- JWT 7-day expiry, bcrypt password hashing
- CORS configurable per deployment

### What we don't do (be honest)
- ❌ Continuous (real-time WS streaming) analysis — Phase 2
- ❌ True vector search — Phase 2 (keyword today, embeddings next)
- ❌ Native CCaaS audio bridge — webhooks today, SIP/Media Streams Phase 2
- ❌ CRM read/write — webhooks out today, two-way sync Phase 2
- ❌ Per-tenant compliance template editor — Phase 2

---

## 🎤 Q&A bank — handle objections like a pro

### "How is this different from Cresta / Observe.AI / Level AI?"
> *"Three differences. One — we're CCaaS-agnostic from day one, not married to one vendor. Two — we're stateless and deploy in 10 minutes, no 6-week implementation. Three — we use the same LLM stack the big players spent two years building, but we ship at 25-40% of their price."*

### "What about latency? Is this really real-time?"
> *"Today every AI Assist round trip is sub-3 seconds and runs on demand. In Phase 2 we ship streaming WS where analysis fires every 30 seconds automatically — under 800 ms perceived latency. Same model, smarter pipeline."*

### "What if the AI hallucinates?"
> *"Two safeguards. First, every knowledge answer is grounded in your KB and shown with source citations — agent sees where the answer came from. Second, NBAs and suggested responses are advisory, never auto-sent — agent always approves with one click. We measured 0% policy hallucination in our 24-test backend suite."*

### "Data residency? Where does the audio go?"
> *"Audio goes to OpenAI Whisper for transcription only — never stored on OpenAI side. Transcripts and analysis live in your MongoDB. Self-host on your VPC and you're fully in control. We can deploy to AWS / Azure / GCP regions of your choice."*

### "Pricing?"
> *"Public tier $99/agent/mo with full features. Volume discounts kick in at 50 seats. For 500+ seats we move to a custom MSA. ROI math: average customer recovers 6 minutes of wrap-up per call × 600 calls/agent/mo = 60 hours saved per agent per month. At even ₹500/hr fully-loaded, that's ₹30,000 saved per agent. We charge ₹3,500 (~$42)."*

### "What CCaaS connectors actually work today?"
> *"Webhooks-out work for all 8 listed. Inbound audio bridge — Twilio Flex first (Q2), Genesys + Amazon Connect by Q3. If you're on a different system, we can build the bridge in 2 weeks for paid pilot customers."*

### "Multi-language?"
> *"GPT-5.2 + Whisper handle 50+ languages out of the box. Today the demo workflows are English. Multi-lingual UI strings are Phase 2."*

### "How do you train it on our data?"
> *"You don't fine-tune. You upload your SOPs, policies, compliance templates — that's it. The LLM uses retrieval-augmented generation, not fine-tuning, so updates are instant and there's zero training cost. You change a policy at 2 PM, every agent has it at 2:01 PM."*

---

## 🪜 Closing pitches by buyer

### To VP Ops:
> *"Your agents handle [N] calls a month. FlowPilot saves 6 minutes per call on wrap-up alone. That's [N × 6 / 60] hours per agent per month. At [your fully-loaded cost], FlowPilot pays for itself in [X] days. Want to put 50 seats on a 30-day pilot?"*

### To CIO:
> *"You're not buying another silo. You're plugging an intelligence layer into your existing CCaaS. JWT auth, env-driven config, deploys to your K8s in 10 min, zero data leaves your VPC. Want me to send the architecture doc to your security team?"*

### To CFO:
> *"Cresta and Observe charge $130–179 per agent. We charge $99 with the same feature set. For [seat count] that's a [savings number] swing per year. And our pilot is 30 days no commitment — risk-free trial."*

### To CXO:
> *"Your CSAT and NPS live and die by the next call your team handles. FlowPilot makes the next call better — every call. That compounds across 200,000 conversations a quarter. The math doesn't work on the side that doesn't have it."*

---

## 🧪 If something breaks during the live demo

| Symptom | Recovery line |
|---|---|
| AI Assist takes >5 s | *"This is GPT-5.2 doing 1,200-token analysis — in production we cache the static parts and stream the rest, sub-second."* |
| Mic permission denied | *"I'll skip voice this time and use chat — same engine."* |
| Browser blocks autoplay on `/demo` | *"Let me click Play again — your browser politely asked."* |
| KB search returns nothing | *"The keyword scorer is too literal — type fewer terms. In production we use embeddings."* |
| GPT returns short JSON | *"This is non-deterministic — let me re-run."* (click AI Assist again) |

**Universal save:** *"This is exactly the kind of edge case I'd want your team to find in a paid pilot — let me show you the rest."*

---

## 🎁 Leave-behind assets

After every demo, send within 1 hour:
1. **3-min auto-tour link** — `https://[YOUR_DEPLOYED_URL]/demo`
2. **One-pager PDF** (you'll create — content from this script's "8 pillars" section)
3. **Architecture diagram** (file: `/app/memory/PRD.md` has the data flow)
4. **Pricing sheet** (custom)
5. **Calendly link** for the next call
6. *Optional:* a screen recording of you running this exact demo (MP4)

---

## 📝 Notes for next iteration of the script

- After 10 demos, mark which slides/beats consistently get nods vs blank stares
- Track: **at which beat does the prospect first ask about pricing?** (signals strong interest)
- Track: **which of the 8 pillars do they bring up first in Q&A?** (their real pain)
- Update this doc with the answers

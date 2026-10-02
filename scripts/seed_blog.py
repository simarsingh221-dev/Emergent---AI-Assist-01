#!/usr/bin/env python3
"""Seed 3 FlowPilot Studio field-note essays via the admin API."""
import os
import json
import sys
import urllib.request
import urllib.parse

BACKEND = "https://assist-flow.preview.emergentagent.com"

def api(method, path, body=None, token=None):
    url = f"{BACKEND}{path}"
    headers = {"Content-Type": "application/json", "User-Agent": "FlowPilot-Seed/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

# login as admin
tok = api("POST", "/api/auth/login", {"email": "admin@flowpilot.co.in", "password": "Admin@2026!"})
token = tok.get("token") or tok.get("access_token")
print("logged in; token prefix:", token[:20])

articles = [
    {
        "slug": "scoping-guide",
        "title": "Scoping Guide: Writing an RFP That Gets You Honest Estimates",
        "excerpt": "The 7 sections every software RFP needs — and the 3 that waste everyone's time. A short field guide from a studio that reads 100+ RFPs a year.",
        "tags": ["scoping", "rfp", "procurement"],
        "author": "FlowPilot Studio",
        "seo_title": "How to Write a Software RFP That Gets Honest Estimates | FlowPilot",
        "seo_description": "A field guide to writing software RFPs that get accurate, honest estimates — not pitch decks. 7 sections to include and 3 to skip.",
        "content_html": """
<p class="lead">Most software RFPs ask for the wrong thing. They collect pitch decks. They should collect calibrated estimates. Here's a 7-section template we tell clients to use — plus the 3 sections you can delete today.</p>

<h2>Why RFPs produce bad estimates</h2>
<p>Vendors read your RFP like a Rorschach test. If you don't tell them what success looks like, they'll invent a success story that fits their strongest skill set. The result: three proposals that look like they're solving three different problems — because they are.</p>
<p>A good RFP forces every vendor to answer the same hard questions. That's the only way you get apples-to-apples pricing.</p>

<h2>The 7 sections your RFP needs</h2>

<h3>1. Business context (1–2 pages)</h3>
<p>What business metric is this project supposed to move? What's the baseline? What's the target? If you can't write this in two paragraphs, your project is a wish, not a scope.</p>

<h3>2. Users and jobs-to-be-done</h3>
<p>Who are the three primary users? What's the single most important job they'll do inside the product? Example: "Dispatch coordinator — assign a driver to a load in under 30 seconds." Specific. Measurable.</p>

<h3>3. In-scope / out-of-scope list</h3>
<p>Vendors inflate scope when it's ambiguous. A clean <em>In Scope</em> / <em>Out of Scope</em> table forces honesty on both sides. For every big-ticket item, say explicitly whether it's in or out — not "TBD".</p>

<h3>4. Non-functional requirements</h3>
<p>Latency, concurrency, uptime target, security posture (SOC2? ISO?), data residency, auditability. These shape architecture more than features do. Omitting them is how you end up with a $400k rebuild in year two.</p>

<h3>5. Integrations and systems-of-record</h3>
<p>Name the systems. Name the APIs. Note which ones have been contacted and which are theoretical. "Integrates with our CRM" is a trap. "Integrates with Salesforce Sales Cloud, read-only, via REST, using an existing OAuth app" is a scope.</p>

<h3>6. Timeline and budget constraints</h3>
<p>Share both. Yes, both. Vendors who refuse to work in a budget range are telling you they're not calibrated. Vendors who refuse to commit to a timeline are telling you they bill by the hour.</p>

<h3>7. Decision criteria and process</h3>
<p>Who signs off? What's the shortlist criteria? When will you decide? Vendors invest more in RFPs they can actually win. Transparency produces better proposals.</p>

<h2>Three sections to delete</h2>
<ol>
<li><strong>"Vendor history" (unless regulated)</strong> — Nice-to-have, rarely decisive. Save it for shortlist diligence.</li>
<li><strong>"Preferred technology stack"</strong> — Unless you have a strong internal reason (hiring, existing ops), picking the stack is the vendor's job. Pre-constraining it narrows your options and often raises price.</li>
<li><strong>"Describe your methodology"</strong> — Everyone says Agile. The answer tells you nothing. Instead, ask: "Show us a weekly demo artifact from a comparable past project."</li>
</ol>

<h2>Red flags in the responses you get back</h2>
<ul>
<li>No fixed scope, only hourly rates</li>
<li>"We'll know more after discovery" (then charge for discovery before quoting)</li>
<li>A 100-page proposal with no written assumptions log</li>
<li>Reluctance to name specific team members who'll do the work</li>
</ul>

<p class="pullquote">A good RFP gets you three vendors who are solving the same problem with calibrated numbers. A bad one gets you three vendors solving three different problems.</p>

<h2>The FlowPilot alternative: a Discovery Sprint</h2>
<p>If you're not sure the problem is scoped enough to RFP yet, don't. A paid 1–2 week Discovery Sprint produces the artifacts you need to run a <em>credible</em> RFP — or decides the project isn't worth running at all. Either outcome saves you a quarter.</p>

<p><em>Published by the FlowPilot Studio team. We've helped operators write (and respond to) more than 100 software RFPs across BFSI, logistics, and SaaS.</em></p>
""".strip(),
    },
    {
        "slug": "ai-buyers-checklist",
        "title": "AI in Production: A Buyer's Checklist",
        "excerpt": "How to evaluate AI vendors beyond the demo. Cost ceilings, evaluations, and the questions nobody asks until it's too late.",
        "tags": ["ai", "procurement", "llm", "evals"],
        "author": "FlowPilot Studio",
        "seo_title": "AI Buyer's Checklist: Evaluating AI Vendors Beyond the Demo | FlowPilot",
        "seo_description": "A buyer's checklist for evaluating AI vendors — cost ceilings, evaluations, failure modes, and the questions to ask before signing.",
        "content_html": """
<p class="lead">Everyone can produce an AI demo. Not everyone can run one in production. Here's the checklist we use when a client asks us to evaluate an AI vendor — or when we evaluate ourselves.</p>

<h2>The problem: AI demos lie by omission</h2>
<p>An AI demo is a happy-path video. Production is 10,000 unhappy paths at 3am. The gap between those two is where projects die.</p>

<h2>Section 1 — Evaluations and failure modes</h2>
<ul>
<li>Does the vendor have a written eval suite? Can you see it?</li>
<li>What's the win-rate on their eval suite vs. the previous generation of the model?</li>
<li>When the model is wrong, how is wrongness measured — and how often?</li>
<li>Is there a human-in-the-loop checkpoint for high-stakes outputs?</li>
</ul>
<p>If the vendor cannot show you a written eval, they're measuring quality by vibes. That's fine for a chatbot in a product demo. It's not fine for a system that scores calls, extracts clinical data, or generates insurance quotes.</p>

<h2>Section 2 — Cost ceilings</h2>
<ul>
<li>What's the current per-call / per-task cost at the vendor's current volume?</li>
<li>At your projected volume, what does that extrapolate to?</li>
<li>Is there a hard cost ceiling, and what happens when it's hit?</li>
<li>Who pays the LLM / inference bill — vendor, pass-through to you, or hybrid?</li>
</ul>
<p>A 2 cent per-call AI gets expensive fast when you're running 10 million calls a quarter. We've seen pilots that looked cheap balloon into six-figure monthly bills because nobody set a ceiling.</p>

<h2>Section 3 — Latency and SLAs</h2>
<ul>
<li>P50 and P95 latency at the vendor's current scale (not the demo scale)</li>
<li>Degradation plan when the upstream LLM is slow or rate-limited</li>
<li>Written SLA — not just an uptime percentage, but a response time for incidents</li>
</ul>

<h2>Section 4 — Data and compliance</h2>
<ul>
<li>Where is your data stored? For how long?</li>
<li>Is it used for model training? If so, how do you opt out?</li>
<li>What encryption-at-rest and in-transit standards apply?</li>
<li>SOC2 Type II? HIPAA? GDPR? Which auditor? When was the last audit?</li>
</ul>

<h2>Section 5 — Model portability</h2>
<ul>
<li>If you need to switch from GPT to Claude mid-project, how disruptive is that?</li>
<li>Is the vendor abstracted over model providers, or hard-coded to one?</li>
<li>What happens to your evals and prompts if the model provider deprecates a version?</li>
</ul>

<p class="pullquote">The question is not "does the AI work?" It's "does it keep working on the day the model provider changes the API, the volume triples, and your legal team asks where the data lives?"</p>

<h2>Section 6 — The team behind the AI</h2>
<ul>
<li>Who did the training / fine-tuning? Can you talk to them?</li>
<li>What's the ratio of ML engineers to sales engineers?</li>
<li>How are regressions caught — before deployment, or after a customer complains?</li>
</ul>

<h2>Our minimum bar at FlowPilot</h2>
<p>Before we ship an AI-powered feature in a client product, we require:</p>
<ol>
<li>A written eval suite with a documented baseline</li>
<li>A per-call cost dashboard with a hard monthly ceiling and alerts</li>
<li>A fallback path when the LLM is slow or unavailable</li>
<li>An audit trail — every AI decision is logged with inputs, outputs, and model version</li>
<li>A human-in-the-loop checkpoint for any output that affects a monetary or regulatory outcome</li>
</ol>

<p>If a vendor can't meet all five, we don't ship them.</p>

<p><em>FlowPilot Studio builds AI-powered software that runs in production. Our own agent-assist product scores 100% of calls in BFSI contact centers with cost ceilings, evals, and audit trails baked in from day one.</em></p>
""".strip(),
    },
    {
        "slug": "weekly-demo",
        "title": "The Weekly Demo: Why Fridays Save Projects",
        "excerpt": "The one ritual that separates studios that ship from agencies that bill. A short defence of the Friday demo.",
        "tags": ["process", "project-management", "delivery"],
        "author": "FlowPilot Studio",
        "seo_title": "The Weekly Demo: Why Fridays Save Software Projects | FlowPilot",
        "seo_description": "A short defence of the Friday demo — the single operational ritual that separates software studios that ship from agencies that just bill hours.",
        "content_html": """
<p class="lead">Every project at FlowPilot has a demo on Friday afternoon. Working software, in the client's hands, every week. It's the most important thing we do.</p>

<h2>Why Fridays?</h2>
<p>Fridays force a hard deadline into every sprint. If the demo is Friday at 4pm, Thursday evening is <em>show-what-you-have</em>, not <em>hope-it-works</em>. Code gets committed. Branches get merged. Features get tested. The team compresses the week around a public commitment.</p>
<p>Monday-start sprints and Friday demos also give you a weekend's buffer before the next sprint starts. A sprint retro on Friday is honest. A sprint retro on Monday morning is anxiety.</p>

<h2>What a demo must be — and must not be</h2>

<h3>A demo IS</h3>
<ul>
<li>Working software, running against production-like data</li>
<li>Driven by the client, not the engineer (you click, we watch)</li>
<li>30 minutes, maximum</li>
<li>Followed by a one-page written recap sent within an hour</li>
</ul>

<h3>A demo IS NOT</h3>
<ul>
<li>A slide deck</li>
<li>A Figma walk-through (that's a design review, do it separately)</li>
<li>An engineer screen-sharing their IDE</li>
<li>A status update dressed up as a demo</li>
</ul>

<p class="pullquote">If you can't demo it, you haven't built it.</p>

<h2>The hidden benefits</h2>

<h3>1. Scope creep gets exposed early</h3>
<p>When the client says "oh, can we also do X?" in week three, you have evidence of what was built against the signed scope. The scope log and the demo together form a running audit trail that protects both sides.</p>

<h3>2. Risk compounds in the dark</h3>
<p>Projects don't fail in the last week. They fail in week four — but nobody notices until week fourteen because the demos stopped. Fridays prevent that. A missed demo in week four is a $5k problem. A missed demo in week fourteen is a $500k problem.</p>

<h3>3. The team ships better software</h3>
<p>When you know the client will click through your work on Friday, you don't ship things you're half-ashamed of. Engineers set their own quality bar higher when there's a public demo waiting.</p>

<h3>4. Clients become collaborators</h3>
<p>Weekly demos give the client narrative ownership. By week ten, they're saying "we built this" — not "they built this". That's the right outcome. The product has to live inside their org after we leave.</p>

<h2>What to do when a demo fails</h2>
<ol>
<li>Hold the demo anyway. Show what broke. Explain what you learned.</li>
<li>Put the gap in the next sprint plan on the shared burndown.</li>
<li>Do NOT catch up on the weekend — that habit kills teams and lies to the client about pace.</li>
<li>If the gap is systemic, raise it in Monday's planning as a scope / timeline conversation, not an all-hands crisis.</li>
</ol>

<h2>Why most agencies skip it</h2>
<p>A time-and-materials agency has no incentive to show you weekly working software. The longer the fog lasts, the more hours they bill. The weekly demo is the single operational ritual that aligns incentives between a studio and its client — which is why we never, ever, skip it.</p>

<p><em>FlowPilot Studio runs Friday demos on every active project. Rain, snow, holiday-adjacent — doesn't matter. The demo happens.</em></p>
""".strip(),
    },
]

for art in articles:
    try:
        r = api("POST", "/api/blog/articles", art, token=token)
        print(f"  OK: {art['slug']}")
    except urllib.error.HTTPError as e:
        print(f"  FAIL: {art['slug']} → {e.code} {e.read().decode()[:200]}")
    except Exception as e:
        print(f"  ERR: {art['slug']} → {e}")

print("done.")

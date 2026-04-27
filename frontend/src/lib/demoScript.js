// FlowPilot — Demo timeline. Each beat optionally has narration (TTS) + visual op.
// Visual ops mutate the demo workspace state.

export const VOICE = "coral"; // calm professional female

export const TIMELINE = [
  // ---------- INTRO ----------
  {
    narrate: "Meet FlowPilot. Real time agent assist that gives every contact center agent a superpower. Watch how it works in three real conversations.",
    visual: { op: "intro" },
    minMs: 1000,
  },

  // ---------- SCENE 1: Credit-card retention ----------
  {
    visual: { op: "scene_open", scene: { number: 1, title: "Credit card retention", customer: "Priya · Premium customer", workflow: "retention" } },
    minMs: 900,
  },
  {
    narrate: "First. Priya, a long-time customer, calls to close her credit card.",
    minMs: 200,
  },
  {
    visual: { op: "utterance", utterance: { speaker: "customer", text: "Hi, I want to close my credit card. The fees are too high." } },
    minMs: 2200,
  },
  {
    narrate: "FlowPilot listens in real time, transcribes the call, and detects intent in milliseconds.",
    visual: { op: "analysis", analysis: { intent: "Close credit card", sentiment: "negative", escalation_risk: "medium", churn_risk: "high" } },
    minMs: 600,
  },
  {
    narrate: "Churn risk: high. And here's where the magic happens. Instead of the agent panicking, FlowPilot recommends the next best action.",
    visual: { op: "nba_show", nba: { title: "Offer 5,000 bonus reward points", reason: "Customer spent ₹64,300 last quarter — high retention value.", type: "upsell" } },
    minMs: 600,
  },
  {
    narrate: "Offer five thousand bonus reward points. Why? Because she spent over sixty four thousand rupees last quarter — she's worth retaining.",
    visual: { op: "suggested", text: "I completely understand the concern about fees. Before we close the account, I'd love to offer you a special retention reward of 5,000 bonus points — a small thank you for being with us." },
    minMs: 600,
  },
  {
    narrate: "And in parallel, FlowPilot tracks compliance. The agent hasn't read the privacy disclosure yet — flagged in real time.",
    visual: {
      op: "compliance",
      items: [
        { item: "Recording consent", status: "done", note: "" },
        { item: "Privacy policy disclosure", status: "missed", note: "Not read in opening 60s" },
        { item: "KYC verification", status: "pending", note: "Required before account changes" },
      ],
    },
    minMs: 1200,
  },

  // ---------- SCENE 2: KYC for a loan ----------
  {
    visual: { op: "scene_open", scene: { number: 2, title: "KYC for a personal loan", customer: "Arjun · Loan applicant", workflow: "kyc" } },
    minMs: 900,
  },
  {
    narrate: "Next. Arjun is applying for a personal loan.",
    minMs: 200,
  },
  {
    visual: { op: "utterance", utterance: { speaker: "customer", text: "I'd like to apply for a personal loan of five lakhs for three years." } },
    minMs: 2400,
  },
  {
    narrate: "FlowPilot recognizes the workflow — and walks the agent through KYC, step by step.",
    visual: {
      op: "workflow",
      steps: [
        { label: "Verify name and date of birth", status: "active" },
        { label: "Capture mobile and PAN last 4", status: "todo" },
        { label: "Send and confirm OTP", status: "todo" },
        { label: "Verify address (city + pincode)", status: "todo" },
        { label: "Read privacy disclosure", status: "todo" },
        { label: "Document in CRM", status: "todo" },
      ],
    },
    minMs: 800,
  },
  {
    visual: { op: "utterance", utterance: { speaker: "agent", text: "Of course Arjun. Could you confirm your full name and date of birth?" } },
    minMs: 1800,
  },
  {
    visual: { op: "step_advance", index: 0 },
    minMs: 400,
  },
  {
    visual: { op: "utterance", utterance: { speaker: "customer", text: "Arjun Mehta, fifteenth April nineteen ninety-two." } },
    minMs: 2200,
  },
  {
    visual: { op: "step_advance", index: 1 },
    minMs: 200,
  },
  {
    narrate: "Each step ticks off automatically as the conversation flows. And when policy questions come up, the answer surfaces instantly. No tab switching. No SOP hunting.",
    visual: {
      op: "kb",
      sources: [
        { title: "Loan Processing SOP", category: "Banking", snippet: "Tenure 3-7 years for auto, less than 3 yrs personal. Indicative EMI only — never confirm final rate without underwriter approval." },
        { title: "Credit Life Insurance Cross-sell", category: "Banking", snippet: "Offer credit life insurance to all loan customers above ₹2,00,000." },
      ],
    },
    minMs: 1200,
  },

  // ---------- SCENE 3: Frustrated insurance claim ----------
  {
    visual: { op: "scene_open", scene: { number: 3, title: "Frustrated insurance claim", customer: "Meera · Health policy", workflow: "claims" } },
    minMs: 900,
  },
  {
    narrate: "And finally — the hard call. Meera has been trying to file an insurance claim for three weeks.",
    minMs: 200,
  },
  {
    visual: { op: "utterance", utterance: { speaker: "customer", text: "I've been trying to file this claim for three weeks. This is absolutely unacceptable." } },
    minMs: 2400,
  },
  {
    narrate: "Tone shifts. Frustration detected. Escalation risk: high.",
    visual: { op: "analysis", analysis: { intent: "File health claim", sentiment: "frustrated", escalation_risk: "high", churn_risk: "high" } },
    minMs: 500,
  },
  {
    visual: { op: "supervisor_alert", message: "Live call needs intervention · escalation risk HIGH" },
    minMs: 1400,
  },
  {
    narrate: "Supervisor alerted automatically. And FlowPilot drafts the perfect empathetic response — ready to send with one click.",
    visual: { op: "suggested", text: "Meera, I completely understand how frustrating this has been, and I'm truly sorry. Let me personally take ownership of your claim right now. Could you confirm your policy number so I can pull it up?" },
    minMs: 1200,
  },
  {
    narrate: "When the call ends, FlowPilot writes the summary, captures next steps, and updates your CRM — saving every agent up to eighty percent of after-call work.",
    visual: {
      op: "summary",
      summary: {
        summary: "Customer Meera reported delayed health claim processing of three weeks. Agent acknowledged with empathy, took personal ownership, and verified policy. Escalated to senior claims specialist with priority flag.",
        customer_intent: "Resolve delayed health insurance claim",
        key_points: [
          "Claim pending for 3 weeks — major service failure",
          "Customer at high churn risk, frustrated tone",
          "Policy verified, claim ID re-shared",
        ],
        next_steps: [
          "Senior claims specialist to call back within 4 hours",
          "Goodwill credit of one free month applied",
          "Privacy + recording disclosure to be re-read on follow-up",
        ],
        tags: ["health-claim", "escalation", "service-recovery", "high-priority"],
      },
    },
    minMs: 2000,
  },

  // ---------- CTA ----------
  {
    narrate: "FlowPilot. Real time intelligence for every conversation. Across voice, chat, and email. Ready to give your agents their superpower? Get started below.",
    visual: { op: "cta" },
    minMs: 500,
  },
];

// Pre-extract narration scripts (for parallel TTS prefetch)
export const NARRATIONS = TIMELINE.filter((b) => b.narrate).map((b) => b.narrate);

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FlowLogo from "@/components/FlowLogo";
import {
  Waveform, Brain, Target, BookOpen, ShieldCheck, ChartBar, ArrowRight, Lightning, Check, CirclesFour
} from "@phosphor-icons/react";

const features = [
  { icon: Waveform, title: "Real-time listening", desc: "Live transcription with speaker diarization across voice, chat and email.", tag: "01" },
  { icon: Brain, title: "Intent & sentiment", desc: "LLM detects customer intent, frustration and churn risk every utterance.", tag: "02" },
  { icon: Target, title: "Next-best actions", desc: "Suggested responses, questions, cross-sell prompts and resolution steps.", tag: "03" },
  { icon: BookOpen, title: "Cognitive search", desc: "Semantic retrieval over SOPs, policies and CRM — exact answer, zero search.", tag: "04" },
  { icon: ShieldCheck, title: "Real-time compliance", desc: "AutoQA checks disclosures and script adherence — flags misses live.", tag: "05" },
  { icon: ChartBar, title: "Live supervisor view", desc: "50+ real-time insights. Intervene on at-risk or high-value calls.", tag: "06" }
];

const ccaas = ["Genesys", "Five9", "NICE CXone", "Amazon Connect", "Twilio Flex", "Webex CC", "Zendesk Talk", "Salesforce SCV"];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#0A0A0A]">
      {/* Top bar */}
      <header className="border-b border-[#E5E5E5] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2" data-testid="brand-logo">
              <FlowLogo size={26} />
              <span className="font-heading font-bold text-lg tracking-tight">FlowPilot</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-[#525252]">
              <a href="#features" className="link-underline">Capabilities</a>
              <a href="#integrations" className="link-underline">Integrations</a>
              <a href="#how" className="link-underline">How it works</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" data-testid="nav-login" className="text-sm px-3 py-2 hover:bg-neutral-100">Sign in</Link>
            <Link to="/register" data-testid="nav-register">
              <Button className="bg-black text-white hover:bg-[#7B61FF] rounded-none h-9 px-4 text-sm">Start free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative border-b border-[#E5E5E5] aurora-bg overflow-hidden">
        <div className="absolute inset-0 grid-texture opacity-40 pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-28 relative">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
              <div className="flex items-center gap-2 mb-8">
                <span className="live-dot" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#525252]">Live Agent Assist · Sub-second latency</span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.95]" data-testid="hero-title">
                Every agent,<br />
                augmented in <span className="brand-gradient-text">real time.</span>
              </h1>
              <p className="mt-8 text-base sm:text-lg text-[#525252] max-w-2xl leading-relaxed">
                FlowPilot plugs into your existing CCaaS stack and gives agents the exact next-best action,
                instant knowledge, and live compliance — while supervisors watch every conversation in one glass.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/demo" data-testid="hero-cta-watch-demo">
                  <Button className="brand-gradient-bg text-white hover:opacity-90 rounded-none h-12 px-6 text-sm font-medium">
                    Watch 3-min demo <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/register" data-testid="hero-cta-start">
                  <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white rounded-none h-12 px-6 text-sm">
                    Start free trial
                  </Button>
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-xl">
                {[
                  { k: "80%", v: "Less after-call work" },
                  { k: "50+", v: "Real-time signals" },
                  { k: "<800ms", v: "AI suggestion latency" }
                ].map((s) => (
                  <div key={s.k} className="border-l-2 border-[#7B61FF] pl-3">
                    <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{s.k}</div>
                    <div className="text-xs text-[#525252] mt-1">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 relative">
              <div className="bg-[#09090B] text-white p-5 border border-black" data-testid="hero-preview">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="live-dot" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Live call · 02:14</span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500">AGENT · P-7821</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-mono text-[10px] text-[#7B61FF] uppercase">Customer</span>
                    <p className="mt-1">I want to close my credit card — too many fees.</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-emerald-400 uppercase">Agent</span>
                    <p className="mt-1 text-neutral-300">I completely understand. Let me pull up your account…</p>
                  </div>
                </div>
                <div className="mt-5 border-t border-neutral-800 pt-4">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Suggested next action</div>
                  <div className="brand-gradient-bg text-white p-3 text-sm">
                    <div className="font-medium">Offer 5,000 bonus reward points</div>
                    <div className="text-[11px] text-white/85 mt-1">Customer spent ₹64,300 last quarter — high retention value.</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono uppercase">
                  <div className="border border-neutral-800 p-2"><div className="text-neutral-500">Intent</div><div className="text-white">Churn risk</div></div>
                  <div className="border border-neutral-800 p-2"><div className="text-neutral-500">Sentiment</div><div className="text-red-400">Negative</div></div>
                  <div className="border border-neutral-800 p-2"><div className="text-neutral-500">Escalate</div><div className="text-amber-400">Medium</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CCaaS logos */}
      <section id="integrations" className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-6">
            <CirclesFour size={16} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252]">Integrates with your CCaaS stack</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {ccaas.map((n) => (
              <div key={n} className="border border-[#E5E5E5] bg-white px-3 py-4 text-center font-mono text-[11px] uppercase tracking-wider text-[#525252]">
                {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-[#E5E5E5] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-20">
          <div className="grid grid-cols-12 gap-6 mb-12">
            <div className="col-span-12 lg:col-span-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-3">§ Capabilities</div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Eight pillars of a modern<br />agent-assist platform.
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-7 text-[#525252] text-sm sm:text-base leading-relaxed flex items-end">
              From the moment a call connects to the post-call wrap-up — every signal, suggestion,
              and surface your agents and supervisors need, in one omnichannel workspace.
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#E5E5E5] border border-[#E5E5E5]">
            {features.map((f) => (
              <div key={f.title} className="bg-white p-6 min-h-[200px] flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <f.icon size={24} weight="regular" />
                  <span className="font-mono text-[10px] text-[#A3A3A3]">{f.tag}</span>
                </div>
                <h3 className="font-heading text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-[#525252] mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-[#E5E5E5] bg-[#09090B] text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-20">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-3">§ How it works</div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-12 max-w-3xl">
            Four steps. Zero friction to deploy.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { n: "01", t: "Connect", d: "Plug into Genesys, Five9, NICE, Amazon Connect via webhook or SIP bridge." },
              { n: "02", t: "Stream", d: "Audio and chat stream to FlowPilot in under 800ms end-to-end." },
              { n: "03", t: "Assist", d: "GPT-5.2 + your KB surface suggestions and compliance checks live." },
              { n: "04", t: "Summarize", d: "Auto-generated summary & CRM updates at call end — zero wrap-up." }
            ].map((s) => (
              <div key={s.n} className="border-t border-neutral-800 pt-5">
                <div className="font-mono text-xs text-[#7B61FF] mb-3">{s.n}</div>
                <div className="font-heading text-xl font-semibold">{s.t}</div>
                <div className="text-sm text-neutral-400 mt-2">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
          <Lightning size={32} weight="fill" className="mx-auto text-[#7B61FF]" />
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tighter mt-6">
            Ship better conversations. Today.
          </h2>
          <p className="text-[#525252] mt-4 max-w-xl mx-auto">Start free. Connect your first call queue in under 10 minutes.</p>
          <div className="mt-8">
            <Link to="/register" data-testid="footer-cta">
              <Button className="bg-black text-white hover:bg-[#7B61FF] rounded-none h-12 px-8 text-sm">Create your workspace</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FlowLogo size={22} />
            <span className="font-heading font-bold">FlowPilot</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">© 2026 · Built for contact centers</div>
        </div>
      </footer>
    </div>
  );
}

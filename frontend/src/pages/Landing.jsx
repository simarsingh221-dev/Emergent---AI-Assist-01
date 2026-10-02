import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import LogoCloud from "@/components/LogoCloud";
import {
  ArrowRight, Lightbulb, PaintBrush, Code, Rocket, CheckCircle,
  CurrencyDollar, Clock, PresentationChart, Buildings, Lightning, ChatCircleText, Truck
} from "@phosphor-icons/react";

export default function Landing() {
  return (
    <>
      <Helmet>
        <title>FlowPilot — Software that ships. On scope. On time.</title>
        <meta name="description" content="FlowPilot is a software engineering and product development studio. We design, build and launch custom web & mobile apps, SaaS products, AI solutions and business systems — from idea to production." />
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-6">
            § Software engineering studio · Est. 2026
          </div>
          <h1 className="font-heading text-[44px] sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em] leading-[1.02] max-w-5xl text-[#1F2937]">
            Software that ships.
            <br />
            <span className="brand-gradient-text">On scope. On time.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg lg:text-xl leading-relaxed text-[#6B7280]">
            From idea to production. We design, build and launch custom software, SaaS products,
            AI solutions and business systems for companies that need more than off-the-shelf tools.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/contact" data-testid="hero-book-call">
              <Button className="brand-gradient-bg text-white hover:opacity-90 rounded-xl h-12 px-6 text-sm font-medium">
                Book Discovery Call <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link to="/case-studies" data-testid="hero-explore-work">
              <Button variant="outline" className="rounded-xl h-12 px-6 text-sm border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white">
                Explore Our Work
              </Button>
            </Link>
          </div>

          {/* Animated Pipeline: Idea → Design → Development → Launch */}
          <div className="mt-20 relative">
            {/* progress rail */}
            <div className="hidden lg:block absolute left-6 right-6 top-[52px] h-px bg-[#EAE9E2]" aria-hidden>
              <motion.div
                className="h-px bg-gradient-to-r from-[#0F766E] via-[#C8A97E] to-[#14532D]"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2.4, ease: "easeInOut", delay: 0.3 }}
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: Lightbulb, label: "Idea", k: "01", note: "Discovery & scope" },
                { icon: PaintBrush, label: "Design", k: "02", note: "Prototype & specs" },
                { icon: Code, label: "Development", k: "03", note: "Weekly demos" },
                { icon: Rocket, label: "Launch", k: "04", note: "Go-live & support" }
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.18, ease: "easeOut" }}
                  className="relative bg-white rounded-2xl p-6 border border-[#EAE9E2] shadow-sm"
                  data-testid={`hero-pipeline-${s.label.toLowerCase()}`}
                >
                  <div className="font-mono text-[10px] text-[#8A7540] uppercase tracking-widest">{s.k}</div>
                  <div className="mt-4 w-10 h-10 rounded-xl bg-[#F0FDF9] border border-[#0F766E]/15 flex items-center justify-center">
                    <s.icon size={18} className="text-[#0F766E]" weight="duotone" />
                  </div>
                  <div className="mt-4 font-heading text-lg font-semibold text-[#1F2937]">{s.label}</div>
                  <div className="text-xs text-[#6B7280] mt-1">{s.note}</div>
                  {i < 3 && (
                    <motion.div
                      className="hidden lg:flex absolute -right-3 top-[42px] w-6 h-6 rounded-full bg-[#C8A97E] items-center justify-center shadow-md"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.9 + i * 0.18 }}
                      aria-hidden
                    >
                      <ArrowRight size={12} weight="bold" className="text-white" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF — anonymized industry trust strip */}
      <LogoCloud variant="white" />

      {/* THE REALITY */}
      <section className="bg-white border-y border-[#EAE9E2]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ The reality</div>
            <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight text-[#1F2937] leading-[1.1]">
              Most software projects fail.<br />
              <span className="text-[#6B7280]">We fix the three reasons why.</span>
            </h2>
          </div>
          <div className="space-y-6">
            {[
              ["Unclear scope", "Teams start building before they define what success looks like."],
              ["Silent delays", "Weeks pass with no demo. Risk compounds in the dark."],
              ["Wrong product decisions", "Features ship that no one needed. Opportunity cost silently kills the business case."]
            ].map(([t, d]) => (
              <div key={t} className="flex gap-4">
                <div className="w-1 shrink-0 bg-[#C8A97E] rounded-full" />
                <div>
                  <div className="font-heading text-xl font-semibold text-[#1F2937]">{t}</div>
                  <p className="text-[#6B7280] mt-1">{d}</p>
                </div>
              </div>
            ))}
            <div className="pt-6 mt-6 border-t border-[#EAE9E2]">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#0F766E] mb-3">The FlowPilot way</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Define first", "Design before build", "Fixed scope", "Weekly demos", "No surprises"].map((p) => (
                  <div key={p} className="flex items-center gap-1.5 text-sm text-[#1F2937]">
                    <CheckCircle size={14} weight="fill" className="text-[#0F766E]" /> {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE BUILD */}
      <section className="bg-[#FAF8F4]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-28">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ What we build</div>
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight text-[#1F2937] max-w-3xl leading-[1.1]">
            Four practices. One studio. Outcomes that compound.
          </h2>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { t: "Web & Mobile Products", o: ["Customer-facing products that scale from 10 → 10M users",
                "Native-feeling iOS and Android apps on a shared codebase", "Instrumented from day one for growth"] },
              { t: "Business Systems", o: ["Replace spreadsheets and legacy tools with purpose-built CRMs & ERPs",
                "Automate workflows that eat your operations team's week", "Single source of truth across departments"] },
              { t: "AI & Automation", o: ["LLM-powered copilots embedded in real business processes",
                "Document intelligence, agent assist, predictive scoring", "Cost-controlled, measurable, production-grade"] },
              { t: "Experience & Strategy", o: ["Product discovery that unblocks a stuck roadmap",
                "Design systems your team can extend without us", "User research that changes the business case, not just the colors"] }
            ].map((c) => (
              <div key={c.t} className="bg-white rounded-2xl p-8 border border-[#EAE9E2] shadow-sm hover:shadow-lg transition-shadow">
                <div className="font-heading text-2xl font-bold tracking-tight text-[#1F2937]">{c.t}</div>
                <ul className="mt-5 space-y-2.5">
                  {c.o.map((o) => (
                    <li key={o} className="flex gap-3 text-[#6B7280]">
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E] shrink-0 mt-0.5" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-white border-y border-[#EAE9E2]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ Featured products</div>
              <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight text-[#1F2937]">
                Our own products.<br />
                <span className="text-[#6B7280]">Built with the same rigor we sell.</span>
              </h2>
            </div>
            <Link to="/products" className="text-sm font-medium text-[#0F766E] hover:text-[#14532D] inline-flex items-center gap-1">
              All products <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { name: "FlowPilot", industry: "Contact Centers · BFSI", desc: "Real-time agent assist and conversation intelligence for 100+ agent operations.", benefits: ["15–20% AHT reduction", "95%+ compliance score", "Supervisor-grade insights"], href: "/products#flowpilot", icon: Lightning },
              { name: "FlowFreight", industry: "Logistics · Freight forwarders", desc: "Operations control tower for freight forwarders and shipping organisations. Shipment visibility, digital POD, dispute workflows.", benefits: ["End-to-end visibility", "Digital POD workflows", "Carrier-agnostic routing"], href: "/products#flowfreight", icon: Truck }
            ].map((p) => (
              <div key={p.name} className="group bg-[#FAF8F4] rounded-2xl p-7 border border-[#EAE9E2] hover:border-[#0F766E] transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 brand-gradient-bg rounded-lg flex items-center justify-center">
                    <p.icon size={18} weight="fill" className="text-white" />
                  </div>
                </div>
                <div className="font-heading text-2xl font-bold text-[#1F2937]">{p.name}</div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#8A7540] mt-1">{p.industry}</div>
                <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">{p.desc}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-[#1F2937]">
                  {p.benefits.map((b) => <li key={b} className="flex gap-2"><CheckCircle size={14} weight="fill" className="text-[#0F766E] mt-0.5 shrink-0" />{b}</li>)}
                </ul>
                <Link to={p.href} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#0F766E] group-hover:gap-2 transition-all">
                  Learn more <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="bg-[#FAF8F4]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-28">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ Case studies</div>
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight text-[#1F2937] max-w-3xl leading-[1.1]">
            Real projects. Real outcomes.
          </h2>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[
              { title: "Real-Time Agent Assist", industry: "BFSI contact center · 500 agents",
                summary: "Live transcription, AI next-best-action, supervisor compliance scoring deployed across 5 BFSI campaigns.",
                outcomes: [["15-20%", "AHT reduction"], ["8-12%", "FCR improvement"], ["95%+", "Compliance score"]] },
              { title: "Shipping Technology Transformation", industry: "Logistics · mid-market fleet",
                summary: "Replaced 7 disconnected tools with a single operations dashboard, shipment visibility and digital POD workflows.",
                outcomes: [["40%", "Fewer back-office hours"], ["3 → 1", "Vendor consolidation"], ["Days → Hours", "Dispute resolution"]] }
            ].map((c) => (
              <Link to="/case-studies" key={c.title} className="group bg-white rounded-2xl p-8 border border-[#EAE9E2] shadow-sm hover:shadow-xl transition-shadow">
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#8A7540]">{c.industry}</div>
                <div className="font-heading text-2xl font-bold text-[#1F2937] mt-2">{c.title}</div>
                <p className="text-[#6B7280] mt-3">{c.summary}</p>
                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#EAE9E2]">
                  {c.outcomes.map(([k, v]) => (
                    <div key={v}>
                      <div className="font-heading text-xl lg:text-2xl font-bold text-[#0F766E]">{k}</div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-[#6B7280] mt-1">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="inline-flex items-center gap-1 text-sm font-medium text-[#0F766E] group-hover:gap-2 transition-all mt-5">
                  Read full case study <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="bg-white border-y border-[#EAE9E2]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-28">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ How we work</div>
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight text-[#1F2937] max-w-3xl leading-[1.1]">
            Four phases. No surprises.
          </h2>
          <div className="mt-14 relative">
            <div className="hidden lg:block absolute left-0 right-0 top-6 h-px bg-gradient-to-r from-[#0F766E] via-[#C8A97E] to-[#14532D]" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              {[
                { k: "01", t: "Discovery", d: "1–2 weeks. We unpack the business problem, risks, and non-obvious constraints." },
                { k: "02", t: "Design", d: "2–3 weeks. Clickable prototypes, system architecture, and a fixed scope document." },
                { k: "03", t: "Build", d: "6–16 weeks. Weekly demos. Shippable increments every sprint. No black boxes." },
                { k: "04", t: "Launch", d: "Go-live support, observability, and a handover plan your team can own." }
              ].map((s) => (
                <div key={s.k} className="relative bg-white border border-[#EAE9E2] rounded-2xl p-6">
                  <div className="w-12 h-12 brand-gradient-bg text-white rounded-xl flex items-center justify-center font-heading font-bold">{s.k}</div>
                  <div className="font-heading text-xl font-bold text-[#1F2937] mt-5">{s.t}</div>
                  <p className="text-sm text-[#6B7280] mt-2">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-[#FAF8F4]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-28">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ Why FlowPilot</div>
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight text-[#1F2937] max-w-3xl leading-[1.1]">
            Studios who respect scope are rare. Here's what you get.
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { i: CurrencyDollar, t: "Fixed Scope", d: "Signed scope document. No vague estimates." },
              { i: Clock, t: "Known Timeline", d: "A delivery date you can share with your board." },
              { i: PresentationChart, t: "Weekly Demos", d: "Working software every Friday. Never a surprise." },
              { i: Code, t: "Modern Architecture", d: "Type-safe, testable, deployable by your team." },
              { i: ChatCircleText, t: "Transparent Communication", d: "Shared Slack, shared repo, shared burndown." },
              { i: Buildings, t: "Long-Term Support", d: "SLAs, retainers, or clean handovers — your call." }
            ].map((p) => (
              <div key={p.t} className="bg-white border border-[#EAE9E2] rounded-2xl p-6">
                <p.i size={22} weight="duotone" className="text-[#0F766E]" />
                <div className="font-heading text-lg font-bold text-[#1F2937] mt-4">{p.t}</div>
                <p className="text-sm text-[#6B7280] mt-1">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white border-y border-[#EAE9E2]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-28">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ Client voices</div>
              <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight text-[#1F2937] max-w-3xl leading-[1.1]">
                From the people who shipped with us.
              </h2>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#8A7540] max-w-xs text-right">
              Names redacted at client request · Full attribution available on reference call
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                quote: "They cut three months out of our roadmap. The Friday demo is addictive — you always know exactly where you stand.",
                initial: "R",
                role: "VP Operations",
                company: "BFSI contact center · 500 agents",
              },
              {
                quote: "We'd been through two agencies before FlowPilot. First studio that actually delivered on a signed scope. No surprises, no scope creep.",
                initial: "A",
                role: "Head of Technology",
                company: "Freight forwarder · Mid-market",
              },
              {
                quote: "Our team owns the codebase on day one post-launch. That's rare. The handover was clean enough that our new hire shipped a feature in week two.",
                initial: "S",
                role: "CTO & Co-founder",
                company: "Series-B SaaS",
              },
            ].map((t, i) => (
              <blockquote key={i} className="bg-[#FAF8F4] border border-[#EAE9E2] rounded-2xl p-7 flex flex-col" data-testid={`testimonial-${i}`}>
                <div className="text-5xl font-heading text-[#C8A97E] leading-none">"</div>
                <p className="text-[#1F2937] mt-2 italic leading-relaxed flex-1">{t.quote}</p>
                <div className="mt-6 pt-5 border-t border-[#EAE9E2] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full brand-gradient-bg text-white flex items-center justify-center font-heading font-bold text-sm">
                    {t.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[#1F2937] truncate">{t.role}</div>
                    <div className="text-xs text-[#6B7280] truncate">{t.company}</div>
                  </div>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#14532D] text-white">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-28 text-center">
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
            Tell us what you're trying to build.
          </h2>
          <p className="mt-5 text-lg text-white/70 max-w-2xl mx-auto">
            Whether you have a detailed specification or just an idea, we'll help you define the right path forward.
          </p>
          <Link to="/contact" data-testid="final-cta" className="inline-block mt-10">
            <Button className="bg-[#C8A97E] text-[#14532D] hover:bg-white rounded-xl h-14 px-8 text-base font-semibold">
              Book Discovery Call <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

    </>
  );
}

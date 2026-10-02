import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowRight, DeviceMobile, Database, Robot, Compass, CheckCircle, Globe, Cpu, Lock } from "@phosphor-icons/react";

const services = [
  {
    icon: DeviceMobile,
    name: "Web & Mobile Products",
    tagline: "Customer-facing software, built to scale.",
    description: "We build custom web and mobile products from scratch — from the first wireframe to the iOS/Android/Web shipped and instrumented for growth.",
    outcomes: [
      "React, Next.js, React Native, Flutter",
      "Native-feeling cross-platform experiences",
      "Analytics and feature flags from day one",
      "Design systems your team can extend",
    ],
    bestFor: "Founders replacing an MVP, series-A teams rebuilding v2, and enterprise innovation groups shipping a greenfield product.",
  },
  {
    icon: Database,
    name: "Business Systems",
    tagline: "Replace spreadsheets with purpose-built software.",
    description: "CRMs, ERPs, operations consoles, portals, and workflow automation that unblock your operations and finance teams.",
    outcomes: [
      "Internal tools and admin consoles",
      "Role-based access & audit trails",
      "Workflow automation and approvals",
      "Clean integrations with your stack",
    ],
    bestFor: "Operators drowning in spreadsheets, teams outgrowing no-code tools, and leaders consolidating 5+ fragmented tools into one.",
  },
  {
    icon: Robot,
    name: "AI & Automation",
    tagline: "LLM-powered software that earns its cost.",
    description: "We embed language models, computer vision, and intelligent agents into real business workflows — with cost ceilings, evals, and measurable outcomes.",
    outcomes: [
      "Agent assist & copilots",
      "Document intelligence & extraction",
      "Predictive scoring and classification",
      "Guardrails, evals, cost dashboards",
    ],
    bestFor: "Teams that have tried demos but not shipped. We take AI from \"interesting\" to a line item in the P&L.",
  },
  {
    icon: Compass,
    name: "Experience & Strategy",
    tagline: "Product discovery that unblocks the roadmap.",
    description: "When the problem isn't clear yet, we run focused discovery sprints that produce a scoped plan — not a 60-slide deck.",
    outcomes: [
      "User research & journey mapping",
      "Product strategy & roadmap",
      "Design systems",
      "Scoped execution plan",
    ],
    bestFor: "Stuck roadmaps, pre-build alignment, and leadership teams who need an outside perspective before signing a 6-figure build.",
  },
];

const stack = [
  { icon: Globe, label: "Frontend", items: ["React 19", "Next.js", "React Native", "Tailwind", "Framer Motion"] },
  { icon: Cpu, label: "Backend & AI", items: ["FastAPI", "Node", "Postgres", "MongoDB", "LLM orchestration"] },
  { icon: Lock, label: "Platform", items: ["AWS / GCP", "Vercel", "SOC2-ready", "Observability", "CI/CD"] },
];

export default function Services() {
  return (
    <>
      <Helmet>
        <title>Services — FlowPilot Studio</title>
        <meta name="description" content="Four practices, one studio. Web & mobile products, business systems, AI & automation, experience & strategy — delivered with fixed scope and weekly demos." />
      </Helmet>

      {/* HERO */}
      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-6">§ Services</div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] max-w-4xl">
          Four practices.<br />
          <span className="brand-gradient-text">One studio you can trust.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[#6B7280] leading-relaxed">
          We don't do everything. We go deep in four areas that compound — so your product gets a specialist, not a staffing agency.
        </p>
      </section>

      {/* SERVICES GRID */}
      <section className="max-w-[1280px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 gap-5">
          {services.map((s, i) => (
            <div key={s.name} className="bg-white rounded-2xl border border-[#EAE9E2] p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 hover:shadow-lg transition-shadow">
              <div className="lg:col-span-4">
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#8A7540]">0{i + 1} / 04</div>
                <div className="mt-4 w-12 h-12 rounded-xl bg-[#F0FDF9] border border-[#0F766E]/15 flex items-center justify-center">
                  <s.icon size={22} className="text-[#0F766E]" weight="duotone" />
                </div>
                <h2 className="font-heading text-2xl lg:text-3xl font-bold text-[#1F2937] mt-5">{s.name}</h2>
                <p className="text-[#0F766E] text-sm font-medium mt-2">{s.tagline}</p>
              </div>
              <div className="lg:col-span-8">
                <p className="text-[#6B7280] text-base leading-relaxed">{s.description}</p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {s.outcomes.map((o) => (
                    <div key={o} className="flex gap-2 text-sm text-[#1F2937]">
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E] shrink-0 mt-0.5" />
                      {o}
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-[#EAE9E2]">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#8A7540] mb-2">Best for</div>
                  <p className="text-sm text-[#1F2937]">{s.bestFor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STACK */}
      <section className="bg-white border-y border-[#EAE9E2]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-28">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ Our stack</div>
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight max-w-3xl leading-[1.1]">
            Modern. Boring where it matters.
          </h2>
          <p className="mt-5 max-w-2xl text-[#6B7280]">
            We pick the tools your team can own after we leave — not the hottest thing on a conference stage.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {stack.map((s) => (
              <div key={s.label} className="bg-[#FAF8F4] rounded-2xl border border-[#EAE9E2] p-6">
                <s.icon size={22} weight="duotone" className="text-[#0F766E]" />
                <div className="font-heading text-lg font-bold mt-4">{s.label}</div>
                <ul className="mt-3 space-y-1.5 text-sm text-[#6B7280]">
                  {s.items.map((i) => <li key={i} className="font-mono text-xs">· {i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#14532D] text-white">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
            Not sure which service fits?
          </h2>
          <div>
            <p className="text-white/70 text-lg">
              Book a 30-minute discovery call. We'll scope the right path forward — or tell you honestly if we're not the right fit.
            </p>
            <Link to="/contact" data-testid="services-cta" className="inline-block mt-8">
              <Button className="bg-[#C8A97E] text-[#14532D] hover:bg-white rounded-xl h-12 px-6 text-sm font-semibold">
                Book Discovery Call <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

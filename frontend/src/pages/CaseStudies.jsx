import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import StudioNav from "@/components/StudioNav";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";

const studies = [
  {
    slug: "bfsi-agent-assist",
    industry: "BFSI · Contact Center",
    size: "500 agents · 5 campaigns",
    title: "Real-Time Agent Assist for a BFSI Contact Center",
    problem: "A 500-agent BFSI operation was losing margin to inconsistent agent behavior, compliance misses, and 9-minute average handle time. Supervisors were drowning in random call sampling.",
    approach: "We shipped a real-time agent assist platform with live transcription, next-best-action suggestions grounded in product knowledge, and supervisor compliance scoring across 100% of calls (not samples).",
    deliverables: [
      "Live transcription and intent detection pipeline",
      "Agent copilot with retrieval-grounded suggestions",
      "100% call compliance scoring (CallMiner-style)",
      "Supervisor dashboards and alerting",
      "Role-based access, audit log, and SOC2-ready architecture",
    ],
    outcomes: [
      { k: "15–20%", v: "AHT reduction" },
      { k: "95%+", v: "Compliance score" },
      { k: "8–12%", v: "FCR improvement" },
      { k: "100%", v: "Calls scored (vs. 2% before)" },
    ],
    timeline: "14 weeks from kickoff to GA across 5 campaigns.",
  },
  {
    slug: "logistics-control-tower",
    industry: "Logistics · Mid-market fleet",
    size: "7 tools → 1 platform",
    title: "Shipping Technology Transformation",
    problem: "A mid-market fleet was running operations across 7 disconnected tools — a shipment tracker, a POD app, 3 spreadsheets, email for disputes, and a legacy TMS. Dispute resolution took days.",
    approach: "We consolidated the stack into a single operations control tower with carrier-agnostic shipment visibility, digital POD workflows, and dispute workflows that cut cycle time by an order of magnitude.",
    deliverables: [
      "Unified operations dashboard",
      "End-to-end shipment visibility (multi-carrier)",
      "Digital POD and exception workflows (driver mobile)",
      "Dispute & claims management",
      "KPI dashboards for ops leadership",
    ],
    outcomes: [
      { k: "40%", v: "Fewer back-office hours" },
      { k: "3 → 1", v: "Vendor consolidation" },
      { k: "Days → Hrs", v: "Dispute resolution" },
      { k: "6 weeks", v: "To first production rollout" },
    ],
    timeline: "16 weeks to full migration · still in production.",
  },
];

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1F2937]">
      <Helmet>
        <title>Case Studies — FlowPilot Studio</title>
        <meta name="description" content="Real projects, real outcomes. BFSI agent assist, logistics control tower, and more case studies from the FlowPilot studio." />
      </Helmet>
      <StudioNav />

      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-14 lg:pt-28 lg:pb-16">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-6">§ Case studies</div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] max-w-4xl">
          Real projects.<br />
          <span className="brand-gradient-text">Real outcomes.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[#6B7280] leading-relaxed">
          We ship software that moves a business metric. Here's a sampling of recent work — anonymized where required by NDA.
        </p>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 pb-20 space-y-10">
        {studies.map((c, idx) => (
          <article key={c.slug} className="bg-white rounded-2xl border border-[#EAE9E2] overflow-hidden" data-testid={`case-${c.slug}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 bg-[#14532D] text-white p-8 lg:p-10 relative overflow-hidden">
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#C8A97E]">Case #{String(idx + 1).padStart(2, "0")}</div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-white/60 mt-2">{c.industry}</div>
                <h2 className="font-heading text-2xl lg:text-3xl font-bold mt-5 leading-[1.15]">{c.title}</h2>
                <div className="font-mono text-xs text-white/60 mt-4">{c.size}</div>
                <div className="mt-10 grid grid-cols-2 gap-4">
                  {c.outcomes.map((m) => (
                    <div key={m.v} className="border-t border-white/15 pt-3">
                      <div className="font-heading text-2xl font-bold text-[#C8A97E]">{m.k}</div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-white/70 mt-1">{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-7 p-8 lg:p-10">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#8A7540] mb-2">The problem</div>
                <p className="text-[#1F2937] leading-relaxed">{c.problem}</p>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#8A7540] mt-7 mb-2">Our approach</div>
                <p className="text-[#1F2937] leading-relaxed">{c.approach}</p>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#8A7540] mt-7 mb-3">What we shipped</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {c.deliverables.map((d) => (
                    <li key={d} className="flex gap-2 text-sm text-[#1F2937]">
                      <CheckCircle size={16} weight="fill" className="text-[#0F766E] shrink-0 mt-0.5" />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 pt-6 border-t border-[#EAE9E2] font-mono text-xs text-[#6B7280]">
                  Timeline — {c.timeline}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="bg-white border-t border-[#EAE9E2]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-24 text-center">
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
            Want to be our next case study?
          </h2>
          <p className="mt-5 text-[#6B7280] max-w-2xl mx-auto text-lg">
            We're selective about who we work with. Tell us the problem — we'll tell you honestly if we can move the needle.
          </p>
          <Link to="/contact" data-testid="case-studies-cta" className="inline-block mt-10">
            <Button className="brand-gradient-bg text-white rounded-xl h-14 px-8 text-base font-semibold">
              Book Discovery Call <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

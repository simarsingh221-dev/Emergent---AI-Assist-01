import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import StudioNav from "@/components/StudioNav";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle, Lightning, ChartBar, Truck } from "@phosphor-icons/react";

const products = [
  {
    id: "flowpilot-ai",
    icon: Lightning,
    name: "FlowPilot AI",
    status: "GA",
    industry: "Contact Centers",
    pitch: "Real-time agent assist and conversation intelligence for 100+ agent operations.",
    description: "Live transcription, next-best-action, compliance scoring, and supervisor dashboards. Deployed in BFSI contact centers with measurable outcomes in weeks, not quarters.",
    metrics: [
      { k: "15–20%", v: "AHT reduction" },
      { k: "95%+", v: "Compliance score" },
      { k: "8–12%", v: "FCR improvement" },
    ],
    features: [
      "Live transcription & intent detection",
      "Agent copilot with knowledge grounding",
      "Supervisor compliance scorecards",
      "Explorer & categories (CallMiner-style)",
      "Role-based access and audit logs",
    ],
    href: "/app",
    hrefLabel: "Open product",
  },
  {
    id: "flowpilot-analytics",
    icon: ChartBar,
    name: "FlowPilot Analytics",
    status: "GA",
    industry: "Operations & RevOps",
    pitch: "Business intelligence layer over the systems you already run.",
    description: "Stop rebuilding ETLs. FlowPilot Analytics connects to your warehouse and operational systems and ships real-time dashboards with RBAC-safe sharing — in days, not quarters.",
    metrics: [
      { k: "0", v: "ETL rebuilds" },
      { k: "<2 wk", v: "To first dashboard" },
      { k: "RBAC", v: "Row & column level" },
    ],
    features: [
      "Live dashboards & scheduled reports",
      "Row-level security (RLS)",
      "Snowflake, Postgres, BigQuery connectors",
      "Alerts & threshold monitors",
      "Embeddable widgets",
    ],
    href: "/contact",
    hrefLabel: "Request access",
  },
  {
    id: "flowpilot-ship",
    icon: Truck,
    name: "FlowPilot Ship",
    status: "Private Beta",
    industry: "Logistics",
    pitch: "Shipment visibility and operations control tower for mid-market fleets.",
    description: "A single operations dashboard replacing 5+ disconnected tools. End-to-end shipment visibility, digital POD workflows, dispute resolution, and carrier-agnostic routing.",
    metrics: [
      { k: "40%", v: "Fewer back-office hours" },
      { k: "3 → 1", v: "Vendor consolidation" },
      { k: "Days → Hours", v: "Dispute resolution" },
    ],
    features: [
      "Multi-carrier shipment tracking",
      "Digital POD & exception workflows",
      "Dispute & claims management",
      "Driver & dispatcher mobile apps",
      "KPI dashboards for ops leadership",
    ],
    href: "/contact",
    hrefLabel: "Join private beta",
  },
];

function ProductCard({ p }) {
  return (
    <div id={p.id} className="bg-white rounded-2xl border border-[#EAE9E2] overflow-hidden" data-testid={`product-${p.id}`}>
      <div className="p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 brand-gradient-bg rounded-xl flex items-center justify-center">
              <p.icon size={18} weight="fill" className="text-white" />
            </div>
            <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded ${
              p.status === "GA" ? "bg-[#F0FDF9] text-[#0F766E] border border-[#0F766E]/20" : "bg-[#C8A97E] text-white"
            }`}>{p.status}</span>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-[#8A7540] mt-5">{p.industry}</div>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight text-[#1F2937] mt-2">{p.name}</h2>
          <p className="text-[#0F766E] text-sm font-medium mt-2">{p.pitch}</p>
          <p className="text-[#6B7280] mt-5 leading-relaxed">{p.description}</p>
          <Link to={p.href} className="inline-flex items-center gap-1 text-sm font-medium text-[#0F766E] mt-6 hover:gap-2 transition-all">
            {p.hrefLabel} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="lg:col-span-7">
          <div className="grid grid-cols-3 gap-3 bg-[#FAF8F4] rounded-xl border border-[#EAE9E2] p-5">
            {p.metrics.map((m) => (
              <div key={m.v}>
                <div className="font-heading text-xl lg:text-2xl font-bold text-[#0F766E]">{m.k}</div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-[#6B7280] mt-1">{m.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#8A7540] mb-3">Key capabilities</div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-[#1F2937]">
                  <CheckCircle size={16} weight="fill" className="text-[#0F766E] shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1F2937]">
      <Helmet>
        <title>Products — FlowPilot Studio</title>
        <meta name="description" content="Our own products — FlowPilot AI (agent assist), FlowPilot Analytics (BI layer), and FlowPilot Ship (logistics control tower). Built with the rigor we sell." />
      </Helmet>
      <StudioNav />

      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-14 lg:pt-28 lg:pb-16">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-6">§ Products</div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] max-w-4xl">
          Our own products.<br />
          <span className="brand-gradient-text">Built with the rigor we sell.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[#6B7280] leading-relaxed">
          We eat our own cooking. These are the products we've built, deployed, and operate in production.
        </p>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 pb-20 space-y-5">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </section>

      <section className="bg-[#14532D] text-white">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-24 text-center">
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
            Want something like this, custom for you?
          </h2>
          <p className="mt-5 text-white/70 max-w-2xl mx-auto">
            Our products are proof we can build real software. Many clients start with a custom build, then license our tech.
          </p>
          <Link to="/contact" data-testid="products-cta" className="inline-block mt-10">
            <Button className="bg-[#C8A97E] text-[#14532D] hover:bg-white rounded-xl h-14 px-8 text-base font-semibold">
              Book Discovery Call <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

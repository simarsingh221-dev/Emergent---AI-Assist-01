import { Buildings, Bank, Truck, GraduationCap, Factory, ShoppingCart } from "@phosphor-icons/react";

/**
 * LogoCloud — anonymized industry trust strip.
 * We don't fabricate client logos. We show the shape of the client base
 * (sector + size) with a note that attribution is NDA-gated.
 */
const anchors = [
  { icon: Bank, label: "BFSI contact center", meta: "500 agents" },
  { icon: Truck, label: "Freight forwarder", meta: "Mid-market fleet" },
  { icon: Buildings, label: "Enterprise SaaS", meta: "Series B" },
  { icon: Factory, label: "Manufacturing", meta: "Ops transformation" },
  { icon: ShoppingCart, label: "D2C commerce", meta: "Growth stage" },
  { icon: GraduationCap, label: "EdTech", meta: "Platform rebuild" },
];

export default function LogoCloud({ variant = "cream" }) {
  const bg = variant === "white" ? "bg-white" : "bg-[#FAF8F4]";
  return (
    <section className={`${bg} border-y border-[#EAE9E2]`} data-testid="logo-cloud">
      <div className="max-w-[1280px] mx-auto px-6 py-10 lg:py-12">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540]">
            § Trusted by teams in
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">
            Client names under NDA · Available on reference call
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {anchors.map((a) => (
            <div
              key={a.label}
              className="group bg-white rounded-xl border border-[#EAE9E2] p-4 hover:border-[#0F766E] transition-colors"
            >
              <a.icon size={20} weight="duotone" className="text-[#0F766E]" />
              <div className="font-heading text-sm font-semibold text-[#1F2937] mt-3">{a.label}</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#8A7540] mt-1">{a.meta}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

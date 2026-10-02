import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Sparkle, Compass, Rocket } from "@phosphor-icons/react";

const tiers = [
  {
    id: "discovery",
    icon: Compass,
    name: "Discovery Sprint",
    tagline: "Prove the business case before you commit.",
    startingAt: "$9,500",
    duration: "1–2 weeks",
    popular: false,
    includes: [
      "Stakeholder interviews & technical audit",
      "User journey + system architecture draft",
      "Written success metrics & risk register",
      "Fixed-scope SOW for the build phase",
      "Go / no-go recommendation",
    ],
    bestFor: "Teams who have an idea but not a signed scope. Credited against a Build engagement if you continue with us.",
    cta: "Start a sprint",
  },
  {
    id: "build",
    icon: Rocket,
    name: "Fixed-Scope Build",
    tagline: "A delivery date you can share with the board.",
    startingAt: "$45,000",
    duration: "6–16 weeks",
    popular: true,
    includes: [
      "Signed scope document & fixed delivery date",
      "Weekly working-software demos (Fridays)",
      "Shared Slack, repo, and burndown",
      "Automated tests, CI/CD, observability",
      "Launch plan + 4 weeks of warranty support",
    ],
    bestFor: "Founders rebuilding v2, series-A teams shipping a new product line, enterprise innovation groups launching greenfield.",
    cta: "Book a scoping call",
  },
  {
    id: "retainer",
    icon: Sparkle,
    name: "Studio Retainer",
    tagline: "A product team that moves at startup speed.",
    startingAt: "$18,000 / mo",
    duration: "Rolling, 3-month minimum",
    popular: false,
    includes: [
      "Dedicated squad (PM + design + engineering)",
      "Fortnightly roadmap reviews",
      "Agreed throughput (features / sprint)",
      "On-call escalation during business hours",
      "Priority on new product initiatives",
    ],
    bestFor: "Post-launch products that need an outside team to keep shipping without a 12-month full-time hire cycle.",
    cta: "Discuss a retainer",
  },
];

const faqs = [
  {
    q: "Why fixed-scope instead of time & materials?",
    a: "Open-ended engagements are how projects slip. We'd rather negotiate scope than negotiate a timeline — so you always know what you're getting and when.",
  },
  {
    q: "What's not included in these numbers?",
    a: "Third-party licenses (hosting, LLM API usage, SaaS tools), production hardening beyond our standard checklist, and ongoing SRE after warranty. We quote these transparently in the SOW.",
  },
  {
    q: "Do you take equity?",
    a: "Occasionally, as a partial offset for the Build tier — only when the problem genuinely excites the team and the business case is strong. Ask us.",
  },
  {
    q: "Can we start smaller?",
    a: "Yes. The Discovery Sprint is designed exactly for this. It's a $9.5k commitment to find out if we're the right partner before anyone signs a six-figure Build SOW.",
  },
];

export default function Pricing() {
  return (
    <>
      <Helmet>
        <title>Pricing — FlowPilot Studio</title>
        <meta
          name="description"
          content="Transparent, fixed-scope engagement pricing. Discovery Sprint, Fixed-Scope Build, Studio Retainer — all with weekly demos and signed SOWs."
        />
      </Helmet>

      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-14 lg:pt-28 lg:pb-16">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-6">§ Engagement pricing</div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] max-w-4xl">
          Transparent pricing.<br />
          <span className="brand-gradient-text">Fixed scope. Signed SOW.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[#6B7280] leading-relaxed">
          Three ways to work with us. All with weekly demos, shared repos, and a delivery date you can share with your board. No hourly billing games.
        </p>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {tiers.map((t) => (
            <div
              key={t.id}
              className={`relative bg-white rounded-2xl border p-8 flex flex-col ${
                t.popular ? "border-[#0F766E] shadow-xl lg:-translate-y-2" : "border-[#EAE9E2]"
              }`}
              data-testid={`pricing-tier-${t.id}`}
            >
              {t.popular && (
                <div className="absolute -top-3 left-8 bg-[#C8A97E] text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full">
                  Most engagements
                </div>
              )}
              <div className="w-11 h-11 rounded-xl bg-[#F0FDF9] border border-[#0F766E]/15 flex items-center justify-center">
                <t.icon size={20} weight="duotone" className="text-[#0F766E]" />
              </div>
              <div className="mt-5 font-heading text-2xl font-bold tracking-tight text-[#1F2937]">{t.name}</div>
              <p className="text-sm text-[#0F766E] font-medium mt-1">{t.tagline}</p>

              <div className="mt-6 pb-6 border-b border-[#EAE9E2]">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#8A7540]">Starting at</div>
                <div className="font-heading text-4xl font-bold text-[#1F2937] mt-1">{t.startingAt}</div>
                <div className="font-mono text-xs text-[#6B7280] mt-1">{t.duration}</div>
              </div>

              <ul className="mt-6 space-y-2.5 flex-1">
                {t.includes.map((i) => (
                  <li key={i} className="flex gap-2 text-sm text-[#1F2937]">
                    <CheckCircle size={16} weight="fill" className="text-[#0F766E] shrink-0 mt-0.5" />
                    {i}
                  </li>
                ))}
              </ul>

              <div className="mt-7 pt-6 border-t border-[#EAE9E2]">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#8A7540] mb-2">Best for</div>
                <p className="text-xs text-[#6B7280] leading-relaxed">{t.bestFor}</p>
              </div>

              <Link to="/contact" className="mt-6" data-testid={`pricing-cta-${t.id}`}>
                <Button
                  className={`w-full rounded-xl h-11 text-sm font-semibold ${
                    t.popular
                      ? "brand-gradient-bg text-white hover:opacity-90"
                      : "bg-white border border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white"
                  }`}
                >
                  {t.cta} <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-y border-[#EAE9E2]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-24">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ Common questions</div>
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight max-w-3xl leading-[1.1]">
            The answers founders ask us in call one.
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((f) => (
              <div key={f.q} className="bg-[#FAF8F4] rounded-2xl border border-[#EAE9E2] p-7">
                <div className="font-heading text-lg font-bold text-[#1F2937]">{f.q}</div>
                <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#14532D] text-white">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-24 text-center">
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
            Still comparing options?
          </h2>
          <p className="mt-5 text-white/70 max-w-2xl mx-auto text-lg">
            Book a 30-minute call. We'll help you figure out which tier fits — or tell you honestly if we're not the right studio for the problem.
          </p>
          <Link to="/contact" data-testid="pricing-cta-final" className="inline-block mt-10">
            <Button className="bg-[#C8A97E] text-[#14532D] hover:bg-white rounded-xl h-14 px-8 text-base font-semibold">
              Book Discovery Call <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

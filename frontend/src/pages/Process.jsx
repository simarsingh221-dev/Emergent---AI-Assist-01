import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, PaintBrush, Code, Rocket, CheckCircle, FileText, Users, ChatCircleText } from "@phosphor-icons/react";

const phases = [
  {
    icon: Lightbulb,
    k: "01",
    name: "Discovery",
    duration: "1–2 weeks",
    goal: "Define what success looks like before we touch a line of code.",
    activities: [
      "Stakeholder interviews & workshops",
      "Technical and operational audit",
      "User research (where it matters)",
      "Risk, dependency, and assumption mapping",
    ],
    deliverable: "A written problem statement, success metrics, and a go/no-go recommendation.",
  },
  {
    icon: PaintBrush,
    k: "02",
    name: "Design",
    duration: "2–3 weeks",
    goal: "Produce a clickable prototype and a fixed-scope document before any build begins.",
    activities: [
      "Information architecture & flows",
      "Clickable prototype (Figma / interactive)",
      "System and data architecture",
      "Scoped SOW with a delivery date",
    ],
    deliverable: "A fixed scope + fixed date you can share with your board.",
  },
  {
    icon: Code,
    k: "03",
    name: "Build",
    duration: "6–16 weeks",
    goal: "Ship working software every week. No black boxes.",
    activities: [
      "Weekly demos — every Friday",
      "Shared Slack, shared repo, shared burndown",
      "Automated tests, CI/CD, observability",
      "Scope changes handled via a formal change log",
    ],
    deliverable: "Production-grade software, shipped incrementally.",
  },
  {
    icon: Rocket,
    k: "04",
    name: "Launch & Operate",
    duration: "Ongoing or 4 weeks",
    goal: "Go-live confidently and hand over a system your team can own.",
    activities: [
      "Rollout plan with phased traffic",
      "Observability, alerting, runbooks",
      "Knowledge transfer and documentation",
      "SLAs, retainer, or clean handover — your call",
    ],
    deliverable: "A live system plus the knowledge to run it without us.",
  },
];

const rituals = [
  { icon: ChatCircleText, name: "Weekly demo", when: "Every Friday", what: "Working software in your hands, not slides." },
  { icon: FileText, name: "Scope log", when: "Updated live", what: "Every change is logged and signed. Nothing lives in a verbal agreement." },
  { icon: Users, name: "Shared standup", when: "Daily async", what: "Your team is embedded. No wall between client and vendor." },
];

export default function Process() {
  return (
    <>
      <Helmet>
        <title>Our Process — FlowPilot Studio</title>
        <meta name="description" content="Discovery → Design → Build → Launch. Four phases, fixed scope, weekly demos. The way FlowPilot delivers software without surprises." />
      </Helmet>

      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-14 lg:pt-28 lg:pb-16">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-6">§ How we work</div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] max-w-4xl">
          Four phases.<br />
          <span className="brand-gradient-text">No surprises.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[#6B7280] leading-relaxed">
          Every project runs on the same operating system. It's boring, deliberate, and the reason our clients keep coming back.
        </p>
      </section>

      {/* Timeline */}
      <section className="max-w-[1280px] mx-auto px-6 pb-20">
        <div className="relative">
          <div className="hidden lg:block absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-[#0F766E] via-[#C8A97E] to-[#14532D]" aria-hidden />
          <div className="space-y-10">
            {phases.map((p, i) => (
              <motion.div
                key={p.k}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10"
              >
                <div className="lg:col-span-3 flex lg:block items-center gap-4">
                  <div className="relative w-20 h-20 brand-gradient-bg rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    <p.icon size={28} className="text-white" weight="duotone" />
                  </div>
                  <div className="lg:mt-5">
                    <div className="font-mono text-[11px] uppercase tracking-widest text-[#8A7540]">Phase {p.k}</div>
                    <div className="font-heading text-2xl font-bold text-[#1F2937] mt-1">{p.name}</div>
                    <div className="font-mono text-xs text-[#6B7280] mt-1">{p.duration}</div>
                  </div>
                </div>
                <div className="lg:col-span-9 bg-white rounded-2xl border border-[#EAE9E2] p-8">
                  <p className="text-lg text-[#1F2937] leading-relaxed font-medium">{p.goal}</p>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {p.activities.map((a) => (
                      <div key={a} className="flex gap-2 text-sm text-[#1F2937]">
                        <CheckCircle size={16} weight="fill" className="text-[#0F766E] shrink-0 mt-0.5" />
                        {a}
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 pt-6 border-t border-[#EAE9E2]">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#8A7540] mb-2">You walk away with</div>
                    <p className="text-sm text-[#1F2937]">{p.deliverable}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RITUALS */}
      <section className="bg-white border-y border-[#EAE9E2]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-24">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ Rituals that protect your project</div>
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight max-w-3xl leading-[1.1]">
            The practices behind "no surprises".
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {rituals.map((r) => (
              <div key={r.name} className="bg-[#FAF8F4] rounded-2xl border border-[#EAE9E2] p-6">
                <r.icon size={22} weight="duotone" className="text-[#0F766E]" />
                <div className="font-heading text-xl font-bold mt-4">{r.name}</div>
                <div className="font-mono text-xs text-[#8A7540] mt-1">{r.when}</div>
                <p className="text-sm text-[#6B7280] mt-3">{r.what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#14532D] text-white">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-24 text-center">
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
            Ready to run on this operating system?
          </h2>
          <Link to="/contact" data-testid="process-cta" className="inline-block mt-10">
            <Button className="bg-[#C8A97E] text-[#14532D] hover:bg-white rounded-xl h-14 px-8 text-base font-semibold">
              Book Discovery Call <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

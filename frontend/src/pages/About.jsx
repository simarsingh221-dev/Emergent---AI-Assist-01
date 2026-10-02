import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Handshake, ShieldCheck, Lightbulb, Globe, Code } from "@phosphor-icons/react";

const principles = [
  { icon: Target, t: "Scope is sacred", d: "If it's not in the scope document, we don't quietly build it. Every change gets logged, costed, and signed." },
  { icon: Handshake, t: "Clients own what we build", d: "Full source code, documentation, and handover. No vendor lock-in, no proprietary black boxes." },
  { icon: ShieldCheck, t: "No surprises culture", d: "Weekly demos, shared Slack, shared repo. If something is slipping, you hear about it the day it slips — not the week before launch." },
  { icon: Lightbulb, t: "We say no", d: "If a feature won't earn its cost, we'll push back. We'd rather lose a scope item than ship something we can't defend." },
  { icon: Globe, t: "Boring where it matters", d: "We pick the stack your team can own after we leave. No conference-stage toys in your production." },
  { icon: Code, t: "Code that outlives us", d: "Tests, docs, observability, CI/CD. We don't believe in \"temporary\" code." },
];

const facts = [
  { k: "4", v: "Core practices" },
  { k: "100%", v: "Code owned by clients" },
  { k: "Fri", v: "Demo day, every week" },
  { k: "0", v: "Hidden sub-contractors" },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About — FlowPilot Studio</title>
        <meta name="description" content="FlowPilot is a software engineering and product development studio. Fixed scope, weekly demos, long-term support. The way software should be built." />
      </Helmet>

      {/* HERO */}
      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-14 lg:pt-28 lg:pb-16">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-6">§ About FlowPilot</div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] max-w-4xl">
          A small studio of operators,<br />
          <span className="brand-gradient-text">designers, and engineers.</span>
        </h1>
        <p className="mt-8 max-w-3xl text-lg text-[#6B7280] leading-relaxed">
          FlowPilot was founded to answer a simple question: why do most software projects fail to ship on time, on scope, and on budget — even when the teams building them are talented? Our answer: because the operating system is broken, not the people. We fixed the operating system. Then we started building.
        </p>
      </section>

      {/* FACTS */}
      <section className="max-w-[1280px] mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white rounded-2xl border border-[#EAE9E2] p-6">
          {facts.map((f) => (
            <div key={f.v} className="p-4">
              <div className="font-heading text-3xl lg:text-4xl font-bold text-[#0F766E]">{f.k}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280] mt-2">{f.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section className="bg-white border-y border-[#EAE9E2]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ Our story</div>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight leading-[1.15]">
              From a <span className="brand-gradient-text">single product</span> to a studio.
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-5 text-[#1F2937] leading-relaxed">
            <p>FlowPilot started as a single AI product — real-time agent assist for contact centers. We shipped it, deployed it, operated it in BFSI production environments, and watched it move actual metrics for actual clients.</p>
            <p>Along the way, clients kept asking us to build other things. A logistics control tower. A reporting layer. A customer portal. Each one came with the same complaint: <em>"We've worked with 3 agencies on this. None of them finished."</em></p>
            <p>So we did what any good operator does: we systematized what we knew worked, and productized the service. FlowPilot is now a software engineering and product development studio — building custom products for companies that need more than off-the-shelf tools, and licensing our own products to companies that just need the result.</p>
            <p className="text-[#0F766E] font-medium">We're small on purpose. We take on 4–6 projects a quarter, max. That's what lets us honor the operating system.</p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section>
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-24">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ What we believe</div>
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight max-w-3xl leading-[1.1]">
            Six principles. Non-negotiable.
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {principles.map((p) => (
              <div key={p.t} className="bg-white rounded-2xl border border-[#EAE9E2] p-6">
                <p.icon size={22} weight="duotone" className="text-[#0F766E]" />
                <div className="font-heading text-lg font-bold text-[#1F2937] mt-4">{p.t}</div>
                <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#14532D] text-white">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
            Think we might be the right studio for your next build?
          </h2>
          <div>
            <p className="text-white/70 text-lg">
              We'll give you an honest answer in a 30-minute call. Even if it's "not us".
            </p>
            <Link to="/contact" data-testid="about-cta" className="inline-block mt-8">
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

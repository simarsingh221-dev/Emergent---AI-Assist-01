import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import BookingWidget from "@/components/BookingWidget";
import { toast } from "sonner";
import { ArrowRight, EnvelopeSimple, Buildings, Sparkle, Clock, Calendar } from "@phosphor-icons/react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Name, email and message are required");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      setDone(true);
      toast.success("Thanks — we'll be in touch shortly");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Book a Discovery Call — FlowPilot Studio</title>
        <meta name="description" content="Tell us what you're trying to build. We'll help you define the right path forward and respond within one business day." />
      </Helmet>

      {/* HERO */}
      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-10 lg:pt-28 lg:pb-14" data-testid="contact-page">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-6">§ Get in touch</div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] max-w-4xl">
          Tell us what you're<br />
          <span className="brand-gradient-text inline-block pb-1">trying to build.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[#6B7280] leading-relaxed">
          Whether you have a detailed spec or just an idea, we'll help you define the right path forward. We respond within one business day.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
          <Stat icon={Clock} k="< 1 day" v="Response time" />
          <Stat icon={Calendar} k="30 min" v="Discovery call" />
          <Stat icon={Sparkle} k="Free" v="No obligation" />
        </div>
      </section>

      {/* BOOKING WIDGET */}
      <section className="max-w-[1280px] mx-auto px-6 pb-10">
        <BookingWidget />
      </section>

      {/* FORM + CONTACT INFO */}
      <section id="form" className="max-w-[1280px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: context panel */}
          <div className="bg-[#14532D] text-white rounded-2xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-70" style={{ background: "radial-gradient(600px 320px at 0% 100%, rgba(15,118,110,0.4), transparent 60%), radial-gradient(400px 240px at 100% 0%, rgba(200,169,126,0.25), transparent 60%)" }} />
            <div className="relative z-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8A97E] mb-3">Or send a note</div>
              <h2 className="font-heading text-2xl lg:text-3xl font-bold tracking-tight leading-[1.15]">
                Prefer email over calendar? That works too.
              </h2>
              <p className="text-white/70 mt-5 leading-relaxed">
                Share what you're building. Team size, timelines, tech stack, pain points — whatever helps us scope the conversation.
              </p>
              <div className="mt-10 space-y-4 text-sm">
                <div className="flex items-center gap-3 text-white/80">
                  <EnvelopeSimple size={18} weight="duotone" className="text-[#C8A97E]" />
                  <a href="mailto:contactus@flowpilot.co.in" className="underline-offset-4 hover:underline">contactus@flowpilot.co.in</a>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Buildings size={18} weight="duotone" className="text-[#C8A97E]" />
                  <span>FlowPilot Studio</span>
                </div>
              </div>
              <div className="mt-14 pt-6 border-t border-white/15">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#C8A97E] mb-3">What happens next</div>
                <ol className="space-y-2 text-sm text-white/80 list-decimal list-inside">
                  <li>We read your note within one business day</li>
                  <li>If there's a fit, we propose a 30-min discovery call</li>
                  <li>We send a short, scoped proposal within 48 hours after</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-white rounded-2xl p-10 border border-[#EAE9E2]">
            {done ? (
              <div className="py-12 text-center" data-testid="contact-done">
                <div className="w-14 h-14 brand-gradient-bg rounded-xl mx-auto flex items-center justify-center">
                  <Sparkle size={24} weight="fill" className="text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold tracking-tight mt-5">Message received.</h3>
                <p className="text-[#6B7280] mt-3 max-w-sm mx-auto">
                  Thank you, <span className="font-semibold text-[#1F2937]">{form.name.split(" ")[0]}</span>. A FlowPilot specialist will reach out within one business day.
                </p>
                <Link to="/case-studies" className="inline-block mt-8">
                  <Button data-testid="contact-watch-demo" className="rounded-xl h-11 px-5 brand-gradient-bg text-white hover:opacity-90">
                    Browse case studies <ArrowRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} data-testid="contact-form">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A7540] mb-2">Contact us</div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight mb-6">Tell us about your project.</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="c-name" className="text-xs uppercase tracking-wider font-mono text-[#6B7280]">Full name *</Label>
                    <Input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                           className="rounded-lg border-[#EAE9E2] h-11 mt-1.5" data-testid="contact-name" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <Label htmlFor="c-email" className="text-xs uppercase tracking-wider font-mono text-[#6B7280]">Work email *</Label>
                    <Input id="c-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                           className="rounded-lg border-[#EAE9E2] h-11 mt-1.5" data-testid="contact-email" placeholder="jane@company.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="c-company" className="text-xs uppercase tracking-wider font-mono text-[#6B7280]">Company</Label>
                      <Input id="c-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                             className="rounded-lg border-[#EAE9E2] h-11 mt-1.5" data-testid="contact-company" placeholder="Acme Inc." />
                    </div>
                    <div>
                      <Label htmlFor="c-phone" className="text-xs uppercase tracking-wider font-mono text-[#6B7280]">Phone</Label>
                      <Input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                             className="rounded-lg border-[#EAE9E2] h-11 mt-1.5" data-testid="contact-phone" placeholder="+91 ..." />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="c-msg" className="text-xs uppercase tracking-wider font-mono text-[#6B7280]">Message *</Label>
                    <Textarea id="c-msg" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                              className="rounded-lg border-[#EAE9E2] min-h-[120px] mt-1.5" data-testid="contact-message"
                              placeholder="What are you trying to build? Team size, timeline, tech stack, pain points…" />
                  </div>
                  <Button type="submit" disabled={submitting} data-testid="contact-submit"
                          className="w-full rounded-xl h-11 brand-gradient-bg text-white hover:opacity-90 font-semibold">
                    {submitting ? "Sending…" : "Send message"}
                  </Button>
                </div>
                <p className="text-[11px] text-[#8A7540] mt-4">By submitting you agree to our <Link to="/privacy" className="underline">privacy policy</Link>.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ icon: Icon, k, v }) {
  return (
    <div className="bg-white border border-[#EAE9E2] rounded-xl p-4">
      <Icon size={18} weight="duotone" className="text-[#0F766E]" />
      <div className="font-heading text-xl font-bold mt-3">{k}</div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-[#6B7280] mt-1">{v}</div>
    </div>
  );
}

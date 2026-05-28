import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import FlowLogo from "@/components/FlowLogo";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { ArrowRight, EnvelopeSimple, Buildings, Phone, Sparkle } from "@phosphor-icons/react";

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
    <div className="min-h-screen bg-[#F4F4F5] text-[#0A0A0A] flex flex-col" data-testid="contact-page">
      <header className="border-b border-[#E5E5E5] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="contact-home">
            <FlowLogo size={26} />
            <span className="font-heading font-bold text-lg tracking-tight">FlowPilot</span>
          </Link>
          <Link to="/login" className="text-sm px-3 py-2 hover:bg-neutral-100" data-testid="contact-nav-login">Sign in</Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-[#E5E5E5] border border-[#E5E5E5]">
          <div className="bg-[#0B0B12] text-white p-10 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(700px 380px at 0% 100%, rgba(123,97,255,0.45), transparent 60%), radial-gradient(500px 300px at 100% 0%, rgba(255,79,216,0.35), transparent 60%), radial-gradient(450px 280px at 50% 50%, rgba(0,212,255,0.25), transparent 60%)" }} />
            <div className="relative z-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-3">Get in touch</div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">
                Let's talk about <span className="brand-gradient-text">your contact center.</span>
              </h1>
              <p className="text-neutral-300 mt-5 max-w-md">
                Tell us about your team, the CCaaS stack you run, and the agents you want to augment.
                We'll respond within one business day.
              </p>
              <div className="mt-10 space-y-4 text-sm">
                <div className="flex items-center gap-3 text-neutral-300">
                  <EnvelopeSimple size={16} className="text-[#7B61FF]" />
                  <span>Contactus@flowpilot.co.in</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-300">
                  <Buildings size={16} className="text-[#7B61FF]" />
                  <span>FlowPilot</span>
                </div>
              </div>
              <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
                <Stat k="80%" v="Less wrap-up" />
                <Stat k="50+" v="Live signals" />
                <Stat k="<800ms" v="Latency" />
              </div>
            </div>
          </div>

          <div className="bg-white p-10">
            {done ? (
              <div className="py-12 text-center" data-testid="contact-done">
                <div className="w-12 h-12 brand-gradient-bg mx-auto flex items-center justify-center">
                  <Sparkle size={22} weight="fill" className="text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold tracking-tight mt-4">Message received.</h3>
                <p className="text-[#525252] mt-2 max-w-sm mx-auto">
                  Thank you, <span className="font-semibold">{form.name.split(" ")[0]}</span>. A FlowPilot specialist will reach out within one business day.
                </p>
                <Link to="/demo" className="inline-block mt-8">
                  <Button data-testid="contact-watch-demo" className="rounded-none h-11 bg-black hover:brand-gradient-bg text-white">
                    Watch the 3-min demo <ArrowRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} data-testid="contact-form" className="max-w-md">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">Contact us</div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight mb-6">Tell us about your team.</h2>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="c-name" className="text-xs uppercase tracking-wider font-mono">Full name *</Label>
                    <Input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                           className="rounded-none border-black h-11 mt-1.5" data-testid="contact-name" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <Label htmlFor="c-email" className="text-xs uppercase tracking-wider font-mono">Work email *</Label>
                    <Input id="c-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                           className="rounded-none border-black h-11 mt-1.5" data-testid="contact-email" placeholder="jane@company.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="c-company" className="text-xs uppercase tracking-wider font-mono">Company</Label>
                      <Input id="c-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                             className="rounded-none border-black h-11 mt-1.5" data-testid="contact-company" placeholder="Acme Inc." />
                    </div>
                    <div>
                      <Label htmlFor="c-phone" className="text-xs uppercase tracking-wider font-mono">Phone</Label>
                      <Input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                             className="rounded-none border-black h-11 mt-1.5" data-testid="contact-phone" placeholder="+91 ..." />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="c-msg" className="text-xs uppercase tracking-wider font-mono">Message *</Label>
                    <Textarea id="c-msg" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                              className="rounded-none border-black min-h-[120px] mt-1.5" data-testid="contact-message"
                              placeholder="What are you trying to solve? Team size, CCaaS stack, current pain points…" />
                  </div>
                  <Button type="submit" disabled={submitting} data-testid="contact-submit"
                          className="w-full rounded-none h-11 brand-gradient-bg text-white hover:opacity-90">
                    {submitting ? "Sending…" : "Send message"}
                  </Button>
                </div>
                <p className="text-[11px] text-[#A3A3A3] mt-3">By submitting you agree to our <Link to="/privacy" className="underline">privacy policy</Link>.</p>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Stat({ k, v }) {
  return (
    <div className="border-l-2 brand-gradient-border pl-3">
      <div className="font-heading text-2xl font-bold">{k}</div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mt-1">{v}</div>
    </div>
  );
}

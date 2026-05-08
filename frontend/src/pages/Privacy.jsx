import { Link } from "react-router-dom";
import FlowLogo from "@/components/FlowLogo";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#0A0A0A] flex flex-col" data-testid="privacy-page">
      <header className="border-b border-[#E5E5E5] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FlowLogo size={26} />
            <span className="font-heading font-bold text-lg tracking-tight">FlowPilot</span>
          </Link>
          <Link to="/contact" className="text-sm px-3 py-2 hover:bg-neutral-100">Contact us</Link>
        </div>
      </header>
      <main className="flex-1 max-w-[900px] mx-auto px-6 py-16">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-3">§ Legal</div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tighter mb-3">Privacy policy</h1>
        <p className="font-mono text-xs text-[#525252] mb-12">Last updated: 5 February 2026</p>

        <div className="prose prose-neutral max-w-none space-y-6 text-[15px] leading-relaxed text-[#0A0A0A]">
          <Section title="1. Who we are">
            FlowPilot ("we", "us", "our") is a real-time agent assist platform operated from India. This policy explains how we
            collect, use and protect personal data when you use our website, contact form, and product.
          </Section>
          <Section title="2. Data we collect">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Account data</strong> — name, work email, role, password (hashed) when an admin onboards you.</li>
              <li><strong>Contact data</strong> — name, email, company, phone, and message when you submit the contact form.</li>
              <li><strong>Conversation data</strong> — call transcripts, summaries, and analytics generated during your use of the agent workspace. This is processed only to provide the service.</li>
              <li><strong>Usage data</strong> — anonymous logs (timestamp, route, status code) for security and reliability.</li>
            </ul>
          </Section>
          <Section title="3. How we use your data">
            <ul className="list-disc list-inside space-y-1">
              <li>Provide, maintain and improve the FlowPilot service.</li>
              <li>Generate AI assist features (LLM analysis, summarisation, knowledge retrieval).</li>
              <li>Respond to support and sales enquiries you submit.</li>
              <li>Comply with applicable law and regulatory obligations.</li>
            </ul>
          </Section>
          <Section title="4. Sub-processors">
            We rely on a small set of vetted sub-processors: <strong>OpenAI</strong> (LLM, speech-to-text, text-to-speech via the
            Emergent LLM gateway), <strong>MongoDB Atlas</strong> (managed database), and <strong>Emergent</strong> (deployment
            infrastructure). All sub-processors are bound by data-processing agreements.
          </Section>
          <Section title="5. Data retention">
            We retain account and conversation data for the duration of your contract plus 90 days, unless you instruct us in
            writing to delete it sooner. Anonymous usage logs are retained for up to 12 months.
          </Section>
          <Section title="6. Your rights">
            Subject to applicable law (DPDP Act 2023, GDPR, etc.) you may request access, correction, deletion, or portability
            of your personal data by writing to <a className="underline" href="mailto:gursimar.singh@flowpilot.co.in">gursimar.singh@flowpilot.co.in</a>.
          </Section>
          <Section title="7. Security">
            FlowPilot uses TLS in transit, encrypted databases at rest, JWT-based session tokens, role-based access control,
            and least-privilege secrets management. We follow industry standards and continuously harden our infrastructure.
          </Section>
          <Section title="8. Children">
            FlowPilot is a B2B product and is not directed at individuals under 18.
          </Section>
          <Section title="9. Changes to this policy">
            We may update this policy from time to time. Material changes will be notified to your registered email at least
            14 days before they take effect.
          </Section>
          <Section title="10. Contact">
            Questions? Email <a className="underline" href="mailto:gursimar.singh@flowpilot.co.in">gursimar.singh@flowpilot.co.in</a>
            {" "}or use our <Link to="/contact" className="underline">contact form</Link>.
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-heading text-xl font-semibold tracking-tight mb-2">{title}</h2>
      <div className="text-[#262626]">{children}</div>
    </section>
  );
}

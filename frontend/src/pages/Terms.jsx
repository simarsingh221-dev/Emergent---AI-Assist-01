import { Link } from "react-router-dom";
import FlowLogo from "@/components/FlowLogo";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#0A0A0A] flex flex-col" data-testid="terms-page">
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
        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tighter mb-3">Terms of service</h1>
        <p className="font-mono text-xs text-[#525252] mb-12">Last updated: 5 February 2026</p>

        <div className="prose prose-neutral max-w-none space-y-6 text-[15px] leading-relaxed text-[#0A0A0A]">
          <Section title="1. Agreement">
            These Terms govern your access to and use of the FlowPilot platform and website. By using the service you agree
            to these Terms. If you are using FlowPilot on behalf of an organisation, you represent that you have authority
            to bind that organisation.
          </Section>
          <Section title="2. The service">
            FlowPilot provides real-time agent-assist software for contact centres. Features include live transcription,
            intent and sentiment detection, next-best-action suggestions, knowledge retrieval, and post-call summarisation.
          </Section>
          <Section title="3. Accounts">
            Accounts are provisioned by an authorised administrator. You are responsible for maintaining the confidentiality
            of your credentials and for all activity under your account. Notify us immediately if you suspect unauthorised access.
          </Section>
          <Section title="4. Acceptable use">
            <ul className="list-disc list-inside space-y-1">
              <li>You will not reverse-engineer, decompile, or attempt to derive source code of the service.</li>
              <li>You will not use the service to process unlawful, defamatory, or infringing content.</li>
              <li>You will obtain consent from end-customers as required by law before recording or processing their conversations.</li>
              <li>You will not attempt to abuse, overload, or circumvent rate limits or security controls.</li>
            </ul>
          </Section>
          <Section title="5. Customer data">
            You retain ownership of all data you submit to the service ("Customer Data"). You grant FlowPilot a limited
            licence to process Customer Data solely to operate and improve the service in accordance with our
            <Link to="/privacy" className="underline ml-1">privacy policy</Link>.
          </Section>
          <Section title="6. Fees and billing">
            Fees are set out in your order form or contract. Invoices are payable within 30 days of receipt. Late payment
            may attract interest at 1.5% per month or the maximum permitted by law, whichever is lower.
          </Section>
          <Section title="7. Service availability">
            FlowPilot targets 99.5% monthly uptime for production tenants, excluding scheduled maintenance and force-majeure
            events. Service credits, if applicable, are governed by the order form.
          </Section>
          <Section title="8. Confidentiality">
            Each party will protect the other's confidential information with at least the same care it uses to protect its
            own and will not disclose it except to personnel and sub-processors with a need to know.
          </Section>
          <Section title="9. Warranty disclaimer">
            FlowPilot is provided "as is". To the maximum extent permitted by law, we disclaim all warranties, express or
            implied, including merchantability, fitness for a particular purpose, and non-infringement.
          </Section>
          <Section title="10. Limitation of liability">
            Neither party will be liable for indirect, incidental, consequential, or punitive damages. FlowPilot's aggregate
            liability under these Terms will not exceed the fees paid by you in the 12 months preceding the claim.
          </Section>
          <Section title="11. Termination">
            Either party may terminate for material breach with 30 days' written notice if the breach is not cured. Upon
            termination, FlowPilot will retain Customer Data for 90 days for export, after which it will be deleted.
          </Section>
          <Section title="12. Governing law">
            These Terms are governed by the laws of India. Disputes will be resolved exclusively by the courts of
            New Delhi, India.
          </Section>
          <Section title="13. Contact">
            Email <a className="underline" href="mailto:gursimar.singh@flowpilot.co.in">gursimar.singh@flowpilot.co.in</a>
            {" "}for any questions about these Terms.
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

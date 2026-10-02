import { Link } from "react-router-dom";
import FlowLogo from "@/components/FlowLogo";

export default function Footer() {
  return (
    <footer className="border-t border-[#EAE9E2] bg-[#FCFBF8]" data-testid="site-footer">
      <div className="max-w-[1280px] mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-2" data-testid="footer-logo">
              <FlowLogo size={24} />
              <span className="font-heading font-bold text-lg">FlowPilot</span>
              <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 bg-[#EAE9E2] text-[#8A7540] rounded">Studio</span>
            </Link>
            <p className="text-sm text-[#525252] mt-4 max-w-sm leading-relaxed">
              A software engineering and product development studio. We design, build and launch custom software, SaaS, and AI products — on scope, on time.
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A7540] mb-3">Studio</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services" className="link-underline text-[#1F2937]" data-testid="footer-link-services">Services</Link></li>
              <li><Link to="/process" className="link-underline text-[#1F2937]" data-testid="footer-link-process">Process</Link></li>
              <li><Link to="/case-studies" className="link-underline text-[#1F2937]" data-testid="footer-link-cases">Case studies</Link></li>
              <li><Link to="/about" className="link-underline text-[#1F2937]" data-testid="footer-link-about">About</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A7540] mb-3">Products</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="link-underline text-[#1F2937]" data-testid="footer-link-products">All products</Link></li>
              <li><Link to="/products#flowpilot-ai" className="link-underline text-[#1F2937]">FlowPilot AI</Link></li>
              <li><Link to="/products#flowpilot-analytics" className="link-underline text-[#1F2937]">Analytics</Link></li>
              <li><Link to="/products#flowpilot-ship" className="link-underline text-[#1F2937]">Ship (beta)</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A7540] mb-3">Company</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/resources" className="link-underline text-[#1F2937]" data-testid="footer-link-resources">Resources</Link></li>
              <li><Link to="/blog" className="link-underline text-[#1F2937]" data-testid="footer-link-blog">Blog</Link></li>
              <li><Link to="/contact" className="link-underline text-[#1F2937]" data-testid="footer-link-contact">Contact</Link></li>
              <li><Link to="/login" className="link-underline text-[#1F2937]" data-testid="footer-link-login">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A7540] mb-3">Legal</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="link-underline text-[#1F2937]" data-testid="footer-link-privacy">Privacy</Link></li>
              <li><Link to="/terms" className="link-underline text-[#1F2937]" data-testid="footer-link-terms">Terms</Link></li>
              <li><a href="mailto:contactus@flowpilot.co.in" className="link-underline text-[#1F2937]">Email us</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#EAE9E2] pt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">© 2026 FlowPilot Studio · All rights reserved</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#8A7540]">Software that ships</div>
        </div>
      </div>
    </footer>
  );
}

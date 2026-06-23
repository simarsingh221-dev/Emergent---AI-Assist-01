import { Link } from "react-router-dom";
import FlowLogo from "@/components/FlowLogo";

export default function Footer() {
  return (
    <footer className="border-t border-[#E5E5E5] bg-[#FAFAFA]" data-testid="site-footer">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2" data-testid="footer-logo">
              <FlowLogo size={24} />
              <span className="font-heading font-bold text-lg">FlowPilot</span>
            </Link>
            <p className="text-sm text-[#525252] mt-3 max-w-sm">
              Real-time agent assist for modern contact centers. Sub-second insight, every conversation.
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-3">Product</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/demo" className="link-underline text-[#0A0A0A]" data-testid="footer-link-demo">Live demo</Link></li>
              <li><Link to="/blog" className="link-underline text-[#0A0A0A]" data-testid="footer-link-blog">Blog</Link></li>
              <li><Link to="/contact" className="link-underline text-[#0A0A0A]" data-testid="footer-link-contact">Contact us</Link></li>
              <li><Link to="/login" className="link-underline text-[#0A0A0A]" data-testid="footer-link-login">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-3">Legal</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="link-underline text-[#0A0A0A]" data-testid="footer-link-privacy">Privacy policy</Link></li>
              <li><Link to="/terms" className="link-underline text-[#0A0A0A]" data-testid="footer-link-terms">Terms of service</Link></li>
              <li><Link to="/contact" className="link-underline text-[#0A0A0A]" data-testid="footer-link-support">Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#E5E5E5] pt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">© 2026 FlowPilot · All rights reserved</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">Built for contact centers</div>
        </div>
      </div>
    </footer>
  );
}

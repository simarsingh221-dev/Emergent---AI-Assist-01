import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import FlowLogo from "@/components/FlowLogo";
import { Button } from "@/components/ui/button";
import { ArrowRight, List, X } from "@phosphor-icons/react";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/case-studies", label: "Case Studies" },
  { to: "/process", label: "Process" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/resources", label: "Resources" },
];

export default function StudioNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      data-testid="studio-nav"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FAF8F4]/85 backdrop-blur-lg border-b border-[#EAE9E2]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="studio-nav-logo">
          <FlowLogo size={26} />
          <span className="font-heading font-bold text-lg tracking-tight text-[#1F2937]">FlowPilot</span>
          <span className="hidden sm:inline-flex items-center text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 ml-1 bg-[#EAE9E2] text-[#8A7540] rounded">Studio</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-testid={`studio-nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              className={({ isActive }) =>
                `px-3 py-2 text-[13px] font-medium rounded-md transition-colors ${
                  isActive ? "text-[#0F766E]" : "text-[#1F2937] hover:text-[#0F766E]"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/contact" data-testid="studio-nav-book-call" className="hidden sm:block">
            <Button className="brand-gradient-bg text-white hover:opacity-90 rounded-xl h-10 px-5 text-[13px] font-medium">
              Book Discovery Call <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </Link>
          <button
            data-testid="studio-nav-menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-md text-[#1F2937] hover:bg-[#EAE9E2]"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-[#FAF8F4] border-t border-[#EAE9E2]" data-testid="studio-nav-mobile">
          <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-3 text-sm rounded-md ${
                    isActive ? "bg-white text-[#0F766E]" : "text-[#1F2937] hover:bg-white"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/contact" data-testid="studio-nav-mobile-cta" className="mt-2">
              <Button className="w-full brand-gradient-bg text-white rounded-xl h-11">
                Book Discovery Call <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

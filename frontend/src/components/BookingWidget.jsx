import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "@phosphor-icons/react";

/**
 * BookingWidget — Cal.com inline embed.
 * Uses REACT_APP_CAL_URL (e.g. "flowpilot/discovery-call").
 * If not configured, falls back to a graceful placeholder with a CTA to /contact.
 */
export default function BookingWidget() {
  const calUrl = process.env.REACT_APP_CAL_URL;

  useEffect(() => {
    if (!calUrl) return;
    // Lazy-load Cal.com embed script once
    if (window.Cal) return;
    const script = document.createElement("script");
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;
    script.onload = () => {
      if (window.Cal) {
        window.Cal("init", { origin: "https://app.cal.com" });
        window.Cal("inline", {
          elementOrSelector: "#cal-inline-widget",
          calLink: calUrl,
          layout: "month_view",
        });
        window.Cal("ui", {
          theme: "light",
          styles: { branding: { brandColor: "#0F766E" } },
          hideEventTypeDetails: false,
        });
      }
    };
    document.body.appendChild(script);
  }, [calUrl]);

  if (!calUrl) {
    return (
      <div
        className="bg-white border border-[#EAE9E2] rounded-2xl p-8 text-center"
        data-testid="booking-widget-placeholder"
      >
        <Calendar size={28} weight="duotone" className="text-[#0F766E] mx-auto" />
        <div className="font-heading text-xl font-bold text-[#1F2937] mt-4">Book a 30-min discovery call</div>
        <p className="text-sm text-[#6B7280] mt-2 max-w-md mx-auto">
          Scheduling will be enabled when the FlowPilot Cal.com link is configured. For now, send a quick note below and we'll propose times within one business day.
        </p>
        <Link to="/contact#form" className="inline-block mt-5">
          <Button className="brand-gradient-bg text-white rounded-xl h-11 px-5 text-sm font-semibold">
            Send a note instead <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      id="cal-inline-widget"
      className="bg-white border border-[#EAE9E2] rounded-2xl overflow-hidden min-h-[640px]"
      data-testid="booking-widget-cal"
    />
  );
}

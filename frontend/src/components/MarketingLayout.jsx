import { Outlet } from "react-router-dom";
import StudioNav from "@/components/StudioNav";
import Footer from "@/components/Footer";

export default function MarketingLayout() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1F2937] flex flex-col" data-testid="marketing-layout">
      <StudioNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

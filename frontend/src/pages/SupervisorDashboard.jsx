import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Warning, Broadcast, TrendUp, Users, ArrowRight } from "@phosphor-icons/react";

export default function SupervisorDashboard() {
  const [active, setActive] = useState([]);
  const [overview, setOverview] = useState(null);
  const nav = useNavigate();

  const load = async () => {
    const [a, o] = await Promise.all([api.get("/calls/active"), api.get("/analytics/overview")]);
    setActive(a.data);
    setOverview(o.data);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F4F5] p-8" data-testid="supervisor-dashboard">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">§ Supervisor</div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">Live call monitor.</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">Auto-refresh · 10s</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#E5E5E5] border border-[#E5E5E5] mb-8">
        <Stat icon={Broadcast} label="Active calls" value={overview?.active_calls ?? "—"} />
        <Stat icon={Users} label="Total calls" value={overview?.total_calls ?? "—"} />
        <Stat icon={TrendUp} label="High risk" value={overview?.escalation?.high ?? 0} danger />
        <Stat icon={Warning} label="Frustrated" value={overview?.sentiment?.frustrated ?? 0} danger />
      </div>

      <div className="bg-white border border-[#E5E5E5]">
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div>
            <div className="font-heading text-lg font-semibold">Active conversations</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-0.5">{active.length} on air</div>
          </div>
        </div>
        <div className="divide-y divide-[#E5E5E5]">
          {active.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-[#A3A3A3]" data-testid="no-active-calls">No live calls right now.</div>
          )}
          {active.map((c) => {
            const sent = c.analysis?.sentiment || "neutral";
            const risk = c.analysis?.escalation_risk || "low";
            return (
              <div key={c.id} data-testid={`active-call-${c.id}`}
                   className="px-6 py-4 flex items-center justify-between hover:bg-[#FAFAFA] cursor-pointer"
                   onClick={() => nav(`/app/workspace/${c.id}`)}>
                <div className="flex items-center gap-4 min-w-0">
                  <span className="live-dot" />
                  <div>
                    <div className="font-medium text-sm">{c.customer_name}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-0.5">
                      {c.channel} · {c.agent_name} · {new Date(c.started_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={sent} color={sent === "frustrated" || sent === "negative" ? "red" : sent === "positive" ? "green" : "neutral"} />
                  <Badge label={`risk: ${risk}`} color={risk === "high" ? "red" : risk === "medium" ? "amber" : "green"} />
                  <Button size="sm" variant="ghost" className="rounded-none h-8"><ArrowRight size={14} /></Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, danger }) {
  return (
    <div className="bg-white p-5">
      <div className="flex items-center justify-between mb-2">
        <Icon size={16} className={danger ? "text-red-600" : "text-[#525252]"} />
      </div>
      <div className={`font-heading text-3xl font-bold ${danger && value > 0 ? "text-red-600" : ""}`}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-1">{label}</div>
    </div>
  );
}

function Badge({ label, color }) {
  const map = {
    red: "bg-red-50 text-red-700 border-red-300",
    green: "bg-emerald-50 text-emerald-700 border-emerald-300",
    amber: "bg-amber-50 text-amber-700 border-amber-300",
    neutral: "bg-neutral-50 text-neutral-700 border-neutral-300"
  };
  return <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 border ${map[color]}`}>{label}</span>;
}

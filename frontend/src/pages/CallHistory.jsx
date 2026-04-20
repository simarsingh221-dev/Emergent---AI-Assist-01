import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowRight } from "@phosphor-icons/react";

export default function CallHistory() {
  const [calls, setCalls] = useState([]);
  const nav = useNavigate();
  useEffect(() => { api.get("/calls").then((r) => setCalls(r.data)); }, []);

  return (
    <div className="min-h-screen bg-[#F4F4F5] p-8" data-testid="history-page">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">§ Call history</div>
      <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-8">Conversations.</h1>
      <div className="bg-white border border-[#E5E5E5]">
        <div className="grid grid-cols-12 px-6 py-3 border-b border-[#E5E5E5] font-mono text-[10px] uppercase tracking-widest text-[#525252]">
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Channel</div>
          <div className="col-span-2">Workflow</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Started</div>
          <div className="col-span-1" />
        </div>
        <div className="divide-y divide-[#E5E5E5]">
          {calls.length === 0 && <div className="px-6 py-12 text-center text-sm text-[#A3A3A3]">No calls yet.</div>}
          {calls.map((c) => (
            <div key={c.id} data-testid={`call-row-${c.id}`}
                 onClick={() => nav(`/app/workspace/${c.id}`)}
                 className="grid grid-cols-12 px-6 py-3 text-sm hover:bg-[#FAFAFA] cursor-pointer items-center">
              <div className="col-span-3 font-medium">{c.customer_name}</div>
              <div className="col-span-2 font-mono text-xs uppercase">{c.channel}</div>
              <div className="col-span-2 font-mono text-xs uppercase">{c.workflow}</div>
              <div className="col-span-2">
                <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border ${
                  c.status === "active" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-neutral-50 border-neutral-300 text-neutral-700"
                }`}>{c.status}</span>
              </div>
              <div className="col-span-2 font-mono text-xs text-[#525252]">{new Date(c.started_at).toLocaleString()}</div>
              <div className="col-span-1 text-right"><ArrowRight size={14} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

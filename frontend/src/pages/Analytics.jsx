import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

export default function Analytics() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/analytics/overview").then((r) => setData(r.data)); }, []);

  const sentimentData = data ? Object.entries(data.sentiment).map(([k, v]) => ({ name: k, value: v })) : [];
  const channelData = data ? Object.entries(data.channels).map(([k, v]) => ({ name: k, value: v })) : [];

  return (
    <div className="min-h-screen bg-[#F4F4F5] p-8" data-testid="analytics-page">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">§ Analytics</div>
      <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-8">Post-call insights.</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#E5E5E5] border border-[#E5E5E5] mb-8">
        <Stat label="Total calls" value={data?.total_calls ?? "—"} />
        <Stat label="Active" value={data?.active_calls ?? "—"} />
        <Stat label="Completed" value={data?.completed_calls ?? "—"} />
        <Stat label="High escalation" value={data?.escalation?.high ?? 0} danger />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5E5E5] p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-4">Sentiment distribution</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={sentimentData}>
                <CartesianGrid strokeDasharray="1 3" stroke="#E5E5E5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <Tooltip cursor={{ fill: "#FAFAFA" }} />
                <Bar dataKey="value" fill="#0A0A0A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-[#E5E5E5] p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-4">Channel mix</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="1 3" stroke="#E5E5E5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <Tooltip cursor={{ fill: "#FAFAFA" }} />
                <Bar dataKey="value" fill="#7B61FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {["low", "medium", "high"].map((k) => (
          <div key={k} className="bg-white border border-[#E5E5E5] p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">Escalation · {k}</div>
            <div className={`font-heading text-4xl font-bold mt-3 ${k === "high" ? "text-red-600" : k === "medium" ? "text-amber-600" : "text-emerald-600"}`}>
              {data?.escalation?.[k] ?? 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, danger }) {
  return (
    <div className="bg-white p-5">
      <div className={`font-heading text-3xl font-bold ${danger && value > 0 ? "text-red-600" : ""}`}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-1">{label}</div>
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Medal, Headset, ArrowRight, ChartPieSlice, Tag } from "@phosphor-icons/react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

const SENTIMENT_COLORS = { positive: "#10B981", neutral: "#A3A3A3", negative: "#F59E0B", frustrated: "#EF4444" };
const ESC_COLORS = { low: "#10B981", medium: "#F59E0B", high: "#EF4444" };
const DAYS = [7, 30, 90];

export default function Scorecard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const isAgent = user?.role === "agent";
  const [days, setDays] = useState(30);
  const [agents, setAgents] = useState([]);
  const [selectedId, setSelectedId] = useState(isAgent ? user?.id : null);
  const [card, setCard] = useState(null);
  const [cats, setCats] = useState({});

  const loadAgents = useCallback(async () => {
    if (isAgent) return;
    const r = await api.get(`/scorecard/agents?days=${days}`);
    setAgents(r.data);
    if (!selectedId && r.data.length > 0) setSelectedId(r.data[0].agent_id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAgent, days]);
  useEffect(() => { loadAgents(); }, [loadAgents]);

  useEffect(() => { api.get("/categories").then((r) => setCats(Object.fromEntries(r.data.map((c) => [c.id, c])))).catch(() => {}); }, []);

  useEffect(() => {
    if (!selectedId) return;
    api.get(`/scorecard/agent/${selectedId}?days=${days}`).then((r) => setCard(r.data));
  }, [selectedId, days]);

  return (
    <div className="min-h-screen bg-[#F4F4F5]" data-testid="scorecard-page">
      <div className="border-b border-[#E5E5E5] bg-white px-8 py-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252]">§ Agent Scorecard</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight mt-1">
            {isAgent ? "Your performance." : "Agent performance · drill down."}
          </h1>
        </div>
        <div className="flex gap-1">
          {DAYS.map((d) => (
            <button key={d} onClick={() => setDays(d)} data-testid={`scorecard-days-${d}`}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest border ${days === d ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#0A0A0A] border-[#E5E5E5] hover:border-[#A3A3A3]"}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-[1px] bg-[#E5E5E5]">
        {/* Agent list (hidden for agent role) */}
        {!isAgent && (
          <aside className="bg-white p-4 overflow-y-auto scrollbar-thin max-h-[calc(100vh-130px)]">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Agents · sorted by volume</div>
            <div className="divide-y divide-[#E5E5E5]">
              {agents.length === 0 ? (
                <div className="text-xs text-[#A3A3A3] py-4 font-mono">No agent data in window</div>
              ) : agents.map((a) => (
                <button key={a.agent_id} onClick={() => setSelectedId(a.agent_id)}
                  data-testid={`scorecard-agent-${a.agent_id}`}
                  className={`w-full text-left px-2 py-2.5 ${selectedId === a.agent_id ? "bg-[#F3EFFF] border-l-2 border-l-[#7B61FF]" : "hover:bg-[#FAFAFA]"}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{a.agent_name}</div>
                    <div className="text-[10px] font-mono text-[#525252]">{a.total_calls} calls</div>
                  </div>
                  <div className="flex gap-3 mt-1 text-[10px] font-mono uppercase tracking-widest">
                    {a.negative_pct > 0 && <span className="text-amber-600">{a.negative_pct}% neg</span>}
                    {a.high_escalation_pct > 0 && <span className="text-red-600">{a.high_escalation_pct}% high-esc</span>}
                    {a.compliance_score !== null && <span className={a.compliance_score >= 80 ? "text-emerald-600" : "text-amber-600"}>QA {a.compliance_score}%</span>}
                  </div>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Scorecard detail */}
        <section className="bg-white p-6 lg:p-8" data-testid="scorecard-detail">
          {!card ? (
            <div className="text-sm text-[#525252] font-mono">Loading scorecard…</div>
          ) : card.total_calls === 0 ? (
            <div className="py-16 text-center">
              <Medal size={32} className="mx-auto text-[#A3A3A3]" />
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-3">No calls in this window</div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 brand-gradient-bg flex items-center justify-center">
                  <Headset size={22} weight="bold" className="text-white" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold tracking-tight">{card.agent.name}</h2>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">
                    {card.agent.role} · last {card.window_days}d
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-[1px] bg-[#E5E5E5] border border-[#E5E5E5] mb-6">
                <KPI label="Calls" value={card.total_calls} />
                <KPI label="Avg duration" value={formatDur(card.avg_duration_sec)} />
                <KPI label="QA compliance"
                  value={card.compliance_score !== null ? `${card.compliance_score}%` : "—"}
                  tone={card.compliance_score === null ? "" : card.compliance_score >= 80 ? "good" : "warn"} />
                <KPI label="High escalations"
                  value={card.escalation?.high || 0}
                  tone={(card.escalation?.high || 0) === 0 ? "good" : "bad"} />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ChartCard title="Sentiment distribution">
                  <PieDist data={card.sentiment} colors={SENTIMENT_COLORS} />
                </ChartCard>
                <ChartCard title="Escalation distribution">
                  <PieDist data={card.escalation} colors={ESC_COLORS} />
                </ChartCard>
              </div>

              {/* Top categories */}
              {card.top_categories?.length > 0 && (
                <ChartCard title="Top categories handled">
                  <div className="space-y-2">
                    {card.top_categories.map((tc) => {
                      const cat = cats[tc.id] || { name: tc.id, color: "#7B61FF" };
                      const pct = Math.round(tc.count / card.total_calls * 100);
                      return (
                        <div key={tc.id} className="flex items-center gap-3" data-testid={`scorecard-cat-${tc.id}`}>
                          <div className="w-2 h-2 shrink-0" style={{ background: cat.color }} />
                          <div className="text-sm font-medium w-40 truncate">{cat.name}</div>
                          <div className="flex-1 bg-[#F4F4F5] h-2 relative">
                            <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: cat.color }} />
                          </div>
                          <div className="text-xs font-mono text-[#525252] w-20 text-right">{tc.count} · {pct}%</div>
                        </div>
                      );
                    })}
                  </div>
                </ChartCard>
              )}

              <div className="mt-6">
                <button onClick={() => nav("/app/explorer")}
                  data-testid="scorecard-drill" className="text-sm text-[#7B61FF] font-mono uppercase tracking-widest hover:underline inline-flex items-center gap-1">
                  Drill down to this agent's calls <ArrowRight size={14} />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function KPI({ label, value, tone }) {
  const cls = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "bad" ? "text-red-600" : "";
  return (
    <div className="bg-white p-4">
      <div className={`font-heading text-2xl font-bold ${cls}`}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-1">{label}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-[#E5E5E5] p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-3">{title}</div>
      {children}
    </div>
  );
}

function PieDist({ data, colors }) {
  const arr = Object.entries(data).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k, value: v, color: colors[k] }));
  if (!arr.length) return <div className="text-xs text-[#A3A3A3] font-mono">No data</div>;
  return (
    <div className="h-48">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={arr} dataKey="value" nameKey="name" innerRadius={32} outerRadius={64} paddingAngle={2}>
            {arr.map((e) => <Cell key={e.name} fill={e.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-1 -mt-4 text-[11px] font-mono">
        {arr.map((e) => (
          <div key={e.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2" style={{ background: e.color }} />
            <span className="uppercase tracking-widest text-[#525252]">{e.name}</span>
            <span className="ml-auto font-semibold text-[#0A0A0A]">{e.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDur(s) { if (!s) return "—"; const m = Math.floor(s / 60); const r = s % 60; return `${m}m ${r}s`; }

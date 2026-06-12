import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import { TrendUp, TrendDown, WarningCircle, ChatCircleDots } from "@phosphor-icons/react";

const DAY_WINDOWS = [7, 14, 30, 60, 90];

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [days, setDays] = useState(14);

  useEffect(() => { api.get("/analytics/overview").then((r) => setOverview(r.data)); }, []);
  useEffect(() => { api.get(`/analytics/trends?days=${days}`).then((r) => setTrends(r.data)); }, [days]);

  return (
    <div className="min-h-screen bg-[#F4F4F5]" data-testid="analytics-page">
      <div className="border-b border-[#E5E5E5] bg-white px-8 py-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252]">§ Conversation Trends</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight mt-1">
            What&apos;s happening across every call.
          </h1>
        </div>
        <div className="flex gap-1">
          {DAY_WINDOWS.map((d) => (
            <button key={d} onClick={() => setDays(d)} data-testid={`trends-days-${d}`}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest border ${days === d ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#0A0A0A] border-[#E5E5E5] hover:border-[#A3A3A3]"}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#E5E5E5] border border-[#E5E5E5] mb-6">
          <KPI label="Total calls" value={overview?.total_calls ?? "—"} />
          <KPI label="Active now" value={overview?.active_calls ?? "—"} accent="purple" />
          <KPI label="Completed" value={overview?.completed_calls ?? "—"} />
          <KPI label="High escalation"
            value={overview?.escalation?.high ?? 0}
            tone={(overview?.escalation?.high ?? 0) > 0 ? "bad" : "good"} />
        </div>

        {/* Sentiment trend (big) */}
        <ChartCard title="Sentiment over time" subtitle={`Last ${days} days · daily breakdown`}>
          <div className="h-72">
            {!trends ? <Loading /> : (
              <ResponsiveContainer>
                <AreaChart data={trends.sentiment_trend}>
                  <CartesianGrid strokeDasharray="1 3" stroke="#E5E5E5" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={fmtDay} />
                  <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
                  <Tooltip cursor={{ fill: "#FAFAFA" }} contentStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono", textTransform: "uppercase", letterSpacing: "0.1em" }} />
                  <Area type="monotone" dataKey="positive" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="neutral" stackId="1" stroke="#A3A3A3" fill="#A3A3A3" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="negative" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="frustrated" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.7} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Escalation risk trend */}
          <ChartCard title="Escalation risk trend" subtitle="Stacked daily counts">
            <div className="h-64">
              {!trends ? <Loading /> : (
                <ResponsiveContainer>
                  <BarChart data={trends.sentiment_trend}>
                    <CartesianGrid strokeDasharray="1 3" stroke="#E5E5E5" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={fmtDay} />
                    <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono", textTransform: "uppercase", letterSpacing: "0.1em" }} />
                    <Bar dataKey="low" stackId="esc" fill="#10B981" />
                    <Bar dataKey="medium" stackId="esc" fill="#F59E0B" />
                    <Bar dataKey="high" stackId="esc" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>

          {/* Daily volume */}
          <ChartCard title="Daily call volume" subtitle="All channels">
            <div className="h-64">
              {!trends ? <Loading /> : (
                <ResponsiveContainer>
                  <LineChart data={trends.sentiment_trend}>
                    <CartesianGrid strokeDasharray="1 3" stroke="#E5E5E5" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={fmtDay} />
                    <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="total" stroke="#7B61FF" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Category mix */}
          <ChartCard title="Category mix"
            subtitle={trends?.category_mix?.length ? `${trends.category_mix.length} tagged categories` : "—"}>
            {!trends ? <Loading /> : trends.category_mix.length === 0 ? (
              <EmptyState msg="No categories tagged yet · go to Categories → Re-tag history" />
            ) : (
              <div className="space-y-2">
                {trends.category_mix.slice(0, 8).map((c) => {
                  const pct = Math.round(c.count / Math.max(trends.total_calls, 1) * 100);
                  return (
                    <div key={c.id} className="flex items-center gap-3" data-testid={`trend-cat-${c.id}`}>
                      <div className="w-2 h-2 shrink-0" style={{ background: c.color }} />
                      <div className="text-sm font-medium w-40 truncate">{c.name}</div>
                      <div className="flex-1 bg-[#F4F4F5] h-2 relative">
                        <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: c.color }} />
                      </div>
                      <div className="text-xs font-mono text-[#525252] w-20 text-right">{c.count} · {pct}%</div>
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>

          {/* Top compliance misses */}
          <ChartCard title="Top compliance misses" subtitle="Items most often skipped">
            {!trends ? <Loading /> : trends.top_compliance_misses.length === 0 ? (
              <EmptyState msg="No compliance misses recorded ✓" />
            ) : (
              <div className="space-y-2">
                {trends.top_compliance_misses.map((m, i) => (
                  <div key={i} className="flex items-center gap-3" data-testid={`compl-miss-${i}`}>
                    <WarningCircle size={14} className="text-amber-600 shrink-0" />
                    <div className="text-sm flex-1 truncate">{m.item}</div>
                    <div className="text-xs font-mono text-[#525252]">{m.count}×</div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>

        {/* Channels strip */}
        <div className="mt-6 bg-white border border-[#E5E5E5] p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-3">Channel mix (all-time)</div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(overview?.channels || {}).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#7B61FF]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#525252]">{k}</span>
                <span className="font-heading text-lg font-bold">{v}</span>
              </div>
            ))}
            {Object.keys(overview?.channels || {}).length === 0 && (
              <div className="text-xs text-[#A3A3A3] font-mono">No data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, tone, accent }) {
  const cls = tone === "bad" ? "text-red-600" : tone === "good" ? "text-emerald-600" : accent === "purple" ? "text-[#7B61FF]" : "";
  return (
    <div className="bg-white p-5">
      <div className={`font-heading text-3xl font-bold ${cls}`}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-1">{label}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-[#E5E5E5] p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">{title}</div>
        {subtitle && <div className="font-mono text-[10px] text-[#A3A3A3]">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Loading() { return <div className="text-xs text-[#A3A3A3] font-mono py-12 text-center">Loading…</div>; }
function EmptyState({ msg }) { return <div className="text-xs text-[#A3A3A3] font-mono py-8 text-center">{msg}</div>; }
function fmtDay(d) { try { return new Date(d + "T00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch { return d; } }

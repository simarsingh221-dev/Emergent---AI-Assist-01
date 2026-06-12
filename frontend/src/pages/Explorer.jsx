import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  MagnifyingGlass, Funnel, X, ChatCircleDots, Headset, ClockCountdown,
  CaretDown, ArrowUpRight, WarningCircle, SmileyMeh, Smiley, SmileySad, Tag
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";

const SENTIMENT_LABEL = { positive: "Positive", neutral: "Neutral", negative: "Negative", frustrated: "Frustrated" };
const SENTIMENT_COLOR = { positive: "#10B981", neutral: "#6B7280", negative: "#F59E0B", frustrated: "#EF4444" };
const ESCALATION_LABEL = { low: "Low", medium: "Medium", high: "High" };
const CHANNELS = ["voice", "chat", "email"];
const DAY_OPTIONS = [
  { v: 1, label: "24h" }, { v: 7, label: "7d" }, { v: 30, label: "30d" },
  { v: 90, label: "90d" }, { v: 0, label: "All" }
];

export default function Explorer() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [days, setDays] = useState(30);
  const [sentiment, setSentiment] = useState([]);
  const [escalation, setEscalation] = useState([]);
  const [channels, setChannels] = useState([]);
  const [cats, setCats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [loading, setLoading] = useState(false);
  const [openCall, setOpenCall] = useState(null);
  const [callDetail, setCallDetail] = useState(null);
  const debounceRef = useRef(null);

  // Load categories once
  useEffect(() => { api.get("/categories").then((r) => setCats(r.data)).catch(() => {}); }, []);

  const filters = useMemo(() => ({
    q, days,
    sentiment: sentiment.length ? sentiment : null,
    escalation: escalation.length ? escalation : null,
    channels: channels.length ? channels : null,
    categories: categories.length ? categories : null,
    page, page_size: pageSize,
  }), [q, days, sentiment, escalation, channels, categories, page, pageSize]);

  const runSearch = async (override) => {
    setLoading(true);
    try {
      const r = await api.post("/explorer/search", override || filters);
      setResults(r.data.results);
      setTotal(r.data.total);
    } finally { setLoading(false); }
  };

  // Debounce on q change; immediate on filter changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(), 350);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => { runSearch(); /* eslint-disable-next-line */ }, [days, sentiment, escalation, channels, categories, page]);

  const toggle = (set, setter, v) => {
    setPage(1);
    setter(set.includes(v) ? set.filter((x) => x !== v) : [...set, v]);
  };

  const clearAll = () => {
    setQ(""); setDays(30); setSentiment([]); setEscalation([]); setChannels([]); setCategories([]); setPage(1);
  };

  const openDetail = async (id) => {
    setOpenCall(id);
    setCallDetail(null);
    try {
      const r = await api.get(`/explorer/call/${id}`);
      setCallDetail(r.data);
    } catch { setCallDetail({ error: true }); }
  };

  const catLookup = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c])), [cats]);
  const pages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="min-h-screen bg-[#F4F4F5]" data-testid="explorer-page">
      <div className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252]">§ Conversation Explorer</div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight mt-1">
          Search every conversation. <span className="text-[#7B61FF]">{total.toLocaleString()}</span> match{total === 1 ? "" : "es"}.
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-[1px] bg-[#E5E5E5] min-h-[calc(100vh-128px)]">
        {/* Filters rail */}
        <aside className="bg-white p-5 overflow-y-auto scrollbar-thin" data-testid="explorer-filters">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Funnel size={14} className="text-[#525252]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">Filters</span>
            </div>
            <button onClick={clearAll} className="text-[10px] font-mono uppercase tracking-widest text-[#7B61FF] hover:underline" data-testid="explorer-clear-filters">
              Clear all
            </button>
          </div>

          {/* Date window */}
          <FilterGroup title="Time window">
            <div className="grid grid-cols-5 gap-1">
              {DAY_OPTIONS.map((o) => (
                <button key={o.v} data-testid={`explorer-days-${o.v}`}
                  onClick={() => { setPage(1); setDays(o.v); }}
                  className={`text-xs py-1.5 border ${days === o.v ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#0A0A0A] border-[#E5E5E5] hover:border-[#A3A3A3]"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </FilterGroup>

          {/* Sentiment */}
          <FilterGroup title="Sentiment">
            <CheckList opts={Object.keys(SENTIMENT_LABEL)} values={sentiment}
              labelFn={(s) => SENTIMENT_LABEL[s]} colorFn={(s) => SENTIMENT_COLOR[s]}
              onToggle={(v) => toggle(sentiment, setSentiment, v)} testid="explorer-filter-sentiment" />
          </FilterGroup>

          {/* Escalation */}
          <FilterGroup title="Escalation risk">
            <CheckList opts={Object.keys(ESCALATION_LABEL)} values={escalation}
              labelFn={(s) => ESCALATION_LABEL[s]} onToggle={(v) => toggle(escalation, setEscalation, v)}
              testid="explorer-filter-escalation" />
          </FilterGroup>

          {/* Channel */}
          <FilterGroup title="Channel">
            <CheckList opts={CHANNELS} values={channels} labelFn={(s) => s} onToggle={(v) => toggle(channels, setChannels, v)}
              testid="explorer-filter-channel" />
          </FilterGroup>

          {/* Categories */}
          {cats.length > 0 && (
            <FilterGroup title="Categories">
              <div className="flex flex-wrap gap-1.5">
                {cats.map((c) => (
                  <button key={c.id} data-testid={`explorer-cat-${c.id}`}
                    onClick={() => toggle(categories, setCategories, c.id)}
                    className={`text-[11px] px-2 py-1 border transition-colors ${categories.includes(c.id) ? "text-white" : "bg-white text-[#262626] hover:border-[#A3A3A3]"}`}
                    style={{ borderColor: c.color, background: categories.includes(c.id) ? c.color : undefined }}>
                    {c.name}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}
        </aside>

        {/* Results */}
        <section className="bg-white">
          <div className="px-5 py-3 border-b border-[#E5E5E5] sticky top-0 bg-white z-10">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
              <Input value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }}
                placeholder='Try "refund", "manager", "OTP not received" — searches every transcript'
                className="pl-9 h-11 rounded-none border-black"
                data-testid="explorer-search" />
              {q && (
                <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#0A0A0A]">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-[#E5E5E5]" data-testid="explorer-results">
            {loading && results.length === 0 ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="p-5"><Skeleton className="h-4 w-2/3 mb-2" /><Skeleton className="h-3 w-full" /></div>
              ))
            ) : results.length === 0 ? (
              <div className="p-10 text-center text-[#525252]">
                <ChatCircleDots size={28} className="mx-auto text-[#A3A3A3]" />
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-3">No matches</div>
                <div className="text-sm mt-2">Try widening the time window or removing filters.</div>
              </div>
            ) : (
              results.map((c) => (
                <button key={c.id} onClick={() => openDetail(c.id)}
                  className="w-full text-left p-5 hover:bg-[#FAFAFA] block"
                  data-testid={`explorer-result-${c.id}`}>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <SentimentIcon s={c.sentiment} />
                    <span className="font-semibold text-sm">{c.customer_name || "Unknown caller"}</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#A3A3A3]">·</span>
                    <span className="text-xs text-[#525252] flex items-center gap-1"><Headset size={11} /> {c.agent_name || "—"}</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#A3A3A3]">·</span>
                    <span className="text-xs text-[#525252] flex items-center gap-1"><ClockCountdown size={11} /> {formatDuration(c.duration_sec)}</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#A3A3A3]">·</span>
                    <span className="text-xs text-[#525252]">{formatDate(c.started_at)}</span>
                    {c.escalation_risk === "high" && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-red-600">
                        <WarningCircle size={11} weight="fill" /> High escalation
                      </span>
                    )}
                  </div>
                  {c.intent && (
                    <div className="text-xs text-[#525252] mb-1">Intent: <span className="font-medium text-[#0A0A0A]">{c.intent}</span></div>
                  )}
                  {c.snippet && (
                    <div className="text-[13px] text-[#262626] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: highlight(c.snippet, q) }} />
                  )}
                  {!c.snippet && c.summary?.summary && (
                    <div className="text-[13px] text-[#525252] leading-relaxed truncate">{c.summary.summary}</div>
                  )}
                  {(c.categories || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.categories.map((cid) => {
                        const cat = catLookup[cid];
                        if (!cat) return null;
                        return (
                          <span key={cid} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wider"
                            style={{ background: cat.color + "22", color: cat.color }}>
                            <Tag size={10} /> {cat.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Pagination */}
          {total > pageSize && (
            <div className="px-5 py-3 border-t border-[#E5E5E5] flex items-center justify-between" data-testid="explorer-pagination">
              <div className="text-xs text-[#525252] font-mono">
                Page {page} of {pages} · {total.toLocaleString()} results
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-none">Prev</Button>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-none">Next</Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!openCall} onOpenChange={(o) => { if (!o) { setOpenCall(null); setCallDetail(null); } }}>
        <SheetContent side="right" className="w-full sm:max-w-[640px] rounded-none p-0" data-testid="explorer-detail">
          <SheetTitle className="sr-only">Call detail</SheetTitle>
          <SheetDescription className="sr-only">Full transcript and analysis for the selected call.</SheetDescription>
          <CallDetail call={callDetail} q={q} catLookup={catLookup} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="mb-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">{title}</div>
      {children}
    </div>
  );
}

function CheckList({ opts, values, labelFn, onToggle, colorFn, testid }) {
  return (
    <div className="space-y-1">
      {opts.map((o) => (
        <label key={o} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#FAFAFA] px-1 py-0.5" data-testid={`${testid}-${o}`}>
          <input type="checkbox" checked={values.includes(o)} onChange={() => onToggle(o)}
            className="rounded-none accent-[#7B61FF]" />
          {colorFn && <span className="w-2 h-2" style={{ background: colorFn(o) }} />}
          <span className="capitalize">{labelFn(o)}</span>
        </label>
      ))}
    </div>
  );
}

function SentimentIcon({ s }) {
  const Cls = "w-4 h-4 inline";
  if (s === "positive") return <Smiley size={16} weight="fill" className="text-emerald-500" />;
  if (s === "negative") return <SmileySad size={16} weight="fill" className="text-amber-500" />;
  if (s === "frustrated") return <SmileySad size={16} weight="fill" className="text-red-500" />;
  return <SmileyMeh size={16} className="text-neutral-400" />;
}

function CallDetail({ call, q, catLookup }) {
  if (!call) {
    return <div className="p-8 text-sm text-[#525252] font-mono">Loading call…</div>;
  }
  if (call.error) {
    return <div className="p-8 text-sm text-red-600">Failed to load call.</div>;
  }
  const a = call.analysis || {};
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-[#E5E5E5] px-6 py-5 bg-[#FAFAFA]">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">§ Call detail</div>
        <h2 className="font-heading text-xl font-bold tracking-tight mt-1">{call.customer_name || "Unknown caller"}</h2>
        <div className="text-xs text-[#525252] mt-1 flex flex-wrap gap-3">
          <span><Headset size={11} className="inline mr-1" /> {call.agent_name}</span>
          <span><ClockCountdown size={11} className="inline mr-1" /> {formatDate(call.started_at)}</span>
          {a.intent && <span>Intent: <span className="font-medium text-[#0A0A0A]">{a.intent}</span></span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {a.sentiment && <Pill label={`Sentiment · ${a.sentiment}`} color={SENTIMENT_COLOR[a.sentiment]} />}
          {a.escalation_risk && <Pill label={`Escalation · ${a.escalation_risk}`} color={a.escalation_risk === "high" ? "#EF4444" : a.escalation_risk === "medium" ? "#F59E0B" : "#10B981"} />}
          {(call.categories || []).map((cid) => catLookup[cid] && (
            <Pill key={cid} label={catLookup[cid].name} color={catLookup[cid].color} />
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
        {call.summary?.summary && (
          <DetailSection title="Summary">{call.summary.summary}</DetailSection>
        )}
        {a.next_best_actions?.length > 0 && (
          <DetailSection title="Next best actions">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {a.next_best_actions.map((x, i) => <li key={i}>{typeof x === "string" ? x : x.action}</li>)}
            </ul>
          </DetailSection>
        )}
        <DetailSection title="Transcript">
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
            {(call.transcript || []).map((t, i) => (
              <div key={i} className={`text-sm ${t.speaker === "agent" ? "" : "pl-4 border-l-2 border-[#7B61FF]"}`}>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#A3A3A3] mr-2">
                  {t.speaker === "agent" ? "Agent" : "Customer"}
                </span>
                <span dangerouslySetInnerHTML={{ __html: highlight(t.text, q) }} />
              </div>
            ))}
          </div>
        </DetailSection>
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">{title}</div>
      <div className="text-sm text-[#0A0A0A] leading-relaxed">{children}</div>
    </div>
  );
}

function Pill({ label, color }) {
  return (
    <span className="text-[11px] px-2 py-0.5 font-mono uppercase tracking-wider"
      style={{ background: color + "22", color }}>{label}</span>
  );
}

function formatDuration(s) { if (!s) return "—"; const m = Math.floor(s / 60); const r = s % 60; return `${m}m ${r}s`; }
function formatDate(iso) { if (!iso) return "—"; try { return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); } catch { return iso; } }
function escapeHtml(s) { return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function highlight(text, q) {
  const safe = escapeHtml(text || "");
  if (!q?.trim()) return safe;
  const terms = q.trim().split(/\s+/).filter((t) => t.length > 1).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return safe;
  return safe.replace(new RegExp(`(${terms.join("|")})`, "gi"), '<mark style="background:#FFF38F;padding:0 2px">$1</mark>');
}

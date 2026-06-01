import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Sparkle, X, PaperPlaneRight, ArrowsClockwise, BookOpen, ChartLineUp,
  ChatCircleText, Lightbulb, ListChecks
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

const TAB_PROMPTS = {
  analytics: [
    { icon: ChartLineUp, label: "Show me my key metrics this week" },
    { icon: ChartLineUp, label: "Why did escalations increase?" },
    { icon: ChartLineUp, label: "Compare sentiment trends" },
  ],
  knowledge: [
    { icon: BookOpen, label: "What is the SOP for KYC verification?" },
    { icon: BookOpen, label: "Find the credit card retention policy" },
    { icon: BookOpen, label: "Show me the claims handling steps" },
  ],
  qa: [
    { icon: ListChecks, label: "Why did my QA score drop?" },
    { icon: ListChecks, label: "Which compliance items am I missing?" },
    { icon: ListChecks, label: "How can I improve my QA score?" },
  ],
  coaching: [
    { icon: Lightbulb, label: "How can I improve my empathy?" },
    { icon: Lightbulb, label: "Recommend training resources" },
    { icon: Lightbulb, label: "What's the best practice for de-escalation?" },
  ],
};

const TABS = [
  { id: "analytics", label: "Analytics", icon: ChartLineUp },
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "qa", label: "QA Insights", icon: ListChecks },
  { id: "coaching", label: "Coaching", icon: Lightbulb },
];

export default function CopilotPanel({ open, onOpenChange }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("analytics");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [followups, setFollowups] = useState([]);
  const sendingRef = useRef(false);  // inflight guard — prevents double-session bug on spam-click
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  const send = async (textOverride) => {
    const message = (textOverride ?? input).trim();
    if (!message || sendingRef.current) return;
    sendingRef.current = true;
    setInput("");
    setSending(true);
    const userMsg = { role: "user", content: message, ts: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    try {
      const r = await api.post("/copilot/chat", { message, session_id: sessionId });
      setSessionId(r.data.session_id);
      setMessages((m) => [...m, {
        role: "assistant",
        content: r.data.reply,
        intent: r.data.intent,
        model_used: r.data.model_used,
        sources: r.data.sources || [],
        ts: new Date().toISOString(),
      }]);
      setFollowups(r.data.suggested_followups || []);
    } catch (err) {
      setMessages((m) => [...m, {
        role: "assistant",
        content: "Sorry — Copilot is unavailable right now. Please try again in a moment.",
        ts: new Date().toISOString(),
        error: true,
      }]);
    } finally { setSending(false); sendingRef.current = false; }
  };

  const clearChat = async () => {
    if (sessionId) {
      try { await api.post(`/copilot/sessions/${sessionId}/clear`); } catch (e) { /* ignore */ }
    }
    setMessages([]); setFollowups([]); setSessionId(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] p-0 rounded-none border-l-2 border-l-[#7B61FF] bg-white"
        data-testid="copilot-panel"
      >
        <SheetTitle className="sr-only">FlowPilot Copilot</SheetTitle>
        <SheetDescription className="sr-only">Conversational operational intelligence scoped to your role and permissions.</SheetDescription>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E5E5E5] bg-[#0B0B12] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 brand-gradient-bg flex items-center justify-center">
                  <Sparkle size={16} weight="fill" className="text-white" />
                </div>
                <div>
                  <div className="font-heading font-bold text-base leading-tight">FlowPilot Copilot</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mt-0.5">
                    {user?.role} · operational intelligence
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={clearChat}
                        data-testid="copilot-clear"
                        className="h-8 w-8 p-0 rounded-none text-neutral-400 hover:text-white hover:bg-neutral-900">
                  <ArrowsClockwise size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}
                        data-testid="copilot-close"
                        className="h-8 w-8 p-0 rounded-none text-neutral-400 hover:text-white hover:bg-neutral-900">
                  <X size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs (only shown when no messages) */}
          {messages.length === 0 && (
            <div className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <div className="flex" data-testid="copilot-tabs">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    data-testid={`copilot-tab-${t.id}`}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
                      tab === t.id ? "border-[#7B61FF] text-[#5B3EE5] bg-white" : "border-transparent text-[#525252] hover:bg-white"
                    }`}
                  >
                    <t.icon size={12} />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-4" data-testid="copilot-messages">
            {messages.length === 0 ? (
              <div className="py-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">Start with</div>
                <div className="space-y-2">
                  {(TAB_PROMPTS[tab] || []).map((p) => (
                    <button
                      key={p.label}
                      onClick={() => send(p.label)}
                      className="w-full text-left px-3 py-2.5 border border-[#E5E5E5] hover:border-[#7B61FF] hover:bg-[#F3EFFF] transition-colors text-sm flex items-start gap-2.5"
                      data-testid={`copilot-prompt-${p.label.slice(0, 24).replace(/\W+/g, "-")}`}
                    >
                      <p.icon size={14} className="mt-0.5 text-[#7B61FF] shrink-0" />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 p-3 bg-[#F3EFFF] border-l-2 border-[#7B61FF]">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#5B3EE5] mb-1">How it works</div>
                  <div className="text-xs text-[#262626] leading-relaxed">
                    Copilot answers based on your <strong>{user?.role === "agent" ? "own data" : user?.role === "supervisor" ? "team" : "organization"}</strong> only.
                    Ask in plain English — follow-ups like "why?" or "show more" keep context automatically.
                  </div>
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={m.role === "user" ? "flex justify-end" : ""}>
                    {m.role === "user" ? (
                      <div className="max-w-[85%] bg-black text-white px-3 py-2 text-sm" data-testid="copilot-msg-user">
                        {m.content}
                      </div>
                    ) : (
                      <div className="max-w-[95%]" data-testid="copilot-msg-assistant">
                        <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-mono uppercase tracking-widest text-[#A3A3A3]">
                          <Sparkle size={10} weight="fill" className="text-[#7B61FF]" />
                          <span>Copilot</span>
                          {m.model_used && <span className="text-[#A3A3A3]">· {m.model_used}</span>}
                          {m.intent && <span className="text-[#7B61FF]">· {m.intent}</span>}
                        </div>
                        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${m.error ? "text-red-700" : "text-[#0A0A0A]"}`}>
                          {m.content}
                        </div>
                        {m.sources && m.sources.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="font-mono text-[9px] uppercase tracking-widest text-[#525252]">Sources</div>
                            {m.sources.map((s) => (
                              <div key={s.id || s.title} className="text-[11px] border-l-2 border-[#7B61FF] pl-2 text-[#525252]">
                                <span className="font-semibold text-[#0A0A0A]">{s.title}</span>
                                {s.category && <span className="font-mono"> · {s.category}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-[#525252] font-mono" data-testid="copilot-thinking">
                <Sparkle size={12} weight="fill" className="text-[#7B61FF] animate-pulse" />
                <span>Copilot is thinking…</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggested follow-ups */}
          {followups.length > 0 && messages.length > 0 && !sending && (
            <div className="px-5 py-2 border-t border-[#E5E5E5] bg-[#FAFAFA]" data-testid="copilot-followups">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#525252] mb-1.5">Suggested follow-ups</div>
              <div className="flex flex-wrap gap-1.5">
                {followups.map((q) => (
                  <button key={q} onClick={() => send(q)}
                    className="text-[11px] px-2 py-1 border border-[#E5E5E5] hover:border-[#7B61FF] hover:bg-white text-[#262626] transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-[#E5E5E5] p-3 bg-white">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Copilot…"
                disabled={sending}
                data-testid="copilot-input"
                className="rounded-none border-black h-10 text-sm"
              />
              <Button type="submit" disabled={sending || !input.trim()}
                      data-testid="copilot-send"
                      className="rounded-none h-10 px-3 brand-gradient-bg text-white hover:opacity-90">
                <PaperPlaneRight size={14} />
              </Button>
            </form>
            <div className="font-mono text-[9px] uppercase tracking-widest text-[#A3A3A3] mt-1.5">
              Scoped to your {user?.role} permissions · auto-routes to Flash or GPT-5.2 for cost
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

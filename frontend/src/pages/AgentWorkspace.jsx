import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Microphone, Stop, PaperPlaneRight, Sparkle, Brain, ShieldCheck, BookOpen, Lightning,
  ListChecks, ChatCircleText, Phone, FileText
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

const SENTIMENT_CLR = {
  positive: "text-emerald-700 bg-emerald-50 border-emerald-300",
  neutral: "text-neutral-700 bg-neutral-50 border-neutral-300",
  negative: "text-red-700 bg-red-50 border-red-300",
  frustrated: "text-red-800 bg-red-100 border-red-400"
};
const RISK_CLR = { low: "bg-emerald-500", medium: "bg-amber-500", high: "bg-red-500" };

export default function AgentWorkspace() {
  const { callId } = useParams();
  const nav = useNavigate();
  const [call, setCall] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState("general");
  const [channel, setChannel] = useState("voice");
  const [customerName, setCustomerName] = useState("Customer");
  const [agentInput, setAgentInput] = useState("");
  const [custInput, setCustInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const transcriptEnd = useRef(null);

  useEffect(() => {
    api.get("/workflows").then((r) => setWorkflows(r.data));
    if (callId) loadCall(callId);
  }, [callId]);

  useEffect(() => {
    transcriptEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [call?.transcript?.length]);

  const loadCall = async (id) => {
    try {
      const r = await api.get(`/calls/${id}`);
      setCall(r.data);
      setAnalysis(r.data.analysis);
      setSummary(r.data.summary);
      setSelectedWorkflow(r.data.workflow);
      setChannel(r.data.channel);
      setCustomerName(r.data.customer_name);
    } catch { /* ignore */ }
  };

  const startCall = async () => {
    try {
      const r = await api.post("/calls", { channel, customer_name: customerName, workflow: selectedWorkflow });
      setCall(r.data);
      setAnalysis(null);
      setSummary(null);
      nav(`/app/workspace/${r.data.id}`, { replace: true });
      toast.success("Call started");
    } catch (e) { toast.error("Could not start call"); }
  };

  const endCall = async () => {
    if (!call) return;
    setSummarizing(true);
    try {
      const r = await api.post(`/calls/${call.id}/summary`);
      setSummary(r.data);
      toast.success("Call summarized");
      setCall({ ...call, status: "completed" });
    } catch (e) {
      toast.error("Summary failed");
      await api.post(`/calls/${call.id}/end`);
      setCall({ ...call, status: "completed" });
    } finally { setSummarizing(false); }
  };

  const addUtterance = async (speaker, text) => {
    if (!call || !text.trim()) return;
    const r = await api.post(`/calls/${call.id}/utterance`, { speaker, text });
    setCall((c) => ({ ...c, transcript: [...(c?.transcript || []), r.data] }));
  };

  const analyze = useCallback(async () => {
    if (!call) return;
    setAnalyzing(true);
    try {
      const r = await api.post(`/calls/${call.id}/analyze`);
      setAnalysis(r.data);
    } catch (e) { toast.error("Analysis failed"); }
    finally { setAnalyzing(false); }
  }, [call]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const fd = new FormData();
        fd.append("file", blob, "audio.webm");
        fd.append("speaker", "customer");
        try {
          const r = await api.post(`/calls/${call.id}/audio`, fd, { headers: { "Content-Type": "multipart/form-data" } });
          if (r.data.utterance) {
            setCall((c) => ({ ...c, transcript: [...(c?.transcript || []), r.data.utterance] }));
            toast.success("Transcribed");
          }
        } catch (e) { toast.error("Transcription failed"); }
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch (e) { toast.error("Microphone access denied"); }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  if (!call) {
    return (
      <div className="min-h-screen p-10 bg-[#F4F4F5]" data-testid="workspace-start">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">§ Agent workspace</div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-8">Start a new conversation.</h1>
        <div className="max-w-xl bg-white border border-[#E5E5E5] p-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-mono text-[#525252]">Customer name</label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                   className="rounded-none border-black h-10 mt-1.5" data-testid="input-customer-name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider font-mono text-[#525252]">Channel</label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="rounded-none border-black h-10 mt-1.5" data-testid="select-channel"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-mono text-[#525252]">Workflow</label>
              <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                <SelectTrigger className="rounded-none border-black h-10 mt-1.5" data-testid="select-workflow"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {workflows.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={startCall} data-testid="btn-start-call"
                  className="w-full bg-black text-white hover:bg-[#7B61FF] rounded-none h-11">
            <Phone size={16} className="mr-2" /> Start call
          </Button>
        </div>
      </div>
    );
  }

  const workflow = workflows.find((w) => w.id === call.workflow) || workflows[0];
  const isActive = call.status === "active";

  return (
    <div className="h-screen flex flex-col bg-[#F4F4F5]" data-testid="agent-workspace">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E5E5E5] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isActive && <span className="live-dot" />}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">{call.channel} · {workflow?.name}</div>
            <div className="font-heading font-semibold text-base">{call.customer_name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={analyze} disabled={analyzing || call.transcript.length === 0}
                  data-testid="btn-analyze"
                  className="rounded-none h-9 bg-[#7B61FF] hover:bg-[#5F44E6] text-white">
            <Sparkle size={14} className="mr-1.5" />{analyzing ? "Analyzing…" : "AI Assist"}
          </Button>
          {isActive ? (
            <Button onClick={endCall} disabled={summarizing}
                    data-testid="btn-end-call"
                    variant="outline" className="rounded-none h-9 border-black hover:bg-black hover:text-white">
              <Stop size={14} className="mr-1.5" />{summarizing ? "Wrapping…" : "End & summarize"}
            </Button>
          ) : (
            <Badge className="rounded-none bg-neutral-900">COMPLETED</Badge>
          )}
        </div>
      </div>

      {/* 4-pane workspace */}
      <div className="flex-1 grid grid-cols-12 gap-[1px] bg-[#E5E5E5] overflow-hidden">
        {/* LEFT: Transcript */}
        <div className="col-span-12 lg:col-span-5 bg-white flex flex-col overflow-hidden">
          <PaneHeader icon={ChatCircleText} title="Live transcript" />
          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 marquee-fade" data-testid="transcript-panel">
            <AnimatePresence initial={false}>
              {(call.transcript || []).map((u, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 ${u.speaker === "agent" ? "bg-black text-white" : "bg-[#7B61FF] text-white"}`}>
                      {u.speaker}
                    </span>
                    <span className="font-mono text-[10px] text-[#A3A3A3]">{u.ts?.slice(11, 19)}</span>
                  </div>
                  <p className="text-sm text-[#0A0A0A] leading-relaxed">{u.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            {call.transcript.length === 0 && (
              <div className="text-sm text-[#A3A3A3] font-mono">Awaiting first utterance…</div>
            )}
            <div ref={transcriptEnd} />
          </div>
          {isActive && (
            <div className="border-t border-[#E5E5E5] p-3 space-y-2">
              <div className="flex gap-2">
                <Input value={custInput} onChange={(e) => setCustInput(e.target.value)}
                       placeholder="Customer says…"
                       onKeyDown={(e) => { if (e.key === "Enter") { addUtterance("customer", custInput); setCustInput(""); } }}
                       className="rounded-none border-[#E5E5E5] h-9 text-sm" data-testid="input-customer" />
                <Button onClick={() => { addUtterance("customer", custInput); setCustInput(""); }}
                        className="rounded-none h-9 bg-[#7B61FF] hover:bg-[#5F44E6]"
                        data-testid="btn-send-customer">
                  <PaperPlaneRight size={14} />
                </Button>
                <Button onClick={recording ? stopRecording : startRecording}
                        data-testid="btn-mic"
                        className={`rounded-none h-9 ${recording ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-neutral-800"}`}>
                  {recording ? <Stop size={14} /> : <Microphone size={14} />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input value={agentInput} onChange={(e) => setAgentInput(e.target.value)}
                       placeholder="Agent says…"
                       onKeyDown={(e) => { if (e.key === "Enter") { addUtterance("agent", agentInput); setAgentInput(""); } }}
                       className="rounded-none border-[#E5E5E5] h-9 text-sm" data-testid="input-agent" />
                <Button onClick={() => { addUtterance("agent", agentInput); setAgentInput(""); }}
                        className="rounded-none h-9 bg-black hover:bg-neutral-800"
                        data-testid="btn-send-agent">
                  <PaperPlaneRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* CENTER: AI Assist */}
        <div className="col-span-12 lg:col-span-4 bg-white flex flex-col overflow-hidden">
          <PaneHeader icon={Brain} title="AI Assist" />
          <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4" data-testid="ai-assist-panel">
            {summary ? <SummaryBlock summary={summary} /> : !analysis ? (
              <div className="text-sm text-[#525252]">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#A3A3A3] mb-2">Waiting</div>
                Click <span className="font-semibold">AI Assist</span> to analyze the conversation.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <MetricBox label="Intent" value={analysis.intent || "—"} />
                  <MetricBox label="Sentiment" value={analysis.sentiment || "—"}
                             accent={SENTIMENT_CLR[analysis.sentiment] || ""} />
                  <MetricBox label="Escalation" value={analysis.escalation_risk || "—"}
                             dot={RISK_CLR[analysis.escalation_risk]} />
                  <MetricBox label="Churn risk" value={analysis.churn_risk || "—"}
                             dot={RISK_CLR[analysis.churn_risk]} />
                </div>

                {analysis.suggested_response && (
                  <div className="border border-[#7B61FF] bg-[#F3EFFF] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightning size={14} weight="fill" className="text-[#7B61FF]" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#5B3EE5]">Suggested response</span>
                    </div>
                    <p className="text-sm text-[#0A0A0A] leading-relaxed">{analysis.suggested_response}</p>
                    <Button size="sm" onClick={() => addUtterance("agent", analysis.suggested_response)}
                            data-testid="btn-use-suggestion"
                            className="mt-3 h-7 text-xs rounded-none bg-[#7B61FF] hover:bg-[#5F44E6]">
                      Use response
                    </Button>
                  </div>
                )}

                {analysis.next_best_actions?.length > 0 && (
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Next best actions</div>
                    <div className="space-y-2">
                      {analysis.next_best_actions.map((nba, i) => (
                        <div key={i} className="border border-[#E5E5E5] p-3 hover:border-[#7B61FF]">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-sm font-medium">{nba.title}</div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#A3A3A3]">{nba.type}</span>
                          </div>
                          <div className="text-xs text-[#525252] mt-1">{nba.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Knowledge + Compliance + Workflow */}
        <div className="col-span-12 lg:col-span-3 bg-white flex flex-col overflow-hidden">
          <PaneHeader icon={ShieldCheck} title="Compliance & Knowledge" />
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5" data-testid="compliance-panel">
            {analysis?.compliance?.length > 0 && (
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Compliance checklist</div>
                <div className="space-y-1.5">
                  {analysis.compliance.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <div className={`w-3 h-3 mt-0.5 border ${c.status === "done" ? "bg-black border-black" : c.status === "missed" ? "bg-red-500 border-red-500" : "border-[#A3A3A3]"}`} />
                      <div className={c.status === "done" ? "line-through text-[#A3A3A3]" : c.status === "missed" ? "text-red-700" : ""}>
                        {c.item}
                        {c.note && <div className="text-[10px] text-[#A3A3A3] mt-0.5">{c.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis?.kb_result?.sources?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={12} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">Knowledge suggestions</span>
                </div>
                <div className="space-y-2">
                  {analysis.kb_result.sources.map((s, i) => (
                    <div key={i} className="border-l-2 border-[#7B61FF] pl-2.5">
                      <div className="text-xs font-semibold">{s.title}</div>
                      <div className="text-[11px] text-[#525252] mt-0.5">{s.category}</div>
                      <div className="text-[11px] text-[#525252] mt-1 line-clamp-3">{s.snippet}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {workflow && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks size={12} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">{workflow.name}</span>
                </div>
                <ol className="space-y-1.5">
                  {workflow.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="font-mono text-[10px] text-[#A3A3A3] min-w-[18px]">{String(i + 1).padStart(2, "0")}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {summary && (
              <div className="border-t border-[#E5E5E5] pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={12} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">Call tags</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(summary.tags || []).map((t, i) => (
                    <span key={i} className="text-[10px] font-mono bg-black text-white px-1.5 py-0.5">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaneHeader({ icon: Icon, title }) {
  return (
    <div className="px-5 py-3 border-b border-[#E5E5E5] flex items-center gap-2 bg-[#FAFAFA]">
      <Icon size={14} />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252]">{title}</span>
    </div>
  );
}

function MetricBox({ label, value, accent, dot }) {
  return (
    <div className={`border p-2.5 ${accent || "border-[#E5E5E5]"}`}>
      <div className="font-mono text-[9px] uppercase tracking-widest text-[#525252]">{label}</div>
      <div className="text-sm font-semibold mt-1 capitalize flex items-center gap-2">
        {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
        {value}
      </div>
    </div>
  );
}

function SummaryBlock({ summary }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#09090B] text-white p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Call summary</div>
        <p className="text-sm leading-relaxed">{summary.summary}</p>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Customer intent</div>
        <p className="text-sm">{summary.customer_intent}</p>
      </div>
      {summary.key_points?.length > 0 && (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Key points</div>
          <ul className="space-y-1">
            {summary.key_points.map((k, i) => <li key={i} className="text-sm flex gap-2"><span className="font-mono text-[#A3A3A3]">→</span>{k}</li>)}
          </ul>
        </div>
      )}
      {summary.next_steps?.length > 0 && (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Next steps</div>
          <ul className="space-y-1">
            {summary.next_steps.map((k, i) => <li key={i} className="text-sm flex gap-2"><span className="font-mono text-[#7B61FF]">□</span>{k}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

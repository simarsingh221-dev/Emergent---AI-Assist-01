import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { TIMELINE, NARRATIONS, VOICE } from "@/lib/demoScript";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FlowLogo from "@/components/FlowLogo";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play, Pause, ArrowsClockwise, X, Lightning, ShieldCheck, BookOpen, ListChecks,
  FileText, Brain, Warning, ChatCircleText, Sparkle, ArrowRight
} from "@phosphor-icons/react";

const SENTIMENT_TONE = {
  positive: "bg-emerald-50 border-emerald-300 text-emerald-700",
  neutral: "bg-neutral-50 border-neutral-300 text-neutral-700",
  negative: "bg-red-50 border-red-300 text-red-700",
  frustrated: "bg-red-100 border-red-400 text-red-800",
};
const RISK_DOT = { low: "bg-emerald-500", medium: "bg-amber-500", high: "bg-red-500" };

export default function Demo() {
  const nav = useNavigate();
  const [stage, setStage] = useState("loading"); // loading | ready | playing | paused | done
  const [progress, setProgress] = useState(0);
  const [beatIdx, setBeatIdx] = useState(-1);

  // Workspace state for the live demo
  const [scene, setScene] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [nbas, setNbas] = useState([]);
  const [suggested, setSuggested] = useState("");
  const [compliance, setCompliance] = useState([]);
  const [kb, setKb] = useState([]);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [supAlert, setSupAlert] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showCta, setShowCta] = useState(false);

  const audioCacheRef = useRef(new Map()); // narration text -> HTMLAudioElement
  const currentAudioRef = useRef(null);
  const cancelRef = useRef(false);
  const pausedRef = useRef(false);
  const resumeFnRef = useRef(null);

  // Reset all visual state
  const resetWorkspace = () => {
    setTranscript([]); setAnalysis(null); setNbas([]); setSuggested("");
    setCompliance([]); setKb([]); setWorkflowSteps([]); setSupAlert(null); setSummary(null);
  };

  // Prefetch all narrator audio in parallel (cached server-side, free on second play)
  useEffect(() => {
    let alive = true;
    (async () => {
      const map = audioCacheRef.current;
      const tasks = NARRATIONS.map(async (text) => {
        if (map.has(text)) return { ok: true };
        try {
          const r = await api.post("/demo/tts", { text, voice: VOICE });
          const audio = new Audio(`data:audio/mp3;base64,${r.data.audio_b64}`);
          audio.preload = "auto";
          map.set(text, audio);
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e };
        }
      });
      const results = await Promise.allSettled(tasks);
      const failures = results.filter((r) => r.status === "rejected" || (r.value && r.value.ok === false)).length;
      if (alive) {
        if (failures > 0 && map.size === 0) {
          toast.error("Could not load demo narration");
        }
        setStage("ready");
      }
    })();
    return () => { alive = false; };
  }, []);

  // Sleep that respects pause + cancel
  const sleep = (ms) =>
    new Promise((resolve) => {
      let elapsed = 0;
      const tick = () => {
        if (cancelRef.current) return resolve();
        if (pausedRef.current) {
          resumeFnRef.current = tick;
          return;
        }
        const slice = 100;
        elapsed += slice;
        if (elapsed >= ms) return resolve();
        setTimeout(tick, slice);
      };
      tick();
    });

  // Play an audio element fully (await ended) with pause/cancel support
  const playAudio = (audio) =>
    new Promise((resolve) => {
      currentAudioRef.current = audio;
      const cleanup = () => {
        audio.removeEventListener("ended", onEnd);
        audio.removeEventListener("error", onEnd);
        currentAudioRef.current = null;
      };
      const onEnd = () => { cleanup(); resolve(); };
      audio.addEventListener("ended", onEnd);
      audio.addEventListener("error", onEnd);
      audio.currentTime = 0;
      audio.play().catch(() => { cleanup(); resolve(); });
    });

  const applyVisual = (v) => {
    if (!v) return;
    switch (v.op) {
      case "intro":
        resetWorkspace();
        setScene(null);
        return;
      case "scene_open":
        resetWorkspace();
        setScene(v.scene);
        return;
      case "utterance":
        setTranscript((t) => [...t, { ...v.utterance, ts: new Date().toISOString() }]);
        return;
      case "analysis":
        setAnalysis(v.analysis);
        return;
      case "nba_show":
        setNbas((n) => [...n, v.nba]);
        return;
      case "suggested":
        setSuggested(v.text);
        return;
      case "compliance":
        setCompliance(v.items);
        return;
      case "kb":
        setKb(v.sources);
        return;
      case "workflow":
        setWorkflowSteps(v.steps);
        return;
      case "step_advance":
        setWorkflowSteps((steps) => steps.map((s, i) => {
          if (i < v.index + 1) return { ...s, status: "done" };
          if (i === v.index + 1) return { ...s, status: "active" };
          return s;
        }));
        return;
      case "supervisor_alert":
        setSupAlert(v.message);
        setTimeout(() => setSupAlert(null), 4500);
        return;
      case "summary":
        setSummary(v.summary);
        return;
      case "cta":
        setShowCta(true);
        return;
      default:
        return;
    }
  };

  const startPlayback = useCallback(async () => {
    cancelRef.current = false;
    pausedRef.current = false;
    setStage("playing");
    resetWorkspace();
    setShowCta(false);
    setBeatIdx(-1);

    for (let i = 0; i < TIMELINE.length; i++) {
      if (cancelRef.current) break;
      while (pausedRef.current) {
        await sleep(120);
        if (cancelRef.current) break;
      }
      if (cancelRef.current) break;

      setBeatIdx(i);
      setProgress(((i + 1) / TIMELINE.length) * 100);
      const beat = TIMELINE[i];

      if (beat.visual) applyVisual(beat.visual);

      if (beat.narrate) {
        const audio = audioCacheRef.current.get(beat.narrate);
        if (audio) {
          await playAudio(audio);
        }
      }

      if (beat.minMs) {
        await sleep(beat.minMs);
      }
    }
    if (!cancelRef.current) setStage("done");
  }, []);

  const stop = () => {
    cancelRef.current = true;
    if (currentAudioRef.current) {
      try { currentAudioRef.current.pause(); } catch { /* noop */ }
    }
    pausedRef.current = false;
  };

  const togglePause = () => {
    if (stage !== "playing") return;
    pausedRef.current = !pausedRef.current;
    if (pausedRef.current) {
      if (currentAudioRef.current) {
        try { currentAudioRef.current.pause(); } catch { /* noop */ }
      }
    } else {
      if (currentAudioRef.current) {
        try { currentAudioRef.current.play(); } catch { /* noop */ }
      }
      if (resumeFnRef.current) {
        const fn = resumeFnRef.current;
        resumeFnRef.current = null;
        fn();
      }
    }
  };

  const restart = () => {
    stop();
    setTimeout(() => startPlayback(), 200);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5]" data-testid="demo-page">
      {/* Top control bar */}
      <div className="bg-[#0B0B12] text-white border-b border-black sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="demo-home">
            <FlowLogo size={22} />
            <span className="font-heading font-bold tracking-tight">FlowPilot</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 ml-3">Live demo</span>
          </Link>
          <div className="flex items-center gap-2">
            {stage === "loading" && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Loading narration…</span>
            )}
            {stage === "ready" && (
              <Button onClick={startPlayback} data-testid="demo-play"
                      className="rounded-none h-9 brand-gradient-bg text-white hover:opacity-90">
                <Play size={14} weight="fill" className="mr-1.5" /> Play 3-min demo
              </Button>
            )}
            {stage === "playing" && (
              <>
                <Button onClick={togglePause} variant="outline" size="sm"
                        data-testid="demo-pause"
                        className="rounded-none h-9 border-neutral-700 bg-transparent text-white hover:bg-neutral-900">
                  {pausedRef.current ? <Play size={14} /> : <Pause size={14} />}
                </Button>
                <Button onClick={stop} variant="outline" size="sm"
                        data-testid="demo-stop"
                        className="rounded-none h-9 border-neutral-700 bg-transparent text-white hover:bg-neutral-900">
                  <X size={14} />
                </Button>
              </>
            )}
            {stage === "done" && (
              <Button onClick={restart} variant="outline" size="sm"
                      data-testid="demo-restart"
                      className="rounded-none h-9 border-neutral-700 bg-transparent text-white hover:bg-neutral-900">
                <ArrowsClockwise size={14} className="mr-1.5" /> Replay
              </Button>
            )}
          </div>
        </div>
        <div className="h-[3px] bg-neutral-900 relative">
          <div className="absolute inset-y-0 left-0 brand-gradient-bg transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Stage area */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {stage === "ready" && <ReadyScreen onPlay={startPlayback} />}
        {stage === "loading" && <LoadingScreen />}
        {(stage === "playing" || stage === "done") && !showCta && (
          <DemoStage
            scene={scene}
            transcript={transcript}
            analysis={analysis}
            nbas={nbas}
            suggested={suggested}
            compliance={compliance}
            kb={kb}
            workflowSteps={workflowSteps}
            supAlert={supAlert}
            summary={summary}
          />
        )}
        {showCta && <CTAScreen onSubmitted={() => toast.success("Thanks — we'll be in touch")} />}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="py-32 text-center">
      <FlowLogo size={48} />
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#525252] mt-6">Preparing voice narration…</p>
    </div>
  );
}

function ReadyScreen({ onPlay }) {
  return (
    <div className="py-20 text-center max-w-2xl mx-auto" data-testid="demo-ready">
      <div className="flex justify-center"><FlowLogo size={56} /></div>
      <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tighter mt-6">
        See FlowPilot in <span className="brand-gradient-text">real time.</span>
      </h1>
      <p className="text-[#525252] mt-4">A 3-minute narrated tour through three real conversations — credit card retention, KYC for a loan, and a frustrated insurance claim.</p>
      <Button onClick={onPlay} data-testid="demo-play-large"
              className="mt-8 h-12 px-7 rounded-none brand-gradient-bg text-white hover:opacity-90">
        <Play size={16} weight="fill" className="mr-2" /> Play demo
      </Button>
    </div>
  );
}

function DemoStage({ scene, transcript, analysis, nbas, suggested, compliance, kb, workflowSteps, supAlert, summary }) {
  if (!scene) {
    return (
      <div className="py-20 text-center" data-testid="demo-intro">
        <div className="flex justify-center"><FlowLogo size={64} /></div>
        <div className="brand-gradient-text font-heading font-bold tracking-tighter text-5xl sm:text-6xl mt-6">FlowPilot</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#525252] mt-3">Real-time agent assist</div>
      </div>
    );
  }
  return (
    <div className="space-y-3" data-testid="demo-stage">
      {/* Scene header */}
      <div className="flex items-center justify-between bg-white border border-[#E5E5E5] px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252]">Scene · {String(scene.number).padStart(2, "0")}</span>
          <span className="font-heading font-semibold">{scene.title}</span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">{scene.customer}</div>
      </div>

      {/* Supervisor toast */}
      <AnimatePresence>
        {supAlert && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            data-testid="demo-supervisor-alert"
            className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 flex items-center gap-2">
            <Warning size={16} weight="fill" className="text-red-600" />
            <span className="font-mono text-xs uppercase tracking-widest">{supAlert}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-pane stage */}
      <div className="grid grid-cols-12 gap-[1px] bg-[#E5E5E5] border border-[#E5E5E5] min-h-[540px]">
        {/* Transcript */}
        <div className="col-span-12 lg:col-span-5 bg-white flex flex-col">
          <PaneHeader icon={ChatCircleText} title="Live transcript" />
          <div className="flex-1 px-5 py-4 overflow-hidden marquee-fade" data-testid="demo-transcript">
            <AnimatePresence initial={false}>
              {transcript.map((u, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 ${u.speaker === "agent" ? "bg-black text-white" : "brand-gradient-bg text-white"}`}>
                      {u.speaker}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{u.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            {transcript.length === 0 && (
              <div className="text-sm text-[#A3A3A3] font-mono">Awaiting first utterance…</div>
            )}
          </div>
        </div>

        {/* AI Assist center */}
        <div className="col-span-12 lg:col-span-4 bg-white flex flex-col">
          <PaneHeader icon={Brain} title="AI Assist" />
          <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto scrollbar-thin" data-testid="demo-assist">
            {summary ? <SummaryBlock summary={summary} /> : (
              <>
                {analysis && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-2">
                    <Metric label="Intent" value={analysis.intent} />
                    <Metric label="Sentiment" value={analysis.sentiment} accent={SENTIMENT_TONE[analysis.sentiment]} />
                    <Metric label="Escalation" value={analysis.escalation_risk} dot={RISK_DOT[analysis.escalation_risk]} />
                    <Metric label="Churn risk" value={analysis.churn_risk} dot={RISK_DOT[analysis.churn_risk]} />
                  </motion.div>
                )}
                {suggested && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="border brand-gradient-border bg-[#F3EFFF] p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightning size={14} weight="fill" className="text-[#7B61FF]" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#5B3EE5]">Suggested response</span>
                    </div>
                    <p className="text-sm leading-relaxed">{suggested}</p>
                  </motion.div>
                )}
                {nbas.length > 0 && (
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Next best actions</div>
                    <div className="space-y-2">
                      <AnimatePresence initial={false}>
                        {nbas.map((nba, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                            className="border border-[#E5E5E5] p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-sm font-medium">{nba.title}</div>
                              <span className="font-mono text-[9px] uppercase tracking-wider text-[#A3A3A3]">{nba.type}</span>
                            </div>
                            <div className="text-xs text-[#525252] mt-1">{nba.reason}</div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
                {!analysis && !suggested && nbas.length === 0 && (
                  <div className="text-sm text-[#A3A3A3] font-mono">Listening…</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right rail */}
        <div className="col-span-12 lg:col-span-3 bg-white flex flex-col">
          <PaneHeader icon={ShieldCheck} title="Compliance · Knowledge · Workflow" />
          <div className="flex-1 px-4 py-4 space-y-5 overflow-y-auto scrollbar-thin" data-testid="demo-right">
            {compliance.length > 0 && (
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Compliance</div>
                <div className="space-y-1.5">
                  {compliance.map((c, i) => (
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
            {kb.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={12} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">Knowledge</span>
                </div>
                <div className="space-y-2">
                  {kb.map((s, i) => (
                    <div key={i} className="border-l-2 border-[#7B61FF] pl-2.5">
                      <div className="text-xs font-semibold">{s.title}</div>
                      <div className="text-[11px] text-[#525252] mt-0.5">{s.category}</div>
                      <div className="text-[11px] text-[#525252] mt-1 line-clamp-3">{s.snippet}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {workflowSteps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks size={12} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">Workflow</span>
                </div>
                <ol className="space-y-1.5">
                  {workflowSteps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className={`w-3 h-3 mt-0.5 border ${s.status === "done" ? "bg-black border-black" : s.status === "active" ? "border-[#7B61FF] bg-[#7B61FF]/30" : "border-[#A3A3A3]"}`} />
                      <span className={s.status === "done" ? "line-through text-[#A3A3A3]" : s.status === "active" ? "text-[#0A0A0A] font-medium" : "text-[#525252]"}>{s.label}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {summary && summary.tags && (
              <div className="border-t border-[#E5E5E5] pt-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {summary.tags.map((t, i) => (
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

function Metric({ label, value, accent, dot }) {
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
    <div className="space-y-3">
      <div className="bg-[#0B0B12] text-white p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Auto call summary</div>
        <p className="text-sm leading-relaxed">{summary.summary}</p>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-1">Customer intent</div>
        <p className="text-sm">{summary.customer_intent}</p>
      </div>
      {summary.key_points?.length > 0 && (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-1">Key points</div>
          <ul className="space-y-1">
            {summary.key_points.map((k, i) => <li key={i} className="text-sm flex gap-2"><span className="font-mono text-[#A3A3A3]">→</span>{k}</li>)}
          </ul>
        </div>
      )}
      {summary.next_steps?.length > 0 && (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-1">Next steps</div>
          <ul className="space-y-1">
            {summary.next_steps.map((k, i) => <li key={i} className="text-sm flex gap-2"><span className="font-mono text-[#7B61FF]">□</span>{k}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function CTAScreen({ onSubmitted }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/demo/lead", form);
      setDone(true);
      onSubmitted?.();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Submission failed");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-[#E5E5E5] border border-[#E5E5E5] my-6" data-testid="demo-cta">
      <div className="bg-[#0B0B12] text-white p-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{background: "radial-gradient(700px 380px at 0% 100%, rgba(123,97,255,0.45), transparent 60%), radial-gradient(500px 300px at 100% 0%, rgba(255,79,216,0.35), transparent 60%), radial-gradient(450px 280px at 50% 50%, rgba(0,212,255,0.25), transparent 60%)"}} />
        <div className="relative z-10">
          <FlowLogo size={28} />
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tighter mt-6">
            Ready to give your agents a <span className="brand-gradient-text">superpower?</span>
          </h2>
          <p className="text-neutral-300 mt-4 max-w-md">Plug FlowPilot into your existing CCaaS in under ten minutes. Free trial. No credit card. Cancel anytime.</p>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            <Stat k="80%" v="Less wrap-up" />
            <Stat k="50+" v="Live signals" />
            <Stat k="<800ms" v="Latency" />
          </div>
        </div>
      </div>
      <div className="bg-white p-10">
        {done ? (
          <div data-testid="demo-cta-done" className="py-12 text-center">
            <div className="w-12 h-12 brand-gradient-bg mx-auto flex items-center justify-center">
              <Sparkle size={22} weight="fill" className="text-white" />
            </div>
            <h3 className="font-heading text-2xl font-bold tracking-tight mt-4">You're on the list.</h3>
            <p className="text-[#525252] mt-2">A FlowPilot specialist will reach out within one business day.</p>
            <Link to="/register" className="inline-block mt-8">
              <Button data-testid="demo-cta-register"
                      className="rounded-none h-11 bg-black hover:brand-gradient-bg text-white">
                Or jump straight in <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="max-w-md" data-testid="demo-cta-form">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">§ Book a personalised demo</div>
            <h3 className="font-heading text-2xl font-bold tracking-tight mb-6">Talk to us.</h3>
            <div className="space-y-3">
              <Input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                     className="rounded-none border-black h-11" data-testid="demo-lead-name" />
              <Input required type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                     className="rounded-none border-black h-11" data-testid="demo-lead-email" />
              <Input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                     className="rounded-none border-black h-11" data-testid="demo-lead-company" />
              <Textarea placeholder="What are you trying to solve? (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="rounded-none border-black min-h-[88px]" data-testid="demo-lead-message" />
              <Button type="submit" disabled={submitting} data-testid="demo-lead-submit"
                      className="w-full rounded-none h-11 brand-gradient-bg text-white hover:opacity-90">
                {submitting ? "Submitting…" : "Book my demo"}
              </Button>
            </div>
            <p className="text-[11px] text-[#A3A3A3] mt-3">By submitting you agree to be contacted by FlowPilot.</p>
          </form>
        )}
      </div>
    </div>
  );
}

function Stat({ k, v }) {
  return (
    <div className="border-l-2 brand-gradient-border pl-3">
      <div className="font-heading text-2xl font-bold">{k}</div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mt-1">{v}</div>
    </div>
  );
}

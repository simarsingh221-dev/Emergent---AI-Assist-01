import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus, PencilSimple, Trash, CaretRight, Microphone, Waveform, Brain, GitBranch,
  PuzzlePiece, Lightning, Monitor, Check, X, ListChecks
} from "@phosphor-icons/react";

const PIPELINE_STAGES = [
  { icon: Microphone, label: "Live conversation", sub: "Voice · Chat · Email", color: "#7B61FF" },
  { icon: Waveform, label: "Transcription", sub: "Deepgram / Whisper", color: "#7B61FF" },
  { icon: Brain, label: "Context engine", sub: "Rolling transcript + KB + persona", color: "#9B7BFF" },
  { icon: GitBranch, label: "Decision engine", sub: "GPT · intent / sentiment / NBA", color: "#00D4FF" },
  { icon: PuzzlePiece, label: "Workflow engine", sub: "Steps · compliance · triggers", color: "#00D4FF" },
  { icon: Lightning, label: "Suggestion / action", sub: "Response · NBA · KB", color: "#FF4FD8" },
  { icon: Monitor, label: "Agent UI", sub: "Real-time surface", color: "#FF4FD8" }
];

const newStepId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
const newStep = () => ({ _key: newStepId(), label: "", description: "", trigger_keywords: [], required: false });
const EMPTY_WORKFLOW = { name: "", description: "", category: "General", steps: [newStep()], compliance_items: [], active: true };

export default function WorkflowBuilder() {
  const { user: me } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null); // {mode: 'create'|'edit', data}
  const canEdit = me?.role === "supervisor" || me?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/workflows");
      setWorkflows(r.data);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => setEditor({ mode: "create", data: { ...EMPTY_WORKFLOW, steps: [newStep()] } });
  const openEdit = (w) => setEditor({
    mode: "edit",
    data: {
      ...w,
      steps: (w.steps || []).map((s) => ({ _key: newStepId(), label: "", description: "", trigger_keywords: [], required: false, ...s })),
      compliance_items: w.compliance_items || []
    }
  });

  const save = async () => {
    const payload = editor.data;
    if (!payload.name?.trim()) { toast.error("Name is required"); return; }
    if (!payload.steps.length || !payload.steps[0].label) { toast.error("At least one step with a label is required"); return; }
    try {
      if (editor.mode === "create") {
        await api.post("/workflows", payload);
        toast.success("Workflow created");
      } else {
        await api.patch(`/workflows/${payload.id}`, payload);
        toast.success("Workflow saved");
      }
      setEditor(null);
      load();
    } catch (err) { toast.error(err?.response?.data?.detail || "Save failed"); }
  };

  const remove = async (w) => {
    if (!window.confirm(`${w.is_seed ? "Deactivate" : "Delete"} "${w.name}"?`)) return;
    try {
      await api.delete(`/workflows/${w.id}`);
      toast.success(w.is_seed ? "Workflow deactivated" : "Workflow deleted");
      load();
    } catch (err) { toast.error(err?.response?.data?.detail || "Delete failed"); }
  };

  const updateEditor = (patch) => setEditor((e) => ({ ...e, data: { ...e.data, ...patch } }));
  const updateStep = (i, patch) => updateEditor({ steps: editor.data.steps.map((s, idx) => idx === i ? { ...s, ...patch } : s) });
  const addStep = () => updateEditor({ steps: [...editor.data.steps, newStep()] });
  const removeStep = (i) => updateEditor({ steps: editor.data.steps.filter((_, idx) => idx !== i) });
  const moveStep = (i, delta) => {
    const arr = [...editor.data.steps];
    const ni = i + delta;
    if (ni < 0 || ni >= arr.length) return;
    [arr[i], arr[ni]] = [arr[ni], arr[i]];
    updateEditor({ steps: arr });
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] p-8" data-testid="workflows-page">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">§ Workflow builder</div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">Build your agent playbooks.</h1>
        </div>
        {canEdit && (
          <Button onClick={openCreate} data-testid="btn-create-workflow"
                  className="rounded-none h-10 brand-gradient-bg text-white hover:opacity-90">
            <Plus size={14} className="mr-2" /> New workflow
          </Button>
        )}
      </div>

      {/* Pipeline architecture diagram */}
      <div className="bg-[#0B0B12] text-white p-6 mb-8 overflow-x-auto" data-testid="pipeline-diagram">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-4">§ How FlowPilot thinks · pipeline architecture</div>
        <div className="flex items-stretch gap-2 min-w-[1100px]">
          {PIPELINE_STAGES.map((s, i) => (
            <div key={s.label} className="flex items-stretch">
              <div className="bg-neutral-900 border border-neutral-800 p-4 flex-1 min-w-[140px]">
                <s.icon size={18} style={{ color: s.color }} />
                <div className="mt-2 font-heading font-semibold text-sm">{s.label}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-1">{s.sub}</div>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="flex items-center px-1"><CaretRight size={14} className="text-neutral-600" /></div>
              )}
            </div>
          ))}
        </div>
        <div className="font-mono text-[10px] text-neutral-500 mt-4">
          Your workflows plug into stage <span className="text-white font-semibold">5 — Workflow engine</span>. Every step defined below becomes guidance + compliance context consumed by the Decision engine in real time.
        </div>
      </div>

      {/* Workflow cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <div className="col-span-full text-sm text-[#A3A3A3] font-mono">Loading workflows…</div>}
        {!loading && workflows.length === 0 && (
          <div className="col-span-full bg-white border border-[#E5E5E5] p-10 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">No workflows</div>
            <p className="text-sm text-[#525252]">Create your first workflow to guide agents step-by-step.</p>
          </div>
        )}
        {workflows.map((w) => (
          <div key={w.id} data-testid={`workflow-card-${w.id}`}
               className="bg-white border border-[#E5E5E5] p-5 hover:border-[#7B61FF] transition-colors flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">{w.category || "General"}</div>
                <div className="font-heading text-lg font-semibold mt-0.5">{w.name}</div>
              </div>
              <div className="flex gap-1">
                {w.is_seed && <span className="font-mono text-[9px] uppercase tracking-widest bg-neutral-100 px-1.5 py-0.5">Seed</span>}
                <span className={`font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 ${w.active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                  {w.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            {w.description && <p className="text-xs text-[#525252] mb-3">{w.description}</p>}
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={12} className="text-[#525252]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">{(w.steps || []).length} steps · {(w.compliance_items || []).length} compliance items</span>
            </div>
            <div className="flex-1 text-xs text-[#525252] space-y-0.5 mb-4 line-clamp-4">
              {(w.steps || []).slice(0, 4).map((s, i) => (
                <div key={i} className="flex gap-2"><span className="text-[#A3A3A3]">{String(i + 1).padStart(2, "0")}</span>{s.label}</div>
              ))}
              {w.steps?.length > 4 && <div className="text-[#A3A3A3]">+ {w.steps.length - 4} more…</div>}
            </div>
            {canEdit && (
              <div className="flex gap-2 mt-auto pt-3 border-t border-[#E5E5E5]">
                <Button size="sm" variant="outline" onClick={() => openEdit(w)} data-testid={`btn-edit-workflow-${w.id}`}
                        className="rounded-none h-8 border-[#7B61FF] text-[#5B3EE5] hover:bg-[#7B61FF] hover:text-white">
                  <PencilSimple size={12} className="mr-1.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(w)} data-testid={`btn-delete-workflow-${w.id}`}
                        className="rounded-none h-8 hover:text-red-600">
                  <Trash size={12} />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Editor dialog */}
      <Dialog open={!!editor} onOpenChange={(o) => !o && setEditor(null)}>
        <DialogContent className="rounded-none max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="workflow-editor">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editor?.mode === "create" ? "New workflow" : `Edit · ${editor?.data?.name}`}
            </DialogTitle>
          </DialogHeader>
          {editor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-wider font-mono">Name</Label>
                  <Input value={editor.data.name} onChange={(e) => updateEditor({ name: e.target.value })}
                         className="rounded-none border-black h-10 mt-1.5" data-testid="wf-name" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider font-mono">Category</Label>
                  <Input value={editor.data.category} onChange={(e) => updateEditor({ category: e.target.value })}
                         className="rounded-none border-black h-10 mt-1.5" data-testid="wf-category" placeholder="Banking, Insurance…" />
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider font-mono">Description</Label>
                <Textarea value={editor.data.description} onChange={(e) => updateEditor({ description: e.target.value })}
                          className="rounded-none border-black min-h-[60px] mt-1.5" data-testid="wf-description" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider font-mono">Compliance items (comma-separated)</Label>
                <Input value={(editor.data.compliance_items || []).join(", ")}
                       onChange={(e) => updateEditor({ compliance_items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                       className="rounded-none border-black h-10 mt-1.5 font-mono text-xs" data-testid="wf-compliance"
                       placeholder="Privacy policy disclosure, Recording consent, KYC verification" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs uppercase tracking-wider font-mono">Workflow steps</Label>
                  <Button size="sm" onClick={addStep} data-testid="wf-add-step"
                          className="h-7 rounded-none bg-black hover:brand-gradient-bg text-white"><Plus size={12} className="mr-1" /> Add step</Button>
                </div>
                <div className="space-y-2">
                  {editor.data.steps.map((s, i) => (
                    <div key={s._key || i} className="border border-[#E5E5E5] p-3 bg-[#FAFAFA]" data-testid={`wf-step-${i}`}>
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-[11px] text-[#525252] mt-2 w-6">{String(i + 1).padStart(2, "0")}</span>
                        <div className="flex-1 space-y-2">
                          <Input value={s.label} onChange={(e) => updateStep(i, { label: e.target.value })}
                                 className="rounded-none border-black h-9 text-sm" placeholder="Step label" />
                          <Input value={s.description || ""} onChange={(e) => updateStep(i, { description: e.target.value })}
                                 className="rounded-none border-[#E5E5E5] h-8 text-xs" placeholder="Description / instruction (optional)" />
                          <div className="flex items-center gap-3 flex-wrap">
                            <Input value={(s.trigger_keywords || []).join(", ")}
                                   onChange={(e) => updateStep(i, { trigger_keywords: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                                   className="rounded-none border-[#E5E5E5] h-8 text-xs font-mono flex-1 min-w-[200px]"
                                   placeholder="Trigger keywords (comma-separated, optional)" />
                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                              <input type="checkbox" checked={s.required} onChange={(e) => updateStep(i, { required: e.target.checked })} />
                              Required
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button size="sm" variant="ghost" onClick={() => moveStep(i, -1)} disabled={i === 0} className="h-6 w-6 p-0 rounded-none">↑</Button>
                          <Button size="sm" variant="ghost" onClick={() => moveStep(i, 1)} disabled={i === editor.data.steps.length - 1} className="h-6 w-6 p-0 rounded-none">↓</Button>
                          <Button size="sm" variant="ghost" onClick={() => removeStep(i)} disabled={editor.data.steps.length <= 1} className="h-6 w-6 p-0 rounded-none hover:text-red-600"><X size={12} /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editor.data.active} onChange={(e) => updateEditor({ active: e.target.checked })} data-testid="wf-active" />
                Workflow is active (agents can select it when starting a call)
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-none h-10" onClick={() => setEditor(null)}>Cancel</Button>
            <Button onClick={save} data-testid="btn-save-workflow" className="rounded-none h-10 brand-gradient-bg text-white hover:opacity-90">
              <Check size={14} className="mr-1.5" /> Save workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash, Plug, CheckCircle, Sparkle, CursorClick } from "@phosphor-icons/react";

export default function Settings() {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [hooks, setHooks] = useState([]);
  const [form, setForm] = useState({ name: "", url: "", events: "call.started,call.ended" });
  const [assistMode, setAssistMode] = useState("auto");
  const [savingMode, setSavingMode] = useState(false);

  const load = useCallback(async () => {
    const [p, h, a] = await Promise.all([
      api.get("/integrations/providers"),
      api.get("/integrations/webhooks"),
      api.get("/settings/assist"),
    ]);
    setProviders(p.data);
    setHooks(h.data);
    setAssistMode(a.data.mode || "auto");
  }, []);
  useEffect(() => { load(); }, [load]);

  const updateAssistMode = async (mode) => {
    setSavingMode(true);
    try {
      await api.put("/settings/assist", { mode });
      setAssistMode(mode);
      toast.success(`AI Assist mode set to "${mode}" for all agents`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Only supervisors can change this");
    } finally { setSavingMode(false); }
  };

  const add = async () => {
    if (!form.name || !form.url) { toast.error("Name + URL required"); return; }
    await api.post("/integrations/webhooks", { name: form.name, url: form.url, events: form.events.split(",").map((s) => s.trim()).filter(Boolean) });
    setForm({ name: "", url: "", events: "call.started,call.ended" });
    toast.success("Webhook added");
    load();
  };

  const remove = async (id) => {
    await api.delete(`/integrations/webhooks/${id}`);
    load();
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] p-8" data-testid="settings-page">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">§ Settings</div>
      <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-8">Integrations & webhooks.</h1>

      {/* AI Assist mode (supervisor-controlled) */}
      <div className="bg-white border border-[#E5E5E5] mb-6">
        <div className="px-6 py-4 border-b border-[#E5E5E5]">
          <div className="font-heading text-lg font-semibold">AI Assist mode</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-0.5">
            Controls how every agent sees AI Assist · {user?.role === "supervisor" ? "Supervisor-controlled" : "Read-only (supervisor sets)"}
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            data-testid="mode-auto"
            disabled={savingMode || user?.role !== "supervisor"}
            onClick={() => updateAssistMode("auto")}
            className={`text-left p-5 border-2 transition-colors ${
              assistMode === "auto" ? "border-[#7B61FF] bg-[#F3EFFF]" : "border-[#E5E5E5] hover:border-[#A3A3A3]"
            } ${user?.role !== "supervisor" ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkle size={16} weight={assistMode === "auto" ? "fill" : "regular"} className="text-[#7B61FF]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#5B3EE5]">Auto</span>
              {assistMode === "auto" && <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-[#7B61FF]">● ACTIVE</span>}
            </div>
            <div className="font-heading font-semibold text-base">Auto-analyse</div>
            <div className="text-xs text-[#525252] mt-1">FlowPilot analyses every utterance automatically (1.5 s debounce). Agents see live updates without clicking. Higher LLM cost but truly real-time.</div>
          </button>
          <button
            data-testid="mode-click"
            disabled={savingMode || user?.role !== "supervisor"}
            onClick={() => updateAssistMode("click")}
            className={`text-left p-5 border-2 transition-colors ${
              assistMode === "click" ? "border-black bg-neutral-50" : "border-[#E5E5E5] hover:border-[#A3A3A3]"
            } ${user?.role !== "supervisor" ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <CursorClick size={16} weight={assistMode === "click" ? "fill" : "regular"} />
              <span className="font-mono text-[10px] uppercase tracking-widest">On-click</span>
              {assistMode === "click" && <span className="ml-auto font-mono text-[10px] uppercase tracking-widest">● ACTIVE</span>}
            </div>
            <div className="font-heading font-semibold text-base">Agent triggers manually</div>
            <div className="text-xs text-[#525252] mt-1">Agents click "AI Assist" when they want analysis. Lowest LLM cost. Best for low-volume or cost-sensitive deployments.</div>
          </button>
        </div>
        {user?.role !== "supervisor" && (
          <div className="px-6 pb-4 text-xs text-[#A3A3A3] font-mono">Sign in as a supervisor to change this setting.</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CCaaS providers */}
        <div className="bg-white border border-[#E5E5E5]">
          <div className="px-6 py-4 border-b border-[#E5E5E5]">
            <div className="font-heading text-lg font-semibold">CCaaS providers</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-0.5">Connect your call monitoring stack</div>
          </div>
          <div className="divide-y divide-[#E5E5E5]" data-testid="providers-list">
            {providers.map((p) => (
              <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Plug size={16} className="text-[#525252]" />
                  <div className="text-sm font-medium">{p.name}</div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <span className="text-emerald-700">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-white border border-[#E5E5E5]">
          <div className="px-6 py-4 border-b border-[#E5E5E5]">
            <div className="font-heading text-lg font-semibold">Webhooks</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-0.5">Stream events to your systems</div>
          </div>
          <div className="p-6 space-y-3 border-b border-[#E5E5E5]">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                   className="rounded-none border-black h-10" data-testid="wh-name" />
            <Input placeholder="https://your.endpoint/hook" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                   className="rounded-none border-black h-10" data-testid="wh-url" />
            <Input placeholder="Events (comma separated)" value={form.events} onChange={(e) => setForm({ ...form, events: e.target.value })}
                   className="rounded-none border-black h-10" data-testid="wh-events" />
            <Button onClick={add} data-testid="wh-add"
                    className="w-full rounded-none h-10 bg-black hover:bg-[#7B61FF]">
              <Plus size={14} className="mr-2" /> Add webhook
            </Button>
          </div>
          <div className="divide-y divide-[#E5E5E5]" data-testid="wh-list">
            {hooks.length === 0 && <div className="px-6 py-8 text-center text-sm text-[#A3A3A3]">No webhooks configured.</div>}
            {hooks.map((h) => (
              <div key={h.id} className="px-6 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{h.name}</div>
                  <div className="font-mono text-[10px] text-[#525252] truncate">{h.url}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove(h.id)}
                        className="rounded-none h-8 hover:text-red-600"
                        data-testid={`wh-del-${h.id}`}><Trash size={14} /></Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

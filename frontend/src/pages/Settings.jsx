import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash, Plug, CheckCircle } from "@phosphor-icons/react";

export default function Settings() {
  const [providers, setProviders] = useState([]);
  const [hooks, setHooks] = useState([]);
  const [form, setForm] = useState({ name: "", url: "", events: "call.started,call.ended" });

  const load = async () => {
    const [p, h] = await Promise.all([api.get("/integrations/providers"), api.get("/integrations/webhooks")]);
    setProviders(p.data);
    setHooks(h.data);
  };
  useEffect(() => { load(); }, []);

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

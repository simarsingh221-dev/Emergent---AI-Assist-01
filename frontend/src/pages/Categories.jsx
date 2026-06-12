import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tag, Plus, Trash, ArrowsClockwise, X, FloppyDisk, CheckCircle } from "@phosphor-icons/react";
import { toast } from "sonner";

const PRESET_COLORS = ["#7B61FF", "#FF4FD8", "#EF4444", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6", "#A855F7"];

export default function Categories() {
  const { user } = useAuth();
  const canEdit = user?.role === "supervisor" || user?.role === "admin";
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {mode: "create"|"edit", data}
  const [recomputing, setRecomputing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get("/categories"); setCats(r.data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => setEditing({ mode: "create",
    data: { name: "", keywords: [], color: PRESET_COLORS[0], description: "" } });
  const openEdit = (c) => setEditing({ mode: "edit", data: { ...c } });

  const save = async () => {
    const { mode, data } = editing;
    if (!data.name.trim()) return toast.error("Name required");
    if (!data.keywords.length) return toast.error("Add at least one keyword");
    try {
      if (mode === "create") {
        await api.post("/categories", data);
        toast.success("Category created");
      } else {
        await api.patch(`/categories/${data.id}`, {
          name: data.name, keywords: data.keywords, color: data.color, description: data.description,
        });
        toast.success("Category updated");
      }
      setEditing(null); load();
    } catch (e) { toast.error(e?.response?.data?.detail || "Save failed"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this category? Existing call tags will be removed.")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      load();
    } catch (e) { toast.error(e?.response?.data?.detail || "Delete failed"); }
  };

  const recompute = async () => {
    setRecomputing(true);
    try {
      const r = await api.post("/categories/recompute");
      toast.success(`Re-tagged ${r.data.updated} calls across ${r.data.categories} categories`);
    } catch (e) { toast.error("Recompute failed"); }
    finally { setRecomputing(false); }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5]" data-testid="categories-page">
      <div className="border-b border-[#E5E5E5] bg-white px-8 py-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252]">§ Categories</div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight mt-1">
            Tag every conversation. Automatically.
          </h1>
          <p className="text-sm text-[#525252] mt-1 max-w-2xl">
            Categories auto-tag calls based on keyword rules — show up in Explorer, Scorecard and Trends.
            New calls are tagged on completion; click <span className="font-mono">Re-tag history</span> to backfill.
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={recompute} disabled={recomputing}
              className="rounded-none h-10" data-testid="categories-recompute">
              <ArrowsClockwise size={14} className={`mr-2 ${recomputing ? "animate-spin" : ""}`} />
              {recomputing ? "Re-tagging…" : "Re-tag history"}
            </Button>
            <Button onClick={openCreate} className="rounded-none h-10 brand-gradient-bg text-white hover:opacity-90" data-testid="categories-new">
              <Plus size={14} className="mr-2" /> New category
            </Button>
          </div>
        )}
      </div>

      <div className="p-8">
        {loading ? (
          <div className="text-sm text-[#525252] font-mono">Loading categories…</div>
        ) : cats.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={32} className="mx-auto text-[#A3A3A3]" />
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-3">No categories yet</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-[1px] bg-[#E5E5E5] border border-[#E5E5E5]">
            {cats.map((c) => (
              <div key={c.id} className="bg-white p-5" data-testid={`cat-${c.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3" style={{ background: c.color }} />
                    <span className="font-semibold">{c.name}</span>
                    {c.is_seed && <span className="text-[9px] font-mono uppercase tracking-widest text-[#A3A3A3]">Default</span>}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="text-xs px-2 py-1 border border-[#E5E5E5] hover:border-[#0A0A0A]" data-testid={`cat-edit-${c.id}`}>
                        Edit
                      </button>
                      <button onClick={() => del(c.id)} className="text-xs px-2 py-1 border border-[#E5E5E5] hover:border-red-600 hover:text-red-600" data-testid={`cat-del-${c.id}`}>
                        <Trash size={12} />
                      </button>
                    </div>
                  )}
                </div>
                {c.description && <div className="text-xs text-[#525252] mt-1.5">{c.description}</div>}
                <div className="flex flex-wrap gap-1 mt-3">
                  {(c.keywords || []).map((k) => (
                    <span key={k} className="text-[10px] px-1.5 py-0.5 bg-[#FAFAFA] border border-[#E5E5E5] font-mono">{k}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" data-testid="cat-editor">
          <div className="bg-white border border-[#E5E5E5] w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">§ {editing.mode === "create" ? "Create" : "Edit"} category</div>
                <h2 className="font-heading text-lg font-bold tracking-tight">{editing.data.name || "Untitled"}</h2>
              </div>
              <button onClick={() => setEditing(null)} className="text-[#525252] hover:text-[#0A0A0A]" data-testid="cat-editor-close">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider font-mono">Name</Label>
                <Input value={editing.data.name}
                  onChange={(e) => setEditing({ ...editing, data: { ...editing.data, name: e.target.value } })}
                  className="rounded-none border-black h-10 mt-1.5" data-testid="cat-editor-name" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider font-mono">Description</Label>
                <Textarea value={editing.data.description || ""}
                  onChange={(e) => setEditing({ ...editing, data: { ...editing.data, description: e.target.value } })}
                  className="rounded-none border-black mt-1.5" placeholder="Optional context for this category" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider font-mono">Color</Label>
                <div className="flex gap-1.5 mt-1.5">
                  {PRESET_COLORS.map((col) => (
                    <button key={col} onClick={() => setEditing({ ...editing, data: { ...editing.data, color: col } })}
                      className="w-7 h-7 border-2"
                      style={{ background: col, borderColor: editing.data.color === col ? "#0A0A0A" : "transparent" }}
                      data-testid={`cat-color-${col}`} />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider font-mono">Keywords / phrases</Label>
                <p className="text-[11px] text-[#525252] mt-0.5 mb-2">Any of these terms in a transcript will tag the call. Case-insensitive.</p>
                <KeywordEditor
                  values={editing.data.keywords}
                  onChange={(kws) => setEditing({ ...editing, data: { ...editing.data, keywords: kws } })}
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-[#E5E5E5] flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)} className="rounded-none" data-testid="cat-editor-cancel">Cancel</Button>
              <Button onClick={save} className="rounded-none brand-gradient-bg text-white hover:opacity-90" data-testid="cat-editor-save">
                <FloppyDisk size={14} className="mr-2" /> Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KeywordEditor({ values, onChange }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]); setInput("");
  };
  return (
    <div>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder='e.g. "money back" or "cancel subscription"'
          className="rounded-none border-black h-10" data-testid="cat-kw-input" />
        <Button type="button" onClick={add} variant="outline" className="rounded-none" data-testid="cat-kw-add">
          <Plus size={14} />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-[#FAFAFA] border border-[#E5E5E5]">
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))} className="text-[#525252] hover:text-red-600">
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

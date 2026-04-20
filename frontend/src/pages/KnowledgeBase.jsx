import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UploadSimple, MagnifyingGlass, FileText, Trash, Sparkle } from "@phosphor-icons/react";

export default function KnowledgeBase() {
  const [docs, setDocs] = useState([]);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    const r = await api.get("/kb/documents");
    setDocs(r.data);
  };
  useEffect(() => { load(); }, []);

  const upload = async () => {
    const f = fileRef.current?.files?.[0];
    if (!f) { toast.error("Choose a file"); return; }
    if (!title.trim()) { toast.error("Add a title"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("title", title);
      fd.append("category", category);
      await api.post("/kb/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Document added");
      setTitle(""); fileRef.current.value = "";
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Upload failed");
    } finally { setUploading(false); }
  };

  const seed = async () => {
    await api.post("/kb/seed");
    toast.success("Demo KB loaded");
    load();
  };

  const remove = async (id) => {
    await api.delete(`/kb/documents/${id}`);
    load();
  };

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const r = await api.post("/kb/search", { query });
      setResult(r.data);
    } catch { toast.error("Search failed"); }
    finally { setSearching(false); }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] p-8" data-testid="kb-page">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">§ Knowledge base</div>
      <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-8">Your enterprise brain.</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <div className="bg-white border border-[#E5E5E5] p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-3">Semantic search</div>
            <div className="flex gap-2">
              <Input value={query} onChange={(e) => setQuery(e.target.value)}
                     onKeyDown={(e) => e.key === "Enter" && search()}
                     placeholder="How do I process a credit card retention offer?"
                     className="rounded-none border-black h-11" data-testid="kb-search-input" />
              <Button onClick={search} disabled={searching}
                      data-testid="kb-search-btn"
                      className="rounded-none h-11 bg-black hover:bg-[#7B61FF]">
                <MagnifyingGlass size={16} className="mr-2" />{searching ? "Searching…" : "Search"}
              </Button>
            </div>
            {result && (
              <div className="mt-5 space-y-3">
                <div className="bg-[#F3EFFF] border border-[#7B61FF] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkle size={12} className="text-[#7B61FF]" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#5B3EE5]">AI Answer</span>
                  </div>
                  <p className="text-sm leading-relaxed" data-testid="kb-search-answer">{result.answer}</p>
                </div>
                {result.sources?.length > 0 && (
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Sources</div>
                    <div className="space-y-1">
                      {result.sources.map((s) => (
                        <div key={s.id} className="text-xs border-l-2 border-[#7B61FF] pl-2">
                          <span className="font-semibold">{s.title}</span> <span className="text-[#A3A3A3] font-mono">· {s.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white border border-[#E5E5E5]">
            <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="font-heading text-lg font-semibold">Documents</div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">{docs.length} items</span>
            </div>
            <div className="divide-y divide-[#E5E5E5]" data-testid="kb-doc-list">
              {docs.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-[#A3A3A3]">No documents yet. Upload or seed demo KB.</div>
              )}
              {docs.map((d) => (
                <div key={d.id} className="px-6 py-3 flex items-center justify-between hover:bg-[#FAFAFA]">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={16} className="text-[#525252]" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{d.title}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">{d.category} · {d.filename}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove(d.id)}
                          data-testid={`kb-delete-${d.id}`}
                          className="rounded-none h-8 hover:text-red-600"><Trash size={14} /></Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upload */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E5E5] p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-3">Add document</div>
            <div className="space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
                     className="rounded-none border-black h-10" data-testid="kb-title" />
              <Input placeholder="Category (Banking, Insurance…)" value={category} onChange={(e) => setCategory(e.target.value)}
                     className="rounded-none border-black h-10" data-testid="kb-category" />
              <input ref={fileRef} type="file" accept=".pdf,.txt,.md"
                     className="block w-full text-xs font-mono text-[#525252] file:mr-3 file:py-2 file:px-3 file:border file:border-black file:bg-white file:hover:bg-black file:hover:text-white file:text-xs file:font-mono file:uppercase file:rounded-none"
                     data-testid="kb-file" />
              <Button onClick={upload} disabled={uploading}
                      data-testid="kb-upload-btn"
                      className="w-full rounded-none h-10 bg-black hover:bg-[#7B61FF]">
                <UploadSimple size={14} className="mr-2" />{uploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </div>
          <div className="bg-[#09090B] text-white p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Quick start</div>
            <div className="text-sm mb-4">Load pre-built banking, insurance & CX playbooks to explore the assist engine.</div>
            <Button onClick={seed} data-testid="kb-seed-btn"
                    className="w-full rounded-none bg-white text-black hover:bg-[#7B61FF] hover:text-white">
              Seed demo KB
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

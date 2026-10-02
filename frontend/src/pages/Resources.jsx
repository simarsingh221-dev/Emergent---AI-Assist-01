import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, FileText, Compass, Lightning } from "@phosphor-icons/react";

const guides = [
  { icon: Compass, title: "Scoping guide: Writing an RFP that gets you honest estimates", excerpt: "The 7 sections every software RFP needs — and the 3 that waste everyone's time.", slug: "scoping-guide" },
  { icon: Lightning, title: "AI in production: A buyer's checklist", excerpt: "How to evaluate AI vendors beyond the demo. Cost ceilings, evals, and the questions nobody asks.", slug: "ai-buyers-checklist" },
  { icon: FileText, title: "The weekly demo: Why Fridays save projects", excerpt: "The one ritual that separates studios that ship from agencies that bill.", slug: "weekly-demo" },
];

export default function Resources() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/blog/articles?limit=6");
        setPosts(res.data?.items || res.data?.articles || res.data || []);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Resources — FlowPilot Studio</title>
        <meta name="description" content="Field notes, guides, and essays from the FlowPilot studio. How to scope software, buy AI, run projects that ship." />
      </Helmet>

      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-14 lg:pt-28 lg:pb-16">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-6">§ Resources</div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] max-w-4xl">
          Field notes from a<br />
          <span className="brand-gradient-text">studio that ships.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[#6B7280] leading-relaxed">
          Essays, guides, and templates from the FlowPilot team. Written for operators, founders, and product leaders who have to make real decisions this quarter.
        </p>
      </section>

      {/* GUIDES */}
      <section className="max-w-[1280px] mx-auto px-6 pb-16">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ Guides</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {guides.map((g) => (
            <div key={g.slug} className="bg-white rounded-2xl border border-[#EAE9E2] p-7 hover:shadow-lg transition-shadow" data-testid={`guide-${g.slug}`}>
              <g.icon size={22} weight="duotone" className="text-[#0F766E]" />
              <h3 className="font-heading text-xl font-bold mt-5 leading-snug">{g.title}</h3>
              <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">{g.excerpt}</p>
              <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#C8A97E]">
                Coming soon
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOG */}
      <section className="bg-white border-y border-[#EAE9E2]">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-24">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A7540] mb-4">§ From the blog</div>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight">Latest essays</h2>
            </div>
            <Link to="/blog" className="text-sm font-medium text-[#0F766E] hover:text-[#14532D] inline-flex items-center gap-1" data-testid="resources-view-blog">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="text-sm font-mono text-[#6B7280]">Loading…</div>
          ) : posts.length === 0 ? (
            <div className="bg-[#FAF8F4] rounded-2xl border border-dashed border-[#EAE9E2] p-10 text-center">
              <BookOpen size={28} weight="duotone" className="text-[#C8A97E] mx-auto" />
              <p className="text-[#1F2937] mt-4 font-medium">New essays coming soon.</p>
              <p className="text-sm text-[#6B7280] mt-1">Our first field notes drop in the next few weeks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.slice(0, 6).map((p) => (
                <Link key={p.slug || p.id} to={`/blog/${p.slug}`} className="bg-[#FAF8F4] rounded-2xl border border-[#EAE9E2] p-6 hover:border-[#0F766E] transition-colors" data-testid={`blog-card-${p.slug || p.id}`}>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#8A7540]">
                    {p.published_at ? new Date(p.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Draft"}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#1F2937] mt-3 leading-snug">{p.title}</h3>
                  {p.excerpt && <p className="text-sm text-[#6B7280] mt-3 line-clamp-3">{p.excerpt}</p>}
                  <div className="inline-flex items-center gap-1 text-sm font-medium text-[#0F766E] mt-4">Read <ArrowRight size={14} /></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#14532D] text-white">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-24 text-center">
          <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
            Have a specific question? We'll answer.
          </h2>
          <Link to="/contact" data-testid="resources-cta" className="inline-block mt-10">
            <Button className="bg-[#C8A97E] text-[#14532D] hover:bg-white rounded-xl h-14 px-8 text-base font-semibold">
              Book Discovery Call <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

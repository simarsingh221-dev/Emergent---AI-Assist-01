import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import FlowLogo from "@/components/FlowLogo";
import Footer from "@/components/Footer";
import { ArrowRight, Calendar, Tag } from "@phosphor-icons/react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Blog() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/blog/articles?limit=50`)
      .then((r) => setArticles(r.data))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#0A0A0A] flex flex-col" data-testid="blog-page">
      <Helmet>
        <title>FlowPilot Blog — Contact Center Intelligence & AI Insights</title>
        <meta name="description" content="Articles, playbooks, and research on real-time agent assist, contact center AI, conversation intelligence, and the future of CCaaS." />
        <link rel="canonical" href="https://flowpilot.co.in/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="FlowPilot Blog" />
        <meta property="og:description" content="Articles, playbooks, and research on real-time agent assist." />
        <meta property="og:url" content="https://flowpilot.co.in/blog" />
        <meta property="og:image" content="https://flowpilot.co.in/og-image.png" />
      </Helmet>

      <header className="border-b border-[#E5E5E5] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="blog-home">
            <FlowLogo size={26} />
            <span className="font-heading font-bold text-lg tracking-tight">FlowPilot</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/demo" className="text-sm hover:underline">Demo</Link>
            <Link to="/contact" className="text-sm hover:underline">Contact</Link>
            <Link to="/login" className="text-sm px-3 py-2 hover:bg-neutral-100">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1100px] mx-auto px-6 py-14 w-full">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-3">§ Blog</div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tighter mb-3">
          Contact center <span className="brand-gradient-text">intelligence</span>.
        </h1>
        <p className="text-[#525252] max-w-2xl mb-12 text-lg">
          Playbooks, research, and field notes on real-time agent assist, conversation intelligence,
          QA automation, and the modern CCaaS stack.
        </p>

        {loading ? (
          <div className="text-sm text-[#525252] font-mono">Loading articles…</div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[#E5E5E5]">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">No articles yet</div>
            <div className="text-sm text-[#525252] mt-2">First article coming soon. <Link to="/contact" className="underline">Get notified</Link>.</div>
          </div>
        ) : (
          <div className="space-y-[1px] bg-[#E5E5E5] border border-[#E5E5E5]">
            {articles.map((a) => <ArticleCard key={a.id} a={a} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ArticleCard({ a }) {
  return (
    <Link to={`/blog/${a.slug}`} data-testid={`article-card-${a.slug}`}
      className="bg-white p-6 lg:p-8 flex flex-col lg:flex-row gap-6 hover:bg-[#FAFAFA] transition-colors group">
      {a.cover_image_url && (
        <img src={a.cover_image_url} alt={a.title}
          className="w-full lg:w-64 h-40 lg:h-32 object-cover" loading="lazy" />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-[#525252] mb-2">
          <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(a.published_at)}</span>
          <span>·</span>
          <span>{a.author}</span>
        </div>
        <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight group-hover:text-[#7B61FF] transition-colors">
          {a.title}
        </h2>
        {a.excerpt && <p className="text-sm text-[#525252] mt-2 leading-relaxed line-clamp-3">{a.excerpt}</p>}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {(a.tags || []).slice(0, 4).map((t) => (
            <span key={t} className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 bg-[#F4F4F5] text-[#525252]">{t}</span>
          ))}
          <span className="ml-auto text-xs font-mono uppercase tracking-widest text-[#7B61FF] inline-flex items-center gap-1">
            Read article <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return iso.slice(0, 10); }
}

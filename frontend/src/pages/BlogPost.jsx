import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import FlowLogo from "@/components/FlowLogo";
import Footer from "@/components/Footer";
import { Calendar, ArrowLeft, Tag } from "@phosphor-icons/react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BlogPost() {
  const { slug } = useParams();
  const nav = useNavigate();
  const [a, setA] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    axios.get(`${API}/blog/articles/${slug}`)
      .then((r) => setA(r.data))
      .catch(() => setErr(true));
  }, [slug]);

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">404</div>
          <h1 className="font-heading text-3xl font-bold mt-2">Article not found</h1>
          <Link to="/blog" className="underline mt-4 inline-block text-sm">Back to all articles</Link>
        </div>
      </div>
    );
  }
  if (!a) return <div className="p-12 text-sm text-[#525252] font-mono">Loading…</div>;

  const pageTitle = a.seo_title || a.title;
  const pageDesc = a.seo_description || a.excerpt || "";
  const canonical = a.canonical_url || `https://flowpilot.co.in/blog/${a.slug}`;
  const ogImage = a.cover_image_url || "https://flowpilot.co.in/og-image.png";

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col" data-testid="blog-post-page">
      <Helmet>
        <title>{`${pageTitle} · FlowPilot`}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonical} />
        <meta name="author" content={a.author} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="article:published_time" content={a.published_at} />
        <meta property="article:author" content={a.author} />
        {(a.tags || []).map((t) => <meta key={t} property="article:tag" content={t} />)}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": a.title,
          "image": ogImage,
          "datePublished": a.published_at,
          "dateModified": a.updated_at,
          "author": { "@type": "Person", "name": a.author },
          "publisher": { "@type": "Organization", "name": "FlowPilot",
            "logo": { "@type": "ImageObject", "url": "https://flowpilot.co.in/logo-512.png" } },
          "mainEntityOfPage": canonical,
          "description": pageDesc,
        })}</script>
      </Helmet>

      <header className="border-b border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FlowLogo size={26} />
            <span className="font-heading font-bold text-lg tracking-tight">FlowPilot</span>
          </Link>
          <Link to="/blog" className="text-xs font-mono uppercase tracking-widest text-[#525252] hover:text-[#0A0A0A] flex items-center gap-1.5">
            <ArrowLeft size={11} /> All articles
          </Link>
        </div>
      </header>

      <article className="max-w-[760px] mx-auto px-6 py-12 w-full">
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-[#525252] mb-4">
          <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(a.published_at)}</span>
          <span>·</span>
          <span>{a.author}</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tighter mb-6 leading-tight">
          {a.title}
        </h1>
        {a.excerpt && (
          <p className="text-lg text-[#525252] leading-relaxed mb-8 max-w-2xl">{a.excerpt}</p>
        )}
        {a.cover_image_url && (
          <img src={a.cover_image_url} alt={a.title}
            className="w-full max-h-[420px] object-cover mb-10 border border-[#E5E5E5]" />
        )}
        <div className="prose prose-neutral prose-lg max-w-none article-content"
          dangerouslySetInnerHTML={{ __html: a.content_html }} />

        {(a.tags || []).length > 0 && (
          <div className="mt-12 pt-6 border-t border-[#E5E5E5] flex flex-wrap gap-1.5">
            <Tag size={14} className="text-[#525252] mt-0.5" />
            {a.tags.map((t) => (
              <span key={t} className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 bg-[#F4F4F5] text-[#525252]">{t}</span>
            ))}
          </div>
        )}

        <div className="mt-12 p-6 bg-[#FAFAFA] border-l-2 border-[#7B61FF]">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#5B3EE5] mb-2">From FlowPilot</div>
          <h3 className="font-heading text-xl font-bold tracking-tight">Want this for your contact center?</h3>
          <p className="text-sm text-[#525252] mt-2">
            Real-time agent assist · sub-second next-best-action · auto QA — under one roof.
          </p>
          <div className="flex gap-2 mt-4">
            <Link to="/demo" className="inline-flex items-center gap-1 text-sm px-4 py-2 bg-black text-white hover:bg-[#7B61FF]">Watch 3-min demo</Link>
            <Link to="/contact" className="inline-flex items-center gap-1 text-sm px-4 py-2 border border-black hover:bg-black hover:text-white">Talk to us</Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }); }
  catch { return iso.slice(0, 10); }
}

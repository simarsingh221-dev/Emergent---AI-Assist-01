"""FlowPilot Articles / Blog — Rank AI compatible headless CMS receiver.

Articles are stored in MongoDB and rendered publicly at /blog and /blog/{slug}.
Rank AI (or any CMS) can publish to FlowPilot via:
  1. Webhook: POST /api/blog/webhook with X-Webhook-Secret header (set RANK_WEBHOOK_SECRET env)
  2. Admin-authed: POST /api/blog/articles with a bearer JWT (admin role)

Both accept the same payload schema.
"""
import os
import re
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorDatabase


def _get_webhook_secret() -> str:
    """Read at request time so .env loaded after this module's import is honored."""
    return os.environ.get('RANK_WEBHOOK_SECRET', '').strip()


def _slugify(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9\s-]", "", text or "").strip().lower()
    s = re.sub(r"[\s_-]+", "-", s)
    return s.strip("-") or str(uuid.uuid4())[:8]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class ArticleReq(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    slug: Optional[str] = None
    content_html: str
    excerpt: Optional[str] = ""
    cover_image_url: Optional[str] = ""
    author: Optional[str] = "FlowPilot"
    tags: List[str] = Field(default_factory=list)
    published_at: Optional[str] = None  # ISO timestamp; defaults to now
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    canonical_url: Optional[str] = None
    source: Optional[str] = "manual"  # "rank.ai" | "manual" | etc


def _to_article_doc(req: ArticleReq, source: str) -> dict:
    slug = req.slug or _slugify(req.title)
    return {
        "id": str(uuid.uuid4()),
        "slug": slug,
        "title": req.title.strip(),
        "content_html": req.content_html,
        "excerpt": (req.excerpt or "").strip()[:400],
        "cover_image_url": (req.cover_image_url or "").strip(),
        "author": (req.author or "FlowPilot").strip(),
        "tags": [t.strip() for t in (req.tags or []) if t.strip()],
        "published_at": req.published_at or _now(),
        "seo_title": (req.seo_title or req.title).strip()[:160],
        "seo_description": (req.seo_description or req.excerpt or "").strip()[:300],
        "canonical_url": (req.canonical_url or "").strip(),
        "source": source,
        "active": True,
        "created_at": _now(),
        "updated_at": _now(),
    }


def build_router(db: AsyncIOMotorDatabase, get_current_user) -> APIRouter:
    router = APIRouter(tags=["blog"])

    # ---------- PUBLIC LIST + READ ----------
    @router.get("/blog/articles")
    async def list_articles(limit: int = 50, tag: Optional[str] = None):
        q: dict = {"active": True}
        if tag:
            q["tags"] = tag
        docs = await db.articles.find(q, {"_id": 0, "content_html": 0}).sort("published_at", -1).to_list(min(limit, 200))
        return docs

    @router.get("/blog/articles/{slug}")
    async def get_article(slug: str):
        doc = await db.articles.find_one({"slug": slug, "active": True}, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Article not found")
        return doc

    @router.get("/blog/sitemap")
    async def article_sitemap():
        """Slim feed used by sitemap.xml builder."""
        docs = await db.articles.find({"active": True}, {"_id": 0, "slug": 1, "updated_at": 1}).to_list(1000)
        return docs

    # ---------- ADMIN AUTH'd PUBLISH ----------
    @router.post("/blog/articles")
    async def create_article(req: ArticleReq, user=Depends(get_current_user)):
        if user.get("role") not in ("supervisor", "admin"):
            raise HTTPException(403, "Supervisor or admin required")
        return await _upsert_article(req, source=req.source or "manual")

    @router.patch("/blog/articles/{slug}")
    async def update_article(slug: str, req: ArticleReq, user=Depends(get_current_user)):
        if user.get("role") not in ("supervisor", "admin"):
            raise HTTPException(403, "Supervisor or admin required")
        return await _upsert_article(req, source=req.source or "manual", target_slug=slug)

    @router.delete("/blog/articles/{slug}")
    async def delete_article(slug: str, user=Depends(get_current_user)):
        if user.get("role") not in ("supervisor", "admin"):
            raise HTTPException(403, "Supervisor or admin required")
        r = await db.articles.update_one({"slug": slug}, {"$set": {"active": False, "updated_at": _now()}})
        if r.matched_count == 0:
            raise HTTPException(404, "Article not found")
        return {"ok": True}

    # ---------- RANK AI WEBHOOK ----------
    @router.post("/blog/webhook")
    async def rank_webhook(request: Request,
                            x_webhook_secret: Optional[str] = Header(None)):
        """Rank AI (or any CMS) calls this URL on article publish.
        Configure in Rank AI: Settings → Webhooks → URL: {API}/api/blog/webhook,
        Header: X-Webhook-Secret = RANK_WEBHOOK_SECRET (set in your env)."""
        secret = _get_webhook_secret()
        if not secret:
            raise HTTPException(503, "Webhook not configured: set RANK_WEBHOOK_SECRET")
        if x_webhook_secret != secret:
            raise HTTPException(401, "Invalid webhook secret")
        body = await request.json()
        # Accept either flat or Rank-style {data: {...}} envelope
        payload = body.get("data") if isinstance(body, dict) and "data" in body else body
        try:
            req = ArticleReq(**payload)
        except Exception as e:
            raise HTTPException(400, f"Invalid article payload: {e}")
        return await _upsert_article(req, source="rank.ai")

    async def _upsert_article(req: ArticleReq, source: str, target_slug: Optional[str] = None) -> dict:
        slug = target_slug or req.slug or _slugify(req.title)
        existing = await db.articles.find_one({"slug": slug})
        if existing:
            updates = _to_article_doc(req, source)
            updates["id"] = existing["id"]
            updates["created_at"] = existing.get("created_at", _now())
            updates["slug"] = slug
            await db.articles.update_one({"slug": slug}, {"$set": updates})
            return {"slug": slug, "id": existing["id"], "updated": True}
        doc = _to_article_doc(req, source)
        doc["slug"] = slug
        await db.articles.insert_one(doc)
        return {"slug": slug, "id": doc["id"], "updated": False}

    return router

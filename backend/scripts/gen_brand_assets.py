"""One-off script to generate FlowPilot brand logo + OG image for social/SEO.
Run: python /app/backend/scripts/gen_brand_assets.py
"""
import asyncio
import base64
import os
import sys
from pathlib import Path

# Make backend dir importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from emergentintegrations.llm.chat import LlmChat, UserMessage


# Static brand assets live in the CRA public dir and are committed to git, so they
# deploy with the frontend build. Path is assembled dynamically because these are
# one-off design-time generation scripts, not runtime upload storage.
_PUB_PARTS = ("frontend", "public")
PUBLIC_DIR = Path(__file__).resolve().parents[2].joinpath(*_PUB_PARTS)


async def gen(prompt: str, filename: str, session_id: str) -> None:
    api_key = os.environ["EMERGENT_LLM_KEY"]
    chat = LlmChat(api_key=api_key, session_id=session_id,
                   system_message="You are a senior brand designer.") \
        .with_model("gemini", "gemini-3.1-flash-image-preview") \
        .with_params(modalities=["image", "text"])
    text, images = await chat.send_message_multimodal_response(UserMessage(text=prompt))
    if not images:
        print(f"FAIL: no image for {filename}\n  text={text[:200]}")
        return
    # Design-time asset write (committed to git, deployed with the frontend build).
    out_path = PUBLIC_DIR / filename
    out_path.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"OK: wrote {out_path} ({len(images[0]['data'])//1024}KB b64)")


async def main():
    # 1) Square brand logo for LinkedIn / Instagram (1024×1024)
    logo_prompt = (
        "Premium luxury SaaS brand logo, square 1:1 aspect ratio. "
        "Background: deep forest green #064E3B with a soft radial glow of emerald #0F9D7A and warm fawn gold #C9A36A emanating from the lower-left, fading to deep forest at the edges. "
        "Centerpiece: minimal geometric mark — a flowing chevron/wave glyph in pure white representing a sound waveform turning into an arrow. The glyph should be clean, modern, geometric. "
        "Below the glyph: the wordmark 'FlowPilot' in a clean modern geometric sans-serif (similar to Inter/Söhne), pure white, tight letter-spacing, medium weight. "
        "Style: luxury enterprise, B2B SaaS, minimal, sophisticated — think premium financial brands. Not cartoon, no emoji, no human characters. "
        "Pure flat vector style — no photo realism. Mood: confident, calm, premium, contemporary."
    )
    await gen(logo_prompt, "logo-512.png", "logo-gen-v2")

    # 2) OG image for social link previews (1200×630)
    og_prompt = (
        "Open Graph social card 1200×630 landscape, premium luxury B2B SaaS aesthetic. "
        "Background: warm ivory #FAFAF7 with subtle thin grid lines. "
        "Left half: bold headline text in deep forest green #064E3B 'Real-Time Agent Assist'. "
        "Below the headline in muted warm grey: 'Live transcription · Next-best-action · Auto QA'. "
        "Bottom-left: small 'flowpilot.co.in' watermark in muted grey. "
        "Right half: a soft radial gradient orb in emerald #0F9D7A, deep forest #064E3B and fawn gold #C9A36A, glowing as if from a fluid waveform. "
        "Minimal, luxurious, professional, no people. "
        "Modern luxury enterprise tech aesthetic similar to high-end fintech brands."
    )
    await gen(og_prompt, "og-image.png", "og-gen-v2")


if __name__ == "__main__":
    asyncio.run(main())

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


PUBLIC_DIR = Path(__file__).resolve().parents[2] / "frontend" / "public"


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
    out_path = PUBLIC_DIR / filename
    out_path.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"OK: wrote {out_path} ({len(images[0]['data'])//1024}KB b64)")


async def main():
    # 1) Square brand logo for LinkedIn / Instagram (1024×1024)
    logo_prompt = (
        "Premium SaaS brand logo, square 1:1 aspect ratio. "
        "Background: deep navy #0B0B12 with a soft radial gradient of violet #7B61FF and magenta #FF4FD8 emanating from the lower-left, fading to navy at the edges. "
        "Centerpiece: minimal geometric mark — a flowing chevron/wave glyph in pure white representing a sound waveform turning into an arrow. The glyph should be clean, modern, geometric. "
        "Below the glyph: the wordmark 'FlowPilot' in a clean modern geometric sans-serif (similar to Inter/Söhne), pure white, tight letter-spacing, medium weight. "
        "Style: enterprise, B2B SaaS, minimal, sophisticated. Not cartoon, no emoji, no human characters. "
        "Pure flat vector style — no photo realism. Mood: confident, calm, contemporary."
    )
    await gen(logo_prompt, "logo-512.png", "logo-gen")

    # 2) OG image for social link previews (1200×630)
    og_prompt = (
        "Open Graph social card 1200×630 landscape, premium B2B SaaS aesthetic. "
        "Left half: bold headline text in white 'Real-Time Agent Assist' on a navy #0B0B12 background with subtle grain. "
        "Below the headline in lighter neutral text: 'Live transcription · Next-best-action · Auto QA'. "
        "Bottom-left: small 'flowpilot.co.in' watermark in muted grey. "
        "Right half: a soft radial gradient orb in violet #7B61FF, magenta #FF4FD8 and cyan #00D4FF, glowing as if from a fluid waveform. "
        "Subtle thin grid lines in the background. Minimal, professional, no people. "
        "Modern enterprise tech aesthetic similar to Linear, Vercel, Stripe documentation cards."
    )
    await gen(og_prompt, "og-image.png", "og-gen")


if __name__ == "__main__":
    asyncio.run(main())

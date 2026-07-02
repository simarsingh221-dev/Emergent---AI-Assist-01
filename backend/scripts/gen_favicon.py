"""Generate favicon and related brand assets."""
import asyncio
import base64
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from emergentintegrations.llm.chat import LlmChat, UserMessage
from PIL import Image
import io

PUBLIC_DIR = Path(__file__).resolve().parents[2] / "frontend" / "public"


async def gen(prompt: str, filename: str, session_id: str) -> Path:
    api_key = os.environ["EMERGENT_LLM_KEY"]
    chat = LlmChat(api_key=api_key, session_id=session_id,
                   system_message="You are a senior brand designer.") \
        .with_model("gemini", "gemini-3.1-flash-image-preview") \
        .with_params(modalities=["image", "text"])
    text, images = await chat.send_message_multimodal_response(UserMessage(text=prompt))
    if not images:
        raise RuntimeError(f"no image for {filename}: {text[:200]}")
    out = PUBLIC_DIR / filename
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"generated {out} ({out.stat().st_size // 1024}KB)")
    return out


def derive_variants(src: Path):
    """Create favicon-32.png, favicon-16.png, apple-touch-icon.png (180x180) from source."""
    img = Image.open(src).convert("RGBA")
    # Center-crop to square if not already
    w, h = img.size
    if w != h:
        s = min(w, h)
        img = img.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2))
    for size, name in [(180, "apple-touch-icon.png"), (32, "favicon-32.png"), (16, "favicon-16.png")]:
        resized = img.resize((size, size), Image.LANCZOS)
        out = PUBLIC_DIR / name
        resized.save(out, "PNG", optimize=True)
        print(f"derived {out} ({out.stat().st_size // 1024}KB)")
    # Also write favicon.ico (multi-size for legacy browsers)
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_variants = [img.resize(s, Image.LANCZOS) for s in ico_sizes]
    ico_out = PUBLIC_DIR / "favicon.ico"
    ico_variants[0].save(ico_out, format="ICO", sizes=ico_sizes, append_images=ico_variants[1:])
    print(f"derived {ico_out} ({ico_out.stat().st_size // 1024}KB)")


async def main():
    favicon_prompt = (
        "Compact favicon glyph, square 1:1. Extremely simple, must be legible at 16×16 pixels. "
        "Background: deep navy #0B0B12 with a soft radial gradient of violet #7B61FF and magenta #FF4FD8 emanating from the lower-left corner, fading to navy at the top-right. "
        "Centerpiece: a bold minimal geometric glyph in PURE WHITE — a single flowing chevron/wave shape that reads as either a sound-wave becoming an arrow, or the letter 'F' abstracted into a wave. Strong, thick, unambiguous. Fills roughly 60 percent of the canvas. "
        "NO TEXT, NO WORDMARK, NO LETTERS visible — pure mark only. "
        "Style: flat vector, minimal, enterprise B2B, sophisticated. "
        "No border, no drop shadow. Icon must remain crisp when scaled down to 16×16."
    )
    src = await gen(favicon_prompt, "favicon-source.png", "fav-gen")
    derive_variants(src)
    # Optional: remove the intermediate source
    src.unlink(missing_ok=True)


if __name__ == "__main__":
    asyncio.run(main())

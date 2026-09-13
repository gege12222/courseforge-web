#!/usr/bin/env python3
"""Verify the Hungarian double acute in the built Space Grotesk subsets.

    python -m pip install fonttools brotli pillow
    python scripts/check-fonts.py

Three checks, because glyph coverage alone is not proof:

1. Coverage — ő/ű/Ő/Ű must exist in the cmap.
2. Structural — the accent component of ő must be a *different* glyph from the accent
   component of ö (same for ű vs ü). A font that quietly maps ő onto an o-with-dieresis
   passes a naive coverage test and is wrong on screen. Note that glyph *names* are
   useless here: Google's subsets are shipped stripped, so every glyph is `glyphNNNNN`.
   Identity of the referenced component is the thing that actually tells us.
3. Visual — rasterise ő and ö with the real font and require the bitmaps to differ,
   then write docs/font-check-hungarian.png so a human can look at it.
"""

from __future__ import annotations

import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "src" / "assets" / "fonts"
OUT = ROOT / "docs" / "font-check-hungarian.png"

WEIGHTS = (500, 700)
ACCENTED = {0x0151: "ő", 0x0171: "ű", 0x0150: "Ő", 0x0170: "Ű"}
# double-acute char -> the dieresis char it must NOT be confused with
PAIRS = {"ő": "ö", "ű": "ü", "Ő": "Ö", "Ű": "Ü"}
SAMPLE = "Árvíztűrő tükörfúrógép"
ROWS = ["ő ű Ő Ű", "ö ü ó ú Ö Ü", SAMPLE, "Tervezz pontosan. Lovagolj magabiztosan."]

INK = (38, 51, 47)
MUTED = (86, 99, 95)
PAPER = (245, 247, 244)


def accent_of(glyf, cmap, char: str) -> str | None:
    """The component glyph that is not the base letter, i.e. the accent."""
    glyph = glyf[cmap[ord(char)]]
    if not glyph.isComposite():
        return None
    parts = [c.glyphName for c in glyph.components]
    base = cmap.get(ord(char.lower().translate(str.maketrans("őűöüóú", "oouoou"))))
    accents = [p for p in parts if p != base]
    return accents[-1] if accents else None


def structural_check(path: Path) -> list[str]:
    problems: list[str] = []
    font = TTFont(path)
    cmap = font.getBestCmap()

    for code, char in ACCENTED.items():
        if code not in cmap:
            problems.append(f"{char} (U+{code:04X}) is not in the cmap")

    glyf = font["glyf"] if "glyf" in font else None
    if glyf is not None:
        for double, dieresis in PAIRS.items():
            if ord(double) not in cmap or ord(dieresis) not in cmap:
                continue
            a, b = accent_of(glyf, cmap, double), accent_of(glyf, cmap, dieresis)
            if a is None or b is None:
                continue  # simple outlines; the raster check below still covers it
            if a == b:
                problems.append(
                    f"{double} and {dieresis} share accent component {a} "
                    f"— the double acute is really a dieresis"
                )
    font.close()
    return problems


def raster_check(ttf: Path) -> list[str]:
    """ő must not rasterise identically to ö (and ű to ü)."""
    problems: list[str] = []
    font = ImageFont.truetype(str(ttf), 180)
    for double, dieresis in PAIRS.items():
        renders = []
        for char in (double, dieresis):
            tile = Image.new("L", (240, 300), 255)
            ImageDraw.Draw(tile).text((30, 20), char, font=font, fill=0)
            renders.append(tile)
        a, b = renders
        differing = sum(1 for pa, pb in zip(a.getdata(), b.getdata()) if abs(pa - pb) > 24)
        if differing < 40:
            problems.append(
                f"{double} rasterises the same as {dieresis} ({differing} differing pixels)"
            )
    return problems


def as_ttf(path: Path, work: Path) -> Path:
    font = TTFont(path)
    font.flavor = None
    target = work / (path.stem + ".ttf")
    font.save(target)
    font.close()
    return target


def main() -> None:
    problems: list[str] = []
    work = Path(tempfile.mkdtemp(prefix="cf-fontcheck-"))
    ttfs: dict[int, Path] = {}

    for weight in WEIGHTS:
        source = FONTS / f"space-grotesk-{weight}-latin-ext.woff2"
        if not source.exists():
            sys.exit(f"missing {source} — run scripts/build-fonts.py first")
        ttfs[weight] = as_ttf(source, work)
        found = structural_check(source) + raster_check(ttfs[weight])
        print(
            f"weight {weight}: "
            + ("OK — double acute is distinct from dieresis" if not found else "PROBLEMS")
        )
        for line in found:
            print(f"  - {line}")
        problems.extend(found)

    width, pad = 1500, 56
    image = Image.new("RGB", (width, 1060), PAPER)
    draw = ImageDraw.Draw(image)
    y = pad

    for weight in WEIGHTS:
        label = ImageFont.truetype(str(ttfs[500]), 26)
        draw.text((pad, y), f"Space Grotesk {weight} — self-hosted subset", font=label, fill=MUTED)
        y += 48
        big = ImageFont.truetype(str(ttfs[weight]), 132)
        draw.text((pad, y), ROWS[0], font=big, fill=INK)
        y += 168
        mid = ImageFont.truetype(str(ttfs[weight]), 92)
        draw.text((pad, y), ROWS[1], font=mid, fill=INK)
        y += 122
        body = ImageFont.truetype(str(ttfs[weight]), 54)
        draw.text((pad, y), ROWS[2], font=body, fill=INK)
        y += 76
        small = ImageFont.truetype(str(ttfs[weight]), 34)
        draw.text((pad, y), ROWS[3], font=small, fill=MUTED)
        y += 82

    OUT.parent.mkdir(parents=True, exist_ok=True)
    image.crop((0, 0, width, min(y + pad, image.height))).save(OUT)
    print(f"\nwrote {OUT.relative_to(ROOT)}")

    if problems:
        sys.exit("double-acute verification FAILED")
    print("double-acute verification passed")


if __name__ == "__main__":
    main()

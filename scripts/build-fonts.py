#!/usr/bin/env python3
"""Build the self-hosted Space Grotesk subset used by the website.

Run locally, not on Cloudflare — the outputs in src/assets/fonts/ are committed.

    python -m pip install fonttools brotli
    python scripts/build-fonts.py

Why this exists instead of just using @fontsource's files directly: Fontsource ships
Space Grotesk pre-split into `latin`, `latin-ext` and `vietnamese` files and its CSS
omits `unicode-range`, so two @font-face rules for the same weight would fight rather
than compose. Hungarian needs ő (U+0151) and ű (U+0171), which live in `latin-ext`.
Merging the two subsets per weight gives one file, one preload, and no chance of a
word being split across two downloads.

Coverage: Basic Latin + Latin-1 Supplement (U+0000–00FF) + Latin Extended-A
(U+0100–017F) + the typographic punctuation the site actually uses.
"""

from __future__ import annotations

import shutil
import sys
import tempfile
from pathlib import Path

from fontTools.merge import Merger
from fontTools.subset import Subsetter, Options
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "node_modules" / "@fontsource" / "space-grotesk" / "files"
OUTPUT = ROOT / "src" / "assets" / "fonts"

WEIGHTS = (500, 700)
SUBSETS = ("latin", "latin-ext")

# Latin + Latin Extended-A, plus punctuation used in UI copy and app strings
# (· in "Meters · imperial", × in "50 m × 60 m", curly quotes, en/em dash, ellipsis, €).
UNICODES = "U+0000-00FF,U+0100-017F,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+20AC,U+2212"

# Must be present in every output file or the build fails loudly.
REQUIRED = "AaBbZz0123456789 áÁéÉíÍóÓöÖőŐúÚüÜűŰ·×—’“”"


def unicode_list(spec: str) -> list[int]:
    values: list[int] = []
    for part in spec.split(","):
        part = part.strip().removeprefix("U+")
        if "-" in part:
            start, end = part.split("-")
            values.extend(range(int(start, 16), int(end, 16) + 1))
        else:
            values.append(int(part, 16))
    return values


def build(weight: int, work: Path) -> Path:
    stages = []
    for subset in SUBSETS:
        source = SOURCE / f"space-grotesk-{subset}-{weight}-normal.woff2"
        if not source.exists():
            sys.exit(f"missing source font: {source}\nrun `npm install` first")
        font = TTFont(source)
        font.flavor = None  # decompress woff2 -> plain sfnt so the merger can read it
        stage = work / f"{subset}-{weight}.ttf"
        font.save(stage)
        font.close()
        stages.append(str(stage))

    merged_path = work / f"merged-{weight}.ttf"
    merger = Merger()
    merged = merger.merge(stages)
    merged.save(merged_path)
    merged.close()

    font = TTFont(merged_path)
    options = Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.recalc_bounds = True
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=unicode_list(UNICODES))
    subsetter.subset(font)

    missing = [c for c in REQUIRED if ord(c) not in font.getBestCmap()]
    if missing:
        sys.exit(f"weight {weight} is missing required glyphs: {missing!r}")

    # A TTF copy for build-time rendering only (OG images go through CanvasKit,
    # which cannot read woff2). Never served to a browser.
    font.flavor = None
    ttf_target = OUTPUT / "og" / f"space-grotesk-{weight}.ttf"
    ttf_target.parent.mkdir(parents=True, exist_ok=True)
    font.save(ttf_target)

    font.flavor = "woff2"
    target = OUTPUT / f"space-grotesk-{weight}-latin-ext.woff2"
    font.save(target)
    font.close()
    return target


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix="cf-fonts-"))
    try:
        for weight in WEIGHTS:
            target = build(weight, work)
            print(f"{target.relative_to(ROOT)}  {target.stat().st_size / 1024:.1f} kB")
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Export optimized copies of every photo in originals/.

- originals/ is never modified.
- Exports land in output/. Metadata, including GPS, is stripped.
- Each photo gets WebP at 480, 800, 1200, and 1800 (never wider than the
  file) plus one JPEG fallback named {slug}-{width}.jpg.
- output/manifest.json lists the widths so photos.ts can be updated by hand.
  This script does not edit photos.ts.

Usage, from the repo root:  python3 make-images/make-images.py
Needs:  Pillow  (pip install Pillow)
"""
import json
import os
import re
import sys

from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "originals")
OUT = os.path.join(HERE, "output")
WIDTHS = [480, 800, 1200, 1800]
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}


def slug_for(filename):
    stem = os.path.splitext(filename)[0].lower()
    slug = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
    if not slug:
        raise SystemExit(f"Cannot name an export for {filename}")
    return slug


def to_rgb(im):
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        im = im.convert("RGBA")
        background = Image.new("RGB", im.size, (255, 255, 255))
        background.paste(im, mask=im.getchannel("A"))
        return background
    return im.convert("RGB")


def sources():
    if not os.path.isdir(SRC):
        raise SystemExit(f"Missing {SRC}")
    found = []
    for name in sorted(os.listdir(SRC)):
        path = os.path.join(SRC, name)
        if not os.path.isfile(path):
            continue
        if name.startswith("."):
            continue
        if os.path.splitext(name)[1].lower() not in EXTENSIONS:
            continue
        found.append((name, path))
    return found


def main():
    files = sources()
    if not files:
        print(f"No images in {SRC}")
        return 0

    os.makedirs(OUT, exist_ok=True)
    used = {}
    manifest = {}

    for name, path in files:
        slug = slug_for(name)
        if slug in used:
            raise SystemExit(f"{name} and {used[slug]} would both export as {slug}")
        used[slug] = name

        im = to_rgb(Image.open(path))
        w, h = im.size
        made = []
        for tw in WIDTHS:
            if tw > w and tw != WIDTHS[0]:
                continue
            tw2 = min(tw, w)
            resized = im.resize((tw2, round(h * tw2 / w)), Image.Resampling.LANCZOS)
            resized.save(os.path.join(OUT, f"{slug}-{tw2}.webp"), "WEBP", quality=78, method=6)
            made.append(tw2)

        fallback = min(1200, w)
        im.resize((fallback, round(h * fallback / w)), Image.Resampling.LANCZOS).save(
            os.path.join(OUT, f"{slug}-{fallback}.jpg"),
            "JPEG",
            quality=80,
            optimize=True,
            progressive=True,
        )
        manifest[slug] = {
            "file": name,
            "widths": made,
            "size": [w, h],
            "fallback": fallback,
        }
        print(f"{slug:28s} {w}x{h}  webp {made}  jpg {fallback}  from {name}")

    with open(os.path.join(OUT, "manifest.json"), "w") as handle:
        json.dump(manifest, handle, indent=1)
        handle.write("\n")
    print(f"{len(manifest)} photo(s) → {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

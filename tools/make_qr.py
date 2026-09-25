#!/usr/bin/env python3
"""Make QR codes for a tutorial's link, to paste into Canvas and onto slides.

    python3 tools/make_qr.py t1      # docs/t1/qr.png and docs/t1/qr.svg
    python3 tools/make_qr.py index   # docs/qr.png and docs/qr.svg for the landing page

qr.png is the plain code, for Canvas: upload it and type the caption in Canvas.
qr.svg adds the tutorial's name and its link underneath, for slides.
Both are black on white with the standard white margin, which scans most reliably.
Needs segno (pip install -r tools/requirements.txt).
"""
import re
import sys
from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape

import segno

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
BASE_URL = "https://batu-uchicago.github.io/bayes-tutorials/"
BORDER = 4  # modules of white margin (the QR standard's quiet zone)


def target(name):
    """Return (folder, url, label) for 'index' or a tutorial id like 't1'."""
    if name == "index":
        return DOCS, BASE_URL, "Weekly tutorials"
    if not re.fullmatch(r"t\d+", name):
        sys.exit(f"usage: python3 tools/make_qr.py <index | t1 | t2 | ...>, not {name!r}")
    folder = DOCS / name
    lesson = folder / "lesson.js"
    if not lesson.exists():
        sys.exit(f"no {lesson.relative_to(ROOT)}; write the tutorial first")
    title = re.search(r'\btitle:\s*"([^"]+)"', lesson.read_text(encoding="utf-8"))
    label = f"Tutorial {name[1:]}" + (f": {title.group(1)}" if title else "")
    return folder, f"{BASE_URL}{name}/", label


def labelled_svg(qr, label, url):
    """The QR code with the label and the link printed underneath, as one SVG."""
    buf = BytesIO()
    qr.save(buf, kind="svg", scale=1, border=BORDER, xmldecl=False, svgns=True, nl=False, omitsize=True)
    inner = buf.getvalue().decode("utf-8")
    modules = int(re.search(r'viewBox="0 0 (\d+) \d+"', inner).group(1))
    path = re.search(r"<path[^>]*/>", inner).group(0)
    scale = 8
    size = modules * scale
    width, height = max(size, 360), size + 64
    x0 = (width - size) // 2
    font = "Fraunces, Georgia, 'Times New Roman', serif"
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" role="img" aria-label="{escape(label)}: {escape(url)}">'
        f'<rect width="{width}" height="{height}" fill="#fff"/>'
        f'<g transform="translate({x0} 0) scale({scale})">{path}</g>'
        f'<text x="{width / 2}" y="{size + 18}" text-anchor="middle" font-family="{font}" font-size="17" fill="#000">{escape(label)}</text>'
        f'<text x="{width / 2}" y="{size + 44}" text-anchor="middle" font-family="{font}" font-size="14" fill="#333">{escape(url.replace("https://", ""))}</text>'
        "</svg>\n"
    )


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: python3 tools/make_qr.py <index | t1 | t2 | ...>")
    folder, url, label = target(sys.argv[1])
    qr = segno.make(url, error="m", micro=False)
    png, svg = folder / "qr.png", folder / "qr.svg"
    qr.save(png, kind="png", scale=12, border=BORDER, dark="#000", light="#fff")
    svg.write_text(labelled_svg(qr, label, url), encoding="utf-8")
    print(f"{label}: {url}")
    print(f"wrote {png.relative_to(ROOT)} and {svg.relative_to(ROOT)} (QR version {qr.version}, error level {qr.error})")


if __name__ == "__main__":
    main()

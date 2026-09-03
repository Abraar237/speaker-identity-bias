#!/usr/bin/env python3
"""Builds site/index.html by templating in the base64 figure. Keeps the huge
data URI out of the hand-edited HTML template file."""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
b64 = (ROOT / "figures" / "figure1_b64.txt").read_text().strip()
template = (ROOT / "site" / "index_template.html").read_text()
out = template.replace("__FIGURE1_B64__", b64)
(ROOT / "site" / "index.html").write_text(out)
print(f"Wrote site/index.html ({len(out)/1024:.0f} KB)")

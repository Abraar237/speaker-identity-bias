"""Per-accent paired shifts vs US for the Qwen2-Audio judge, matching
analyze.py conventions (gender-matched within item, bootstrap 10k CI,
sign-flip 20k permutation p, d_z). Writes results/qwen2audio_summary.txt.
"""
import json
import pathlib
import re
import sys

import numpy as np

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from analyze import bootstrap_ci, sign_flip_p, cohens_dz

ROOT = pathlib.Path(__file__).resolve().parents[1]
rows = [json.loads(l) for l in open(ROOT / "results" / "multijudge_qwen2audio.jsonl")
        if l.strip()]

scores = {}
n_fail = 0
for r in rows:
    if r["score"] is None:
        n_fail += 1
        continue
    m = re.match(r"(item\d+)_(\w\w)_(\w)$", r["clip"])
    if m:
        scores[(m.group(1), m.group(2), m.group(3))] = r["score"]

lines = [f"Qwen2-Audio-7B-Instruct judge, Axis A ({len(rows)} rows, {n_fail} unparsed)"]
for acc in ["uk", "in", "ng"]:
    diffs = []
    for (item, a, g), s in scores.items():
        if a == acc and (item, "us", g) in scores:
            diffs.append(s - scores[(item, "us", g)])
    if not diffs:
        lines.append(f"  {acc}: no pairs")
        continue
    ci = bootstrap_ci(diffs)
    p = sign_flip_p(diffs)
    dz = cohens_dz(diffs)
    lines.append(
        f"  {acc} vs us: mean {np.mean(diffs):+.2f}  "
        f"CI[{ci[0]:+.2f},{ci[1]:+.2f}]  p={p:.4f}  "
        f"d_z={dz:+.2f}  n={len(diffs)}"
    )

out = ROOT / "results" / "qwen2audio_summary.txt"
out.write_text("\n".join(lines) + "\n")
print("\n".join(lines))

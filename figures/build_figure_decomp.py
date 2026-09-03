#!/usr/bin/env python3
"""Decomposition figure: the Indian-accent shift by grading mode, Gemini 3.1 Pro.
The paper's central mechanism result. Numbers come only from results/analysis.json."""

import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import style  # noqa: E402
import matplotlib.pyplot as plt  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[1]
ANALYSIS = ROOT / "results" / "analysis.json"
OUT = ROOT / "figures" / "figure2_decomposition.png"

MODES = [
    ("audio_in_vs_us", "end-to-end\naudio", style.PALETTE["hot"]),
    ("own_transcript_in_vs_us", "judge's own\ntranscript", style.PALETTE["slate"]),
    ("gold_transcript_in_vs_us", "frozen gold\ntranscript", style.PALETTE["good"]),
]


def main():
    style.setup()
    data = json.loads(ANALYSIS.read_text())["decomposition"]["gemini-3.1-pro-preview"]

    fig, ax = plt.subplots(figsize=(6.3, 3.0))
    style.strip_frame(ax)
    style.eyebrow(ax, "Indian-accent shift by grading mode, Gemini 3.1 Pro")

    drawn = []
    for x, (key, label, color) in enumerate(MODES):
        e = data[key]
        lo, hi = e["ci95"]
        mean = e["mean_shift"]
        p = e["p_sign_flip"]
        sig = p < 0.01
        ax.plot([x, x], [lo, hi], color=color, lw=3.0 if sig else 2.2,
                solid_capstyle="round", alpha=1.0 if sig else 0.7, zorder=3)
        ax.scatter([x], [mean], color=color, s=90 if sig else 60,
                   edgecolor=style.PALETTE["surface"], linewidth=1.3, zorder=4)
        ptxt = f"p={p:.3f}" if p >= 0.001 else "p<0.001"
        ax.text(x + 0.09, mean, f"{mean:+.2f}  ({ptxt})", fontsize=8.6,
                color=style.PALETTE["ink"] if sig else style.PALETTE["muted"],
                va="center")
        drawn.append((key, mean, lo, hi, p, e["n"]))

    ax.axhline(0, color=style.PALETTE["faint"], lw=1.0, ls=(0, (4, 3)), zorder=1)
    ax.text(2.42, 0.12, "no shift", color=style.PALETTE["faint"], fontsize=8,
            ha="right", va="bottom")

    ax.annotate("the penalty lives in the acoustic channel;\ntranscript grading removes it",
                xy=(0.1, -3.4), xytext=(0.62, -4.15), fontsize=8.8,
                color=style.PALETTE["ink2"], ha="left",
                arrowprops=dict(arrowstyle="-", color=style.PALETTE["faint"], lw=0.8))

    ax.set_xticks(range(len(MODES)))
    ax.set_xticklabels([m[1] for m in MODES], fontsize=9.2, color=style.PALETTE["ink2"])
    ax.set_ylabel("score shift, Indian minus US accent", fontsize=9.5)
    ax.set_xlim(-0.45, 2.55)
    ax.set_ylim(-4.6, 4.6)

    fig.tight_layout()
    fig.savefig(OUT, dpi=300, bbox_inches="tight")
    print(f"Wrote {OUT}")
    for row in drawn:
        print(row)


if __name__ == "__main__":
    main()

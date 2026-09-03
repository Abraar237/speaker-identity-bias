#!/usr/bin/env python3
"""Delivery-arm figure: five perturbations x two judges x two prompt arms,
all null at this sample size. Honest wide-CI presentation. Numbers come only
from results/analysis.json."""

import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import style  # noqa: E402
import matplotlib.pyplot as plt  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[1]
ANALYSIS = ROOT / "results" / "analysis.json"
OUT = ROOT / "figures" / "figure3_delivery.png"

CONDS = [
    ("um_vs_clean", "filled pauses"),
    ("slow_vs_clean", "slowed 0.85x"),
    ("fast_vs_clean", "sped 1.25x"),
    ("tel_vs_clean", "telephone 8kHz"),
    ("noise_vs_clean", "pink noise 10dB"),
]
JUDGES = [
    ("gemini-3.1-pro-preview", "Gemini 3.1 Pro", style.PALETTE["hot"]),
    ("gemini-3.6-flash", "Gemini 3.6 Flash", style.PALETTE["slate"]),
]
ARMS = [("neutral", "o"), ("ignore-delivery", "D")]


def main():
    style.setup()
    data = json.loads(ANALYSIS.read_text())["axis_b"]

    fig, axes = plt.subplots(1, 2, figsize=(6.3, 3.1), sharey=True)
    drawn = []
    for ax, (jkey, jlabel, color) in zip(axes, JUDGES):
        style.strip_frame(ax)
        ax.text(0.0, 1.05, jlabel.upper(), transform=ax.transAxes, fontsize=9,
                color=color, ha="left", va="bottom")
        for ci_, (ckey, clabel) in enumerate(CONDS):
            for ai, (arm, marker) in enumerate(ARMS):
                e = data[jkey][arm][ckey]
                lo, hi = e["ci95"]
                mean = e["mean_shift"]
                x = ci_ + (-0.16 if ai == 0 else 0.16)
                ax.plot([x, x], [lo, hi], color=color, lw=1.8, alpha=0.5,
                        solid_capstyle="round", zorder=3)
                ax.scatter([x], [mean], color=color, s=34, marker=marker,
                           edgecolor=style.PALETTE["surface"], linewidth=1.0,
                           alpha=0.9, zorder=4)
                drawn.append((jkey, arm, ckey, mean, lo, hi, e["p_sign_flip"], e["n"]))
        ax.axhline(0, color=style.PALETTE["faint"], lw=1.0, ls=(0, (4, 3)), zorder=1)
        ax.set_xticks(range(len(CONDS)))
        ax.set_xticklabels([c[1] for c in CONDS], fontsize=7.6,
                           color=style.PALETTE["ink2"], rotation=18, ha="right")
        ax.set_ylim(-9.5, 8.5)

    axes[0].set_ylabel("score shift vs clean baseline", fontsize=9.5)
    axes[0].scatter([], [], marker="o", color=style.PALETTE["muted"], s=30, label="neutral rubric")
    axes[0].scatter([], [], marker="D", color=style.PALETTE["muted"], s=30, label="ignore-delivery rubric")
    # direct key text instead of a legend box
    axes[1].text(0.98, 0.06,
                 "circles: neutral rubric\ndiamonds: ignore-delivery rubric",
                 transform=axes[1].transAxes, fontsize=7.8,
                 color=style.PALETTE["muted"], ha="right", va="bottom")
    axes[0].text(0.02, 0.05,
                 "every interval spans zero:\ninconclusive at n≈21-24, not proof of no effect",
                 transform=axes[0].transAxes, fontsize=8.2,
                 color=style.PALETTE["ink2"], ha="left", va="bottom")

    fig.tight_layout(w_pad=1.4)
    fig.savefig(OUT, dpi=300, bbox_inches="tight")
    print(f"Wrote {OUT}")
    for row in drawn:
        print(row)


if __name__ == "__main__":
    main()

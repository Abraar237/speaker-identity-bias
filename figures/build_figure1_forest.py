#!/usr/bin/env python3
"""Figure 1: accent-shift forest plot, gender-matched vs US baseline, both judges.
Data comes only from results/analysis.json (the scripted analysis output) -- this
script draws numbers, it never invents them."""

import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import style  # noqa: E402
import matplotlib.pyplot as plt  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[1]
ANALYSIS = ROOT / "results" / "analysis.json"
OUT = ROOT / "figures" / "figure1_accent_forest.png"

JUDGES = [
    ("gemini-3.1-pro-preview", "Gemini 3.1 Pro", style.PALETTE["hot"]),
    ("gemini-3.6-flash", "Gemini 3.6 Flash", style.PALETTE["slate"]),
]
ACCENTS = [("accent_uk_vs_us", "UK"), ("accent_in_vs_us", "Indian"), ("accent_ng_vs_us", "Nigerian")]


def main():
    style.setup()
    data = json.loads(ANALYSIS.read_text())

    fig, ax = plt.subplots(figsize=(6.3, 3.0))
    style.strip_frame(ax)
    style.eyebrow(ax, "Axis A · accent shift vs US baseline, gender-matched")

    y = 0
    yticks, yticklabels = [], []
    drawn = []
    for accent_key, accent_label in ACCENTS:
        for judge_key, judge_label, color in JUDGES:
            entry = data["axis_a"].get(judge_key, {}).get("neutral", {}).get(accent_key)
            if not entry:
                continue
            lo, hi = entry["ci95"]
            mean = entry["mean_shift"]
            p = entry["p_sign_flip"]
            sig = p < 0.01
            ax.plot([lo, hi], [y, y], color=color, lw=2.2, solid_capstyle="round",
                    alpha=1.0 if sig else 0.55, zorder=3)
            ax.scatter([mean], [y], color=color, s=85 if sig else 55,
                       edgecolor=style.PALETTE["surface"], linewidth=1.2, zorder=4)
            label = f"{judge_label}"
            if sig:
                label += f"  (p={p:.3f})"
            ax.text(hi + 0.35, y, label, va="center", fontsize=8.6,
                    color=style.PALETTE["ink"] if sig else style.PALETTE["muted"])
            yticks.append(y)
            yticklabels.append(accent_label if judge_key == JUDGES[0][0] else "")
            drawn.append((accent_label, judge_label, mean, lo, hi, p))
            y -= 1
        y -= 0.4

    ax.axvline(0, color=style.PALETTE["faint"], lw=1.0, ls=(0, (4, 3)), zorder=1)
    ax.text(0, y + 0.2, "no shift", color=style.PALETTE["faint"], fontsize=8,
            ha="center", va="top")

    accent_positions = {}
    for i, (accent_label, judge_label, *_ ) in enumerate(drawn):
        accent_positions.setdefault(accent_label, []).append(yticks[i])
    ax.set_yticks([sum(v) / len(v) for v in accent_positions.values()])
    ax.set_yticklabels(list(accent_positions.keys()), fontsize=9.5, color=style.PALETTE["ink2"])

    ax.set_xlabel("score shift, accent minus US baseline (0-100 scale)", fontsize=9.5)
    ax.set_xlim(-6, 9)
    ax.set_ylim(y - 0.3, 1.3)
    ax.set_yticks(ax.get_yticks())

    fig.tight_layout()
    fig.savefig(OUT, dpi=300, bbox_inches="tight")
    print(f"Wrote {OUT}")
    for row in drawn:
        print(row)


if __name__ == "__main__":
    main()

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
    ("qwen2-audio-7b", "Qwen2-Audio-7B", style.PALETTE["good"]),
]
ACCENTS = [("accent_uk_vs_us", "UK"), ("accent_in_vs_us", "Indian"), ("accent_ng_vs_us", "Nigerian")]
# Benjamini-Hochberg survivors across all nine accent-judge tests (see paper §4.1)
BH_SURVIVORS = {("Gemini 3.1 Pro", "Indian"), ("Qwen2-Audio-7B", "UK"), ("Qwen2-Audio-7B", "Nigerian")}
QWEN_JSONL = ROOT / "results" / "multijudge_qwen2audio.jsonl"


def qwen_entries():
    """Compute Qwen2-Audio shifts from the raw judgments with the same seeds as
    results/qwen2audio_summary.txt so every number matches the shipped summary."""
    import random, re, statistics as st
    from collections import defaultdict
    rows = [json.loads(l) for l in open(QWEN_JSONL)]
    by = defaultdict(dict)
    for r in rows:
        m = re.match(r"(item\d+)_(\w\w)_(\w)$", r["clip"])
        if m and r["score"] is not None:
            by[(m.group(1), m.group(3))][m.group(2)] = r["score"]
    out = {}
    for key, acc in [("accent_uk_vs_us", "uk"), ("accent_in_vs_us", "in"), ("accent_ng_vs_us", "ng")]:
        d = [v[acc] - v["us"] for v in by.values() if acc in v and "us" in v]
        random.seed(7)
        bs = sorted(st.mean(random.choices(d, k=len(d))) for _ in range(10000))
        random.seed(11)
        obs = abs(sum(d))
        hits = sum(1 for _ in range(20000) if abs(sum(x * random.choice((1, -1)) for x in d)) >= obs)
        out[key] = {"mean_shift": st.mean(d), "ci95": [bs[250], bs[9750]],
                    "p_sign_flip": (hits + 1) / 20001}
    return out


def main():
    style.setup()
    data = json.loads(ANALYSIS.read_text())
    qwen_data = qwen_entries()

    fig, ax = plt.subplots(figsize=(6.3, 3.6))
    style.strip_frame(ax)
    style.eyebrow(ax, "Accent shift vs US baseline, gender-matched")

    y = 0
    yticks, yticklabels = [], []
    drawn = []
    for accent_key, accent_label in ACCENTS:
        for judge_key, judge_label, color in JUDGES:
            if judge_key == "qwen2-audio-7b":
                entry = qwen_data.get(accent_key)
            else:
                entry = data["axis_a"].get(judge_key, {}).get("neutral", {}).get(accent_key)
            if not entry:
                continue
            lo, hi = entry["ci95"]
            mean = entry["mean_shift"]
            p = entry["p_sign_flip"]
            sig = (judge_label, accent_label) in BH_SURVIVORS
            ax.plot([lo, hi], [y, y], color=color, lw=3.0 if sig else 2.2, solid_capstyle="round",
                    alpha=1.0 if sig else 0.55, zorder=3)
            if sig:
                ax.scatter([mean], [y], color=color, s=85,
                           edgecolor=style.PALETTE["surface"], linewidth=1.2, zorder=4)
            else:
                ax.scatter([mean], [y], facecolor=style.PALETTE["surface"], s=55,
                           edgecolor=color, linewidth=1.4, zorder=4)
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

    ax.annotate("one family penalises,\none is null, one rewards",
                xy=(-2.5, -3.35), xytext=(-6.1, -6.2), fontsize=8.6,
                color=style.PALETTE["ink2"], ha="left",
                arrowprops=dict(arrowstyle="-", color=style.PALETTE["faint"], lw=0.8))
    ax.axvline(0, color=style.PALETTE["faint"], lw=1.0, ls=(0, (4, 3)), zorder=1)
    ax.text(0, y + 0.55, "no shift", color=style.PALETTE["faint"], fontsize=8,
            ha="center", va="top")

    accent_positions = {}
    for i, (accent_label, judge_label, *_ ) in enumerate(drawn):
        accent_positions.setdefault(accent_label, []).append(yticks[i])
    ax.set_yticks([sum(v) / len(v) for v in accent_positions.values()])
    ax.set_yticklabels(list(accent_positions.keys()), fontsize=9.5, color=style.PALETTE["ink2"])

    ax.set_xlabel("score shift, accent minus US baseline (0-100 scale)", fontsize=9.5)
    ax.set_xlim(-6.4, 6.4)
    ax.set_ylim(y + 0.15, 1.3)
    ax.set_yticks(ax.get_yticks())

    fig.tight_layout()
    fig.savefig(OUT, dpi=300, bbox_inches="tight")
    print(f"Wrote {OUT}")
    for row in drawn:
        print(row)


if __name__ == "__main__":
    main()

"""Figure: the Indian-accent shift is a property of the voice, not the accent.
Per-voice Indian-vs-US shifts computed directly from results/multivoice_*.jsonl
(6 new voices, n=12 item-gender pairs each) plus the original single-voice arm
(Charon/Kore pair, n=48) read from results/analysis.json. Every drawn number
is printed for verification."""
import json, re, pathlib, statistics as st
from collections import defaultdict
import matplotlib.pyplot as plt
import style
from style import PALETTE

style.setup()
HERE = pathlib.Path(__file__).parent
RES = HERE.parent / "results"

A = json.load(open(RES / "analysis.json"))

def per_voice(path):
    by = defaultdict(dict)
    for line in open(path):
        r = json.loads(line)
        if r.get("score") is None:
            continue
        clip = r.get("clip") or r.get("clip_id") or r.get("item_condition", "")
        m = re.match(r"(item\d+)_(\w\w)_(m|f)_([A-Za-z]+)", clip)
        if m:
            by[(m.group(1), m.group(3), m.group(4))][m.group(2)] = r["score"]
    pv = defaultdict(list)
    for (it, g, v), accs in by.items():
        if "in" in accs and "us" in accs:
            pv[v].append(accs["in"] - accs["us"])
    return {v: (st.mean(d), len(d)) for v, d in pv.items()}

pro_new = per_voice(RES / "multivoice_pro.jsonl")
flash_new = per_voice(RES / "multivoice_flash.jsonl")
pro_orig = A["axis_a"]["gemini-3.1-pro-preview"]["neutral"]["accent_in_vs_us"]["mean_shift"]
flash_orig = A["axis_a"]["gemini-3.6-flash"]["neutral"]["accent_in_vs_us"]["mean_shift"]

VOICES = ["Charon/Kore\n(original arm)", "Aoede", "Fenrir", "Leda", "Orus", "Puck", "Zephyr"]
order = ["Aoede", "Fenrir", "Leda", "Orus", "Puck", "Zephyr"]

fig, axes = plt.subplots(1, 2, figsize=(6.3, 2.9), sharey=True)
for ax, data, orig, name in [(axes[0], pro_new, pro_orig, "Gemini 3.1 Pro"),
                             (axes[1], flash_new, flash_orig, "Gemini 3.6 Flash")]:
    ys = range(len(VOICES) - 1, -1, -1)
    vals = [orig] + [data[v][0] for v in order]
    for y, v, label in zip(ys, vals, VOICES):
        col = PALETTE["hot"] if label.startswith("Charon") else PALETTE["slate"]
        marker = "s" if label.startswith("Charon") else "o"
        ax.plot([v], [y], marker, ms=7, color=col, mec=PALETTE["surface"], mew=1.2, zorder=4)
        print("fig-multivoice", name, label.split("\n")[0], round(v, 2))
    ax.axvline(0, color=PALETTE["faint"], lw=0.9, ls="--", zorder=1)
    ax.set_yticks(list(ys))
    ax.set_yticklabels(VOICES, fontsize=8.4, color=PALETTE["ink2"])
    ax.set_xlim(-5.4, 5.4)
    ax.set_title(name, fontsize=9.5, color=PALETTE["ink2"])
    ax.spines[["top", "right"]].set_visible(False)
    ax.set_xlabel("Indian $-$ American shift (points)")
axes[0].annotate("the original pair's penalty\nis the outlier, not the rule",
                 xy=(-2.5, 6), xytext=(-5.1, 3.7), fontsize=8, color=PALETTE["ink2"],
                 arrowprops=dict(arrowstyle="-", color=PALETTE["faint"], lw=0.8))
axes[1].annotate("per-voice swings dwarf\nany accent-level effect",
                 xy=(4.17, 4.95), xytext=(0.6, 2.6), fontsize=8, color=PALETTE["ink2"],
                 arrowprops=dict(arrowstyle="-", color=PALETTE["faint"], lw=0.8))
fig.suptitle("SAME ACCENT INSTRUCTION, SEVEN VOICES: THE VOICE, NOT THE ACCENT, MOVES THE SCORE",
             fontsize=9, color=PALETTE["muted"], x=0.02, ha="left", y=1.0)
fig.tight_layout(rect=[0, 0, 1, 0.95])
out = HERE / "figure4_multivoice.png"
fig.savefig(out, dpi=300, bbox_inches="tight")
print("wrote", out)

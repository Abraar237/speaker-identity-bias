"""Figure: real speech (L2-ARCTIC), per-L1 shift vs gender-matched native
baseline under three judges. Values parsed directly from the shipped summary
files so the figure cannot drift from the reported numbers."""
import pathlib, re
import matplotlib.pyplot as plt
import style
from style import PALETTE

style.setup()
HERE = pathlib.Path(__file__).parent
RES = HERE.parent / "results"

L1S = ["hindi", "korean", "spanish", "arabic", "mandarin", "vietnamese"]


def parse_gemini(path):
    out = {"PRO": {}, "FLASH": {}}
    cur = None
    for line in open(path):
        if "PRO real speech" in line:
            cur = "PRO"
        elif "FLASH real speech" in line:
            cur = "FLASH"
        m = re.match(r"\s+(\w+)\s+([+-]\d+\.\d+) CI\[([+-]\d+\.\d+),([+-]\d+\.\d+)\]", line)
        if m and cur and m.group(1) in L1S:
            out[cur][m.group(1)] = (float(m.group(2)), float(m.group(3)), float(m.group(4)))
    return out


def parse_qwen(path):
    out = {}
    for line in open(path):
        m = re.match(r"Qwen2-Audio (\w+)\s+vs native:\s+([+-]\d+\.\d+) CI\[([+-]\d+\.\d+),([+-]\d+\.\d+)\]", line)
        if m:
            out[m.group(1)] = (float(m.group(2)), float(m.group(3)), float(m.group(4)))
    return out


g = parse_gemini(RES / "l2arctic_gemini_summary.txt")
q = parse_qwen(RES / "l2arctic_qwen2audio_summary.txt")

fig, ax = plt.subplots(figsize=(6.3, 3.0))
series = [("Gemini 3.1 Pro", g["PRO"], PALETTE["hot"], -0.22),
          ("Gemini 3.6 Flash", g["FLASH"], PALETTE["slate"], 0.0),
          ("Qwen2-Audio-7B", q, PALETTE["good"], 0.22)]
for name, data, col, off in series:
    for i, l1 in enumerate(L1S):
        mval, lo, hi = data[l1]
        y = len(L1S) - 1 - i + off
        ax.plot([lo, hi], [y, y], color=col, lw=1.8, zorder=3, alpha=0.9)
        ax.plot([mval], [y], "o", ms=5.5, color=col, mec=PALETTE["surface"], mew=1.0, zorder=4)
        print("fig-l2arctic", name, l1, mval, lo, hi)

ax.axvline(0, color=PALETTE["faint"], lw=0.9, ls="--", zorder=1)
ax.set_yticks(range(len(L1S) - 1, -1, -1))
ax.set_yticklabels([l.capitalize() for l in L1S], fontsize=9, color=PALETTE["ink2"])
ax.set_xlabel("shift vs gender-matched native voices (points, read-aloud rubric)")
ax.set_xlim(-23, 5)
ax.spines[["top", "right"]].set_visible(False)
for i, (name, data, col, off) in enumerate(series):
    ax.text(-22.6, 0.9 - i * 0.55, name, fontsize=8.2, color=col, ha="left", va="center")
ax.annotate("both Gemini judges agree;\nQwen2-Audio, on its compressed\nscale, barely reacts",
            xy=(-1.25, 3.22), xytext=(-9.5, 1.4), fontsize=8, color=PALETTE["ink2"],
            arrowprops=dict(arrowstyle="-", color=PALETTE["faint"], lw=0.8))
style.eyebrow(ax, "Real speech: every non-native L1 is penalised, hardest for Mandarin and Vietnamese")
fig.tight_layout()
out = HERE / "figure5_l2arctic.png"
fig.savefig(out, dpi=300, bbox_inches="tight")
print("wrote", out)

"""Axis A-prime analysis for the Qwen2-Audio judge: per-L1 shifts vs the
gender-matched native-English baseline on the same 8 sentences.
Unit: per L2 clip, its score minus the mean of same-gender native scores for
the same sentence; aggregated per L1 with bootstrap CI (10k) and sign-flip
permutation p (20k). Writes results/l2arctic_qwen2audio_summary.txt.
"""
import json, pathlib, random, statistics as st
from collections import defaultdict

HERE = pathlib.Path(__file__).parent
RES = HERE.parent / "results"
IN = RES / "l2arctic_qwen2audio.jsonl"
OUT = RES / "l2arctic_qwen2audio_summary.txt"

rows = [json.loads(l) for l in open(IN) if l.strip()]
ok = [r for r in rows if r.get("score") is not None]

# clip = {speaker}_{L1}_{gender}_{sid}
native = defaultdict(list)   # (gender, sid) -> scores
l2 = defaultdict(list)       # (L1, speaker, gender, sid) -> score
for r in ok:
    spk, l1, g, sid = r["clip"].split("_", 3)
    if l1 == "eng":
        native[(g, sid)].append(r["score"])
    else:
        l2[(l1, spk, g, sid)] = r["score"]

def perm_p(diffs, n=20000):
    random.seed(11)
    obs = abs(sum(diffs))
    hits = sum(1 for _ in range(n)
               if abs(sum(d * random.choice((1, -1)) for d in diffs)) >= obs)
    return (hits + 1) / (n + 1)

lines = [f"{len(ok)}/{len(rows)} clips scored; native baseline cells: {len(native)}"]
by_l1 = defaultdict(list)
for (l1, spk, g, sid), s in l2.items():
    base = native.get((g, sid))
    if base:
        by_l1[l1].append(s - st.mean(base))
for l1 in sorted(by_l1):
    d = by_l1[l1]
    random.seed(7)
    bs = sorted(st.mean(random.choices(d, k=len(d))) for _ in range(10000))
    lines.append(f"Qwen2-Audio {l1:10s} vs native: {st.mean(d):+6.2f} "
                 f"CI[{bs[250]:+.2f},{bs[9750]:+.2f}] p={perm_p(d):.4f} n={len(d)}")
scores = [r["score"] for r in ok]
lines.append(f"score dist: mean {st.mean(scores):.1f} min {min(scores)} max {max(scores)} unique {len(set(scores))}")
OUT.write_text("\n".join(lines) + "\n")
print("\n".join(lines))

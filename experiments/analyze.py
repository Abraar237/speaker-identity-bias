#!/usr/bin/env python3
"""CP3 analysis: the ONE script every number in the paper must trace back to.

Reads results/*.jsonl (judge_runner.py output), computes within-item score shifts
vs a reference condition, with bootstrap 95% CIs, two-sided sign-flip permutation
tests, and paired effect size d_z — exactly the script-bias predecessor's method.

Axis A: shift = score(accent, gender) - score(us, gender), per item, per judge,
per prompt_arm. Gender-matched so accent shift isn't confounded by gender.
Axis B: shift = score(condition) - score(clean), per item, per judge, per prompt_arm.

Outputs results/analysis.json.
"""

import json
import pathlib
import random
import re
import sys

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parents[1]
RESULTS = ROOT / "results"
RESULTS.mkdir(exist_ok=True)

N_BOOT = 10000
N_PERM = 20000


def load_records():
    records = []
    for jf in RESULTS.glob("*.jsonl"):
        for line in jf.read_text().splitlines():
            if line.strip():
                records.append(json.loads(line))
    return records


def bootstrap_ci(diffs, n=N_BOOT, seed=0):
    rng = np.random.default_rng(seed)
    diffs = np.array(diffs, dtype=float)
    if len(diffs) == 0:
        return None
    boots = rng.choice(diffs, size=(n, len(diffs)), replace=True).mean(axis=1)
    return float(np.percentile(boots, 2.5)), float(np.percentile(boots, 97.5))


def sign_flip_p(diffs, n=N_PERM, seed=0):
    rng = np.random.default_rng(seed)
    diffs = np.array(diffs, dtype=float)
    if len(diffs) == 0:
        return None
    observed = abs(diffs.mean())
    signs = rng.choice([-1, 1], size=(n, len(diffs)))
    perm_means = np.abs((signs * diffs).mean(axis=1))
    return float((perm_means >= observed).mean())


def cohens_dz(diffs):
    diffs = np.array(diffs, dtype=float)
    if len(diffs) < 2 or diffs.std(ddof=1) == 0:
        return None
    return float(diffs.mean() / diffs.std(ddof=1))


def summarize(diffs):
    diffs = [d for d in diffs if d is not None]
    if not diffs:
        return None
    ci = bootstrap_ci(diffs)
    return {
        "n": len(diffs),
        "mean_shift": round(float(np.mean(diffs)), 3),
        "ci95": [round(ci[0], 3), round(ci[1], 3)] if ci else None,
        "p_sign_flip": round(sign_flip_p(diffs), 5),
        "d_z": round(cohens_dz(diffs), 3) if cohens_dz(diffs) is not None else None,
    }


def parse_item_condition(ic, axis):
    if axis == "a":
        m = re.match(r"(item\d+)_(us|uk|in|ng)_(m|f)$", ic)
        if not m:
            return None
        return {"item_id": m.group(1), "accent": m.group(2), "gender": m.group(3)}
    else:
        m = re.match(r"(item\d+)_(clean|um|slow|fast|tel|noise)$", ic)
        if not m:
            return None
        return {"item_id": m.group(1), "condition": m.group(2)}


def analyze_axis_a(records):
    out = {}
    by_key = {}  # (model, prompt_arm) -> {(item_id, accent, gender): score}
    for r in records:
        if "item_condition" not in r:
            continue
        parsed = parse_item_condition(r["item_condition"], "a")
        if not parsed or r.get("score") is None:
            continue
        key = (r["model"], r["prompt_arm"])
        by_key.setdefault(key, {})[(parsed["item_id"], parsed["accent"], parsed["gender"])] = r["score"]

    for (model, arm), scores in by_key.items():
        entry = out.setdefault(model, {}).setdefault(arm, {})
        for accent in ["uk", "in", "ng"]:
            diffs = []
            for (item_id, a, g), score in scores.items():
                if a != accent:
                    continue
                base = scores.get((item_id, "us", g))
                if base is not None:
                    diffs.append(score - base)
            s = summarize(diffs)
            if s:
                entry[f"accent_{accent}_vs_us"] = s
        # gender main effect within US accent
        diffs_gender = []
        item_ids = {k[0] for k in scores if k[1] == "us"}
        for item_id in item_ids:
            f = scores.get((item_id, "us", "f"))
            m = scores.get((item_id, "us", "m"))
            if f is not None and m is not None:
                diffs_gender.append(f - m)
        s = summarize(diffs_gender)
        if s:
            entry["gender_f_vs_m_within_us"] = s

    return out


def analyze_axis_b(records):
    out = {}
    by_key = {}
    for r in records:
        if "item_condition" not in r:
            continue
        parsed = parse_item_condition(r["item_condition"], "b")
        if not parsed or r.get("score") is None:
            continue
        key = (r["model"], r["prompt_arm"])
        by_key.setdefault(key, {})[(parsed["item_id"], parsed["condition"])] = r["score"]

    for (model, arm), scores in by_key.items():
        entry = out.setdefault(model, {}).setdefault(arm, {})
        for cond in ["um", "slow", "fast", "tel", "noise"]:
            diffs = []
            item_ids = {k[0] for k in scores if k[1] == "clean"}
            for item_id in item_ids:
                base = scores.get((item_id, "clean"))
                treat = scores.get((item_id, cond))
                if base is not None and treat is not None:
                    diffs.append(treat - base)
            s = summarize(diffs)
            if s:
                entry[f"{cond}_vs_clean"] = s

    return out


def analyze_decomp(records):
    """Compares the accent shift (in vs us, gender-matched) under three modes:
    end-to-end audio (from axis_a_* results), own-transcript, gold-transcript.
    Shrinkage from audio -> gold-transcript localizes bias in the acoustic channel."""
    out = {}
    decomp_records = [r for r in records if "mode" in r]
    audio_records = [r for r in records if "item_condition" in r]

    audio_scores = {}
    for r in audio_records:
        parsed = parse_item_condition(r["item_condition"], "a")
        if not parsed or r.get("score") is None or r["prompt_arm"] != "neutral":
            continue
        audio_scores.setdefault(r["model"], {})[(parsed["item_id"], parsed["accent"], parsed["gender"])] = r["score"]

    by_model_mode = {}
    for r in decomp_records:
        if r.get("score") is None:
            continue
        by_model_mode.setdefault(r["model"], {}).setdefault(r["mode"], {})[
            (r["item_id"], r["accent"], r["gender"])] = r["score"]

    for model in set([r["model"] for r in decomp_records]):
        entry = out.setdefault(model, {})
        modes = {"audio": audio_scores.get(model, {}), **by_model_mode.get(model, {})}
        for mode_name, scores in modes.items():
            diffs = []
            item_ids = {k[0] for k in scores if k[1] == "us"}
            for item_id in item_ids:
                for g in ["m", "f"]:
                    base = scores.get((item_id, "us", g))
                    treat = scores.get((item_id, "in", g))
                    if base is not None and treat is not None:
                        diffs.append(treat - base)
            s = summarize(diffs)
            if s:
                entry[f"{mode_name}_in_vs_us"] = s

    return out


def main():
    records = load_records()
    print(f"Loaded {len(records)} judgment records from {RESULTS}")
    if not records:
        print("No results yet — run judge_runner.py first.")
        return

    result = {
        "n_records": len(records),
        "axis_a": analyze_axis_a(records),
        "axis_b": analyze_axis_b(records),
        "decomposition": analyze_decomp(records),
    }
    out_path = RESULTS / "analysis.json"
    out_path.write_text(json.dumps(result, indent=2))
    print(f"Wrote {out_path}")
    print(json.dumps(result, indent=2)[:3000])


if __name__ == "__main__":
    main()

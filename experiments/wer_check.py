#!/usr/bin/env python3
"""CP3 step: WER-neutrality check for Axis B delivery perturbations.

Transcribes each non-baseline Axis B clip via Gemini audio input and computes
word error rate against the frozen answer text (for slow/fast/tel/noise, which
must not change recognized words) or against the disfluency-injected text (for
the 'um' condition, which is allowed to add filler words but must not change the
underlying content words).

Any condition with WER above the threshold is flagged and excluded from the
delivery-arm analysis as a failed manipulation check (a WER-changing perturbation
would confound delivery with actual content degradation).
"""

import base64
import json
import pathlib
import re
import sys
import time
import urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from cost_tracker import log_cost, check_budget  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[1]
BANK = pathlib.Path(__file__).resolve().parent / "answer_bank.json"
AXIS_B = pathlib.Path(__file__).resolve().parent / "clips" / "axis_b"
DISFLUENT = pathlib.Path(__file__).resolve().parent / "axis_b_disfluent_texts.json"
OUT = pathlib.Path(__file__).resolve().parent / "axis_b_wer.json"

KEY = next(
    line.split("=", 1)[1].strip()
    for line in (ROOT / ".env").read_text().splitlines()
    if line.startswith("GEMINI_API_KEY=")
)
MODEL = "gemini-3.6-flash"
WER_THRESHOLD = 0.05

CONDITIONS_STRICT = ["slow", "fast", "tel", "noise"]  # must match frozen text exactly


def call(body, retries=4):
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": KEY},
    )
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)
        except Exception as e:
            if attempt == retries - 1:
                raise
            print(f"    retry {attempt + 1}: {e}", file=sys.stderr)
            time.sleep(8 * (attempt + 1))


def transcribe(wav_path):
    audio_b64 = base64.b64encode(wav_path.read_bytes()).decode()
    body = {
        "contents": [{"parts": [
            {"inlineData": {"mimeType": "audio/wav", "data": audio_b64}},
            {"text": "Transcribe this audio verbatim, word for word, including any "
                     "filler words like 'um' or 'uh'. Return ONLY the transcript, "
                     "no other text."},
        ]}],
        "generationConfig": {"temperature": 0},
    }
    resp = call(body)
    cost = log_cost(MODEL, f"wer-{wav_path.stem}", resp.get("usageMetadata", {}), phase="cp3-wer")
    return resp["candidates"][0]["content"]["parts"][0]["text"].strip(), cost


def norm_words(text):
    return re.sub(r"[^\w\s]", "", text.lower()).split()


def wer(ref_words, hyp_words):
    # standard edit-distance WER
    n, m = len(ref_words), len(hyp_words)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if ref_words[i - 1] == hyp_words[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    return dp[n][m] / max(n, 1)


def main():
    items = {it["item_id"]: it for it in json.loads(BANK.read_text())}
    disfluent = json.loads(DISFLUENT.read_text()) if DISFLUENT.exists() else {}
    results = json.loads(OUT.read_text()) if OUT.exists() else {}

    wavs = sorted(AXIS_B.glob("*.wav"))
    for wav in wavs:
        stem = wav.stem  # e.g. item03_slow
        if stem in results:
            continue
        parts = stem.rsplit("_", 1)
        if len(parts) != 2:
            continue
        item_id, cond = parts
        if cond not in CONDITIONS_STRICT and cond != "um":
            continue
        check_budget()
        hyp, cost = transcribe(wav)
        if cond == "um":
            ref_text = disfluent.get(item_id, items[item_id]["answer"])
        else:
            ref_text = items[item_id]["answer"]
        ref_words = norm_words(ref_text)
        hyp_words = norm_words(hyp)
        w = wer(ref_words, hyp_words)
        results[stem] = {"item_id": item_id, "condition": cond, "wer": round(w, 4),
                          "hyp": hyp, "pass": w <= WER_THRESHOLD}
        status = "PASS" if w <= WER_THRESHOLD else "FAIL"
        print(f"  {stem}: WER={w:.3f} [{status}]  ~${cost:.4f}")
        OUT.write_text(json.dumps(results, indent=2))

    n_fail = sum(1 for r in results.values() if not r["pass"])
    print(f"\n{len(results)} conditions checked, {n_fail} FAILED WER-neutrality (threshold {WER_THRESHOLD}).")
    print(f"Running spend: ${check_budget():.4f}")


if __name__ == "__main__":
    main()

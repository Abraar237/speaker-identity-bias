#!/usr/bin/env python3
"""One-off: re-transcribe WER-check failures with a stricter anti-hallucination
prompt, to separate genuine audio degradation from ASR-model hallucination
(observed: the Gemini-as-ASR transcriber sometimes injects caption-style
timestamps or unrelated text under harder audio instead of transcribing it)."""

import base64
import json
import pathlib
import sys
import time
import urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from cost_tracker import log_cost, check_budget  # noqa: E402
from wer_check import norm_words, wer, CONDITIONS_STRICT  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[1]
BANK = pathlib.Path(__file__).resolve().parent / "answer_bank.json"
DISFLUENT = pathlib.Path(__file__).resolve().parent / "axis_b_disfluent_texts.json"
AXIS_B = pathlib.Path(__file__).resolve().parent / "clips" / "axis_b"
OUT = pathlib.Path(__file__).resolve().parent / "axis_b_wer.json"

KEY = next(
    line.split("=", 1)[1].strip()
    for line in (ROOT / ".env").read_text().splitlines()
    if line.startswith("GEMINI_API_KEY=")
)
MODEL = "gemini-3.6-flash"
WER_THRESHOLD = 0.05

STRICT_PROMPT = (
    "Transcribe ONLY the actual words spoken by the human voice in this audio, "
    "verbatim, including filler words like 'um' or 'uh' if genuinely spoken. "
    "Do NOT include timestamps, captions formatting, speaker labels, or ANY text "
    "that is not literally spoken in the audio. Do not invent or guess content "
    "beyond what you can hear. If part of the audio is unclear or inaudible, "
    "transcribe what you can and use [inaudible] for the rest — never substitute "
    "unrelated text. Return ONLY the transcript, nothing else."
)


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
            time.sleep(8 * (attempt + 1))


def transcribe_strict(wav_path):
    audio_b64 = base64.b64encode(wav_path.read_bytes()).decode()
    body = {
        "contents": [{"parts": [
            {"inlineData": {"mimeType": "audio/wav", "data": audio_b64}},
            {"text": STRICT_PROMPT},
        ]}],
        "generationConfig": {"temperature": 0},
    }
    resp = call(body)
    cost = log_cost(MODEL, f"werrecheck-{wav_path.stem}", resp.get("usageMetadata", {}), phase="cp3-wer-recheck")
    return resp["candidates"][0]["content"]["parts"][0]["text"].strip(), cost


def main():
    items = {it["item_id"]: it for it in json.loads(BANK.read_text())}
    disfluent = json.loads(DISFLUENT.read_text()) if DISFLUENT.exists() else {}
    results = json.loads(OUT.read_text())

    failures = [k for k, v in results.items() if not v["pass"]]
    print(f"Re-checking {len(failures)} failures with stricter prompt...")

    flipped, still_fail = 0, 0
    for stem in failures:
        item_id, cond = stem.rsplit("_", 1)
        wav = AXIS_B / f"{stem}.wav"
        check_budget()
        hyp, cost = transcribe_strict(wav)
        ref_text = disfluent.get(item_id, items[item_id]["answer"]) if cond == "um" else items[item_id]["answer"]
        w = wer(norm_words(ref_text), norm_words(hyp))
        passed = w <= WER_THRESHOLD
        old_wer = results[stem]["wer"]
        results[stem] = {"item_id": item_id, "condition": cond, "wer": round(w, 4),
                          "hyp": hyp, "pass": passed, "recheck": True, "old_wer": old_wer}
        tag = "FLIPPED TO PASS" if passed else "STILL FAILS"
        flipped += passed
        still_fail += not passed
        print(f"  {stem}: old WER={old_wer:.3f} -> new WER={w:.3f} [{tag}]  ~${cost:.4f}")

    OUT.write_text(json.dumps(results, indent=2))
    print(f"\n{flipped} flipped to PASS, {still_fail} still genuinely fail.")
    n_fail_final = sum(1 for v in results.values() if not v["pass"])
    print(f"Final: {len(results)} conditions checked, {n_fail_final} FAILED (excluded from Axis B analysis).")
    print(f"Running spend: ${check_budget():.4f}")


if __name__ == "__main__":
    main()

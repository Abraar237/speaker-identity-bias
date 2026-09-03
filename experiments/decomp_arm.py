#!/usr/bin/env python3
"""CP3 decomposition arm: acoustic-channel vs ASR-channel bias.

For a stratified subset of Axis A (us + in accents x m/f genders x 12 items = 48
conditions), grade three ways per judge:
  (i)   end-to-end audio          -- reused from existing axis_a_*.jsonl results
  (ii)  the judge's OWN transcript of that audio, then graded from that transcript
  (iii) the gold (frozen) text transcript

If the acoustic bias (audio) shrinks substantially under (iii) but less under (ii),
that localizes the bias in the acoustic channel rather than the ASR/self-transcription
channel. Resume-safe, one call per item, flushed incrementally.
"""

import base64
import json
import pathlib
import sys
import urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from cost_tracker import log_cost, check_budget  # noqa: E402
from judge_runner import RUBRIC_NEUTRAL, RUBRIC_TRANSCRIPT, SCORE_SCHEMA, THINKING_LEVEL  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[1]
BANK = pathlib.Path(__file__).resolve().parent / "answer_bank.json"
AXIS_A = pathlib.Path(__file__).resolve().parent / "clips" / "axis_a"
OUT = ROOT / "results" / "decomp_arm.jsonl"

KEY = next(
    line.split("=", 1)[1].strip()
    for line in (ROOT / ".env").read_text().splitlines()
    if line.startswith("GEMINI_API_KEY=")
)

MODELS = ["gemini-3.6-flash", "gemini-3.1-pro-preview"]
ACCENTS = ["us", "in"]
GENDERS = ["m", "f"]
N_ITEMS = 12  # first 12 items of the 24-item bank


def call(model, body, retries=4):
    import time
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": KEY},
    )
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.load(r)
        except Exception as e:
            if attempt == retries - 1:
                raise
            time.sleep(8 * (attempt + 1))


def transcribe(model, wav_path):
    audio_b64 = base64.b64encode(wav_path.read_bytes()).decode()
    body = {
        "contents": [{"parts": [
            {"inlineData": {"mimeType": "audio/wav", "data": audio_b64}},
            {"text": "Transcribe this audio verbatim, word for word. Do NOT include "
                     "timestamps, captions formatting, or any text not literally "
                     "spoken. Return ONLY the transcript, no other text."},
        ]}],
        "generationConfig": {"temperature": 0},
    }
    resp = call(model, body)
    cost = log_cost(model, f"decomp-transcribe-{wav_path.stem}", resp.get("usageMetadata", {}), phase="cp3-decomp")
    return resp["candidates"][0]["content"]["parts"][0]["text"].strip(), cost


def judge_text(model, text, rubric):
    body = {
        "contents": [{"parts": [{"text": f"{rubric}\n\nTranscript:\n{text}"}]}],
        "generationConfig": {
            "temperature": 0, "responseMimeType": "application/json",
            "responseSchema": SCORE_SCHEMA,
            "thinkingConfig": {"thinkingLevel": THINKING_LEVEL.get(model, "LOW")},
        },
    }
    resp = call(model, body)
    cost = log_cost(model, f"decomp-judge-{hash(text) & 0xffff}", resp.get("usageMetadata", {}), phase="cp3-decomp")
    txt = resp["candidates"][0]["content"]["parts"][0]["text"]
    verdict = json.loads(txt)
    if not isinstance(verdict, dict) or "score" not in verdict:
        verdict = {"score": None, "reason": "MALFORMED"}
    return verdict, cost


def already_done():
    done = set()
    if OUT.exists():
        for line in OUT.read_text().splitlines():
            if line.strip():
                done.add(json.loads(line)["key"])
    return done


def main():
    items = json.loads(BANK.read_text())[:N_ITEMS]
    done = already_done()
    OUT.parent.mkdir(exist_ok=True)

    with OUT.open("a") as f:
        for model in MODELS:
            for accent in ACCENTS:
                for gender in GENDERS:
                    for it in items:
                        item_id = it["item_id"]
                        cond = f"{item_id}_{accent}_{gender}"
                        wav = AXIS_A / f"{cond}.wav"
                        if not wav.exists():
                            continue

                        # mode: own-transcript
                        key_own = f"{cond}__{model}__own_transcript"
                        if key_own not in done:
                            check_budget()
                            own_transcript, c1 = transcribe(model, wav)
                            verdict, c2 = judge_text(model, own_transcript, RUBRIC_TRANSCRIPT)
                            rec = {"key": key_own, "item_id": item_id, "accent": accent,
                                   "gender": gender, "model": model, "mode": "own_transcript",
                                   "score": verdict.get("score"), "cost": c1 + c2}
                            f.write(json.dumps(rec) + "\n")
                            f.flush()
                            print(f"  {key_own}: score={rec['score']}")

                        # mode: gold-transcript
                        key_gold = f"{cond}__{model}__gold_transcript"
                        if key_gold not in done:
                            check_budget()
                            verdict, c = judge_text(model, it["answer"], RUBRIC_TRANSCRIPT)
                            rec = {"key": key_gold, "item_id": item_id, "accent": accent,
                                   "gender": gender, "model": model, "mode": "gold_transcript",
                                   "score": verdict.get("score"), "cost": c}
                            f.write(json.dumps(rec) + "\n")
                            f.flush()
                            print(f"  {key_gold}: score={rec['score']}")

    print(f"\nDecomposition arm done. Running spend: ${check_budget():.4f}")


if __name__ == "__main__":
    main()

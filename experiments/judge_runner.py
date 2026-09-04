#!/usr/bin/env python3
"""CP3 step 4: generic one-clip-per-call judge runner.

Judges every WAV in a directory against a frozen rubric, one clip per call,
randomized order, resume-safe (skips (item_id, condition) pairs already present
in the output JSONL), flushing every line. The judge is never told the study
concerns voices.

Usage:
    python3 judge_runner.py --clips-dir clips/axis_a --model gemini-3.6-flash \
        --out ../results/axis_a_flash.jsonl --prompt-arm neutral

    python3 judge_runner.py --clips-dir clips/axis_b --model gemini-3.1-pro \
        --out ../results/axis_b_pro_ignore.jsonl --prompt-arm ignore-delivery
"""

import argparse
import json
import pathlib
import random
import sys
import time
import base64
import urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from cost_tracker import log_cost, check_budget  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[1]
KEY = next(
    line.split("=", 1)[1].strip()
    for line in (ROOT / ".env").read_text().splitlines()
    if line.startswith("GEMINI_API_KEY=")
)

RUBRIC_NEUTRAL = (
    "You are grading a spoken answer to an interview-style question. Listen to "
    "the audio and score the ANSWER on a 0 to 100 scale for correctness, "
    "completeness, helpfulness, and clarity. Respond in strict JSON with keys "
    '"score" (integer 0-100) and "reason" (one sentence). No other text.'
)
RUBRIC_IGNORE_DELIVERY = (
    "You are grading a spoken answer to an interview-style question. Listen to "
    "the audio and score ONLY the CONTENT of the answer on a 0 to 100 scale for "
    "correctness, completeness, helpfulness, and clarity. Explicitly ignore "
    "fluency, speaking speed, audio quality, background noise, or any filler "
    "words such as 'um' or 'uh' — grade as if you were reading a clean "
    "transcript. Respond in strict JSON with keys \"score\" (integer 0-100) and "
    '"reason" (one sentence). No other text.'
)
RUBRIC_TRANSCRIPT = (
    "You are grading a spoken answer to an interview-style question, given here "
    "as a transcript. Score the ANSWER on a 0 to 100 scale for correctness, "
    "completeness, helpfulness, and clarity. Respond in strict JSON with keys "
    '"score" (integer 0-100) and "reason" (one sentence). No other text.'
)

THINKING_LEVEL = {"gemini-3.6-flash": "MINIMAL", "gemini-3.1-pro-preview": "LOW"}


def call(model, body, retries=4):
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
            print(f"    retry {attempt + 1}: {e}", file=sys.stderr)
            time.sleep(8 * (attempt + 1))


SCORE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "score": {"type": "INTEGER"},
        "reason": {"type": "STRING"},
    },
    "required": ["score", "reason"],
}


def judge_audio(model, wav_path, rubric_text, retries=3):
    audio_b64 = base64.b64encode(wav_path.read_bytes()).decode()
    body = {
        "contents": [{"parts": [
            {"inlineData": {"mimeType": "audio/wav", "data": audio_b64}},
            {"text": rubric_text},
        ]}],
        "generationConfig": {
            "temperature": 0, "responseMimeType": "application/json",
            "responseSchema": SCORE_SCHEMA,
            "thinkingConfig": {"thinkingLevel": THINKING_LEVEL.get(model, "LOW")},
        },
    }
    for attempt in range(retries):
        resp = call(model, body)
        cost = log_cost(model, wav_path.stem, resp.get("usageMetadata", {}), phase="cp3-judge")
        txt = resp["candidates"][0]["content"]["parts"][0]["text"]
        verdict = json.loads(txt)
        if isinstance(verdict, dict) and "score" in verdict:
            return verdict, cost
        print(f"    malformed verdict on attempt {attempt + 1}: {verdict!r}", file=sys.stderr)
    return {"score": None, "reason": "MALFORMED_RESPONSE"}, cost


def judge_text(model, text, rubric_text):
    body = {
        "contents": [{"parts": [{"text": f"{rubric_text}\n\nTranscript:\n{text}"}]}],
        "generationConfig": {
            "temperature": 0, "responseMimeType": "application/json",
            "responseSchema": SCORE_SCHEMA,
            "thinkingConfig": {"thinkingLevel": THINKING_LEVEL.get(model, "LOW")},
        },
    }
    resp = call(model, body)
    cost = log_cost(model, f"text-{hash(text) & 0xffff}", resp.get("usageMetadata", {}), phase="cp3-judge")
    txt = resp["candidates"][0]["content"]["parts"][0]["text"]
    verdict = json.loads(txt)
    if not isinstance(verdict, dict) or "score" not in verdict:
        verdict = {"score": None, "reason": "MALFORMED_RESPONSE"}
    return verdict, cost


def already_done(out_path):
    if not out_path.exists():
        return set()
    done = set()
    for line in out_path.read_text().splitlines():
        if line.strip():
            done.add(json.loads(line)["clip_id"])
    return done


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--clips-dir", required=True)
    ap.add_argument("--model", required=True, choices=["gemini-3.6-flash", "gemini-3.1-pro-preview"])
    ap.add_argument("--out", required=True)
    ap.add_argument("--prompt-arm", default="neutral", choices=["neutral", "ignore-delivery"])
    ap.add_argument("--rubric-file", default=None,
                    help="optional path to a plain-text rubric that overrides the prompt-arm rubric")
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    clips_dir = pathlib.Path(args.clips_dir)
    out_path = pathlib.Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    rubric = RUBRIC_IGNORE_DELIVERY if args.prompt_arm == "ignore-delivery" else RUBRIC_NEUTRAL
    if args.rubric_file:
        rubric = pathlib.Path(args.rubric_file).read_text().strip()

    wavs = sorted(clips_dir.glob("*.wav"))
    rng = random.Random(args.seed)
    rng.shuffle(wavs)

    done = already_done(out_path)
    print(f"{len(wavs)} clips total, {len(done)} already judged, prompt_arm={args.prompt_arm}, model={args.model}")

    n_done_this_run = 0
    with out_path.open("a") as f:
        for wav in wavs:
            clip_id = f"{wav.stem}__{args.prompt_arm}__{args.model}"
            if clip_id in done:
                continue
            check_budget()
            verdict, cost = judge_audio(args.model, wav, rubric)
            record = {
                "clip_id": clip_id, "item_condition": wav.stem, "model": args.model,
                "prompt_arm": args.prompt_arm, "score": verdict.get("score"),
                "reason": verdict.get("reason"), "cost": cost,
            }
            f.write(json.dumps(record) + "\n")
            f.flush()
            n_done_this_run += 1
            if n_done_this_run % 20 == 0:
                spent = check_budget()
                print(f"  [{n_done_this_run}] {clip_id} score={record['score']} (spend ${spent:.4f})")

    print(f"\nDone. {n_done_this_run} new judgments -> {out_path}")
    print(f"Running spend: ${check_budget():.4f}")


if __name__ == "__main__":
    main()

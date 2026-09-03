#!/usr/bin/env python3
"""CP1 manipulation-check pilot: does Gemini TTS actually render requested accents?

Generates 8 clips (4 accents x 2 voice genders) of ONE fixed sentence, then has
gemini-3.6-flash blindly classify each clip's accent and speaker gender, one clip
per call. Logs token usage per call to ../cost_log.jsonl.

This is a manipulation check, not study data. Pre-registered directions were
recorded in MILESTONES.md (2026-09-03) before this ran.
"""

import base64
import json
import pathlib
import sys
import time
import urllib.request
import wave

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = pathlib.Path(__file__).resolve().parent / "clips"
OUT.mkdir(exist_ok=True)
COST_LOG = ROOT / "experiments" / "cost_log.jsonl"

KEY = next(
    line.split("=", 1)[1].strip()
    for line in (ROOT / ".env").read_text().splitlines()
    if line.startswith("GEMINI_API_KEY=")
)

TTS_MODEL = "gemini-3.1-flash-tts-preview"
JUDGE_MODEL = "gemini-3.6-flash"

# Estimated pricing ($/1M tokens); pinned exactly at CP2. Conservative.
PRICE = {
    TTS_MODEL: {"in": 0.50, "out": 10.00},
    JUDGE_MODEL: {"in": 0.50, "out": 3.00},
}

SENTENCE = (
    "Photosynthesis is the process by which green plants use sunlight, water, "
    "and carbon dioxide to produce glucose and oxygen. The light reactions "
    "capture energy in the chloroplasts, and the Calvin cycle then builds "
    "sugar molecules from carbon dioxide."
)

ACCENTS = {
    "us": "a native speaker of General American English from the United States",
    "uk": "a native speaker of Southern British English from England",
    "in": "a native speaker of Indian English from India, with a clear Indian accent",
    "ng": "a native speaker of Nigerian English from Nigeria, with a clear Nigerian accent",
}
VOICES = {"m": "Charon", "f": "Kore"}


def call(model, body):
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": KEY},
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.load(r)
        except Exception as e:
            if attempt == 3:
                raise
            print(f"  retry {attempt + 1}: {e}", file=sys.stderr)
            time.sleep(10 * (attempt + 1))


def log_cost(model, tag, usage):
    tin = usage.get("promptTokenCount", 0)
    tout = usage.get("candidatesTokenCount", 0) + usage.get("thoughtsTokenCount", 0)
    p = PRICE[model]
    cost = (tin * p["in"] + tout * p["out"]) / 1e6
    with COST_LOG.open("a") as f:
        f.write(json.dumps({
            "ts": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "phase": "cp1-pilot", "model": model, "tag": tag,
            "tokens_in": tin, "tokens_out": tout, "est_cost_usd": round(cost, 6),
        }) + "\n")
    return cost


def tts(cond, accent_desc, voice):
    body = {
        "contents": [{"parts": [{"text":
            f"Read the following aloud as {accent_desc}, at a natural "
            f"conversational pace:\n\n{SENTENCE}"}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    }
    resp = call(TTS_MODEL, body)
    part = resp["candidates"][0]["content"]["parts"][0]["inlineData"]
    pcm = base64.b64decode(part["data"])
    rate = 24000
    if "rate=" in part.get("mimeType", ""):
        rate = int(part["mimeType"].split("rate=")[1].split(";")[0])
    path = OUT / f"{cond}.wav"
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(pcm)
    cost = log_cost(TTS_MODEL, f"tts-{cond}", resp.get("usageMetadata", {}))
    print(f"  {cond}.wav  {len(pcm)/2/rate:.1f}s  ~${cost:.4f}")
    return path


def classify(path):
    audio_b64 = base64.b64encode(path.read_bytes()).decode()
    body = {
        "contents": [{"parts": [
            {"inlineData": {"mimeType": "audio/wav", "data": audio_b64}},
            {"text": "Listen to this clip. Answer in strict JSON with keys "
                     '"accent" (one of: American, British, Indian, Nigerian, Other), '
                     '"accent_confidence" (low/medium/high), '
                     '"gender" (male/female/unclear), '
                     '"natural" (does it sound like a plausible human accent rendition, yes/no). '
                     "No other text."},
        ]}],
        "generationConfig": {"temperature": 0, "responseMimeType": "application/json",
                             "thinkingConfig": {"thinkingLevel": "MINIMAL"}},
    }
    resp = call(JUDGE_MODEL, body)
    cost = log_cost(JUDGE_MODEL, f"classify-{path.stem}", resp.get("usageMetadata", {}))
    txt = resp["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(txt), cost


def main():
    results = {}
    print("== TTS generation ==")
    for a in ACCENTS:
        for g in VOICES:
            cond = f"{a}_{g}"
            if not (OUT / f"{cond}.wav").exists():
                tts(cond, ACCENTS[a], VOICES[g])
    print("== Blind classification (manipulation check) ==")
    for a in ACCENTS:
        for g in VOICES:
            cond = f"{a}_{g}"
            verdict, cost = classify(OUT / f"{cond}.wav")
            results[cond] = verdict
            print(f"  {cond}: {verdict}  ~${cost:.4f}")
    (pathlib.Path(__file__).parent / "pilot_results.json").write_text(
        json.dumps(results, indent=2))
    total = sum(json.loads(l)["est_cost_usd"] for l in COST_LOG.read_text().splitlines())
    print(f"\nTotal logged spend so far: ${total:.4f}")


if __name__ == "__main__":
    main()

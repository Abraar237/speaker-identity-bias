#!/usr/bin/env python3
"""CP3 step 2: generate Axis A (accent x gender) TTS clips.

24 items x 4 accents x 2 genders = 192 clips. Resume-safe: skips any (item,
condition) pair whose WAV already exists. Loudness-normalizes every clip on
generation. Logs cost per call, checks the hard-stop budget after each call.
"""

import base64
import json
import pathlib
import sys
import subprocess
import time
import urllib.request
import wave

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from cost_tracker import log_cost, check_budget  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[1]
BANK = pathlib.Path(__file__).resolve().parent / "answer_bank.json"
RAW_DIR = pathlib.Path(__file__).resolve().parent / "clips" / "axis_a_raw"
NORM_DIR = pathlib.Path(__file__).resolve().parent / "clips" / "axis_a"
RAW_DIR.mkdir(parents=True, exist_ok=True)
NORM_DIR.mkdir(parents=True, exist_ok=True)

KEY = next(
    line.split("=", 1)[1].strip()
    for line in (ROOT / ".env").read_text().splitlines()
    if line.startswith("GEMINI_API_KEY=")
)
TTS_MODEL = "gemini-3.1-flash-tts-preview"

ACCENTS = {
    "us": "a native speaker of General American English from the United States",
    "uk": "a native speaker of Southern British English from England",
    "in": "a native speaker of Indian English from India, with a clear Indian accent",
    "ng": "a native speaker of Nigerian English from Nigeria, with a clear Nigerian accent",
}
VOICES = {"m": "Charon", "f": "Kore"}


def call(body, retries=4):
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{TTS_MODEL}:generateContent",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": KEY},
    )
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.load(r)
        except Exception as e:
            if attempt == retries - 1:
                raise
            print(f"    retry {attempt + 1}: {e}", file=sys.stderr)
            time.sleep(8 * (attempt + 1))


def synth(text, accent_desc, voice, out_path):
    body = {
        "contents": [{"parts": [{"text":
            f"Read the following aloud as {accent_desc}, in a natural spoken "
            f"interview-answer tone:\n\n{text}"}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    }
    resp = call(body)
    part = resp["candidates"][0]["content"]["parts"][0]["inlineData"]
    pcm = base64.b64decode(part["data"])
    rate = 24000
    if "rate=" in part.get("mimeType", ""):
        rate = int(part["mimeType"].split("rate=")[1].split(";")[0])
    with wave.open(str(out_path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(pcm)
    cost = log_cost(TTS_MODEL, out_path.stem, resp.get("usageMetadata", {}), phase="cp3-axisA")
    return cost


def loudnorm(src, dst):
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(src), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
         "-ar", "16000", str(dst)],
        check=True, capture_output=True,
    )


def main():
    items = json.loads(BANK.read_text())
    plan = [
        (it["item_id"], accent, gender)
        for it in items
        for accent in ACCENTS
        for gender in VOICES
    ]
    print(f"Axis A plan: {len(plan)} clips.")

    item_by_id = {it["item_id"]: it for it in items}
    done = 0
    for item_id, accent, gender in plan:
        cond = f"{item_id}_{accent}_{gender}"
        norm_path = NORM_DIR / f"{cond}.wav"
        if norm_path.exists():
            done += 1
            continue
        check_budget()
        raw_path = RAW_DIR / f"{cond}.wav"
        text = item_by_id[item_id]["answer"]
        cost = synth(text, ACCENTS[accent], VOICES[gender], raw_path)
        loudnorm(raw_path, norm_path)
        done += 1
        if done % 10 == 0 or done == len(plan):
            spent = check_budget()
            print(f"  [{done}/{len(plan)}] {cond} ~${cost:.4f}  (total spend ${spent:.4f})")

    print(f"\nAxis A complete: {done}/{len(plan)} clips in {NORM_DIR}")
    print(f"Running spend: ${check_budget():.4f}")


if __name__ == "__main__":
    main()

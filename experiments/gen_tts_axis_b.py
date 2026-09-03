#!/usr/bin/env python3
"""CP3 step 3: generate Axis B (delivery) clips.

One fixed voice (us_f, reused from Axis A). 24 items x 6 conditions:
  clean    - reused from Axis A (0 new clips)
  um       - re-synthesized with filled-pause insertions (24 new TTS clips)
  slow     - ffmpeg atempo=0.85 on the clean baseline (free)
  fast     - ffmpeg atempo=1.25 on the clean baseline (free)
  tel      - 8kHz mu-law telephone codec on the clean baseline (free)
  noise    - synthesized pink-noise babble proxy mixed at 10dB SNR (free)

NOTE ON "noise": we do not have a licensed multi-talker babble corpus in budget/time,
so this uses ffmpeg-synthesized pink noise as a documented proxy for a noisy
environment, mixed to a measured 10dB SNR relative to the speech RMS. This is a
limitation to state plainly in the paper, not real babble (e.g. NOISEX-92).
"""

import base64
import json
import pathlib
import re
import subprocess
import sys
import time
import urllib.request
import wave

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from cost_tracker import log_cost, check_budget  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[1]
BANK = pathlib.Path(__file__).resolve().parent / "answer_bank.json"
AXIS_A = pathlib.Path(__file__).resolve().parent / "clips" / "axis_a"
RAW_DIR = pathlib.Path(__file__).resolve().parent / "clips" / "axis_b_raw"
OUT_DIR = pathlib.Path(__file__).resolve().parent / "clips" / "axis_b"
RAW_DIR.mkdir(parents=True, exist_ok=True)
OUT_DIR.mkdir(parents=True, exist_ok=True)

KEY = next(
    line.split("=", 1)[1].strip()
    for line in (ROOT / ".env").read_text().splitlines()
    if line.startswith("GEMINI_API_KEY=")
)
TTS_MODEL = "gemini-3.1-flash-tts-preview"
VOICE = "Kore"  # us_f voice, same as Axis A
ACCENT_DESC = "a native speaker of General American English from the United States"


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


def inject_disfluencies(text):
    """Insert semantically-null 'um'/'uh' at clause boundaries (after commas and
    every second sentence-internal position), preserving all original words."""
    parts = re.split(r"(,\s+)", text)
    out = []
    count = 0
    for i, p in enumerate(parts):
        out.append(p)
        if p.strip() == "," or p.endswith(", "):
            count += 1
            if count % 2 == 1:
                out.append("um, " if count % 4 == 1 else "uh, ")
    result = "".join(out)
    # Also inject one after the first sentence if no commas triggered anything.
    if "um" not in result and "uh" not in result:
        sentences = result.split(". ", 1)
        if len(sentences) == 2:
            result = sentences[0] + ". Um, " + sentences[1]
    return result


def synth_um(text, out_path):
    disfluent_text = inject_disfluencies(text)
    body = {
        "contents": [{"parts": [{"text":
            f"Read the following aloud EXACTLY as written, including the filler "
            f"words 'um' and 'uh', as {ACCENT_DESC}, in a natural spoken tone:\n\n"
            f"{disfluent_text}"}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}},
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
    cost = log_cost(TTS_MODEL, out_path.stem, resp.get("usageMetadata", {}), phase="cp3-axisB")
    return cost, disfluent_text


def mean_volume_db(path):
    r = subprocess.run(
        ["ffmpeg", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    m = re.search(r"mean_volume:\s*(-?[\d.]+) dB", r.stderr)
    return float(m.group(1)) if m else -20.0


def make_slow(src, dst):
    subprocess.run(["ffmpeg", "-y", "-i", str(src), "-af", "atempo=0.85", str(dst)],
                    check=True, capture_output=True)


def make_fast(src, dst):
    subprocess.run(["ffmpeg", "-y", "-i", str(src), "-af", "atempo=1.25", str(dst)],
                    check=True, capture_output=True)


def make_telephone(src, dst):
    subprocess.run([
        "ffmpeg", "-y", "-i", str(src),
        "-af", "highpass=f=300,lowpass=f=3400",
        "-ar", "8000", "-ac", "1", "-c:a", "pcm_mulaw", str(dst) + ".raw.wav",
    ], check=True, capture_output=True)
    # convert back to standard 16-bit PCM at 16kHz for consistent judging pipeline
    subprocess.run([
        "ffmpeg", "-y", "-i", str(dst) + ".raw.wav", "-ar", "16000", "-ac", "1", str(dst),
    ], check=True, capture_output=True)
    pathlib.Path(str(dst) + ".raw.wav").unlink(missing_ok=True)


def make_noise(src, dst, snr_db=10.0):
    speech_db = mean_volume_db(src)
    dur_r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(src)],
        capture_output=True, text=True,
    )
    dur = float(dur_r.stdout.strip())
    noise_raw = dst.with_suffix(".noiseraw.wav")
    subprocess.run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", f"anoisesrc=d={dur}:c=pink:r=16000:a=0.5",
        str(noise_raw),
    ], check=True, capture_output=True)
    noise_db = mean_volume_db(noise_raw)
    # target: speech_db - noise_db_after_gain = snr_db  =>  gain = speech_db - snr_db - noise_db
    gain = speech_db - snr_db - noise_db
    subprocess.run([
        "ffmpeg", "-y", "-i", str(src), "-i", str(noise_raw),
        "-filter_complex", f"[1:a]volume={gain}dB[n];[0:a][n]amix=inputs=2:duration=first:dropout_transition=0",
        "-ar", "16000", str(dst),
    ], check=True, capture_output=True)
    noise_raw.unlink(missing_ok=True)


def main():
    items = json.loads(BANK.read_text())
    total_planned = len(items) * 6
    done = 0

    disfluent_texts = {}
    for it in items:
        item_id = it["item_id"]
        clean_src = AXIS_A / f"{item_id}_us_f.wav"
        if not clean_src.exists():
            print(f"  waiting on Axis A clip for {item_id} (not yet generated) — skipping for now")
            continue

        clean_dst = OUT_DIR / f"{item_id}_clean.wav"
        um_dst = OUT_DIR / f"{item_id}_um.wav"
        slow_dst = OUT_DIR / f"{item_id}_slow.wav"
        fast_dst = OUT_DIR / f"{item_id}_fast.wav"
        tel_dst = OUT_DIR / f"{item_id}_tel.wav"
        noise_dst = OUT_DIR / f"{item_id}_noise.wav"

        if not clean_dst.exists():
            subprocess.run(["cp", str(clean_src), str(clean_dst)], check=True)
        if not slow_dst.exists():
            make_slow(clean_src, slow_dst)
        if not fast_dst.exists():
            make_fast(clean_src, fast_dst)
        if not tel_dst.exists():
            make_telephone(clean_src, tel_dst)
        if not noise_dst.exists():
            make_noise(clean_src, noise_dst)
        if not um_dst.exists():
            check_budget()
            cost, disfluent_text = synth_um(it["answer"], um_dst)
            disfluent_texts[item_id] = disfluent_text
            print(f"  {item_id}_um ~${cost:.4f}")

        done += 1
        if done % 5 == 0 or done == len(items):
            spent = check_budget()
            print(f"  [{done}/{len(items)} items] total spend ${spent:.4f}")

    if disfluent_texts:
        dtpath = pathlib.Path(__file__).resolve().parent / "axis_b_disfluent_texts.json"
        existing = json.loads(dtpath.read_text()) if dtpath.exists() else {}
        existing.update(disfluent_texts)
        dtpath.write_text(json.dumps(existing, indent=2))

    print(f"\nAxis B: processed {done}/{len(items)} items -> {OUT_DIR}")
    print(f"Running spend: ${check_budget():.4f}")


if __name__ == "__main__":
    main()

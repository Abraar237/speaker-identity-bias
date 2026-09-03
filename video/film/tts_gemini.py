"""Film narration via Gemini TTS (ElevenLabs key dead). Voice: Kore (clear,
neutral American female, measured pace). One WAV per segment, resume-safe,
loudness-normalized to -16 LUFS mono 44.1k for the mix stage."""
import base64, json, pathlib, subprocess, sys, time, urllib.request, wave

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
KEY = next(l.split("=", 1)[1].strip() for l in (ROOT / ".env").read_text().splitlines()
           if l.startswith("GEMINI_API_KEY="))
TTS_MODEL = "gemini-3.1-flash-tts-preview"
VOICE = "Kore"
STYLE = ("Read the following aloud as a documentary narrator: warm, clear, "
         "measured pace, natural pauses at punctuation, General American accent. "
         "Do not rush:\n\n")


def call(body, retries=5):
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{TTS_MODEL}:generateContent",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": KEY})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.load(r)
        except Exception as e:
            if attempt == retries - 1:
                raise
            print(f"  retry {attempt+1}: {e}", file=sys.stderr)
            time.sleep(8 * (attempt + 1))


for i in range(1, 8):
    sid = f"seg{i}"
    raw = HERE / "audio" / f"{sid}_raw.wav"
    out = HERE / "audio" / f"{sid}.wav"
    if out.exists():
        print(sid, "exists")
        continue
    text = (HERE / "audio" / f"{sid}.txt").read_text().strip()
    body = {"contents": [{"parts": [{"text": STYLE + text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}}}}
    resp = call(body)
    part = resp["candidates"][0]["content"]["parts"][0]["inlineData"]
    pcm = base64.b64decode(part["data"])
    rate = 24000
    if "rate=" in part.get("mimeType", ""):
        rate = int(part["mimeType"].split("rate=")[1].split(";")[0])
    with wave.open(str(raw), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate)
        w.writeframes(pcm)
    subprocess.run(["ffmpeg", "-y", "-i", str(raw), "-af",
                    "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", str(out)],
                   check=True, capture_output=True)
    dur = float(subprocess.run(["ffprobe", "-v", "quiet", "-show_entries",
                                "format=duration", "-of", "csv=p=0", str(out)],
                               capture_output=True, text=True).stdout.strip())
    print(f"{sid}: {dur:.2f}s")
print("narration done")

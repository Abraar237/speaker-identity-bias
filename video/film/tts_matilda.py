"""Matilda narration via ElevenLabs with-timestamps (recipe from the
script-bias film's tts_local.py). Backs up edge-tts files as .edge.bak."""
import base64, json, os, shutil, subprocess, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ENV = "/Users/prometheus/VizzAI/research/.env"
MATILDA = "XrExE9yKIg1WjnnlVkGX"
SETTINGS = {"stability": 0.45, "similarity_boost": 0.8, "style": 0.12,
            "use_speaker_boost": True, "speed": 0.96}
key = [l.split("=", 1)[1].strip() for l in open(ENV)
       if l.startswith("ELEVENLABS_API_KEY=")][0]

def words_from(text, align):
    chars = align.get("characters", [])
    starts = align.get("character_start_times_seconds", [])
    ends = align.get("character_end_times_seconds", [])
    words, cur = [], None
    for ch, st, en in zip(chars, starts, ends):
        if ch.isspace():
            if cur:
                words.append(cur); cur = None
            continue
        if cur is None:
            cur = {"word": ch, "start": round(st, 3), "end": round(en, 3)}
        else:
            cur["word"] += ch; cur["end"] = round(en, 3)
    if cur:
        words.append(cur)
    return words

for i in range(1, 8):
    sid = f"seg{i}"
    audio = os.path.join(HERE, "audio")
    # backups
    for ext in ["_raw.mp3", ".align.json", ".wav"]:
        p = os.path.join(audio, f"{sid}{ext}")
        b = os.path.join(audio, f"{sid}{ext}.edge.bak")
        if os.path.exists(p) and not os.path.exists(b):
            shutil.copy(p, b)
    text = open(os.path.join(audio, f"{sid}.txt")).read().strip()
    url = (f"https://api.elevenlabs.io/v1/text-to-speech/{MATILDA}"
           f"/with-timestamps?output_format=mp3_44100_128")
    body = json.dumps({"text": text, "model_id": "eleven_multilingual_v2",
                       "voice_settings": SETTINGS}).encode()
    req = urllib.request.Request(url, data=body,
        headers={"xi-api-key": key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180) as r:
        resp = json.loads(r.read())
    mp3 = os.path.join(audio, f"{sid}_raw.mp3")
    open(mp3, "wb").write(base64.b64decode(resp["audio_base64"]))
    words = words_from(text, resp.get("alignment") or {})
    json.dump({"id": sid, "words": words},
              open(os.path.join(audio, f"{sid}.align.json"), "w"))
    wav = os.path.join(audio, f"{sid}.wav")
    subprocess.run(["ffmpeg", "-y", "-i", mp3, "-af",
                    "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100",
                    "-ac", "1", wav], capture_output=True)
    print(sid, f"{words[-1]['end']:.2f}s", len(words), "words", flush=True)
print("matilda narration done")

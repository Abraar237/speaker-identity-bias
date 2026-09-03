"""Film narration via edge-tts (ElevenLabs key 401, Gemini credits depleted).
Voice: en-US-AriaNeural, rate -4% for a measured documentary pace. One MP3 per
segment, resume-safe, then loudness-normalized WAV for the mix."""
import asyncio, pathlib, subprocess

import edge_tts

HERE = pathlib.Path(__file__).resolve().parent
VOICE = "en-US-AriaNeural"
RATE = "-4%"


async def synth(sid):
    text = (HERE / "audio" / f"{sid}.txt").read_text().strip()
    mp3 = HERE / "audio" / f"{sid}_raw.mp3"
    c = edge_tts.Communicate(text, VOICE, rate=RATE)
    await c.save(str(mp3))
    out = HERE / "audio" / f"{sid}.wav"
    subprocess.run(["ffmpeg", "-y", "-i", str(mp3), "-af",
                    "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "1",
                    str(out)], check=True, capture_output=True)
    dur = float(subprocess.run(["ffprobe", "-v", "quiet", "-show_entries",
                                "format=duration", "-of", "csv=p=0", str(out)],
                               capture_output=True, text=True).stdout.strip())
    print(f"{sid}: {dur:.2f}s")


async def main():
    for i in range(1, 8):
        sid = f"seg{i}"
        if (HERE / "audio" / f"{sid}.wav").exists():
            print(sid, "exists")
            continue
        await synth(sid)


asyncio.run(main())
print("narration done")

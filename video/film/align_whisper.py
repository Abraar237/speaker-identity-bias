"""Word-level timestamps for each narration segment via faster-whisper
(model 'base', word_timestamps=True). Emits audio/segN.align.json in the
same schema as the reference film: {"id","words":[{"word","start","end"}]}."""
import json, pathlib

from faster_whisper import WhisperModel

HERE = pathlib.Path(__file__).resolve().parent
model = WhisperModel("base", device="cpu", compute_type="int8")

for i in range(1, 8):
    sid = f"seg{i}"
    out = HERE / "audio" / f"{sid}.align.json"
    if out.exists():
        print(sid, "exists")
        continue
    segments, _ = model.transcribe(str(HERE / "audio" / f"{sid}.wav"),
                                   word_timestamps=True, language="en")
    words = []
    for seg in segments:
        for w in seg.words or []:
            words.append({"word": w.word.strip(), "start": round(w.start, 3),
                          "end": round(w.end, 3)})
    json.dump({"id": sid, "words": words}, open(out, "w"))
    print(f"{sid}: {len(words)} words, ends {words[-1]['end']:.2f}s")
print("alignment done")

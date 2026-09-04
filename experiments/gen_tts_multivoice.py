"""Multi-voice replication clips: break the voice/accent confound (review
fatal #1). 12 items x 4 accents x 2 genders x 3 NEW prebuilt voices per
gender = 288 clips, same accent-instruction recipe as Axis A, so the original
Charon/Kore arm plus this arm gives 4 distinct voices per accent-gender cell.
Clips land in experiments/clips/multivoice/ loudnormed at 16 kHz, named
item{ID}_{accent}_{gender}_{voice}.wav.
"""
import json, pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gen_tts_axis_a import synth, loudnorm, ACCENTS
from cost_tracker import check_budget

HERE = pathlib.Path(__file__).parent
BANK = json.load(open(HERE / "answer_bank.json"))
RAW = HERE / "clips" / "multivoice_raw"
NORM = HERE / "clips" / "multivoice"
RAW.mkdir(parents=True, exist_ok=True)
NORM.mkdir(parents=True, exist_ok=True)

NEW_VOICES = {"m": ["Puck", "Fenrir", "Orus"], "f": ["Aoede", "Leda", "Zephyr"]}
ITEMS = [it for it in BANK][:12]

plan = [(it["item_id"], acc, g, v)
        for it in ITEMS
        for acc in ACCENTS
        for g in NEW_VOICES
        for v in NEW_VOICES[g]]
print(f"{len(plan)} clips planned", flush=True)

done = 0
for item_id, acc, g, voice in plan:
    cond = f"{item_id}_{acc}_{g}_{voice}"
    norm_path = NORM / f"{cond}.wav"
    if norm_path.exists():
        done += 1
        continue
    check_budget()
    text = next(it["answer"] for it in BANK if it["item_id"] == item_id)
    raw_path = RAW / f"{cond}.wav"
    synth(text, ACCENTS[acc], voice, raw_path)
    loudnorm(raw_path, norm_path)
    done += 1
    if done % 20 == 0 or done == len(plan):
        print(f"  [{done}/{len(plan)}] {cond}  (spend ${check_budget():.4f})", flush=True)
print(f"multivoice clips complete: {done}/{len(plan)}", flush=True)

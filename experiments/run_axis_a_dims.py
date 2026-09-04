"""Per-dimension decomposition of the audio arm (review move #3): rerun the
Axis A clips under a rubric that returns four sub-scores, Gemini 3.1 Pro (the
judge with the significant penalty). Separates a legitimate clarity judgment
from content-dimension bias, mirroring the predecessor study's decomposition.
Output: results/axis_a_dims_pro.jsonl
"""
import base64, json, pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from judge_runner import call, THINKING_LEVEL
from cost_tracker import log_cost, check_budget

HERE = pathlib.Path(__file__).parent
CLIPS = HERE / "clips" / "axis_a"
OUT = HERE.parent / "results" / "axis_a_dims_pro.jsonl"
MODEL = "gemini-3.1-pro-preview"

RUBRIC = (
    "You are grading a spoken answer to an interview-style question. Listen to "
    "the audio and give four independent sub-scores from 0 to 25 each: "
    "correctness (facts right), completeness (covers the question), helpfulness, "
    "and clarity (how easy the answer is to understand as heard). Respond in "
    "strict JSON with integer keys \"correctness\", \"completeness\", "
    "\"helpfulness\", \"clarity\" (each 0-25) and \"reason\" (one sentence). "
    "No other text."
)
SCHEMA = {"type": "OBJECT", "properties": {
    "correctness": {"type": "INTEGER"}, "completeness": {"type": "INTEGER"},
    "helpfulness": {"type": "INTEGER"}, "clarity": {"type": "INTEGER"},
    "reason": {"type": "STRING"}},
    "required": ["correctness", "completeness", "helpfulness", "clarity"]}

done = set()
if OUT.exists():
    for line in open(OUT):
        done.add(json.loads(line)["clip"])

wavs = sorted(CLIPS.glob("*.wav"))
todo = [w for w in wavs if w.stem not in done]
print(f"{len(todo)} per-dimension calls ({len(done)} done)", flush=True)
with open(OUT, "a") as out:
    for n, w in enumerate(todo, 1):
        check_budget()
        body = {"contents": [{"parts": [
            {"inlineData": {"mimeType": "audio/wav",
                            "data": base64.b64encode(w.read_bytes()).decode()}},
            {"text": RUBRIC}]}],
            "generationConfig": {"temperature": 0,
                                 "responseMimeType": "application/json",
                                 "responseSchema": SCHEMA,
                                 "thinkingConfig": {"thinkingLevel": THINKING_LEVEL.get(MODEL, "LOW")}}}
        resp = call(MODEL, body)
        log_cost(MODEL, w.stem, resp.get("usageMetadata", {}), phase="cp3-dims")
        try:
            v = json.loads(resp["candidates"][0]["content"]["parts"][0]["text"])
        except Exception:
            v = {}
        out.write(json.dumps({"clip": w.stem, **{k: v.get(k) for k in
                  ["correctness", "completeness", "helpfulness", "clarity", "reason"]}},
                  ensure_ascii=False) + "\n")
        out.flush()
        if n % 25 == 0:
            print(f"  {n}/{len(todo)}  (spend ${check_budget():.4f})", flush=True)
print("per-dimension battery done", flush=True)

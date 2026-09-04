"""Open-weight, non-Google audio judge: Qwen2-Audio-7B-Instruct on Modal (A10G).

Judges every Axis A clip (16 kHz mono wav) with the study's neutral rubric,
one clip per generation call, greedy decoding. Resume-safe: the local
entrypoint only ships clips missing from results/multijudge_qwen2audio.jsonl.

Run:  python3 -m modal run modal_qwen2audio_judge.py
"""
import json
import pathlib

import modal

app = modal.App("voice-judge-qwen2audio")

hf_cache = modal.Volume.from_name("qwen2audio-hf-cache", create_if_missing=True)

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "torch==2.4.0",
        "transformers==4.46.3",
        "accelerate==1.1.1",
        "librosa==0.10.2.post1",
        "soundfile==0.12.1",
    )
    .env({"HF_HOME": "/hf_cache"})
)

RUBRIC = (
    "You are grading a spoken answer to an interview-style question. Listen to "
    "the audio and score the ANSWER on a 0 to 100 scale for correctness, "
    "completeness, helpfulness, and clarity. Respond in strict JSON with keys "
    '"score" (integer 0-100) and "reason" (one sentence). No other text.'
)


@app.function(image=image, gpu="A10G", timeout=3600, volumes={"/hf_cache": hf_cache})
def judge_batch(jobs: list) -> list:
    import io
    import re

    import soundfile as sf
    import torch
    from transformers import AutoProcessor, Qwen2AudioForConditionalGeneration

    processor = AutoProcessor.from_pretrained("Qwen/Qwen2-Audio-7B-Instruct")
    model = Qwen2AudioForConditionalGeneration.from_pretrained(
        "Qwen/Qwen2-Audio-7B-Instruct", torch_dtype=torch.bfloat16, device_map="cuda"
    )
    hf_cache.commit()
    sr_target = processor.feature_extractor.sampling_rate

    results = []
    for n, job in enumerate(jobs, 1):
        audio, sr = sf.read(io.BytesIO(bytes(job["wav"])), dtype="float32")
        if sr != sr_target:
            import librosa

            audio = librosa.resample(audio, orig_sr=sr, target_sr=sr_target)
        conversation = [
            {"role": "user", "content": [
                {"type": "audio", "audio_url": job["clip"] + ".wav"},
                {"type": "text", "text": RUBRIC},
            ]},
        ]
        text = processor.apply_chat_template(
            conversation, add_generation_prompt=True, tokenize=False
        )
        try:
            inputs = processor(text=text, audio=[audio], sampling_rate=sr_target,
                               return_tensors="pt", padding=True)
        except TypeError:
            inputs = processor(text=text, audios=[audio], sampling_rate=sr_target,
                               return_tensors="pt", padding=True)
        inputs = {k: (v.to("cuda") if hasattr(v, "to") else v) for k, v in inputs.items()}
        with torch.no_grad():
            out_ids = model.generate(**inputs, max_new_tokens=80, do_sample=False)
        gen = out_ids[:, inputs["input_ids"].shape[1]:]
        raw = processor.batch_decode(gen, skip_special_tokens=True)[0].strip()

        score, reason = None, raw[:160]
        m = re.search(r'"score"\s*:\s*(\d+)', raw)
        if not m:
            m = re.search(r"\b(\d{1,3})\b", raw)
        if m and 0 <= int(m.group(1)) <= 100:
            score = int(m.group(1))
            rm = re.search(r'"reason"\s*:\s*"([^"]*)"', raw)
            if rm:
                reason = rm.group(1)
        results.append({"clip": job["clip"], "score": score, "reason": reason})
        if n % 16 == 0:
            print(f"  {n}/{len(jobs)} scored", flush=True)
    return results


@app.local_entrypoint()
def main():
    here = pathlib.Path(__file__).parent
    clips_dir = here / "clips" / "axis_a"
    out_path = here.parent / "results" / "multijudge_qwen2audio.jsonl"

    done = set()
    if out_path.exists():
        for line in out_path.read_text().splitlines():
            if line.strip():
                done.add(json.loads(line)["clip"])

    wavs = sorted(clips_dir.glob("*.wav"))
    todo = [w for w in wavs if w.stem not in done]
    print(f"{len(todo)} clips to judge ({len(done)} already done)")
    if not todo:
        return

    batches = [todo[i:i + 96] for i in range(0, len(todo), 96)]
    with open(out_path, "a") as out:
        for bi, batch in enumerate(batches, 1):
            jobs = [{"clip": w.stem, "wav": w.read_bytes()} for w in batch]
            print(f"batch {bi}/{len(batches)}: {len(jobs)} clips -> Modal A10G")
            results = judge_batch.remote(jobs)
            for r in results:
                out.write(json.dumps(r, ensure_ascii=False) + "\n")
            out.flush()
            print(f"batch {bi} written ({len(results)} rows)")
    print("qwen2audio judging complete")

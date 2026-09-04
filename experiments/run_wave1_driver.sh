#!/bin/bash
# Quota-resilient wave-1 driver: waits out Gemini 429s, then runs
# multivoice gen -> multivoice judging (both judges) -> per-dim battery.
cd "$(dirname "$0")"
probe() {
python3 - <<'PY'
import sys; sys.path.insert(0, ".")
from judge_runner import call
try:
    call("gemini-3.6-flash", {"contents":[{"parts":[{"text":"ok"}]}],
         "generationConfig":{"temperature":0}}, retries=1)
    sys.exit(0)
except Exception:
    sys.exit(1)
PY
}
echo "$(date) waiting for Gemini quota..."
until probe; do sleep 300; done
echo "$(date) quota back. generating multivoice clips"
python3 gen_tts_multivoice.py > ../logs_multivoice_gen.log 2>&1 || exit 1
echo "$(date) judging multivoice: pro"
python3 judge_runner.py --clips-dir clips/multivoice --model gemini-3.1-pro-preview --out ../results/multivoice_pro.jsonl --prompt-arm neutral > ../logs_mv_pro.log 2>&1
echo "$(date) judging multivoice: flash"
python3 judge_runner.py --clips-dir clips/multivoice --model gemini-3.6-flash --out ../results/multivoice_flash.jsonl --prompt-arm neutral > ../logs_mv_flash.log 2>&1
echo "$(date) per-dimension battery"
python3 run_axis_a_dims.py > ../logs_dims.log 2>&1
echo "$(date) WAVE1 COMPLETE"

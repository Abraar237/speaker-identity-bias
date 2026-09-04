#!/bin/bash
# Wave-2 driver (Axis A-prime, L2-ARCTIC): waits for wave-1 to finish AND for
# Gemini quota, then judges clips/l2arctic with both Gemini judges using the
# read-aloud rubric. Modeled on run_wave1_driver.sh.
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
echo "$(date) wave2: waiting for wave1 completion..."
until grep -q "WAVE1 COMPLETE" wave1_driver.log 2>/dev/null || [ -f .wave1_done ]; do sleep 300; done
echo "$(date) wave2: wave1 done. waiting for quota headroom..."
sleep 120
until probe; do sleep 300; done
echo "$(date) wave2: judging l2arctic with pro"
python3 judge_runner.py --clips-dir clips/l2arctic --model gemini-3.1-pro-preview --out ../results/l2arctic_pro.jsonl --prompt-arm neutral --rubric-file l2arctic_rubric.txt > ../logs_l2a_pro.log 2>&1
echo "$(date) wave2: judging l2arctic with flash"
python3 judge_runner.py --clips-dir clips/l2arctic --model gemini-3.6-flash --out ../results/l2arctic_flash.jsonl --prompt-arm neutral --rubric-file l2arctic_rubric.txt > ../logs_l2a_flash.log 2>&1
echo "$(date) WAVE2 COMPLETE"

#!/bin/bash
# Axis A-prime end-to-end: wait for the corpus zip -> extract wav dirs only ->
# prep 240 clips -> Qwen2-Audio judging on Modal -> analysis -> arm wave-2.
cd "$(dirname "$0")"
Z=l2arctic/raw/l2arctic_v5.zip
echo "$(date) waiting for corpus download to finish..."
prev=-1
while true; do
  size=$(stat -f%z "$Z" 2>/dev/null || echo 0)
  if [ "$size" = "$prev" ] && [ "$size" -gt 1000000000 ]; then
    if unzip -t "$Z" > /dev/null 2>&1; then break; fi
  fi
  prev=$size
  sleep 120
done
echo "$(date) zip complete and valid ($(du -h "$Z" | cut -f1)). extracting speaker zips..."
mkdir -p l2arctic/raw/pack l2arctic/raw/extracted
unzip -o -q "$Z" -d l2arctic/raw/pack
for inner in l2arctic/raw/pack/*.zip; do
  spk=$(basename "$inner" .zip)
  unzip -o -q "$inner" "*/wav/*" -d l2arctic/raw/extracted/ 2>/dev/null \
    || unzip -o -q "$inner" "wav/*" -d "l2arctic/raw/extracted/$spk/" 2>/dev/null
done
# also surface README/PROMPTS if present at pack root
cp l2arctic/raw/pack/README* l2arctic/ 2>/dev/null
cp l2arctic/raw/pack/PROMPTS* l2arctic/ 2>/dev/null
echo "$(date) prep: selecting + resampling 240 clips"
python3 prep_l2arctic.py > ../logs_l2a_prep.log 2>&1 || { echo PREP_FAILED; exit 1; }
echo "$(date) judging with Qwen2-Audio on Modal"
python3 -m modal run modal_qwen2audio_l2arctic.py > ../logs_l2a_qwen.log 2>&1 || echo MODAL_FAILED
echo "$(date) analysis"
python3 analyze_l2arctic_qwen.py > /dev/null 2>&1 || echo ANALYZE_FAILED
echo "$(date) arming wave-2 gemini driver"
nohup ./run_wave2_l2arctic.sh > wave2_driver.log 2>&1 &
echo "$(date) L2ARCTIC PIPELINE ARMED/COMPLETE"

# Video pipeline status

- [x] Stage 1: UNDERSTAND — `UNDERSTANDING.md`
- [x] Stage 2: SCRIPT — `SCRIPT.md` (2:05 runtime, short format). **Awaiting your approval per the paper-to-video hard rule: script before visuals.**
- [ ] Stage 3: NARRATION AND MUSIC — **blocked.** `ELEVENLABS_API_KEY` in `.env` fails even read-only calls (`voices_read`, `user_read` both return `unauthorized`). Needs a key with at least `text_to_speech`, `voices_read`, and `music` scopes before `tts.py`/`gen_music.py` can run.
- [ ] Stage 4: VISUALS — not started (depends on Stage 3 script approval + narration timing)
- [ ] Stage 5: SITE — draft narrative website already exists separately (`site/index.html`), film section wired as a placeholder pending this film
- [ ] Stage 6: RENDER — not started
- [ ] Stage 7: QA AND FINAL — not started
- [x] Stage 3a: segment texts written (7 segs)
- [x] Stage 3b: narration generated (edge-tts en-US-AriaNeural; ElevenLabs 401, Gemini credits depleted)
- [x] Stage 3c: whisper alignment done; music bed copied
- [x] Stage 4: VISUALS — 7 Remotion scenes built from real analysis.json numbers (S1 hook, S2 eight voices, S3 verdict -2.5/p=0.005, S4 two judges, S5 decomposition aha, S6 honest nulls + Nigerian reversal, S7 end card)
- [~] Stage 6: RENDER — running (film composition, 1920x1080/60fps)

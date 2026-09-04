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

- [x] Stage 3 (REDONE): narration regenerated with ElevenLabs Matilda (XrExE9yKIg1WjnnlVkGX), with-timestamps alignment (no whisper needed); edge-tts files kept as .edge.bak
- [x] Stage 6 (REDONE): re-render at new durations (DUR updated in timeline.ts); 7845 frames
- [x] Stage 7: remaster -13.9 LUFS / -0.9 dBTP; final.mp4 2:10.8; thumb regenerated

- [x] EXTENDED CUT (v3, 2026-09-04): five new segments (7-11) + rewritten closing (seg12),
  all Matilda with-timestamps narration; new scenes S8ThirdFamily (Qwen2-Audio up-bars),
  S9ThreeDirections (three judge cards), S10Interaction (difference-of-differences),
  S11NineTests (BH grid, 3 survive), S12InProgress (multi-voice + 24-real-speakers tiles);
  music bed self-crossfaded to 456s (music_bed_ext.mp3); L2-ARCTIC results scene SKIPPED
  (summary file not present at script time).
- [x] RENDER v3: 16,242 frames, 1920x1080/60fps -> mastered **-14.0 LUFS / -1.0 dBTP**,
  final.mp4 **4:30.8** (18.8MB pre-master), thumb.png regenerated; QA: seam luma 234-244
  (no black frames), A/V duration delta 0.1s, all 20 word-timing needles resolved non-zero.

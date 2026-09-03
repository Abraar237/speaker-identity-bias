# Video pipeline status

- [x] Stage 1: UNDERSTAND — `UNDERSTANDING.md`
- [x] Stage 2: SCRIPT — `SCRIPT.md` (2:05 runtime, short format). **Awaiting your approval per the paper-to-video hard rule: script before visuals.**
- [ ] Stage 3: NARRATION AND MUSIC — **blocked.** `ELEVENLABS_API_KEY` in `.env` fails even read-only calls (`voices_read`, `user_read` both return `unauthorized`). Needs a key with at least `text_to_speech`, `voices_read`, and `music` scopes before `tts.py`/`gen_music.py` can run.
- [ ] Stage 4: VISUALS — not started (depends on Stage 3 script approval + narration timing)
- [ ] Stage 5: SITE — draft narrative website already exists separately (`site/index.html`), film section wired as a placeholder pending this film
- [ ] Stage 6: RENDER — not started
- [ ] Stage 7: QA AND FINAL — not started

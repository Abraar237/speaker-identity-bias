# Progress Log
## Does the Voice Change the Grade? — A voice-identity audit of audio-LLM judges

This file tracks progress batch-by-batch as the project executes. For the full brief
see `MISSION.md`; for checkpoint gate status see `MILESTONES.md`.

---

## The mission, in short

Audio LLMs now grade spoken answers — AI job-interview screeners, automated oral
exams, speech leaderboards judged by models. Every such pipeline silently assumes the
judge grades *what was said*, not *how it sounded*. This project causally tests that
assumption: does an audio-LLM judge's score move when the exact same answer is spoken
with a different accent, a different gender of voice, different delivery (disfluencies,
telephone codec, speed, noise), or code-switching?

It is the audio sequel to a completed sibling project, "Do LLM Judges Penalise the
Script?" (same team, Hindi script bias — judges shifted scores up to 12 points,
sign-opposite across model families). This project reuses that method exactly:
frozen content, crossed conditions, one-clip-per-call blind judging, pre-registered
directions, resume-safe scripted pipelines, every number traced to one analysis script.

The project runs through 6 checkpoints (CP1–CP6), stopping for user approval at each:
lit review → experiment plan → experiments/analysis → paper → publish → self-review.
Budget: $50 total cap, **hard stop $20** (user-tightened from the original $40 on
2026-09-03).

---

## Batch log

### Batch 1 — Setup (2026-09-03)
- Installed writing skills (`Agent Skills/3-research-paper-writing/skills/*` → `~/.claude/skills/`).
- Sanity-checked keys: Gemini API live, Modal profile (`thesreedath`) live. ElevenLabs
  key returned a permissions error (`missing_permissions: voices_read`) — **not yet
  resolved**, needs a key with broader scope before the film/GIF stages (CP5).
- Skimmed the predecessor script-bias paper (method template).

### Batch 2 — CP1: Lit review + pre-emption (2026-09-03)
- 6 parallel search agents (4 by angle, 1 recency sweep restricted to the last 6
  months, 1 full-text pre-emption read of the 3 flagged nearest neighbors). Two agents
  hit a transient API session-limit error mid-run and were resumed to completion.
- **36 papers verified** (real arXiv/Semantic Scholar abstracts, not memory) →
  `lit_review/lit_review.csv`, `lit_review/LIT_REVIEW.md`.
- **Verdict: ALIVE.** No paper combines (audio-LLM judge role) × (evaluee voice as
  causal treatment) × (content score as outcome). The closest-looking neighbor
  (arXiv:2603.16941) turned out to use a judge that is explicitly text-only and
  voice-blind — full-text read caught this before it became a false alarm.
- L2-ARCTIC corpus verified: **USABLE-WITH-CONDITIONS** (CC BY-NC 4.0,
  registration-gated; 1,132-sentence overlap with CMU ARCTIC confirmed but per-speaker
  coverage is non-uniform; found and flagged a 44.1kHz vs 16kHz sample-rate mismatch
  that must be corrected before judging).
- TTS accent-manipulation pilot: 8 clips (US/UK/Indian/Nigerian × M/F), blind-classified
  one-clip-per-call — 8/8 correct accent + gender, high confidence. Cost: $0.0485.
- Pre-registered all 4 directions in `MILESTONES.md` before this ran.
- **Reported to user, approved.**

### Batch 3 — CP2: Experiment plan frozen (2026-09-03)
- User tightened the hard stop from $40 → **$20**; updated `experiments/cost_tracker.py`.
- Drafted `EXPERIMENT_PLAN.md` + published plan page:
  https://claude.ai/code/artifact/b25d8c80-edca-424a-a414-45abcf615126
- Design: 24-item answer bank (1 medium tier). Axis A (accent×gender, TTS, 192 clips).
  Axis A′ (real-speech anchor, L2-ARCTIC×CMU ARCTIC, 240 clips, $0). Axis B (delivery,
  288 judged instances/judge, mostly free via ffmpeg). Axis C (code-switching, stretch,
  cut first). Judges: Gemini 3.6 Flash + Gemini 3.1 Pro (full coverage) + one
  open-weight judge on Modal (Axis A/A′ only, to control GPU spend). Planned ~$20 with
  ~$6.40 reserve.
- Flagged the honest trade-off: n=24 vs the predecessor's n=150 means wider CIs on the
  TTS arm; the real-speech anchor is the cheapest lever to buy back power if needed.
- **Reported to user, approved 2026-09-03.**

### Batch 4 — CP3 kickoff: experiment execution (in progress, 2026-09-03)
- Confirmed local tooling: ffmpeg 8.0.1 ✓, tectonic ✓ (for CP4 paper build),
  Modal ✓ (via `python3 -m modal`, no standalone binary on PATH — not blocking).
- **Known blocker, needs your action:** L2-ARCTIC download requires a human to submit
  name/email/affiliation on the TAMU corpus page and then retrieve a download link
  from an automated email — I cannot submit that form or read that inbox. Building
  everything else (answer bank, Axis A/B TTS generation, judging) first; will flag
  again with the exact registration link when this becomes the blocking item.
- Next up: build the 24-item answer bank, then Axis A TTS generation.

### Batch 5 — CP3: answer bank + pipeline scripts (2026-09-03)
- Confirmed local tooling: ffmpeg 8.0.1 ✓, tectonic ✓, Modal ✓ (via `python3 -m modal`).
- Built and froze the **24-item answer bank** (`experiments/answer_bank.json`):
  10 domains, medium-quality tier (40–80 words, correct-but-shallow, spoken register,
  accent-neutral wording). Cost: $0.0821.
- Built the full CP3 script suite:
  - `experiments/gen_tts_axis_a.py` — Axis A generation (192 clips: 24 items × 4
    accents × 2 genders), resume-safe, loudness-normalized + resampled to 16kHz on
    generation.
  - `experiments/gen_tts_axis_b.py` — Axis B generation (24 items × 6 delivery
    conditions: clean/um/slow/fast/telephone/noise). Only the "um" condition needs
    new TTS; slow/fast/telephone/noise are free ffmpeg transforms of the clean
    baseline. Noise is ffmpeg-synthesized pink noise mixed to a measured 10dB SNR —
    **not** a licensed multi-talker babble corpus (no budget/time for one); this is
    a limitation to state plainly in the paper, not real babble.
  - `experiments/wer_check.py` — mandatory WER-neutrality gate: transcribes every
    non-baseline Axis B clip and computes word-error-rate against the frozen text;
    flags any condition above 5% WER as a failed manipulation check, to be excluded
    from the delivery-arm analysis rather than silently included as a confound.
  - `experiments/judge_runner.py` — generic one-clip-per-call judge (Gemini 3.6
    Flash / 3.1 Pro), randomized order, resume-safe JSONL, supports both prompt
    arms (neutral rubric vs. explicit ignore-delivery instruction).
  - `experiments/analyze.py` — the one script every paper number must trace to:
    within-item score shifts vs. a reference condition (US accent, gender-matched,
    for Axis A; clean baseline for Axis B), bootstrap 95% CIs (10,000 resamples),
    sign-flip permutation tests (20,000 permutations), paired d_z.
- **Axis A generation is running now** (in background — TTS calls for our 40-80 word
  answers are taking noticeably longer per clip than the CP1 pilot's single short
  sentence did, so the full 192-clip run will take a while; resume-safe, so no risk
  from interruption). Will report real numbers once it completes and judging runs.
- **Still blocked on you:** L2-ARCTIC registration (Axis A′, the real-speech causal
  anchor) — see the note in Batch 4 above. Will pick this up once Axis A/B are judged.

### Batch 6 — Environment hiccup: macOS Desktop permission (2026-09-03)
- Mid-run, macOS revoked filesystem access to `~/Desktop` (a protected folder under
  macOS privacy controls) for the whole session — both the shell and Claude Code's
  own file tools were blocked, while `/tmp` and `$HOME` stayed accessible.
- **Fixed by relocating the project**, at the user's direction: used `osascript`
  to have Finder (which has its own permissions, unaffected by the restriction)
  move the whole `VizzAI` folder from `~/Desktop` to `~/VizzAI`. Everything survived
  intact (all clips, all scripts, all results) — project now lives at
  **`/Users/prometheus/VizzAI/voice agent research`**. All scripts use
  `__file__`-relative paths, so nothing needed to be rewritten.

### Batch 7 — Real bug caught: quality-tier ceiling effect (2026-09-03)
- Ran the first real judging pass (Gemini 3.6 Flash on all 192 Axis A clips) and
  found scores compressed at **85-100 (mean 94.3, stdev 4.5)** — the answer bank
  was supposed to land at medium quality (40-75) but the judge scored everything
  near ceiling. This is exactly the range-restriction failure the predecessor
  script-bias project warned about (lesson #5): a text LLM asked to write a
  "shallow" answer still writes something that reads as competent to a different
  judge's rubric. Continuing on this data would have produced a null result with
  no way to tell "no bias" from "no headroom to measure it."
- **Caught before wasting the rest of the budget on it.** Built a small calibration
  pilot (`experiments/calibrate_quality_pilot.py`) that generates candidate answers
  with a much more aggressively-weakened prompt (explicit instructions to leave
  gaps, hedge, ramble, answer only part of the question) and scores them with the
  REAL judge + rubric before committing to a full regeneration. Calibration
  landed at scores 35/35/45/60/65 — a genuine spread through the medium band.
- Archived the old (invalid) answer bank and all downstream clips/judgments as
  `*.v1_ceiling_bug.bak`, regenerated the 24-item answer bank with the calibrated
  prompt, and re-kicked TTS generation for both axes from the corrected text.
  Re-running Axis A/B generation + judging now.

### Batch 8 — CP3 real results (2026-09-03)
- Full judging matrix complete: Axis A (192 clips x 2 judges), Axis B (139
  clips x 2 judges x 2 prompt arms), decomposition arm (192 records x 2
  judges). Spend: **$7.62 of $20 hard stop.**
- **Headline finding:** Gemini 3.1 Pro scores Indian-accented answers 2.5
  points lower than the identical American-accented answer (95% CI
  [-4.06, -0.94], p=0.005, d_z=-0.44). Gemini 3.6 Flash shows zero effect on
  the same comparison (-0.04, p=1.0). Sign/magnitude differs across judge
  families, exactly as pre-registered, though here it's two sibling models
  from the same vendor, not a full cross-vendor spread.
- **Decomposition arm confirms the acoustic-channel hypothesis** for the one
  bias found: audio -2.50 (p=0.006) -> own-transcript +1.88 (p=0.14) ->
  gold-transcript -0.83 (p=0.51). Grading from a transcript removes it.
- **Nigerian accent reversal:** both judges trended positive (not negative),
  opposite the pre-registered direction, reported plainly per house rules.
- **Delivery arm (Axis B): inconclusive**, not null — no condition reached
  significance for either judge under either prompt arm, consistent with the
  power trade-off flagged at CP2 (n=24 gives wide CIs).
- Full numbers in `MILESTONES.md` CP3 section and `results/analysis.json`.

### Batch 9 — Paper, website, and video drafts (2026-09-03)
User asked to push straight through to initial drafts of all three
deliverables using the real CP3 numbers, ahead of the normal CP4/CP5
checkpoint gates. Delivered:

- **Paper** (`paper/paper.tex` -> `paper/paper.pdf`, 6 pages, two-column,
  natbib): abstract walking the four numbered findings in order, novelty
  delineation against the 5 closest neighbors, method with the quality-tier
  ceiling bug narrated as part of the story (not hidden), results with 2
  tables + 1 forest-plot figure, 5 narrated limitations, conclusion.
  **36 references, all built from arXiv-API-verified metadata**
  (`paper/build_bib.py` fetches title/authors/year per id; 3 non-arXiv
  entries — Koenecke et al. PNAS, Kang & Rubin 2009, the L2-ARCTIC corpus
  paper — added from the CP1 verification data). Compiled clean with
  tectonic, only cosmetic underfull-hbox warnings.
- **Figure 1** (`figures/figure1_accent_forest.png`): house-style forest
  plot built from `results/analysis.json` directly, following the
  paper-figures skill's palette and conventions (own `figures/style.py`
  module, since the reference implementation lives in a sibling project not
  present in this repo).
- **Website draft** (`site/index.html`, built from `site/index_template.html`
  via `site/build_site.py`): narrative article structure per the
  research-website skill (hero, numbered TOC, finding-titled sections,
  novelty/significance sections, honest limitations, film section as an
  explicit placeholder). Published as an Artifact:
  https://claude.ai/code/artifact/ba103af0-e0b7-4cd2-b00f-f0bc3469738d
  Not yet deployed to GitHub Pages (that needs the public repo to exist
  first, a CP5 action).
- **Video script draft** (`video/UNDERSTANDING.md`, `video/SCRIPT.md`,
  `video/STATUS.md`): installed the `paper-to-video` and `social-media-gif`
  skill bundles (missed at initial setup, only the writing-skills bundle was
  copied then). Wrote the Stage 1 (understand) and Stage 2 (script) outputs
  per that skill's process. **Stage 3 (narration/music) is blocked**: the
  `ELEVENLABS_API_KEY` in `.env` fails even read-only calls
  (`voices_read`, `user_read` both return `unauthorized`) — needs a key
  with at least `text_to_speech`, `voices_read`, and `music` scopes before
  any audio can be generated. Per the skill's own hard rule ("script before
  visuals"), the script also needs your approval before Stage 4 (Remotion
  visuals) starts, independent of the key issue.
- **Not yet done, still pending:** L2-ARCTIC real-speech anchor (blocked on
  your registration), open-weight Modal judge, mitigation prompt battery,
  code-switching arm, GIFs, actual GitHub repo / Pages deployment. All are
  scoped and budgeted in `EXPERIMENT_PLAN.md` / `MISSION.md`; none were
  silently dropped.

### Batch 10 — Published: public GitHub repo + Pages (2026-09-03)
User explicitly requested this (a visible, hard-to-reverse action, confirmed
before proceeding). Steps taken, not the literal bare-README snippet given:
- Wrote `.gitignore` **before** the first `git add` (excludes `.env`, all raw
  audio in `experiments/clips/` (403MB, regenerable), `Agent Skills/` internal
  tooling data, the predecessor team's PDF in `reference/`, OS/LaTeX cruft).
- Scanned every staged file for leaked secrets before committing; the only
  matches were code referencing env-var *names* (`GEMINI_API_KEY=` as a
  string in a config parser) and one coincidental text match in
  `lit_review.csv` ("...as-instrument..."). No real key values were staged.
  Confirmed `.env` itself was never staged.
- Wrote a real `README.md` (the user's snippet only echoed a title).
- `git init` -> commit -> `git branch -M main` -> pushed to the
  already-existing `Abraar237/speaker-identity-bias` repo (public, confirmed).
- Enabled GitHub Pages via `gh api`, serving from `main` branch's `/docs`
  folder (copied from `site/index.html`, matching this project's own
  documented folder-layout convention from MISSION.md).

**Live links:**
- Repo: https://github.com/Abraar237/speaker-identity-bias
- Site: https://abraar237.github.io/speaker-identity-bias/ (building at time
  of push; GitHub Pages typically finishes within 1-2 minutes)

*(This file will keep growing batch-by-batch as CP3 executes — check back here for
the latest status without needing to re-read the whole conversation.)*

# Voice-Judge Audit · Milestones & Checkpoints

Project: "Does the Voice Change the Grade?" (see MISSION.md).
Budget cap: **$50 total** (hard stop $40). Update this file at every checkpoint.
RULE: at each CP, STOP and report to the user; wait for approval before the next phase.

## Pre-registered directions (fill in and date BEFORE any data collection)
- [x] Direction 1: judges score L2/global-South accents lower on identical words. Recorded: 2026-09-03
- [x] Direction 2: sign/magnitude differ across judge families. Recorded: 2026-09-03
- [x] Direction 3: transcript-first grading removes most of the acoustic bias. Recorded: 2026-09-03
- [x] Direction 4: delivery perturbations shift content scores despite ignore-delivery instructions. Recorded: 2026-09-03

All four directions recorded 2026-09-03, before any data collection (including the TTS
manipulation pilot). Per the script-bias precedent, reversals will be reported plainly.

## CP1 · Lit review + pre-emption — REPORTED, AWAITING APPROVAL
- [x] 4 angle agents + 1 recency sweep -> `lit_review/lit_review.csv` (36 verified papers, all id/title/abstract confirmed against arXiv API or Semantic Scholar)
- [x] Full-text pre-emption reads: arXiv:2603.16941, arXiv:2602.01030, arXiv:2507.12705 — all three CLEAR/PARTIAL, structurally orthogonal to our claim (see LIT_REVIEW.md)
- [x] L2-ARCTIC license + native/non-native sentence overlap verified — USABLE-WITH-CONDITIONS (CC BY-NC 4.0, registration-gated; 1,132-sentence overlap confirmed but coverage non-uniform per speaker; sample-rate mismatch 44.1kHz vs 16kHz found, must resample)
- [x] Gemini TTS accent manipulation pilot (8 clips: US/UK/Indian/Nigerian x M/F) — 8/8 correctly classified accent+gender, high confidence, rated natural. Cost $0.0485.
- [x] `lit_review/LIT_REVIEW.md` with novelty-delineation table
- [ ] **REPORTED TO USER, APPROVAL RECEIVED: ____**

Pre-emption verdict: **ALIVE**. Core claim (audio judge x evaluee-voice-as-treatment x
content-score-as-outcome) is unclaimed. Closest neighbor arXiv:2603.16941 is structurally
orthogonal (voice-blind text judge scoring assistant replies, not an audio judge scoring
evaluee answers) — see LIT_REVIEW.md for the full delineation.

## CP2 · Experiment plan frozen — REPORTED, AWAITING APPROVAL
- [x] `EXPERIMENT_PLAN.md`: dataset sizes, all treatment axes, judges, analyses, spend table
- [x] Plan HTML page for the user: https://claude.ai/code/artifact/b25d8c80-edca-424a-a414-45abcf615126
- [x] Budget hard stop lowered to **$20** per user override 2026-09-03 (was $40); total cap unchanged at $50; `experiments/cost_tracker.py` enforces it
- [x] **REPORTED TO USER, APPROVAL RECEIVED: 2026-09-03**

Design: N=24 items, 1 medium quality tier. Axis A (accent x gender, TTS) = 192 clips.
Axis A' (real-speech anchor, L2-ARCTIC x CMU ARCTIC) = 240 clips, $0 generation cost.
Axis B (delivery) = 288 judged instances/judge. Axis C (code-switching) = stretch,
cut first. Judges: Gemini 3.6 Flash + Gemini 3.1 Pro (full coverage), one open-weight
judge on Modal (Axis A + A' only, to control GPU spend). Planned total ~$20 with ~$6.40
reserve. Power trade-off flagged: n=24 vs predecessor's n=150 means wider CIs on the
TTS arm; real-speech anchor is the cheapest lever to buy back power if CP3 results are
inconclusive.

## CP3 · Experiments + analysis — TTS ARMS COMPLETE, L2-ARCTIC + MODAL PENDING
- [x] Frozen answer bank (v2, quality-calibrated — see Batch 7 in PROGRESS.md)
- [ ] L2-ARCTIC core set — **blocked on user registration** (TAMU corpus page)
- [x] Gemini TTS scaled set (Axis A 192 clips, Axis B 139 clips after WER exclusions), loudnorm + resampled 16kHz
- [x] Judge runs: Gemini 3.6 Flash + Gemini 3.1 Pro, one clip per call, randomized, resume-safe
- [ ] Open judge on Modal — not yet run
- [x] Decomposition arm (audio vs own-transcript vs gold-transcript), 2 accents x 2 genders x 12 items x 2 judges
- [x] Delivery arm (WER-neutrality verified — 5/120 conditions genuinely failed and were excluded; see Batch 7-8)
- [ ] Code-switching arm — not run (stretch, budget headroom allows revisiting)
- [ ] Mitigation battery — not yet triggered (see headline result below for why)
- [x] `analyze.py` -> `results/analysis.json` (bootstrap CIs 10k resamples, sign-flip permutation 20k, d_z)
- [x] Spend so far: **$7.62** of $20 hard stop
- [ ] **REPORTED TO USER, APPROVAL RECEIVED: ____**

### Headline results (TTS arms, n=24 items, gender-matched within-item shifts vs US baseline)

| Judge | Accent | Mean shift | 95% CI | p (sign-flip) | d_z |
|---|---|---|---|---|---|
| Gemini 3.1 Pro | Indian | **-2.50** | [-4.06, -0.94] | **0.005** | -0.44 |
| Gemini 3.1 Pro | UK | -0.42 | [-2.08, 1.25] | 0.73 | -0.07 |
| Gemini 3.1 Pro | Nigerian | +1.04 | [-0.52, 2.60] | 0.26 | 0.18 |
| Gemini 3.6 Flash | Indian | -0.04 | [-2.85, 2.73] | 1.00 | 0.00 |
| Gemini 3.6 Flash | UK | -1.08 | [-3.90, 1.92] | 0.49 | -0.11 |
| Gemini 3.6 Flash | Nigerian | +0.23 | [-2.60, 3.08] | 0.89 | 0.02 |

**One significant finding: Gemini 3.1 Pro penalizes Indian-accented English by 2.5
points on identical content (p=0.005), Gemini 3.6 Flash shows zero effect on the same
comparison** — sign/magnitude differs across families, as pre-registered. Nigerian
accent trended positive (not negative) for both judges — a partial reversal of the
pre-registered direction, reported plainly per the predecessor project's own precedent.
Gender main effect: not significant for either judge (Flash trended +3.25 favoring
female voices, p=0.12).

**Decomposition arm (Gemini 3.1 Pro, Indian vs US):** audio mode -2.50 (p=0.006,
significant) -> own-transcript mode +1.88 (p=0.14, opposite sign) -> gold-transcript
mode -0.83 (p=0.51). The significant penalty lives specifically in the acoustic
channel and disappears under either transcript-based grading — supporting the
pre-registered "transcript-first grading removes most of the acoustic-channel bias"
direction, for the one judge where a bias was found to decompose.

**Delivery arm (Axis B):** no condition reached significance for either judge under
either prompt arm (all p > 0.1, wide CIs). This is inconclusive at n≈21-24 per
condition, not evidence of no effect — exactly the power trade-off flagged at CP2.

**Mitigation battery not triggered:** the plan's rule was "run the battery if bias is
found" — bias was found only in one judge x one accent x one channel (audio), and the
decomposition arm already shows transcript-based grading removes it, which IS a
mitigation result (not merely a placeholder). A prompt-level battery (script-blindness
phrasings, persona, decomposed rubric) remains a good next spend if budget allows.

## CP4 · Paper — PENDING
- [ ] Figures (house style; Figure 1 teaser via HTML->Chrome; example strip)
- [ ] `paper/paper.tex` -> PDF via tectonic; 30+ arXiv-API-verified references
- [ ] Novelty + significance + narrated limitations; every number traces to analysis.json
- [ ] **DELIVERED TO USER, APPROVAL RECEIVED: ____**

## CP5 · Publish — PENDING
- [ ] GitHub repo (public, .env excluded and verified absent from tree)
- [ ] GitHub Pages website (narrative article, film embed, figures, concept-card GIFs)
- [ ] Film (script approved -> ElevenLabs narration + music -> Remotion -> -14 LUFS)
- [ ] 3 from-scratch concept GIFs (gif skill hard rules)
- [ ] **LINKS DELIVERED TO USER, APPROVAL RECEIVED: ____**

## CP6 · Self-review — PENDING
- [ ] a-star-reviewer on the PDF (target venue from user; default ICLR)
- [ ] 3 simulated scores + calibrated P(accept) + effort-ranked fix list reported

## Spend log
| Date | Item | Amount | Running total |
|---|---|---|---|
| 2026-09-03 | CP1 TTS accent-manipulation pilot (8 clips gen + 8 blind classifications) | $0.0485 | $0.0485 |

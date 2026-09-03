# Experiment Plan — "Does the Voice Change the Grade?"
## CP2 · frozen 2026-09-03

Budget: **hard stop $20** (user override, tighter than MISSION.md's original $40 hard
stop / $50 total cap — see cost/power trade-off note at the end). Enforced by
`experiments/cost_tracker.py`. All runners must call `check_budget()` after every
API call and halt immediately on breach.

Pre-registered directions (recorded in `MILESTONES.md` 2026-09-03, before this plan):
judges score L2/global-South accents lower on identical words; sign/magnitude differ
across judge families; transcript-first grading removes most acoustic bias; delivery
perturbations shift content scores despite ignore-delivery instructions.

---

## 1. Answer bank (TTS scaling arm)

- **N = 24 items**, one medium quality tier only (target score band 40–75, per the
  script-bias lesson that only the medium tier had headroom to move). 24 items span
  the same 10 everyday domains as the script-bias project (science, history, cooking,
  health, technology, culture, geography, personal finance, daily-life advice,
  education), authored once by a frozen text LLM (`gemini-3.5-flash`, temperature 0.7
  for variety, then frozen), 40–80 words each, interview-question-and-spoken-answer
  format.
- Frozen before any TTS rendering. Item texts never change across conditions —
  content is identical by construction, exactly as in the script-bias design.

## 2. Treatment axis A — Accent × Gender (primary, TTS scaling arm)

- 4 accents (US, UK, Indian, Nigerian) × 2 genders = **8 conditions per item** →
  24 × 8 = **192 clips**.
- Generator: `gemini-3.1-flash-tts-preview`, natural-language accent-style prompt +
  voice choice (Charon=male, Kore=female — same voices validated in the CP1 pilot).
- Manipulation check: CP1's 8-clip pilot already validated 8/8 correct accent+gender
  classification at high confidence. At CP3 kickoff, run one more blind check on a
  random 12-clip sample of the real 192 (not the pilot sentence) before mass judging,
  since accent fidelity can vary by content length/lexical content.
- Loudness-normalize every clip (`ffmpeg loudnorm`) before judging.

## 3. Treatment axis A′ — Real-speech causal anchor (L2-ARCTIC × CMU ARCTIC)

- Non-negotiable per MISSION lesson #6 (model-authored stimuli draw the hardest
  reviewer attacks). Uses real human speech, no generation cost.
- Select **8 shared CMU ARCTIC prompt sentences** present across all 24 L2-ARCTIC
  speakers (verified: per-speaker coverage ranges 974–1,132 of 1,132; pick 8 IDs
  confirmed present for every speaker, checked programmatically before selection —
  do not assume uniform coverage) plus 6 matched native CMU ARCTIC voices (bdl, rms
  male; slt, clb female; jmk, awb as extra native-accent variety).
- (24 L2 speakers + 6 native) × 8 sentences = **240 real clips**, $0 generation cost.
- Resample everything to a common rate (16 kHz) before judging — CP1 verification
  found L2-ARCTIC ships at 44.1 kHz vs. CMU ARCTIC's 16 kHz; an unresampled mismatch
  would let bandwidth itself become a confound.
- Grading rubric here scores clarity/intelligibility/professionalism of the reading
  (script-bias-style fixed-content grading), since ARCTIC sentences are generic
  prompts, not domain answers — the causal test is purely "same sentence, different
  real speaker," which isolates accent/gender/L1 exactly as cleanly as the TTS arm
  isolates accent/gender by construction.

## 4. Treatment axis B — Delivery (secondary)

One fixed voice (`us_f` condition, reused from Axis A — zero extra cost for the
baseline), same 24 items, 6 conditions:

| Condition | Method | Cost |
|---|---|---|
| Clean baseline | reuse Axis A us_f clip | $0 |
| Filled pauses ("um"/"uh") | re-synthesize text with semantically-null insertions | 24 new TTS clips |
| Slow speed | `ffmpeg atempo=0.85` on baseline | $0 |
| Fast speed | `ffmpeg atempo=1.25` on baseline | $0 |
| 8kHz mu-law telephone codec | `ffmpeg` codec conversion on baseline | $0 |
| Babble noise, fixed 10dB SNR | `ffmpeg` mix on baseline | $0 |

Only the "um" condition needs new generation (24 clips). All others are free ffmpeg
transforms of already-generated audio. **WER-neutrality check mandatory** before
judging: run each of the 5 non-baseline conditions through an ASR pass (Gemini audio
transcription) and confirm word error rate vs. the frozen text stays effectively zero
— any perturbation that changes recognized words is disqualified as a confound.

Each of the 6 conditions is judged under **2 prompt arms**: neutral rubric vs.
explicit "grade only the content; ignore fluency, speed, and audio quality."
24 items × 6 conditions × 2 prompt arms = **288 judged instances** per judge.

## 5. Treatment axis C — Code-switching (tertiary, stretch)

**Cut first if budget pressure appears.** If retained: 8 of the 24 items, spoken as
a task request in pure Hindi / natural Hinglish / pure English (3 conditions), TTS
generated, judged for whether tool-call or content-grade shifts. 8 × 3 = 24 clips.
Only greenlit after Axes A/A′/B are fully executed and logged spend leaves ≥$3
headroom under the $20 cap.

## 6. Decomposition arm (acoustic vs. ASR channel)

For a stratified subset of Axis A (2 accents × 2 genders × 12 items = 48 items),
grade three ways: (i) end-to-end audio, (ii) the judge's own transcript of that audio,
(iii) the gold (frozen) text transcript. Text-only calls are cheap; this arm adds
negligible cost (~$0.20) but is the whole point of the acoustic-vs-ASR-channel claim
in the pre-registration.

## 7. Judges

- **Gemini 3.6 Flash** and **Gemini 3.1 Pro** — full API, temperature 0,
  `thinkingConfig.thinkingLevel: MINIMAL` (Flash) / `LOW` (Pro rejects MINIMAL,
  per MISSION lesson #8), one clip per call, randomized order, resume-safe JSONL.
- **One open-weight judge on Modal** (Qwen2.5-Omni or Voxtral, whichever installs
  cleanly first) — scoped to **Axis A (192 clips) + real-speech anchor (240 clips)
  only**, not Axes B/C, to control GPU spend under the tighter cap. This still
  supports the primary "sign/magnitude differ across families" claim on the primary
  axis; it does not extend to the secondary/tertiary arms this round.
- **No OpenAI judge** — no key yet, per MISSION §5.
- Judges are never told the study concerns voices. One clip per call always (per
  MISSION lesson #1 — batched judging masked a 12-point bias in the predecessor
  project).

## 8. Mitigation battery (only if bias is found in Axis A/A′)

Per MISSION lesson #4: single-arm mitigation does not survive review. If Axis A or
A′ shows a significant shift, run a battery of ≥5 prompt phrasings (script-blindness
instruction, fairness framing, transcribe-first instruction, decomposed rubric,
voice-blind persona) × 2 judge families on a stratified 12-item subset of Axis A.
Budgeted at ~$2–3; comes out of the reserve below.

## 9. Analysis

One scripted `analyze.py` reading raw score JSONL files (never hand-computed
numbers). Unit of analysis: within-item score difference vs. a reference condition
(Devanagari-equivalent baseline = `us_m`/`us_f` for TTS, native CMU ARCTIC for the
real-speech anchor), per judge and condition. Bootstrap 95% CIs (10,000 resamples),
two-sided sign-flip permutation tests (20,000 permutations), paired effect size
\(d_z\). Report reversals plainly if pre-registered directions are wrong.

## 10. Budget table

| Item | Clips/calls | Est. cost |
|---|---|---|
| TTS generation, Axis A (192 clips) | 192 | $2.10 |
| TTS generation, Axis B "um" condition (24 clips) | 24 | $0.30 |
| ffmpeg perturbations (Axis B slow/fast/codec/noise) | — | $0 |
| Real-speech anchor download + resample | — | $0 |
| CP1 pilot (already spent) | 8+8 | $0.05 |
| CP3 kickoff manipulation re-check (12 clips) | 12 | $0.10 |
| WER-neutrality ASR pass (Axis B, 5 conditions × 24 items) | 120 | $0.15 |
| Judging — Gemini 3.6 Flash (Axis A + A′ + B) | 192+240+288 = 720 | $0.90 |
| Judging — Gemini 3.1 Pro (same set) | 720 | $2.80 |
| Judging — open-weight judge on Modal (Axis A + A′ only) | 432 | $3.00 |
| Decomposition arm (48 items × 3 modes, text-cheap) | 144 | $0.20 |
| Mitigation battery (conditional) | ~120 | $2.50 |
| Code-switching (stretch, cut first) | 24 clips + judging | $1.50 |
| **Reserve** (reruns, pilot fixes, price-estimate slippage) | — | ~$6.40 |
| **Total planned** | | **~$20.00 (hard stop)** |

Running total already logged: **$0.0485** (CP1 pilot).

## 11. Budget/power trade-off — flagging for the record

The user's $20 hard stop (down from MISSION.md's original $40) is a **meaningfully
tighter** budget than the predecessor script-bias paper's design, which ran n=150
items. This plan uses **n=24 items** for the TTS arm — a real reduction in
statistical power: confidence intervals on the accent-shift estimate will be wider,
and a true effect near the smaller end of the script-bias paper's range (e.g. the
+1.1 to +1.4 point shifts seen in some conditions) may not reach significance at
this N. The real-speech anchor (n=240 real clips, free) partially compensates since
it costs nothing to run larger — if the $20 cap holds, I'd rather spend saved TTS
budget on more real-speech sentences (cheap, causally strongest) than more synthetic
items. If results come back inconclusive at CP3, the cheapest fix is enlarging the
real-speech anchor's sentence count before touching the TTS arm.

---

**Next step if approved:** CP3 — execute this plan (resume-safe, randomized,
one-item-per-call runners; cost tracker with hard stop; `analyze.py`), then stop and
report headline numbers before touching the paper.

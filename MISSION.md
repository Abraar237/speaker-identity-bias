# MISSION: Does the Voice Change the Grade?
## A voice-identity audit of audio-LLM judges (accent, gender, delivery, code-switching)

You are a Claude Code agent starting a complete research project in this folder. Your user is
Mohammed Abraar (author name on the paper; email abraar@vizz.vizuara.ai). This file is your
complete brief: the problem, the plan, the tools, the rules, and the checkpoint protocol.
Read it fully before doing anything.

---

## 0. THE CHECKPOINT PROTOCOL (this governs everything)

Work phase by phase. **At the end of every phase, STOP and report to the user** with what you
found, what you built, where the files are, and what comes next. **Do not start the next phase
until the user says continue.** The phases and their checkpoint gates:

1. **CP1 · Lit review + pre-emption check** -> report, wait for approval
2. **CP2 · Experiment plan frozen (with budget)** -> report, wait for approval
3. **CP3 · Experiments complete, analysis done** -> report headline numbers, wait
4. **CP4 · Paper written (PDF compiled, figures, 30+ verified citations)** -> deliver, wait
5. **CP5 · Published: GitHub repo + GitHub Pages website + film + GIFs** -> deliver links, wait
6. **CP6 · Self-review: run the calibrated A*-reviewer on the paper, report scores + fix list**

Track progress in `MILESTONES.md` (already scaffolded) and update it at every checkpoint.
Record every result and script inside THIS folder. Log every API call's cost (see §6).

---

## 1. THE PROBLEM (what we are testing)

Audio LLMs now GRADE spoken answers: AI job-interview screeners, automated oral exams,
speech leaderboards judged by models. Every such pipeline silently assumes the judge grades
**what was said, not how it sounded**. Nobody has causally tested that assumption.

**Core question:** if the exact same answer is spoken with a different accent, by a different
gender of voice, with different delivery (ums, telephone audio, speed), or with code-switching,
does an audio-LLM judge's score move?

This is the audio sequel to a completed project by the same team: "Do LLM Judges Penalise the
Script?" (same Hindi content, Devanagari vs romanized -> judges shifted scores by up to 12
points, sign-opposite across families, protocol-sensitive, not promptable away). Read that
paper first: `reference/script-bias-paper.pdf` in this folder, website
https://abraar237.github.io/script-bias-llm-judges/, repo
https://github.com/Abraar237/script-bias-llm-judges. Your project reuses its entire method.

**Pre-registered directions (record in MILESTONES.md before ANY data collection):**
- Judges score L2/global-South accents lower on identical words.
- Sign and magnitude differ across judge families (as in the script paper).
- Transcript-first grading removes most of the acoustic-channel bias.
- Delivery perturbations (disfluencies, telephone codec) lower content scores even under
  ignore-delivery instructions.

**Treatment axes (all on frozen, content-identical answers):**
- **A. Accent x gender** (primary): same answer text spoken in US / UK / Indian / Nigerian
  English, male and female voices.
- **B. Delivery** (secondary): one fixed voice with injected "um"s, slow/fast speed,
  8 kHz telephone codec, babble noise — all verified WER-neutral.
- **C. Code-switching** (tertiary, optional if budget allows): the same task request in pure
  Hindi / natural Hinglish / pure English — measures tool-call or content-grade shift.

**Instruments:**
- **Real-speech anchor (the causal core): L2-ARCTIC corpus** — 24 real non-native English
  speakers (Hindi, Arabic, Mandarin, Korean, Spanish, Vietnamese L1s) reading the SAME
  sentences, plus matched native CMU ARCTIC recordings. Real humans, content held constant.
  VERIFY ITS LICENSE AND SENTENCE OVERLAP during CP1 before relying on it.
- **TTS scaling arm: Gemini TTS** (`gemini-2.5-flash-preview-tts` or newer 3.x TTS; ~25
  audio tokens/sec, ~$10/1M output tokens => ~$9-18 for 10h of audio). Accent via
  natural-language style prompts + voice choice. MANDATORY manipulation check: verify on a
  sample that the requested accent actually renders (listen or classify) before mass generation.
- **ElevenLabs cross-check subset** (key in `.env`) — a small second-provider set to control
  for TTS-provider artifacts. Do not exceed the plan's monthly quota; it is a subset, not the corpus.
- **Judges:** Gemini 3.6 Flash + Gemini 3.1 Pro (audio input, API), one open audio model
  (Qwen2.5-Omni or Voxtral) on Modal. NO OpenAI models for now (no key; user will add later).
  One clip per call, randomized order, judge never told the study concerns voices.

**Known pre-emption frontier (from our scout; re-verify full-text at CP1):**
- arXiv:2507.12705 AudioJudge — judge biases (verbosity/position), never varies evaluee voice.
- arXiv:2603.16941 — bias in responses TO accented speakers (assistant role, not judge role).
- arXiv:2510.02352 — paralinguistic bias in advisor role, not grader role.
- arXiv:2602.01030 — read in full; nearest neighbor.
- Crowded, avoid: accent jailbreaks, ASR accent bias, MOS-predictor bias, agentic Indic
  benchmarks (VoiceAgentBench arXiv:2510.07978 owns that space).
Full pitch with more ids: `VOICE_PROBLEM_STATEMENTS.md` (Rank 1 = this project; fold Rank 3 in).

---

## 2. THE PIPELINE (copy the script-bias project exactly; it worked)

The previous project's stages, in order, each with the skill that governs it. All skills are in
`Agent Skills/` in this folder. Install `Agent Skills/3-research-paper-writing/skills/*` into
`~/.claude/skills/` at the start so the Skill tool can load them.

| Stage | What we did last time (replicate) | Skill |
|---|---|---|
| 1. Lit review | 4 parallel search agents by angle + 1 recency pre-emption agent; 35 verified papers -> `lit_review/lit_review.csv` (paper, link, what it does, results, drawbacks, gap vs ours) + `LIT_REVIEW.md` with a novelty-delineation table written BEFORE results | `prior-work-check` |
| 2. Plan | `EXPERIMENT_PLAN.md` + an HTML plan page for the user; budget table; pre-registered directions recorded | `paper-topic-selection` |
| 3. Experiments | Frozen dataset; scripted runners (one item per call, randomized, resume-safe JSONL); cost tracker with hard stop; paired stats (bootstrap CIs, sign-flip permutation tests, d_z) in one `analyze.py` -> `results/analysis.json`; EVERY paper number traces to it | — |
| 4. Paper | Two-column LaTeX (tectonic; installed via brew), Times/fontspec, natbib author-year, 30+ arXiv-verified references (verify via export.arxiv.org API in batches), teaser Figure 1 (HTML->headless-Chrome render for full typography), qualitative example strip, results table with CIs + bold p<0.01, narrated limitations | `research-paper-writing`, `paper-quality` (NO em dashes, plain register), `paper-figures` (house palette) |
| 5. Publish | Public GitHub repo (gh CLI, account Abraar237) with code+data+paper, `.gitignore` BEFORE first add (`.env` must NEVER be committed — grep staged files for key values); GitHub Pages site from `docs/` (narrative article, film embed, figures); explainer film (ElevenLabs Matilda voice XrExE9yKIg1WjnnlVkGX + Remotion, script approved before visuals, -14 LUFS); 3 from-scratch concept-card GIFs (square 1080, rough.js, Virgil font, loop-safe) embedded in the site | `research-website`, `2-paper-to-video/skills/paper-to-video`, `1-social-media-gifs/skills/social-media-gif` |
| 6. Review | Run `4-research-paper-review/skills/a-star-reviewer` on the finished PDF with its calibration data (`4-research-paper-review/data/`); report 3 simulated scores + calibrated P(accept) + the fix list to the user | `a-star-reviewer` |

---

## 3. METHOD LESSONS FROM THE SCRIPT-BIAS PROJECT (do not relearn these the hard way)

1. **Protocol matters more than you think.** Batched judging (many items in one context) MASKED
   a 12-point bias that one-item-per-call judging revealed. Judge one clip per call, always.
   If you ever use Claude subagents as pilot judges, treat them as pilot-tier only; the clean
   arm is headless `claude -p --model <id>` one item per call (works on the user's subscription).
2. **Pre-register directions in writing before data.** Our headline finding was the OPPOSITE
   of the prediction; pre-registration is what made the reversal publishable. Report reversals plainly.
3. **Randomize job order** so partial runs are unbiased samples; make every runner resume-safe
   (skip already-written (id, condition) pairs); write JSONL incrementally, flush every line.
4. **Mitigation experiments need batteries, not single arms** (5+ phrasings + a rubric variant,
   2+ judge families). Single-arm mitigation results do not survive review. Expect backfires.
5. **Quality tiers need headroom.** Our high tier saturated at 99/100 and low at 15/100, so only
   the medium tier could move — reviewers called it range restriction. Design answer quality
   to land mid-scale (target 40-75) so every tier can move.
6. **The stimuli critique.** Reviewers attacked model-authored stimuli hardest. That is why the
   L2-ARCTIC real-speech anchor is non-negotiable here: TTS-only would eat the same attack.
7. **Verify every citation against the arXiv metadata API** (export.arxiv.org batch queries).
   One hallucinated reference is a career-level embarrassment.
8. **Track spend per call** from the API's own usage metadata with a hard-stop cap
   (previous project: `experiments/cost_tracker.py` pattern — copy it). Gemini thinking tokens
   bill as OUTPUT; use thinkingLevel MINIMAL where supported (Pro models reject MINIMAL; use LOW).
9. **Corrected-numbers discipline:** when a result changes, purge and update paper + website +
   film in ONE consolidated pass, never piecemeal.
10. **Devanagari/Hindi text in figures:** matplotlib cannot shape complex scripts; render
    HTML via headless Chrome (`--force-device-scale-factor=2`) for any figure with Indic text.
11. **Audio-specific:** loudness-normalize all stimuli (ffmpeg loudnorm) so volume is not a
    confound; verify WER-neutrality of delivery perturbations with an ASR pass before judging.

---

## 4. BUDGET (hard rules)

- **Total cap: $50.** Hard-stop in the cost tracker at $40. Report spend at every checkpoint.
- Expected: Gemini TTS ~$9-18, Gemini judging ~$3-6, Modal open judge ~$3-8 (starter credits
  usually cover), ElevenLabs subset $0 (plan), L2-ARCTIC $0 (download).
- Modal: token in `.env` (token-id / token-secret); `python3 -m modal token set ...`. A $10
  spend cap is set in the Modal dashboard.

## 5. KEYS AND ACCOUNTS (all in `.env` in this folder — NEVER commit it, never print values)

- `GEMINI_API_KEY` — TTS generation, audio-input judging, image generation for the Figure 1
  schematic (model `gemini-3.1-flash-image`), countTokens (free).
- `ELEVENLABS_API_KEY` — film narration (Matilda XrExE9yKIg1WjnnlVkGX), music bed
  (`/v1/music`), cross-check TTS subset.
- `token-id` / `token-secret` — Modal (profile thesreedath).
- GitHub: `gh` CLI already authenticated as Abraar237. Create the repo public when publishing.
- No OpenAI key yet: skip GPT judges until the user provides one.

## 6. FOLDER LAYOUT (already scaffolded; keep everything inside this folder)

```
voice agent research/
  MISSION.md                    <- this file
  MILESTONES.md                 <- checkpoint tracker; update at every gate
  VOICE_PROBLEM_STATEMENTS.md   <- the 3 scouted pitches (Rank 1 is this project)
  .env                          <- all keys (never commit)
  Agent Skills/                 <- all 4 skill bundles (writing, video, gifs, review)
  reference/script-bias-paper.pdf  <- the predecessor paper; read first
  lit_review/  experiments/  results/  paper/  figures/  site/  video/
```

## 7. FIRST ACTIONS WHEN YOU (the new session) START

1. Read this file fully, then `VOICE_PROBLEM_STATEMENTS.md`, then skim
   `reference/script-bias-paper.pdf` (the method is your template).
2. Install the writing skills: `cp -R "Agent Skills/3-research-paper-writing/skills/"* ~/.claude/skills/`
3. Sanity-check keys: one tiny Gemini call, one ElevenLabs voices GET, `modal profile current`.
4. Begin Phase 1 (lit review + full-text pre-emption on arXiv:2603.16941 and arXiv:2602.01030,
   L2-ARCTIC license + sentence-overlap verification, Gemini TTS accent manipulation pilot of
   ~8 clips) — then **CHECKPOINT CP1: stop and report to the user.**

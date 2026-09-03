# Voice-AI problem statements (audit-shaped, inference-only)

Scouted 2026-09-03. Successor candidates to the script-bias-in-LLM-judges project.
Ranked by novelty x ease. All three are inference-only, under a week, under $50.

Shared feasibility levers, verified:
- **ElevenLabs** (team already has it) as the controlled treatment generator: the same
  answer text rendered by different library voices (accent x gender x age labels) gives
  perfectly content-matched audio pairs — the audio analog of transliteration. Voice
  settings (speed, stability) give delivery treatments on top.
- **Cheap audio-input judges:** Gemini 2.5 Flash/Pro tokenize audio at ~32 tokens/sec, so
  an hour of judged audio costs cents; gpt-4o-audio / gpt-audio-mini are affordable at
  small trial counts; Qwen2.5-Omni / Qwen3-Omni and Voxtral run open-weight on Modal
  (~$4.5/hr H100). Five to six judge families is realistic, mirroring the script paper.
- **Free acoustic manipulations:** ffmpeg gives codec (8 kHz mu-law telephone), SNR-fixed
  noise, time-stretch, loudness normalization — all deterministic, all diffable.

---

## Rank 1. Does the voice change the grade? Auditing speaker-identity bias in audio-LLM judges

**Problem.** Audio LLMs are now used as judges of spoken answers — oral-exam grading,
AI-interview scoring, and leaderboard evaluation of speech systems (AudioJudge-style).
The silent assumption is that the judge grades the words, not the voice: that a
content-identical answer receives the same score whether spoken in an American, Indian,
or Nigerian accent, by a male or female voice. No published work has causally isolated
the evaluee's voice as a treatment on the score an audio judge assigns.

**What we do.** Build a bank of 100 questions x 2 answer-quality tiers (answer texts
generated once by a frozen text LLM, then held fixed). Render every answer with 6
ElevenLabs voices in a crossed design (3-4 accents: US, UK, Indian, Nigerian x 2
genders), loudness-normalized, same speed/stability settings — ~1,200 clips, ~10 hours
of audio. Judges: Gemini 2.5 Flash and Pro, gpt-4o-audio (or gpt-audio-mini),
Qwen2.5/3-Omni and Voxtral on Modal — 5-6 judge families, temperature 0. Outcomes:
(a) pointwise rubric score 1-10; (b) pairwise A/B preference between a better and worse
answer whose voices are crossed, position-counterbalanced, with a same-voice-both-sides
control that fixes the baseline at exactly 50%. Headline metric: the grade-flipping
rate — how often does the accent alone make the worse answer win? Decomposition arm:
score the same items from (i) end-to-end audio, (ii) the judge's own transcript, (iii)
the gold transcript, separating acoustic-channel bias from ASR-channel bias; report WER
per voice to rule out intelligibility as the mediator. Instruments: ElevenLabs crossed
voices as matched treatment; ffmpeg loudness normalization; balanced blocks. Compute
cap: **$50** ($20 closed APIs, $15 Modal, ElevenLabs within existing plan).

**Why it matters.** Voice-AI interview screening and automated oral assessment are
deployed now; speech leaderboards increasingly use LAM judges. If judges penalize
accents on identical content, every one of those pipelines is scoring speakers, not
answers — and the fix (transcribe-then-grade) is directly tested by our decomposition
arm. The sign-per-judge-family result would be the exact audio sequel to the script
paper.

**Pre-emption status.**
- arXiv:2507.12705 (AudioJudge) — engineering LAM judges; reports verbosity/position
  bias; does not vary evaluee speaker identity.
- arXiv:2607.13477 (protocol-level shortcuts in LALM judges) — audits
  feature-blueprint/reference/slot shortcuts; no accent, gender, or voice-identity axis.
- arXiv:2603.16941 (The Voice Behind the Words) — bias in how speech LLMs *respond to*
  accented speakers (assistant role); not the judge role, no grading of content-matched
  evaluee audio.
- arXiv:2510.02352 (FairDialogue) — decision/recommendation bias by speaker
  paralinguistics; again the model acts as advisor, not grader.
- Verdict: **alive**. The judge role with the evaluee's voice as treatment is
  unclaimed; the adjacent crowding makes the gap legible to reviewers.

**Pre-registered direction.** Judges assign lower content scores to L2/global-South
accents on identical words; the effect is large enough to flip better-vs-worse pairwise
preferences in >5% of crossed trials for at least one judge family; sign and magnitude
differ across judge families; the bias shrinks substantially (>50%) under
gold-transcript grading, localizing it in the acoustic channel.

**ICLR angle.** New bias axis for the LLM-as-judge literature (evaluee voice identity),
a causal decomposition (acoustic vs ASR channel) rather than a benchmark, and a
practical stake for every deployed spoken-assessment pipeline and LAM-judged
leaderboard.

---

## Rank 2. The synthetic-voice penalty: do audio LLMs treat AI voices differently from the same human's real voice?

**Problem.** Two assumptions go untested at once. Deployed audio LLMs increasingly hear
TTS voices (agent-to-agent calls, accessibility users, voice preservation), and the
assumption is they treat a voice the same regardless of provenance. Meanwhile, nearly
every recent audio-bias benchmark (FairDialogue, BiasInEar, VIBE, intersectional-bias
work) generates its stimuli *with TTS*, silently assuming synthetic-ness itself is
inert. Nobody has measured whether models behave differently toward a cloned voice than
toward the same speaker's real recording of the same words.

**What we do.** Take 30-40 speakers from VCTK (CC BY): for each, the real recording of
a sentence set, and a zero-shot clone (open-weight F5-TTS or XTTS-v2 on Modal — no ToS
issues, one GPU-hour) speaking the *same sentences*. Pairs are matched on speaker,
content, and duration; loudness-normalized; a vocoder-resynthesis control (real audio
passed through analysis-synthesis) separates "codec artifacts" from "TTS provenance."
Outcomes across 4-5 audio LLMs (Gemini 2.5, gpt-4o-audio, Qwen-Omni, Voxtral): (a)
content grading of the matched utterances (judge role); (b) agent-behavior tasks —
helpfulness, empathy markers, compliance with mildly sensitive but benign requests
(refusal-rate delta); (c) an explicit probe: "is this voice AI-generated?" — so we can
test whether behavioral treatment differences exceed explicit detection (implicit
sensitivity without awareness) or vice versa. ~200 trials per cell, exact binomial and
paired tests. Compute cap: **$40** ($10 Modal cloning, $10 Modal open judges, $20
closed APIs).

**Why it matters.** If models penalize or over-trust synthetic voices: accessibility
users with TTS voices get worse service, agent-to-agent voice commerce inherits a
hidden tax, and — the methodological bomb — every TTS-stimulus bias benchmark has an
unmodeled confound. If models are provenance-blind, that *validates* the TTS-as-
instrument methodology our Rank-1 project and the whole field rely on. Either result
lands.

**Pre-emption status.**
- arXiv:2601.23066 / arXiv:2410.04324 (audio-LLM deepfake detection; detection survey)
  — explicit detection accuracy only; never behavioral treatment of synthetic voices.
- arXiv:2605.28064 (I Hear, Therefore I Trust) — humans as synthetic-speech detectors,
  not model behavior.
- arXiv:2607.03418 (DETECT-3B-Omni demographics) — demographic invariance of a
  dedicated detector, not of general audio-LLM behavior.
- arXiv:2604.14548 (VoxSafeBench) — who/how/where safety conditioning; provenance
  (synthetic vs real) is not an axis.
- Verdict: **alive**, and the most novel axis of the three — "provenance bias" has no
  paper.

**Pre-registered direction.** At least one model family shows a behavioral delta
(grading or refusal) between real and cloned same-speaker same-content audio that
exceeds its explicit detection accuracy on the same pairs — i.e., models discriminate
by provenance without being able to report it. The vocoder-resynthesis control shows
the delta tracks TTS provenance, not mere re-encoding.

**ICLR angle.** A genuinely new phenomenon class (implicit provenance sensitivity in
audio LMs), a mediation-style design linking behavior to detectability, and a
methodological consequence for every TTS-stimulus audit published in the last year.

---

## Rank 3. Grading the delivery, not the answer: can audio judges ignore how something is said when told to?

**Problem.** Rubrics for spoken assessment routinely instruct the grader to score
content and ignore delivery. The silent assumption is that an instruction-following
audio judge can orthogonalize the two channels: that filled pauses, speaking rate,
telephone bandwidth, or background noise leave a "content quality" score untouched.
Robustness work measures whether models still *understand* degraded speech; nobody has
measured whether delivery leaks into content *scores* under explicit
ignore-delivery instructions.

**What we do.** Reuse the Rank-1 answer bank (100 questions x 2 quality tiers, one
fixed ElevenLabs voice). Apply 5 delivery treatments to identical content: (1) filled
pauses ("um," "uh" injected into the TTS text — semantically null insertions), (2)
slow speed and (3) fast speed via ElevenLabs speed setting, (4) 8 kHz mu-law telephone
codec via ffmpeg, (5) babble noise at fixed 10 dB SNR — plus the clean baseline; all
loudness-normalized. 4-5 audio judges, each run with two prompt arms: neutral rubric
vs. explicit "grade only the content; ignore fluency, speed, and audio quality."
Outcomes: content-score shift per treatment, and the fluency-halo flipping rate — how
often a fluent mediocre answer beats a disfluent excellent one in counterbalanced
pairwise trials. The instruction arm measures whether the leak is correctable by
prompting; the transcript-grading arm (treatments verified to leave WER unchanged)
gives the zero-leak reference. ~7,200 pointwise + 4,000 pairwise calls. Compute cap:
**$45**.

**Why it matters.** Call-center QA, telehealth triage review, and oral-exam scoring all
run over telephone-quality audio and disfluent speakers; language-assessment tools
explicitly claim to separate fluency from content. If a codec or an "um" moves the
content grade, speakers on bad connections and speakers with disfluencies (including
stuttering) are being systematically mis-scored — and we quantify whether the standard
mitigation (a rubric instruction) works at all.

**Pre-emption status.**
- arXiv:2507.12705 (AudioJudge) — notes noise as a robustness concern for judge
  pipelines; no delivery-vs-content orthogonality test, no ignore-delivery
  instruction arm.
- arXiv:2510.15406 (VocalBench-DF) — disfluency robustness of speech-LLM
  *comprehension*, not scoring bias in the judge role.
- arXiv:2606.19951 (human-model discrepancies via acoustic/prosodic perturbations) —
  perturbation methodology on MOS/quality models, not content grading by LAM judges.
- arXiv:2607.26541 (prosody-driven jailbreaks) — delivery effects on *safety*, not on
  evaluation scores.
- Verdict: **alive but nearest to the robustness literature** — highest ease, moderate
  novelty; strongest as a fast follow-up or a second experiment inside Rank 1.

**Pre-registered direction.** Every judge shifts content scores under at least one
delivery treatment despite unchanged WER; disfluency and telephone codec produce the
largest penalties; the explicit ignore-delivery instruction removes less than half of
the shift; fluent-mediocre beats disfluent-excellent in a nonzero fraction of pairs.

**ICLR angle.** Turns "robustness" into a fairness-of-evaluation claim: the first
quantification of delivery-content leakage in audio judges and of whether
instruction-based mitigation works — directly actionable for anyone writing a spoken
rubric.

---

## Ranking rationale

1. **Rank 1** — verified unclaimed gap sitting between two 2026 audit papers that each
   stop short of it; cheapest per bit of headline; perfect sequel symmetry to the
   script-bias paper (same six-judge, sign-per-family structure).
2. **Rank 2** — most novel axis (provenance), double-barreled payoff (deployment
   fairness + methodology of the entire TTS-stimulus audit literature), slightly more
   pipeline (cloning on Modal).
3. **Rank 3** — easiest to execute, but closest to existing robustness work; best
   framed as the follow-up experiment.

## Crowded areas to avoid (verified pre-empted)

- Voice-agent refusal/jailbreak by accent, emotion, prosody: arXiv:2504.01094,
  arXiv:2607.26541, arXiv:2510.16893, JALMBench arXiv:2505.17568.
- Decision/recommendation bias by speaker paralinguistics: arXiv:2510.02352,
  arXiv:2602.01030, arXiv:2604.17248, arXiv:2603.16941.
- ASR accent bias and decoder priors: arXiv:2604.21276.
- MOS-predictor gender bias: arXiv:2603.10723.

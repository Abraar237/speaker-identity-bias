# Lit Review & Novelty Delineation
## "Does the Voice Change the Grade?" — CP1

Compiled 2026-09-03. 36 papers verified (id/title/abstract confirmed against the arXiv
API or Semantic Scholar by 6 parallel search agents — 4 by angle, 1 recency sweep, 1
full-text pre-emption read). Full table: `lit_review.csv`.

Method: fanned out one agent per angle (audio-judge bias; accent/paralinguistic bias;
TTS-instrument validity; deployed spoken-assessment systems), one recency sweep
restricted to the last 6 months, and one full-text (not abstract-only) read of the
three nearest neighbors flagged by the original scout. Two agents hit an API
session-limit error mid-run and were resumed to completion rather than discarded.

---

## The claim we are testing

**Does an audio-LLM JUDGE's score of a spoken answer shift when the evaluee's voice
identity changes (accent, gender, delivery, code-switching) while the answer's CONTENT
is held identical?**

## Novelty delineation table

| Nearest neighbor | What it establishes | What it does NOT cover |
|---|---|---|
| **arXiv:2603.16941** — The Voice Behind the Words (Interspeech 2026) | Causally varies accent x gender of a **question-asker** (voice-cloned) and shows the **assistant's own text reply** gets rated less helpful for some accents. | The judge in this paper is **text-only and explicitly voice-blind** — quoting Sec 3.2: "the judge receives only the user question and the SpeechLLM response... with no knowledge of the speech accent, gender, or hesitation metadata." Voice never reaches the judge. It cannot show — and does not claim — that an **audio-input** judge's score of an **evaluee's own answer** moves with that evaluee's voice. This is the closest paper by topic and the one our delineation must be sharpest against. |
| **arXiv:2604.13067** — From Seeing it to Experiencing it | Companion to the above; voice-conversion lets users experience identical content through different vocal identities, showing assistant quality-of-service disparities. | Explicitly **judge-free** by design. No model ever scores anything. |
| **arXiv:2602.01030** — BiasInEar (EACL 2026) | Varies voice of a **spoken MCQ question** and shows the model (as test-taker) is fairly robust to accent/gender but sensitive to language/option-order. | Model is the **test-taker**, not a judge; no evaluee, no answer being scored; TTS-only. |
| **arXiv:2604.17248** — VIBE | Uses **real L2-ARCTIC speech** (validating our exact corpus) to show accent/gender of a user's voice shift what an assistant **generates** for them (recommendations). | Outcome is generated content for the speaker, not a grade of the speaker's own answer; no TTS arm despite using real L2 speech; no judge role. |
| **arXiv:2507.12705** — AudioJudge (EACL 2026) | Establishes LAM-as-judge framework and catalogs verbosity/position/noise bias on **TTS-system** outputs. | Evaluees are TTS systems, not human speakers; never varies evaluee identity as a treatment. |
| **arXiv:2606.24648** — ParaPairAudioBench | Tests whether LALM judges can correctly **perceive and rank** gender/age/style/rate/emphasis differences — content held fixed in some conditions. | Tests judge **competence at detecting** the attribute as the judging *target*, not whether the attribute **leaks into an unrelated content score**. Inverse of our question. |
| **arXiv:2608.06718** — Counterfactual Audits for Response Evaluation | Multi-judge-family (Gemini/GPT/open), transcript-fixed counterfactual protocol on judges — methodologically our closest cousin. | Varies **affect/prosody** to test evidence-use correctness, not accent/gender/code-switching as a demographic bias treatment on a content grade. |
| **arXiv:2608.26137 / 2608.06300** — L2 speaking-assessment fairness audits | Model is a **grader** of L2 speech; audits fairness by L1/age. | **Observational** — content varies naturally across real speakers of differing proficiency; no controlled same-content voice swap. One is representation-probing (CAVs), not an outcome audit. |
| **Kang & Rubin (2009)**, *Reverse Linguistic Stereotyping* | The exact causal design (identical audio, manipulated apparent identity, rating shifts) — but on **human** listeners, pre-audio-LLM. | Not an LLM at all; we port this design to audio-LLM judges. |

## What is new — ours alone

1. **The judge role with evaluee voice as treatment.** No paper puts an audio-input LLM
   in the grader role and varies the graded speaker's own accent, gender, delivery, or
   code-switching while holding answer content fixed. The nearest attempts either (a)
   vary the *asker's* voice and judge the assistant's reply through a voice-blind text
   judge (2603.16941), (b) make the model the test-taker rather than a judge (2602.01030),
   or (c) audit graders observationally across naturally different speakers (2608.26137).
2. **Real speech + TTS as two instruments compared side by side.** VIBE (2604.17248) uses
   real L2-ARCTIC speech; nobody pairs it with a TTS scaling arm to check whether
   TTS-only findings replicate on real non-native speech, or vice versa.
3. **Delivery as a judge-bias treatment, not a robustness stressor.** VocalBench-DF and
   the acoustic/prosodic-perturbation literature ask whether models still *understand*
   degraded speech; nobody asks whether a WER-neutral disfluency, codec, speed, or noise
   change leaks into a *content grade* under an explicit ignore-delivery instruction.
4. **Code-switching as a judge-bias treatment.** Untouched by every paper found, including
   VoiceAgentBench (2510.07978), which we explicitly stay out of (agentic tool-call
   competence in Indic languages, not judge-score bias).
5. **Acoustic-vs-ASR channel decomposition on a judge.** 2604.21276 and the Koenecke et
   al. (2020) PNAS result decompose accent bias at the ASR/WER layer; nobody carries that
   decomposition through to a downstream *judge score*.

## Significance

Audio-LLM judges already sit inside AI interview screeners, automated oral-exam graders,
and speech-leaderboard evaluation (2507.16835 documents 300,000+ real AI-conducted
interviews already using this exact LLM-as-judge pattern). If judge scores move with
accent, gender, or delivery on identical content, every one of those pipelines is
partly scoring the speaker rather than the answer — and unlike the human-rater version
of this problem (known since Kang & Rubin, 2009), nobody has checked whether swapping
in an LLM judge removed the effect or merely hid it behind a veneer of objectivity.

## Pre-emption verdict

**ALIVE.** Two independent passes agree: a full-text read of the three originally
flagged nearest neighbors found each one structurally orthogonal to our claim (see
table), and a recency sweep restricted to the last 6 months found no new competing
paper, only closer variants of the same three categories above. The recency-sweep
agent's first-pass summary called this "alive-but-crowded" on the reasoning that
2603.16941 already establishes "content-held-constant accent x gender judge-score
shift" — but that overstates it: 2603.16941's judge is text-only and deliberately
voice-blind (quoted above), so it cannot speak to whether an *audio* judge shifts
scores based on the *evaluee's own* voice. Correcting for that, the core claim (audio
judge x evaluee-voice-as-treatment x content-score-as-outcome) remains fully open, not
merely its delivery/code-switching extensions.

**Crowded-but-avoid zones, confirmed:** voice-agent refusal/jailbreak by accent/prosody;
decision/recommendation bias in the advisor role; ASR accent bias and decoder priors;
MOS-predictor gender bias (2603.10723); agentic Indic benchmarks (VoiceAgentBench owns
this). None overlaps our judge-role, content-fixed design.

## L2-ARCTIC verification (verified 2026-09-03)

- **License: CC BY-NC 4.0**, registration-gated (name/email/affiliation form, automated
  download link). Non-commercial research and citation (Zhao et al., Interspeech 2018)
  satisfy it; public posting of derived clips is fine under the same terms, but we
  should not re-mirror the full raw corpus.
- **CMU ARCTIC license: permissive BSD-style** ("free for use for any purpose... subject
  to light restrictions"), no gate.
- **Sentence overlap confirmed:** both corpora use the same 1,132-sentence CMU ARCTIC
  prompt set with matching `arctic_aXXXX`/`arctic_bXXXX` IDs — but coverage is
  **not uniform** (974–1,132 WAVs per L2 speaker); pairing must intersect actually-present
  IDs per speaker, not assume all 1,132.
- **24 speakers confirmed:** 6 L1s (Hindi, Korean, Mandarin, Spanish, Arabic, Vietnamese)
  x 2 genders x 2 speakers each.
- **Sample-rate mismatch found and must be corrected:** L2-ARCTIC ships at 44.1 kHz,
  standard CMU ARCTIC distributions at 16 kHz — both must be resampled to a common
  rate before judging, or bandwidth becomes a confound.
- **Verdict: USABLE-WITH-CONDITIONS** (registration, non-commercial framing, per-speaker
  ID intersection, common resampling, pin to corpus v5.0 for annotation consistency).
  Full detail in the agent's report; conditions will be encoded directly into the
  data-prep script at CP2/CP3.

## TTS accent-manipulation pilot (2026-09-03)

8 clips generated with `gemini-3.1-flash-tts-preview` (US/UK/Indian/Nigerian accent
prompts x male/female voice), blind-classified one-clip-per-call by `gemini-3.6-flash`
(temperature 0). All 8/8 classified with **high confidence** as the intended accent and
correct gender, and all 8/8 rated "natural: yes." Files: `experiments/pilot_accent_check/`.
Cost: **$0.0485** (logged in `experiments/cost_log.jsonl`). This is a promising signal
that Gemini TTS accent prompting is usable for the scaling arm, though a single blind
LLM classifier is not a substitute for a human/native-speaker check — a larger,
human-audited manipulation check is planned for CP2/CP3 before mass generation.

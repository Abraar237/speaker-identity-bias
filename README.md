# Does the Voice Change the Grade?

A causal audit of speaker-identity bias in audio-LLM judges: accent, gender,
delivery, and code-switching.

Audio language models now grade spoken answers directly, in automated oral
exams, AI interview screening, and speech leaderboards. Every one of these
systems assumes the judge scores what was said, not how it sounded. This
project tests that assumption directly by holding a bank of answers fixed in
content and varying only the speaker's voice.

**Paper (AAAI-27 format, for the Second Workshop on Audio-Centric AI):**
[`docs/paper_aaai_preprint.pdf`](docs/paper_aaai_preprint.pdf) (named preprint) ·
[`docs/paper_aaai_submission.pdf`](docs/paper_aaai_submission.pdf) (anonymous build).
Sources in `paper/aaai/`; reference checks in `paper/refs_verification.md`.

## Headline results

- **Single voice per accent:** Gemini 3.1 Pro scores an Indian-accented answer 2.50 points lower
  than the identical American-accented answer (95% CI [-4.06, -0.94], p=0.005); grading the
  judge's own transcript removes it (interaction -6.04, p=4e-4).
- **Six more voices:** the penalty dissolves (Indian shift -0.76, p=0.35; single voices range
  from +2.08 to -4.58), and a four-part rubric gives -0.33. One voice per accent is not enough.
- **Real speech (L2-ARCTIC):** both Gemini judges penalise all six non-native first languages by
  4 to 16 points (all p <= 4e-4); Qwen2-Audio-7B barely moves.

## Layout

```
paper/aaai/     AAAI-27 LaTeX source (anonymous + named builds, appendix inside), figures, bibliography
paper/          gen_schematic.py (Nano Banana 2 Figure 1), refs_verification.md
figures/        Result figures and the shared house-style module
site/           Draft narrative website (also published to docs/ for GitHub Pages)
docs/           GitHub Pages source
video/          Explainer film script and pipeline status (production pending)
experiments/    All experiment runners (answer bank, TTS generation, judging, analysis)
results/        Raw judgment logs (JSONL) and the scripted analysis output
lit_review/     Literature review and novelty delineation (36 verified references)
```

Raw audio clips are not tracked in this repository to keep its size
reasonable; they are fully regenerable by rerunning the scripts in
`experiments/` against the frozen `experiments/answer_bank.json`.

## Building the paper

```
cd paper/aaai && for f in paper_aaai_submission paper_aaai_preprint; do pdflatex $f; bibtex $f; pdflatex $f; pdflatex $f; done   # AAAI kit needs pdfLaTeX
```

## Reproducing the analysis

Every number in the paper traces to `experiments/analyze.py` reading the raw
files in `results/`. Run it directly:

```
python3 experiments/analyze.py
```

## Author

Mohammed Abraar, Vizuara Research (abraar@vizz.vizuara.ai)

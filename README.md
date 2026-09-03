# Does the Voice Change the Grade?

A causal audit of speaker-identity bias in audio-LLM judges: accent, gender,
delivery, and code-switching.

Audio language models now grade spoken answers directly, in automated oral
exams, AI interview screening, and speech leaderboards. Every one of these
systems assumes the judge scores what was said, not how it sounded. This
project tests that assumption directly by holding a bank of answers fixed in
content and varying only the speaker's voice.

**Draft status.** This is a working draft ahead of the project's full publish
checkpoint. See `PROGRESS.md` for a batch-by-batch log and `MILESTONES.md` for
checkpoint status.

## Headline result so far

Gemini 3.1 Pro scores an Indian-accented answer 2.5 points lower than the
identical American-accented answer (95% CI [-4.06, -0.94], p=0.005). Gemini
3.6 Flash shows no such effect on the same comparison. A decomposition arm
traces the bias to the acoustic channel: grading from a transcript of the
same audio removes it. Full results in `paper/paper.pdf` and `results/analysis.json`.

## Layout

```
paper/          LaTeX source, compiled PDF, bibliography build script
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

## Reproducing the analysis

Every number in the paper traces to `experiments/analyze.py` reading the raw
files in `results/`. Run it directly:

```
python3 experiments/analyze.py
```

## Author

Mohammed Abraar, Vizuara Research (abraar@vizz.vizuara.ai)

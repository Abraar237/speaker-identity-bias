# Reference verification: AAAI-27 build (2026-10-29)

Bibliography: `paper/aaai/references.bib` (37 entries; 3 unused entries from the old `refs.bib` dropped:
hu2026shouldwetype, jain2025voiceagentbench, tam2025medvoicebias).

## 1. Metadata

All cited keys exist in the bib. Every arXiv entry (33) was checked against the arXiv API for title,
first author and year: 33/33 OK. Entries whose arXiv comment states acceptance were switched to the
venue, with the venue year:

| key | venue now in bib |
|---|---|
| jeon2026parapairaudi | Interspeech 2026 |
| wang2025speechllmasj | ACL 2026 |
| wei2026biasintheear | Findings of EACL 2026 |
| satish2026thevoicebehi | Interspeech 2026 |
| satish2026fromseeingit | CHI 2026 Extended Abstracts |
| chen2025audiolargela | ICLR 2025 |
| satish2025speakyourmin | Identity-Aware AI Workshop, LREC 2026 |
| satish2025dobiasbenchm | ICASSP 2026 |
| yang2025positiontowa | ICML 2026 |
| zhong2025pairwiseeval | Interspeech 2025 |
| xinyuan2025scalablecont | ASRU 2025 |
| takagi2026investigatin | Interspeech 2026 |

Non-arXiv entries checked against Crossref: kang2009reverse (DOI 10.1177/0261927X09341950),
koenecke2020racial (10.1073/pnas.1915768117), zhao2018l2arctic (10.21437/Interspeech.2018-1110) OK.
Formula sources added (already verified for the voice-provenance paper): efron1979 (bootstrap),
good2005 (permutation test), lakens2013 (d_z), bh1995 (Benjamini-Hochberg).

## 2. Claim check

Each citing sentence was checked against the cited paper's full text (arXiv HTML) or abstract.

Fixed (wording in the old ICLR draft that the source does not support):

| key | old claim | what the source says | new wording |
|---|---|---|---|
| ma2025assessmentof | graders "claim to measure content, not accent" | speech LLMs for L2 oral proficiency must handle diverse accents; no such claim | "Speech LLMs are being trained to grade the oral proficiency of L2 speakers, who bring a wide range of accents" |
| allbert2025evaluatingsp | pipelines "process hundreds of thousands of interviews with an LLM-as-judge step" | data sampled from over 300,000 AI-conducted interviews, evaluated with an LLM-as-a-judge framework (the judge is the paper's evaluation method) | "one study samples from over 300,000 AI-conducted job interviews and evaluates them with an LLM judge" |
| manakul2025audiojudgeun | "evaluees are TTS systems, not people" | evaluates speech systems and audio characteristics; no speaker-identity treatment | "These studies vary the delivery the judge should notice" |
| satish2026thevoicebehi | judge "explicitly text-only and voice-blind" | LLM judges rate the SpeechLLM's text replies; finding: lower helpfulness for Eastern European accents, mainly female voices | states the finding; the model is the respondent |
| ginjala2026doLLMdecoders | grouped as "observational audit of deployed L2 grading" | ASR fairness; Whisper hallucinates on Indian-accented speech (9.62% insertions) while LLM decoders stay below 3.1% | moved to speech recognition; "Whisper hallucinates far more on Indian-accented speech than LLM-decoder recognisers do" |
| koenecke2020racial | grouped with L2 grading audits | ASR WER 0.35 (Black) vs 0.19 (white) | moved to speech recognition; number used in Table 10 |
| uehara2026interpretabl | grouped as an observational L2 fairness audit | hybrid L2 scorer benchmarked against trained raters ("fairly evaluated" = evaluated against the right human bar) | "benchmarked against the agreement of trained human raters" |
| liu2025vocalbenchdf, takagi2026investigatin | listed as judge-construction work | disfluency robustness benchmark; MOS predictors vs human listeners | placed under respondents and speech-quality assessment respectively |
| huang2026codecmosacce, xinyuan2025scalablecont | generic "TTS validity" | MOS benchmark across ten accents with same-accent listener bias; scaling accented TTS via accent-label discovery and augmentation | specific wording |

Verified as stated: chen2025audiolargela, chiang2025audioawarela, choi2025acousticbase, jeon2026parapairaudi,
kang2009reverse, labroo2026biasanalysis, lin2026vibevoiceind, miller2026doaudiolangu, park2026auditingprot,
ren2026mosbiasfromh, satish2025dobiasbenchm, satish2025speakyourmin, satish2026fromseeingit, wang2025speechllmasj,
wang2026priorongevidence (39.6% figure), wei2026biasintheear, wu2025evaluatingbi, yang2025positiontowa,
zhang2026jastinaligni, zhao2018l2arctic, zhong2025pairwiseeval, booth2023integratingp, and the four formula sources.

## 3. Numbers in the paper

Every result number was re-read from `results/analysis.json`, `results/wave_final_summary.json`,
`results/interaction_test.txt`, `results/l2arctic_gemini_summary.txt`, `results/qwen2audio_summary.txt` and
`results/l2arctic_qwen2audio_summary.txt`; the decomposed-rubric shifts were recomputed from
`results/axis_a_dims_pro.jsonl`. One correction to the old draft: Qwen2-Audio's single-voice scores were said to
cluster "around 75"; the file shows four distinct values from 75 to 95 (mean 86.3).

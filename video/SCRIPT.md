# Script — Does the Voice Change the Grade?
Format: short, target 2:00. Narrator: ElevenLabs Matilda (`XrExE9yKIg1WjnnlVkGX`),
American female, per paper-to-video default. STATUS: awaiting approval, not yet
recorded (ElevenLabs key blocked, see UNDERSTANDING.md).

---

**1. [0:00-0:12]**
Narrator: "Right now, an AI is listening to someone's interview answer and
giving it a score. It's supposed to grade what they said. But does it also
grade how they sound?"
Visual: a waveform plays under a simple score dial ticking up. Title card
fades in: "Does the Voice Change the Grade?"

**2. [0:12-0:28]**
Narrator: "We tested it directly. We wrote one interview answer, froze the
exact words, and had a computer voice speak it eight different ways: four
accents, two genders. Same sentence, every single time."
Visual: one text block splits into eight audio-waveform tiles labeled US,
UK, Indian, Nigerian, times two genders, all playing the identical text
underneath.

**3. [0:28-0:48]**
Narrator: "Then we asked two AI judges to grade every version, one clip at a
time, never told what we were testing. Gemini 3.1 Pro scored the Indian
accented version two and a half points lower than the identical American
accented answer. That gap is real: the odds of seeing it by chance are about
one in two hundred."
Visual: the two score bars settle at their final values, Indian bar
visibly lower, "p = 0.005" labels in below the gap.

**4. [0:48-1:05]**
Narrator: "Here's the part that should worry you more. We ran the exact same
audio past Gemini's own sibling model, 3.6 Flash. It scored the two accents
the same. Same company, same audio, and the two models disagree."
Visual: split screen, Pro's bars on the left showing the gap, Flash's bars
on the right sitting flat and even.

**5. [1:05-1:28]**
Narrator: "So we went looking for where the penalty actually lives. We
graded the same content three ways: from the audio, from the judge's own
transcript of that audio, and from the original clean text. The moment the
model only sees words, the penalty disappears."
Visual: three-panel reveal, "Audio" bar showing the dip, then "Own
transcript" and "Gold transcript" bars both flattening back to near zero,
each panel labeled with its own p-value.

**6. [1:28-1:48]**
Narrator: "We should be straight about what we haven't shown yet. We tried
five ways to change delivery: filled pauses, faster or slower speech, phone
quality audio, background noise. None of them moved the score, at least not
yet, at this sample size. And a Nigerian accent actually trended toward a
higher score, the opposite of what we predicted before we ran this. We're
reporting that exactly as we found it."
Visual: five small icon tiles (pause, speed, phone, noise, mic) fade in
side by side with flat, near-zero bars beneath them; then the Nigerian-accent
bar appears, tilting upward, unexpectedly.

**7. [1:48-2:05]**
Narrator: "One finding, so far, is solid: which audio judge you pick is not
a neutral choice, and grading from a transcript is a real, tested fix, not
just a guess. If you're using an AI to grade a human voice today, that's
worth checking before you trust the score."
Visual: end card, Vizuara Research logo, paper site URL, "Vizuara Research"
credit line.

---

## Notes for the next pass
- No em dashes anywhere on screen, per house style; narration above uses none.
- Every number spoken aloud must match `results/analysis.json` exactly at
  build time; re-verify before recording if any experiment reruns.
- Scene 5's three-panel reveal is the film's one mandatory "aha" beat; give
  it the most animation budget.
- Music bed: inspiring, understated, per `music_prompt.txt` convention;
  duck under every narration segment, never under the silence in scene 6's
  honest-limitation beat (let that one breathe).


## Extended cut (v3, ~4:30) — segments 8-12 added 2026-09-04

Segs 1-6 unchanged. Old seg7 closing replaced by five new segments plus a
rewritten closing (all Matilda, same recipe):

**seg7 — the third family (31.1s).** "At this point you might ask: maybe that's
just how Gemini models hear the world. Fair question. So we brought in a third
judge from a completely different family: Qwen2-Audio, an open-weight model
that anyone can download and run. It listened to the exact same one hundred
ninety-two clips. And it did the opposite. It scored every non-American accent
higher than the American one: British up nearly three points, Nigerian up two
point three, Indian up two."

**seg8 — three directions (20.6s).** "Line the three judges up and the picture
gets strange. One family penalises an accent. One doesn't react at all. And one
rewards every accent it hears. Same audio, same words, three different
verdicts. So the direction of the bias is not a property of the voice. It's a
property of the judge you happened to pick."

**seg9 — the interaction test (22.3s).** "We also want to be careful with our
own statistics. It's tempting to say the penalty is significant with audio and
not significant with transcripts, case closed. But a difference in significance
is not a significant difference. So we tested the difference itself. The audio
penalty is six points larger than the transcript one, and that gap has odds of
about one in twenty-five hundred."

**seg10 — nine tests (23.7s).** "One more honesty check. Across the three
judges we ran nine accent tests in total, and if you run enough tests,
something will look significant by pure luck. So we corrected for all nine.
Three results survive: the Pro penalty on Indian accents, and Qwen's reward for
British and for Nigerian voices. Everything else, we treat as noise."

**seg11 — what would change our mind (25.0s).** "What would change our mind?
Two experiments, running right now. Every accent you've heard so far came from
a single synthetic voice, so we're re-running the whole study with several
different voices for every accent. And we've just obtained recordings of
twenty-four real people, from six different language backgrounds, reading the
very same sentences. Real human voices, not synthetic ones."

**seg12 — closing (28.0s).** "So here's where we land, for now. If you're using
an AI to grade a human voice — a job interview, an oral exam, a support call —
which judge you pick is not a neutral engineering choice. It can quietly decide
who sounds better. Grading from a transcript is a real, tested fix for the one
penalty we found, not just a guess. Because a score should measure what
somebody said. Never who they sound like."

Scene map: S8ThirdFamily (flat up-bars echoing the site GIFs), S9ThreeDirections
(three judge cards, down/flat/up), S10Interaction (two mini bars + gap card,
"a difference in significance is not a significant difference"), S11NineTests
(3x3 p-value grid, three cells survive BH), S12InProgress (multi-voice +
24-real-speakers tiles, pulsing "running now"), then the original end card.
The real-speech L2-ARCTIC results scene was SKIPPED: results file not present
at script time.

## Reversal cut (v4, ~5:14) — 2026-09-05

Scene order: segs 1-5 kept (hook, eight voices, -2.5 verdict, two judges,
decomposition), then kept-but-reordered seg9 (interaction test), seg7 (Qwen
third family, TTS arm), seg6 (delivery nulls + Nigerian), then five NEW
segments. Old seg8 (three directions), seg10 (nine tests), seg11 (in
progress), seg12 (old closing) retired — superseded by the reversal story.

**seg13 — the replication pivot (32.1s).** "Then we did the experiment every
careful reviewer asks for. Every accent you heard so far came from one
synthetic voice. So we re-rendered the whole study with six more voices, and
asked the same judges again. The penalty dissolved. Across the new voices,
the Indian shift is small and indistinguishable from zero. And voice by
voice, the story scatters: one voice is up two points, another is down four
and a half. The voice, not the accent, moves the score."
Visual: six per-voice bars grow one by one (Fenrir +2.08 ... Zephyr -4.58),
overall -0.76 p=0.35 line, thesis line.

**seg14 — the rubric vanishing (20.3s).** "We also changed one more thing:
the rubric. Instead of one overall score, we asked the original judge for
four separate scores: correctness, completeness, helpfulness, and clarity.
On the very same voices that produced the penalty, it vanished. Every
dimension came back flat."
Visual: four dimension cards cascade in, values settle near zero, green
flat-lines draw.

**seg15 — the honest reversal (22.0s).** "Before we collected any data, we
wrote our prediction down. So we are reporting exactly what happened: our
own headline did not survive our own replication. That is not a failure.
That is the method working. And it carries a warning for this whole field:
an audit built on a single voice and a single rubric can manufacture an
accent bias that is not there."
Visual: the -2.5 p=0.005 stamp gets struck through; "method working" beat;
warning line word-reveals. THE THESIS SCENE.

**seg16 — real speech (38.5s).** "Real speech is a different story. We took
recordings of twenty-four real people, from six language backgrounds,
reading the same sentences as native speakers. Under a read-aloud rubric,
both Gemini judges penalised every single group: Hindi speakers by four to
six points, Arabic by about thirteen, Mandarin and Vietnamese by around
fifteen. Two judges, in close agreement. The open-weight judge barely
reacted at all. Whether that penalty is fair grading of fluency, or
something more, is exactly the question this rubric cannot settle. We say so
in the paper."
Visual: per-L1 double-bar ladder (Pro hot / Flash slate) animates row by
row, Hindi shortest to Mandarin longest; agreement + caveat lines.

**seg17 — closing checklist (26.7s).** "So here is what to demand of any
audio judge audit, including ours. More than one voice per accent. More than
one rubric. Real human speech, not just synthetic. And a judge from more
than one family. If you are using an AI to grade a human voice today,
grading from a transcript is still the one tested fix. Because a score
should measure what somebody said. Never who they sound like."
Visual: four checkmarks draw in on spoken beats; transcript-fix line; end
card (Vizuara Research, title, repo URL).

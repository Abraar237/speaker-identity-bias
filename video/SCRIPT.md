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

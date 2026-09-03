# Understanding — Does the Voice Change the Grade?

**The one idea that makes this matter:** audio-grading AI (interview screeners,
oral exam graders, speech leaderboards) is already deployed on the unchecked
assumption that it scores words, not voices. This project ran the one clean
experiment that tests it: freeze the words, change only the accent, watch the
score.

**Story arc (short format, 1:50-2:15):**
1. Hook — an AI is already listening to your interview answer and grading it.
   Does it hear you, or does it hear your accent?
2. The experiment — one answer, frozen, spoken eight ways.
3. First reveal — Gemini 3.1 Pro docks the Indian-accented version 2.5 points.
   Real number, real p-value, on screen.
4. Second reveal — its sibling model, same company, shows nothing. Two judges,
   one truth: which model you pick is not a neutral choice.
5. The decomposition — strip the voice away (grade the transcript instead),
   the penalty vanishes. This localizes it: the bias lives in the sound.
6. Honest limitation beat — five delivery changes (um, speed, phone quality,
   noise) moved nothing yet, and the Nigerian accent trended the *opposite*
   direction from the prediction. Say this plainly; it's part of the finding.
7. Takeaway — if you deploy an audio judge today, the model you pick matters,
   and grading from a transcript is a tested fix, not a guess.

**Real figures/numbers available to redraw in Remotion:**
- Figure 1 forest plot (`figures/figure1_accent_forest.png`) — accent shift by
  judge, both Gemini models, three accents, CI bars.
- Table 1 numbers: Indian accent, Gemini 3.1 Pro, -2.50 [-4.06, -0.94], p=0.005.
- Table 2 (decomposition): audio -2.50 (p=0.006) -> own-transcript +1.88
  (p=0.14) -> gold-transcript -0.83 (p=0.51).
- Answer-bank calibration story (94.3 ceiling -> 61.3 corrected mean) as a
  brief methods-credibility beat if time allows.

**Blocker:** `ELEVENLABS_API_KEY` in `.env` currently fails even read-only
calls (`voices_read`, `user_read` both return `unauthorized`). Stage 3
(narration + music generation) cannot run until this key is fixed with at
least `text_to_speech`, `voices_read`, and `music` scopes. Flagged to the user;
this document and the script below are the deliverable until that's resolved.

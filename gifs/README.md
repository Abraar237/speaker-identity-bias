# Concept GIFs

Three square (1080x1080) animated concept cards for the speaker-identity-bias
study, built with Remotion + rough.js per the Vizuara social-media-gif recipe
(hand-drawn linework, flowing dots, seamless 240-frame loop, every number real
and traceable to results/analysis.json).

- same-words-different-voice: one frozen answer, four accents, one audio judge;
  Indian shifts -2.5 (p=0.005), Nigerian +1.0, British -0.4 vs the US baseline.
- bias-lives-in-the-audio-channel: audio vs own-transcript vs gold-transcript
  grading; only the audio path keeps the penalty (-2.5 -> +1.9 / -0.8, n.s.).
- two-judges-two-verdicts: Gemini 3.1 Pro (-2.5, p=0.005) vs Gemini 3.6 Flash
  (-0.0) on the identical clip.

`src/` holds the self-contained composition sources (lib/ = the shared
rough.js/FlowDots component library; needs `Virgil.woff2` and a Devanagari
face in the Remotion project's public/fonts/). To rebuild: drop src/ into a
Remotion 4.x project, register each component as a 240-frame 30fps 1080x1080
composition, `npx remotion render <Id> out/<name>.mp4 --concurrency=4`, then
encode the GIF with the two-pass palette ffmpeg recipe (fps=12, 840px,
192 colours). Rendered outputs live in out/.

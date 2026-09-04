import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  PAGE, INK, INK2, MUTED, FAINT, GRID, HOT, SLATE, SHELF,
  SANS, MONO, growth, fadeAlpha, T, Card, ReplayPill, Swatch, fmt,
} from "./flat";

// Vertical bars: the same Indian-vs-American comparison under three grading
// modes, Gemini 3.1 Pro. Numbers from results/analysis.json (decomposition).
const BARS = [
  { label: "hear the audio", shift: -2.5, color: HOT, tag: "penalty · p = 0.006", strong: true },
  { label: "read its own transcript", shift: +1.88, color: SLATE, tag: "gone · p = 0.14", strong: false },
  { label: "read the gold transcript", shift: -0.83, color: SHELF, tag: "gone · p = 0.51", strong: false },
];

const ZERO_Y = 560;       // px of shift == 0
const PX_PER_PT = 106;    // +-3 pts spans +-318 px
const BAR_W = 120;
const XS = [235, 540, 845];

export const BiasInTheAudioChannel: React.FC = () => {
  const frame = useCurrentFrame();
  const g = growth(frame);
  const a = fadeAlpha(frame);

  return (
    <AbsoluteFill style={{ background: PAGE }}>
      <Card>
        <T x={60} y={52} size={46} color={INK} weight={700} w={880}>
          The bias lives in the audio channel
        </T>
        <T x={60} y={116} size={25} color={MUTED} w={880}>
          one Indian-accented answer, graded three ways by the same judge
        </T>
        <Swatch x={60} y={182} color={HOT} label="hears sound" w={260} />
        <Swatch x={320} y={182} color={SLATE} label="reads text only" w={420} />

        <T x={44} y={236} size={22} color={MUTED} w={700}>
          score shift, Indian minus American · Gemini 3.1 Pro
        </T>

        {/* horizontal gridlines + axis numerals, static from frame 0 */}
        {[-3, -2, -1, 0, 1, 2, 3].map((v) => {
          const y = ZERO_Y - v * PX_PER_PT;
          if (y < 290 || y > 900) return null;
          return (
            <React.Fragment key={v}>
              <div style={{ position: "absolute", left: 120, top: y,
                width: 850, height: v === 0 ? 2.5 : 1,
                background: v === 0 ? INK2 : GRID }} />
              <T x={58} y={y - 13} size={20} color={FAINT} w={52}
                 align="right" font={MONO}>{v === 0 ? "0" : fmt(v, 0)}</T>
            </React.Fragment>
          );
        })}

        {BARS.map((b, i) => {
          const x = XS[i];
          const h = Math.abs(b.shift) * PX_PER_PT * g;
          const top = b.shift < 0 ? ZERO_Y + 1 : ZERO_Y - h;
          const val = b.shift * g;
          const valY = b.shift < 0 ? ZERO_Y + h + 12 : ZERO_Y - h - 44;
          return (
            <React.Fragment key={b.label}>
              <div style={{ position: "absolute", left: x - BAR_W / 2, top,
                width: BAR_W, height: Math.max(h, 2), background: b.color,
                borderRadius: 5, opacity: a }} />
              <T x={x - 110} y={valY} size={34} color={b.color} font={MONO}
                 weight={b.strong ? 700 : 600} w={220} align="center" opacity={a}>
                {fmt(val, 2)}
              </T>
              <T x={x - 150} y={870} size={24} color={b.strong ? b.color : INK2}
                 weight={b.strong ? 700 : 500} w={300} align="center">
                {b.label}
              </T>
              <T x={x - 150} y={904} size={20} color={MUTED} w={300}
                 align="center" font={MONO} opacity={a}>
                {b.tag}
              </T>
            </React.Fragment>
          );
        })}

        <T x={60} y={956} size={24} color={INK2} w={904} align="center" weight={700}>
          take away the sound, the penalty disappears
        </T>
        <ReplayPill />
      </Card>
    </AbsoluteFill>
  );
};

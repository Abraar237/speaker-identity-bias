import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  PAGE, INK, INK2, MUTED, FAINT, GRID, HOT, GREY,
  SANS, MONO, growth, fadeAlpha, T, Card, ReplayPill, Swatch, fmt,
} from "./flat";

// Grouped vertical bars: the identical Indian-vs-American clips under two
// judges. Numbers from results/analysis.json (axis_a, neutral arm).
const BARS = [
  { label: "Gemini 3.1 Pro", shift: -2.5, color: HOT, tag: "p = 0.005", strong: true },
  { label: "Gemini 3.6 Flash", shift: -0.04, color: GREY, tag: "no shift · p = 1.0", strong: false },
];

const ZERO_Y = 520;
const PX_PER_PT = 118;    // +-3 pts spans +-354 px
const BAR_W = 150;
const XS = [330, 750];

export const TwoJudgesTwoVerdicts: React.FC = () => {
  const frame = useCurrentFrame();
  const g = growth(frame);
  const a = fadeAlpha(frame);

  return (
    <AbsoluteFill style={{ background: PAGE }}>
      <Card>
        <T x={60} y={52} size={46} color={INK} weight={700} w={880}>
          Two judges, two verdicts
        </T>
        <T x={60} y={116} size={25} color={MUTED} w={900}>
          the identical Indian-accented clips, scored by two models from one company
        </T>
        <Swatch x={60} y={182} color={HOT} label="penalises the accent" w={300} />
        <Swatch x={370} y={182} color={GREY} label="does not move" w={300} />

        <T x={44} y={236} size={22} color={MUTED} w={700}>
          score shift, Indian minus American · same audio, same rubric
        </T>

        {[-3, -2, -1, 0, 1].map((v) => {
          const y = ZERO_Y - v * PX_PER_PT;
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
          const valY = ZERO_Y + h + 14;
          return (
            <React.Fragment key={b.label}>
              <div style={{ position: "absolute", left: x - BAR_W / 2, top,
                width: BAR_W, height: Math.max(h, 3), background: b.color,
                borderRadius: 5, opacity: a }} />
              <T x={x - 120} y={valY} size={38} color={b.color} font={MONO}
                 weight={b.strong ? 700 : 600} w={240} align="center" opacity={a}>
                {fmt(val, 2)}
              </T>
              <T x={x - 170} y={886} size={27} color={b.strong ? b.color : INK2}
                 weight={b.strong ? 700 : 500} w={340} align="center">
                {b.label}
              </T>
              <T x={x - 170} y={922} size={21} color={MUTED} w={340}
                 align="center" font={MONO} opacity={a}>
                {b.tag}
              </T>
            </React.Fragment>
          );
        })}

        <T x={60} y={968} size={24} color={INK2} w={904} align="center" weight={700}>
          same audio, same rubric, different verdict
        </T>
        <ReplayPill />
      </Card>
    </AbsoluteFill>
  );
};

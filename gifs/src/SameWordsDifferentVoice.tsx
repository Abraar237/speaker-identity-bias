import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  PAGE, INK, INK2, MUTED, FAINT, GRID, HOT, GOOD, GREY,
  SANS, MONO, growth, fadeAlpha, T, Card, ReplayPill, Swatch, fmt,
} from "./flat";

// Horizontal delta-bar chart: score shift vs the American baseline,
// Gemini 3.1 Pro, numbers from results/analysis.json (axis_a).
const ROWS = [
  { label: "American", shift: 0.0, color: GREY, tag: "baseline", strong: false },
  { label: "British", shift: -0.4, color: GREY, tag: "", strong: false },
  { label: "Indian", shift: -2.5, color: HOT, tag: "p = 0.005", strong: true },
  { label: "Nigerian", shift: +1.0, color: GOOD, tag: "", strong: false },
];

const ZERO_X = 560;        // px of shift == 0
const PX_PER_PT = 82;      // +-3 pts spans +-246 px
const ROW_Y0 = 420;
const ROW_H = 118;
const BAR_H = 34;

export const SameWordsDifferentVoice: React.FC = () => {
  const frame = useCurrentFrame();
  const g = growth(frame);
  const a = fadeAlpha(frame);

  return (
    <AbsoluteFill style={{ background: PAGE }}>
      <Card>
        <T x={60} y={52} size={46} color={INK} weight={700} w={800}>
          Same words, different voice
        </T>
        <T x={60} y={116} size={25} color={MUTED} w={860}>
          one spoken answer, four accents, identical words · scored by an audio judge
        </T>

        <Swatch x={60} y={186} color={GREY} label="no reliable shift" w={300} />
        <Swatch x={360} y={186} color={HOT} label="significant shift" w={300} />
        <Swatch x={660} y={186} color={GOOD} label="trend, not significant" w={330} />

        <T x={60} y={252} size={22} color={MUTED} w={800}>
          score shift vs the American baseline · Gemini 3.1 Pro · 0–100 scale
        </T>

        {/* gridlines and axis numerals, static from frame 0 */}
        {[-3, -2, -1, 0, 1, 2, 3].map((v) => {
          const x = ZERO_X + v * PX_PER_PT;
          return (
            <React.Fragment key={v}>
              <div style={{ position: "absolute", left: x, top: 320,
                width: v === 0 ? 2 : 1, height: 500,
                background: v === 0 ? INK2 : GRID }} />
              <T x={x - 30} y={836} size={20} color={FAINT} w={60}
                 align="center" font={MONO}>{v === 0 ? "0" : fmt(v, 0)}</T>
            </React.Fragment>
          );
        })}

        {ROWS.map((r, i) => {
          const y = ROW_Y0 + i * ROW_H;
          const w = Math.abs(r.shift) * PX_PER_PT * g;
          const barX = r.shift < 0 ? ZERO_X - w : ZERO_X;
          const val = r.shift * g;
          const valX = r.shift < 0 ? ZERO_X - w - 118 : ZERO_X + w + 14;
          return (
            <React.Fragment key={r.label}>
              <T x={60} y={y + 2} size={26} color={r.strong ? r.color : INK2}
                 weight={r.strong ? 700 : 500} w={220}>{r.label}</T>
              {r.shift !== 0 && (
                <div style={{ position: "absolute", left: barX, top: y - 2,
                  width: Math.max(w, 2), height: BAR_H, background: r.color,
                  borderRadius: 4, opacity: a }} />
              )}
              <T x={valX} y={y} size={27} color={r.strong ? r.color : INK2}
                 font={MONO} weight={r.strong ? 700 : 500} w={104}
                 align={r.shift < 0 ? "right" : "left"} opacity={a}>
                {fmt(val)}
              </T>
              {r.tag && (
                <T x={r.strong ? 60 : ZERO_X + 70} y={y + 34} size={21}
                   color={r.strong ? r.color : MUTED} w={220}
                   font={r.strong ? MONO : SANS} opacity={a}>
                  {r.tag}
                </T>
              )}
            </React.Fragment>
          );
        })}

        <T x={60} y={905} size={23} color={INK2} w={904} align="center" weight={600}>
          the judge heard identical words in every clip
        </T>
        <T x={60} y={945} size={21} color={MUTED} w={904} align="center">
          24 frozen answers · temperature 0 · one clip per call · judge blind to the study
        </T>
        <ReplayPill />
      </Card>
    </AbsoluteFill>
  );
};

import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Canvas, Eyebrow, secToFrame} from "../common";
import {SLATE, HOT, MUTED, INK, CARD} from "../theme";
import {wordTime} from "../timeline";

// Real numbers (results/analysis.json axis_a, gemini-3.1-pro-preview neutral):
// US baseline shown at 78; Indian shift -2.5, CI [-4.06,-0.94], p=0.005.
const Bar: React.FC<{label: string; sub: string; value: number; color: string; grow: number}> = ({label, sub, value, color, grow}) => (
  <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 14}}>
    <div style={{fontSize: 46, fontWeight: 700, color: INK, fontVariantNumeric: "tabular-nums", opacity: grow > 0.95 ? 1 : 0}}>
      {value.toFixed(1)}
    </div>
    <div style={{width: 190, height: 430 * (value / 80) * grow, background: color, borderRadius: 12, transition: "none"}} />
    <div style={{fontSize: 30, fontWeight: 700, color: INK}}>{label}</div>
    <div style={{fontSize: 22, color: MUTED}}>{sub}</div>
  </div>
);

export const S3Verdict: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const grow = interpolate(frame, [t(wordTime(2, "grade")), t(wordTime(2, "grade")) + 55], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const gapAt = t(wordTime(2, "lower"));
  const pAt = t(wordTime(2, "chance"));
  const showGap = frame > gapAt;
  const showP = frame > pAt;
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 30}}>
        <Eyebrow delay={6}>judge: gemini 3.1 pro &middot; identical words</Eyebrow>
        <div style={{display: "flex", alignItems: "flex-end", gap: 110}}>
          <Bar label="American accent" sub="baseline" value={78.0} color={SLATE} grow={grow} />
          <Bar label="Indian accent" sub="same words" value={75.5} color={HOT} grow={grow} />
        </div>
        {showGap && (
          <div style={{position: "absolute", right: 300, top: 250, background: CARD, borderRadius: 14, padding: "18px 28px", boxShadow: "0 6px 24px rgba(27,24,16,0.12)", opacity: interpolate(frame, [gapAt, gapAt + 18], [0, 1], {extrapolateRight: "clamp"})}}>
            <div style={{fontSize: 52, fontWeight: 700, color: HOT}}>&minus;2.5 points</div>
            <div style={{fontSize: 24, color: MUTED}}>95% CI [&minus;4.1, &minus;0.9]</div>
            {showP && <div style={{fontSize: 28, color: INK, marginTop: 8, fontWeight: 600}}>p = 0.005 &middot; about 1 in 200</div>}
          </div>
        )}
      </AbsoluteFill>
    </Canvas>
  );
};

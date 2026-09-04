import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Canvas, WordReveal, Eyebrow, secToFrame, useFloat, useBreath} from "../common";
import {HOT, INK, MUTED, SLATE, CARD, FAINT} from "../theme";
import {wordTime} from "../timeline";

const Wave: React.FC<{frame: number}> = ({frame}) => (
  <div style={{display: "flex", alignItems: "center", gap: 7, height: 130}}>
    {Array.from({length: 42}).map((_, i) => {
      const h = 18 + 52 * Math.abs(Math.sin(i * 0.83 + frame / 9)) + 38 * Math.abs(Math.sin(i * 0.37 - frame / 17));
      return <div key={i} style={{width: 9, height: h, borderRadius: 5, background: i % 5 === 0 ? SLATE : FAINT}} />;
    })}
  </div>
);

export const S1Hook: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const float = useFloat(1.5, 3);
  const breath = useBreath(1);
  const t = (sec: number) => audioStart + secToFrame(sec);
  const score = Math.round(interpolate(frame, [t(1.0), t(4.5)], [0, 82], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}));
  const titleAt = t(wordTime(0, "sound"));
  const dim = interpolate(frame, [titleAt - 12, titleAt + 8], [1, 0.25], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 44}}>
        <div style={{opacity: dim, display: "flex", flexDirection: "column", alignItems: "center", gap: 40}}>
          <Eyebrow delay={10}>an AI is listening</Eyebrow>
          <Wave frame={frame} />
          <div style={{...float, background: CARD, borderRadius: 18, padding: "26px 60px", boxShadow: breath, display: "flex", alignItems: "baseline", gap: 18}}>
            <span style={{fontSize: 30, color: MUTED}}>score</span>
            <span style={{fontSize: 84, fontWeight: 700, color: INK, fontVariantNumeric: "tabular-nums"}}>{score}</span>
            <span style={{fontSize: 30, color: MUTED}}>/ 100</span>
          </div>
        </div>
        {frame > titleAt - 6 && (
          <AbsoluteFill style={{alignItems: "center", justifyContent: "center", transform: `scale(${1 + Math.min(0.02, Math.max(0, (frame - titleAt)) * 0.00012)})`}}>
            <WordReveal text="Does the Voice Change the Grade?" delay={titleAt} size={92} color={HOT} />
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </Canvas>
  );
};

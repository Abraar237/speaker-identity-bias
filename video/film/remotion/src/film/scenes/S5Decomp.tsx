import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, Headline, secToFrame} from "../common";
import {HOT, GOOD, SHELF, MUTED, INK, CARD} from "../theme";
import {wordTime} from "../timeline";

// Decomposition (analysis.json, gemini-3.1-pro-preview, Indian vs US):
// audio -2.50 p=0.006 | own transcript +1.88 p=0.14 | gold transcript -0.83 p=0.51
const PANELS = [
  {label: "Audio", shift: -2.5, p: "0.006", color: HOT, note: "the penalty lives here", anchor: "audio"},
  {label: "Own transcript", shift: 1.88, p: "0.14", color: SHELF, note: "penalty gone", anchor: "transcript"},
  {label: "Gold transcript", shift: -0.83, p: "0.51", color: GOOD, note: "penalty gone", anchor: "text"},
];

const Panel: React.FC<{p: (typeof PANELS)[0]; at: number}> = ({p, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 16, stiffness: 95}});
  const barH = Math.abs(p.shift) * 62;
  const up = p.shift > 0;
  return (
    <div style={{opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`, background: CARD, borderRadius: 18, padding: "30px 36px", width: 380, boxShadow: "0 6px 24px rgba(27,24,16,0.10)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16}}>
    <div style={{fontSize: 30, fontWeight: 700, color: INK}}>{p.label}</div>
      <div style={{height: 240, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
        <div style={{height: 110, display: "flex", alignItems: "flex-end"}}>{up && <div style={{width: 96, height: barH * s, background: p.color, borderRadius: 8}} />}</div>
        <div style={{width: 220, height: 3, background: MUTED, opacity: 0.5}} />
        <div style={{height: 110, display: "flex", alignItems: "flex-start"}}>{!up && <div style={{width: 96, height: barH * s, background: p.color, borderRadius: 8}} />}</div>
      </div>
      <div style={{fontSize: 34, fontWeight: 700, color: p.color}}>{p.shift > 0 ? "+" : ""}{p.shift.toFixed(2)}</div>
      <div style={{fontSize: 22, color: MUTED}}>p = {p.p} &middot; {p.note}</div>
    </div>
  );
};

export const S5Decomp: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const ats = [t(wordTime(4, "audio") || 4.0), t(wordTime(4, "transcript") || 8.0), t(wordTime(4, "clean") || 11.5)];
  const punchAt = t(wordTime(4, "disappears") || 15.0);
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 40}}>
        <Eyebrow delay={6}>same content, graded three ways &middot; indian vs american</Eyebrow>
        <div style={{display: "flex", gap: 44, minHeight: 480}}>
          {PANELS.map((p, i) => (
            <div key={p.label} style={{position: "relative"}}>
              <div style={{position: "absolute", inset: 0, border: "3px dashed #d8d2c4", borderRadius: 18, opacity: frame > t(1.2) && frame < ats[i] + 8 ? 0.8 : 0}} />
              <Panel p={p} at={ats[i]} />
            </div>
          ))}
        </div>
        {frame > punchAt - 4 && (
          <Headline delay={punchAt} size={46}>
            Only words? The penalty disappears.
          </Headline>
        )}
      </AbsoluteFill>
    </Canvas>
  );
};

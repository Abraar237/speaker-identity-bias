import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Canvas, Eyebrow, Headline, secToFrame} from "../common";
import {SLATE, HOT, GOOD, MUTED, INK, CARD, FAINT} from "../theme";
import {wordTime} from "../timeline";

// Pro: Indian -2.5 (p=0.005). Flash: Indian -0.04 (p=1.0). Same audio.
const Panel: React.FC<{title: string; shift: number; p: string; color: string; grow: number; verdict: string}> = ({title, shift, p, color, grow, verdict}) => (
  <div style={{background: CARD, borderRadius: 20, padding: "34px 44px", width: 620, boxShadow: "0 6px 26px rgba(27,24,16,0.10)", display: "flex", flexDirection: "column", alignItems: "center", gap: 20}}>
    <div style={{fontSize: 34, fontWeight: 700, color: INK}}>{title}</div>
    <div style={{display: "flex", alignItems: "flex-end", gap: 48, height: 300}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8}}>
        <div style={{width: 120, height: 270 * grow, background: SLATE, borderRadius: 10}} />
        <div style={{fontSize: 22, color: MUTED}}>American</div>
      </div>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8}}>
        <div style={{width: 120, height: (270 + shift * 10.5) * grow, background: color, borderRadius: 10}} />
        <div style={{fontSize: 22, color: MUTED}}>Indian</div>
      </div>
    </div>
    <div style={{fontSize: 28, fontWeight: 700, color}}>{shift === 0 ? "no gap" : `${shift.toFixed(1)} points`} &middot; <span style={{color: MUTED, fontWeight: 500}}>p = {p}</span></div>
    <div style={{fontSize: 24, color: MUTED}}>{verdict}</div>
  </div>
);

export const S4TwoJudges: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const grow = interpolate(frame, [t(1.2), t(3.2)], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const disagreeAt = t(wordTime(3, "disagree"));
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 34}}>
        <Eyebrow delay={6}>the exact same audio, two judges</Eyebrow>
        <div style={{display: "flex", gap: 60}}>
          <Panel title="Gemini 3.1 Pro" shift={-2.5} p="0.005" color={HOT} grow={grow} verdict="penalises the accent" />
          <Panel title="Gemini 3.6 Flash" shift={0} p="1.0" color={GOOD} grow={grow} verdict="scores them the same" />
        </div>
        {frame > disagreeAt && (
          <Headline delay={disagreeAt} size={44}>Same company. Same audio. Two different answers.</Headline>
        )}
      </AbsoluteFill>
    </Canvas>
  );
};

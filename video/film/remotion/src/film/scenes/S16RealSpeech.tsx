import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, Headline, secToFrame, useCount, useFloat, useBreath} from "../common";
import {HOT, SLATE, MUTED, INK, CARD, FAINT} from "../theme";
import {wordTime} from "../timeline";

// Canonical: results/l2arctic_gemini_summary.txt (per-L1 vs native, all p<=0.0004)
// PRO:   hindi -4.27 korean -7.08 spanish -9.33 arabic -13.08 vietnamese -15.27 mandarin -15.67
// FLASH: hindi -6.08 korean -8.14 spanish -9.61 arabic -13.02 vietnamese -14.20 mandarin -14.20
const MONO = "'SF Mono', Menlo, monospace";
const ROWS = [
  {l1: "Hindi", pro: -4.27, flash: -6.08},
  {l1: "Korean", pro: -7.08, flash: -8.14},
  {l1: "Spanish", pro: -9.33, flash: -9.61},
  {l1: "Arabic", pro: -13.08, flash: -13.02},
  {l1: "Vietnamese", pro: -15.27, flash: -14.2},
  {l1: "Mandarin", pro: -15.67, flash: -14.2},
];
const MAX = 16.5;
const W = 560;

const Row: React.FC<{l1: string; pro: number; flash: number; at: number; i: number}> = ({l1, pro, flash, at, i}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d = at + i * 9;
  const s = spring({frame: frame - d, fps, config: {damping: 14, stiffness: 85, mass: 0.8}});
  const growP = spring({frame: frame - d - 6, fps, config: {damping: 13, stiffness: 60, mass: 0.9}});
  const growF = spring({frame: frame - d - 12, fps, config: {damping: 13, stiffness: 60, mass: 0.9}});
  const shownP = useCount(d + 8, pro, 40);
  return (
    <div style={{display: "flex", alignItems: "center", gap: 18, opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`}}>
      <div style={{width: 176, fontSize: 27, fontWeight: 700, color: INK, textAlign: "right"}}>{l1}</div>
      <div style={{display: "flex", flexDirection: "column", gap: 5}}>
        <div style={{width: (Math.abs(pro) / MAX) * W * growP, height: 20, background: HOT, borderRadius: "0 6px 6px 0"}} />
        <div style={{width: (Math.abs(flash) / MAX) * W * growF, height: 20, background: SLATE, borderRadius: "0 6px 6px 0", opacity: 0.85}} />
      </div>
      <div style={{fontFamily: MONO, fontSize: 28, fontWeight: 700, color: HOT, opacity: interpolate(frame, [d + 12, d + 26], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
        {"−"}{Math.abs(shownP).toFixed(1)}
      </div>
    </div>
  );
};

export const S16RealSpeech: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const ladderAt = t(wordTime(11, "penalised") || 12);
  const agreeAt = t(wordTime(11, "agreement") || 22);
  const caveatAt = t(wordTime(11, "fluency") || 28);
  const float = useFloat(1, 2.5);
  const breath = useBreath(3);
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 24, padding: "60px 100px"}}>
        <Eyebrow delay={10}>real speech &middot; 24 speakers &middot; six first languages &middot; read-aloud rubric</Eyebrow>
        <Headline delay={t(0.9)} size={46}>Real speech is a different story.</Headline>
        <div style={{...float, background: CARD, borderRadius: 22, padding: "30px 48px", boxShadow: breath, display: "flex", flexDirection: "column", gap: 12, opacity: interpolate(frame, [ladderAt - 14, ladderAt], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
          <div style={{display: "flex", gap: 26, justifyContent: "center", fontSize: 21, color: MUTED}}>
            <span><span style={{display: "inline-block", width: 26, height: 12, background: HOT, borderRadius: 3, marginRight: 8}} />Gemini 3.1 Pro</span>
            <span><span style={{display: "inline-block", width: 26, height: 12, background: SLATE, borderRadius: 3, marginRight: 8, opacity: 0.85}} />Gemini 3.6 Flash</span>
            <span style={{color: FAINT}}>shift vs native voices &middot; all p &le; 0.0004</span>
          </div>
          {ROWS.map((r, i) => (
            <Row key={r.l1} {...r} at={ladderAt} i={i} />
          ))}
        </div>
        <div style={{fontSize: 27, color: INK, fontWeight: 600, opacity: interpolate(frame, [agreeAt, agreeAt + 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
          two judges, close agreement &middot; the open-weight judge barely reacts
        </div>
        <div style={{fontSize: 24, color: MUTED, opacity: interpolate(frame, [caveatAt, caveatAt + 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
          fair fluency grading, or something more? this rubric cannot settle that &mdash; and the paper says so
        </div>
      </AbsoluteFill>
    </Canvas>
  );
};

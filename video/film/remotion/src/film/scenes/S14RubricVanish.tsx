import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, Headline, secToFrame, usePunch, useFloat, useBreath} from "../common";
import {HOT, GOOD, MUTED, INK, CARD, FAINT} from "../theme";
import {wordTime} from "../timeline";

// Canonical: axis_a_dims_pro.jsonl — Indian-vs-US per-dimension shifts (0-25 scale),
// all n.s.: correctness -0.15 p=0.66, completeness -0.17 p=0.56,
// helpfulness +0.21 p=0.46, clarity -0.23 p=0.48. Total -0.33.
const MONO = "'SF Mono', Menlo, monospace";
const DIMS = [
  {name: "correctness", v: "−0.15", p: "p = 0.66"},
  {name: "completeness", v: "−0.17", p: "p = 0.56"},
  {name: "helpfulness", v: "+0.21", p: "p = 0.46"},
  {name: "clarity", v: "−0.23", p: "p = 0.48"},
];

const DimCard: React.FC<{name: string; v: string; p: string; at: number; i: number}> = ({name, v, p, at, i}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at - i * 8, fps, config: {damping: 14, stiffness: 90, mass: 0.8}});
  const float = useFloat(i + 3, 2.5);
  const breath = useBreath(i);
  const flatAt = at + i * 8 + 34;
  const flat = interpolate(frame, [flatAt, flatAt + 16], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <div style={{...float, opacity: interpolate(s, [0, 1], [0, 1]), transform: `${float.transform} translateY(${interpolate(s, [0, 1], [24, 0])}px)`, background: CARD, borderRadius: 18, padding: "28px 34px", boxShadow: breath, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 260}}>
      <div style={{fontSize: 26, fontWeight: 700, color: INK}}>{name}</div>
      <div style={{fontFamily: MONO, fontSize: 40, fontWeight: 700, color: MUTED}}>{v}</div>
      <div style={{width: interpolate(flat, [0, 1], [0, 150]), height: 4, background: GOOD, borderRadius: 2}} />
      <div style={{fontFamily: MONO, fontSize: 20, color: FAINT, opacity: flat}}>{p} &middot; n.s.</div>
    </div>
  );
};

export const S14RubricVanish: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const cardsAt = t(wordTime(9, "correctness") || 9);
  const vanishAt = t(wordTime(9, "vanished") || 15);
  const punch = usePunch(vanishAt, 0.1);
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 40, padding: "80px 100px"}}>
        <Eyebrow delay={10}>same voices &middot; decomposed rubric &middot; four sub-scores</Eyebrow>
        <Headline delay={t(0.8)} size={48}>Change the rubric, and the penalty vanishes.</Headline>
        <div style={{display: "flex", gap: 30, transform: `scale(${punch.scale})`}}>
          {DIMS.map((d, i) => (
            <DimCard key={d.name} {...d} at={cardsAt} i={i} />
          ))}
        </div>
        <div style={{fontSize: 30, color: MUTED, opacity: interpolate(frame, [vanishAt + 24, vanishAt + 42], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
          every dimension flat on the <span style={{color: HOT, fontWeight: 700}}>same voices</span> that produced {"−"}2.5
        </div>
      </AbsoluteFill>
    </Canvas>
  );
};

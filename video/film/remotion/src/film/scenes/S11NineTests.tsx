import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, WordReveal, secToFrame, usePunch, useFloat} from "../common";
import {HOT, GOOD, MUTED, INK, CARD, FAINT} from "../theme";
import {wordTime} from "../timeline";

// Real p-values, 9 accent x judge tests; BH(9) keeps pro-in, qwen-uk, qwen-ng.
const MONO = "'SF Mono', Menlo, monospace";
const CELLS: {j: string; a: string; p: string; keep: boolean; color: string}[] = [
  {j: "Pro", a: "UK", p: "0.73", keep: false, color: HOT},
  {j: "Pro", a: "Indian", p: "0.005", keep: true, color: HOT},
  {j: "Pro", a: "Nigerian", p: "0.26", keep: false, color: HOT},
  {j: "Flash", a: "UK", p: "0.49", keep: false, color: FAINT},
  {j: "Flash", a: "Indian", p: "1.0", keep: false, color: FAINT},
  {j: "Flash", a: "Nigerian", p: "0.89", keep: false, color: FAINT},
  {j: "Qwen2-Audio", a: "UK", p: "0.012", keep: true, color: GOOD},
  {j: "Qwen2-Audio", a: "Indian", p: "0.042", keep: false, color: GOOD},
  {j: "Qwen2-Audio", a: "Nigerian", p: "0.016", keep: true, color: GOOD},
];
// survivors ring in narrated order, landing last
const SURVIVE_ORDER: Record<number, number> = {1: 0, 6: 1, 8: 2};

const Cell: React.FC<{c: (typeof CELLS)[0]; i: number; flipAt: number; corrAt: number; surviveAt: number}> = ({c, i, flipAt, corrAt, surviveAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - flipAt, fps, config: {damping: 14, stiffness: 110}});
  const rot = interpolate(s, [0, 1], [78, 0]);
  const dim = c.keep ? 1 : interpolate(frame, [corrAt, corrAt + 25], [1, 0.22], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const ringAt = c.keep ? surviveAt + (SURVIVE_ORDER[i] ?? 0) * 14 : Infinity;
  const ring = frame > ringAt;
  const punch = usePunch(ringAt, 0.12);
  const float = useFloat(i * 1.7, 2, 170);
  return (
    <div style={{...float, opacity: Math.min(dim, interpolate(s, [0, 0.4], [0, 1], {extrapolateRight: "clamp"})), transform: `${float.transform} perspective(900px) rotateX(${rot}deg) scale(${ring ? punch.scale : 1})`}}>
      <div style={{background: CARD, borderRadius: 16, padding: "22px 26px", boxShadow: ring ? `0 0 0 4px ${c.color}, 0 0 ${26 * (0.5 + punch.flash)}px ${c.color}55` : "0 4px 18px rgba(27,24,16,0.08)", display: "flex", flexDirection: "column", gap: 6}}>
        <div style={{fontSize: 22, color: MUTED}}>{c.j} &middot; {c.a}</div>
        <div style={{fontFamily: MONO, fontSize: 32, fontWeight: 700, color: c.keep ? c.color : INK}}>p = {c.p}</div>
        <div style={{fontSize: 20, fontWeight: 600, color: c.keep ? c.color : FAINT}}>{c.keep ? "survives" : "treated as noise"}</div>
      </div>
    </div>
  );
};

export const S11NineTests: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const gridAt = t(wordTime(9, "nine") || 4);
  const corrAt = t(wordTime(9, "corrected") || 12);
  const surviveAt = t(wordTime(9, "survive") || 14);
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 40}}>
        <Eyebrow delay={6}>nine tests &middot; corrected for multiple comparisons</Eyebrow>
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 340px)", gap: 22}}>
          {CELLS.map((c, i) => (
            <Cell key={i} c={c} i={i} flipAt={gridAt + i * 5} corrAt={corrAt} surviveAt={surviveAt} />
          ))}
        </div>
        {frame > surviveAt && <WordReveal text="Three survive. The rest is noise." delay={surviveAt + 10} size={46} />}
      </AbsoluteFill>
    </Canvas>
  );
};

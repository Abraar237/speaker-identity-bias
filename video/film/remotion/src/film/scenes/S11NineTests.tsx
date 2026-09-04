import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Canvas, Eyebrow, WordReveal, secToFrame} from "../common";
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

export const S11NineTests: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const gridAt = t(wordTime(9, "nine") || 4);
  const corrAt = t(wordTime(9, "corrected") || 12);
  const surviveAt = t(wordTime(9, "survive") || 14);
  const gridO = interpolate(frame, [gridAt, gridAt + 20], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const dim = interpolate(frame, [corrAt, corrAt + 25], [1, 0.22], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 40}}>
        <Eyebrow delay={6}>nine tests &middot; corrected for multiple comparisons</Eyebrow>
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 340px)", gap: 22, opacity: gridO}}>
          {CELLS.map((c, i) => {
            const survived = c.keep && frame > surviveAt + i * 3;
            const cellDim = c.keep ? 1 : dim;
            return (
              <div key={i} style={{opacity: cellDim, background: CARD, borderRadius: 16, padding: "22px 26px", boxShadow: survived ? `0 0 0 4px ${c.color}` : "0 4px 18px rgba(27,24,16,0.08)", display: "flex", flexDirection: "column", gap: 6}}>
                <div style={{fontSize: 22, color: MUTED}}>{c.j} &middot; {c.a}</div>
                <div style={{fontFamily: MONO, fontSize: 32, fontWeight: 700, color: c.keep ? c.color : INK}}>p = {c.p}</div>
                <div style={{fontSize: 20, fontWeight: 600, color: c.keep ? c.color : FAINT}}>{c.keep ? "survives" : "treated as noise"}</div>
              </div>
            );
          })}
        </div>
        {frame > surviveAt && <WordReveal text="Three survive. The rest is noise." delay={surviveAt + 10} size={46} />}
      </AbsoluteFill>
    </Canvas>
  );
};

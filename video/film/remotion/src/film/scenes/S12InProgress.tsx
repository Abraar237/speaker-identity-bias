import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Canvas, Eyebrow, Headline, secToFrame} from "../common";
import {SLATE, GOOD, MUTED, INK, CARD, HOT} from "../theme";
import {wordTime} from "../timeline";

const Wave: React.FC<{color: string; seed: number}> = ({color, seed}) => (
  <svg width="200" height="36" viewBox="0 0 200 36">
    {Array.from({length: 40}, (_, i) => {
      const h = 6 + 24 * Math.abs(Math.sin(seed + i * 0.9) * Math.cos(seed * 2 + i * 0.35));
      return <rect key={i} x={i * 5} y={(36 - h) / 2} width={3} height={h} rx={1.5} fill={color} />;
    })}
  </svg>
);

const Tile: React.FC<{title: string; sub: string; at: number; frame: number; children: React.ReactNode}> = ({title, sub, at, frame, children}) => {
  const o = interpolate(frame, [at, at + 20], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const pulse = 0.75 + 0.25 * Math.sin(frame / 14);
  return (
    <div style={{opacity: o, transform: `translateY(${(1 - o) * 22}px)`, background: CARD, borderRadius: 20, padding: "38px 46px", width: 620, boxShadow: "0 8px 30px rgba(27,24,16,0.10)", display: "flex", flexDirection: "column", gap: 16, alignItems: "center"}}>
      <div style={{fontSize: 30, fontWeight: 700, color: INK, textAlign: "center"}}>{title}</div>
      {children}
      <div style={{fontSize: 22, color: MUTED, textAlign: "center"}}>{sub}</div>
      <div style={{fontSize: 20, fontWeight: 700, color: HOT, opacity: pulse}}>&#9679; running now</div>
    </div>
  );
};

export const S12InProgress: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const aAt = t(wordTime(10, "voices") || 8);
  const bAt = t(wordTime(10, "real", 1) || 15);
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 40}}>
        <Eyebrow delay={6}>what would change our mind</Eyebrow>
        <Headline delay={t(wordTime(10, "experiments") || 2)} size={50}>Two experiments, running right now.</Headline>
        <div style={{display: "flex", gap: 46}}>
          <Tile title="Several voices per accent" sub="so no single synthetic voice can carry the result" at={aAt} frame={frame}>
            <div style={{display: "flex", flexDirection: "column", gap: 8}}>
              <Wave color={SLATE} seed={1} /><Wave color={SLATE} seed={2.4} /><Wave color={SLATE} seed={4.1} />
            </div>
          </Tile>
          <Tile title="24 real speakers, 6 language backgrounds" sub="real human recordings of the very same sentences" at={bAt} frame={frame}>
            <div style={{display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 460}}>
              {Array.from({length: 24}, (_, i) => (
                <div key={i} style={{width: 30, height: 30, borderRadius: "50%", background: i % 4 === 0 ? GOOD : "#e3ded2", border: `2px solid ${MUTED}`}} />
              ))}
            </div>
          </Tile>
        </div>
      </AbsoluteFill>
    </Canvas>
  );
};

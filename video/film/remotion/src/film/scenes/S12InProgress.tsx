import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Canvas, Eyebrow, Headline, secToFrame, useFloat, useBreath} from "../common";
import {SLATE, GOOD, MUTED, INK, CARD, HOT} from "../theme";
import {wordTime} from "../timeline";

// live waveform: bars ripple as if playing
const Wave: React.FC<{color: string; seed: number; frame: number}> = ({color, seed, frame}) => (
  <svg width="200" height="36" viewBox="0 0 200 36">
    {Array.from({length: 40}, (_, i) => {
      const h = 6 + 24 * Math.abs(Math.sin(seed + i * 0.9 + frame / 11) * Math.cos(seed * 2 + i * 0.35 - frame / 19));
      return <rect key={i} x={i * 5} y={(36 - h) / 2} width={3} height={h} rx={1.5} fill={color} />;
    })}
  </svg>
);

const Tile: React.FC<{title: string; sub: string; at: number; frame: number; seed: number; children: React.ReactNode}> = ({title, sub, at, frame, seed, children}) => {
  const o = interpolate(frame, [at, at + 20], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const pulse = 0.75 + 0.25 * Math.sin(frame / 14);
  const float = useFloat(seed, 3);
  const breath = useBreath(seed);
  return (
    <div style={{...float, opacity: o, transform: `${float.transform} translateY(${(1 - o) * 22}px)`}}>
      <div style={{background: CARD, borderRadius: 20, padding: "38px 46px", width: 620, boxShadow: breath, display: "flex", flexDirection: "column", gap: 16, alignItems: "center"}}>
        <div style={{fontSize: 30, fontWeight: 700, color: INK, textAlign: "center"}}>{title}</div>
        {children}
        <div style={{fontSize: 22, color: MUTED, textAlign: "center"}}>{sub}</div>
        <div style={{fontSize: 20, fontWeight: 700, color: HOT, opacity: pulse}}>&#9679; running now</div>
      </div>
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
          <Tile title="Several voices per accent" sub="so no single synthetic voice can carry the result" at={aAt} frame={frame} seed={1.4}>
            <div style={{display: "flex", flexDirection: "column", gap: 8}}>
              <Wave color={SLATE} seed={1} frame={frame} />
              <Wave color={SLATE} seed={2.4} frame={frame + 20} />
              <Wave color={SLATE} seed={4.1} frame={frame + 43} />
            </div>
          </Tile>
          <Tile title="24 real speakers, 6 language backgrounds" sub="real human recordings of the very same sentences" at={bAt} frame={frame} seed={3.8}>
            <div style={{display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 460}}>
              {Array.from({length: 24}, (_, i) => {
                const fillAt = bAt + 14 + i * 3;
                const filled = frame > fillAt;
                const pop = Math.max(0, 1 - (frame - fillAt) / 12);
                return (
                  <div key={i} style={{width: 30, height: 30, borderRadius: "50%", background: filled ? (i % 4 === 0 ? GOOD : "#cdc7b8") : "#efece3", border: `2px solid ${MUTED}`, transform: `scale(${filled ? 1 + 0.35 * pop : 0.85})`, transition: "none"}} />
                );
              })}
            </div>
          </Tile>
        </div>
      </AbsoluteFill>
    </Canvas>
  );
};

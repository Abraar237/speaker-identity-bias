import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, Headline, secToFrame} from "../common";
import {SLATE, SHELF, GOOD, HOT, MUTED, CARD, INK} from "../theme";
import {wordTime} from "../timeline";

const ACCENTS = [
  {label: "American", color: SLATE},
  {label: "British", color: SHELF},
  {label: "Indian", color: HOT},
  {label: "Nigerian", color: GOOD},
];

const Tile: React.FC<{label: string; gender: string; color: string; at: number}> = ({label, gender, color, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 15, stiffness: 100}});
  return (
    <div style={{opacity: interpolate(s, [0, 1], [0, 1]), transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`, background: CARD, borderRadius: 14, padding: "18px 20px", width: 218, boxShadow: "0 4px 18px rgba(27,24,16,0.08)", borderTop: `5px solid ${color}`}}>
      <div style={{fontSize: 25, fontWeight: 700, color: INK}}>{label}</div>
      <div style={{fontSize: 20, color: MUTED, marginBottom: 10}}>{gender}</div>
      <div style={{display: "flex", gap: 4, alignItems: "center", height: 34}}>
        {Array.from({length: 16}).map((_, i) => (
          <div key={i} style={{width: 6, borderRadius: 3, background: color, opacity: 0.75, height: 8 + 22 * Math.abs(Math.sin(i * 1.7 + frame / 8))}} />
        ))}
      </div>
    </div>
  );
};

export const S2EightVoices: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const start = t(wordTime(1, "eight"));
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 40, padding: 90}}>
        <Eyebrow delay={8}>one answer, frozen words</Eyebrow>
        <div style={{background: CARD, borderRadius: 14, padding: "20px 44px", fontSize: 30, color: INK, boxShadow: "0 4px 18px rgba(27,24,16,0.08)", opacity: interpolate(frame, [10, 30], [0, 1], {extrapolateRight: "clamp"})}}>
          &ldquo;My biggest strength is staying calm when a plan falls apart&hellip;&rdquo;
        </div>
        <div style={{display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: 26}}>
          {ACCENTS.map((a, i) => (
            <Tile key={a.label + "f"} label={a.label} gender="female voice" color={a.color} at={start + i * 8} />
          ))}
          {ACCENTS.map((a, i) => (
            <Tile key={a.label + "m"} label={a.label} gender="male voice" color={a.color} at={start + 32 + i * 8} />
          ))}
        </div>
        <Headline delay={t(wordTime(1, "single"))} size={42}>
          Same sentence, every single time.
        </Headline>
      </AbsoluteFill>
    </Canvas>
  );
};

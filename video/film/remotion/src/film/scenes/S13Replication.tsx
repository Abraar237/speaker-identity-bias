import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, Headline, secToFrame, useCount, usePunch, useFloat, useBreath} from "../common";
import {GOOD, HOT, MUTED, INK, CARD, FAINT} from "../theme";
import {wordTime} from "../timeline";

// Canonical: results/wave_final_summary.json multivoice_pro.indian_per_voice
// Aoede +1.67, Fenrir +2.08, Leda +0.83, Orus -2.08, Puck -2.50, Zephyr -4.58
// overall in-vs-us: -0.76, p=0.35, n=72
const MONO = "'SF Mono', Menlo, monospace";
const VOICES: {name: string; v: number}[] = [
  {name: "Fenrir", v: 2.08},
  {name: "Aoede", v: 1.67},
  {name: "Leda", v: 0.83},
  {name: "Orus", v: -2.08},
  {name: "Puck", v: -2.5},
  {name: "Zephyr", v: -4.58},
];
const MAX = 5.0;
const H = 250; // half-height for bar scaling

const VoiceBar: React.FC<{name: string; v: number; at: number; i: number}> = ({name, v, at, i}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grow = spring({frame: frame - at - i * 7, fps, config: {damping: 13, stiffness: 70, mass: 0.9}});
  const shown = useCount(at + i * 7 + 4, v, 40);
  const up = v >= 0;
  const col = up ? GOOD : HOT;
  const barH = Math.abs(v) / MAX * H * grow;
  const punch = usePunch(at + i * 7 + 44, 0.12);
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", width: 148}}>
      <div style={{height: H, display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
        {up && <div style={{width: 76, height: barH, background: col, borderRadius: "8px 8px 0 0"}} />}
      </div>
      <div style={{width: 120, height: 3, background: INK, opacity: 0.75}} />
      <div style={{height: H * 0.95, display: "flex", flexDirection: "column", justifyContent: "flex-start"}}>
        {!up && <div style={{width: 76, height: barH, background: col, borderRadius: "0 0 8px 8px"}} />}
      </div>
      <div style={{fontFamily: MONO, fontSize: 30, fontWeight: 700, color: col, marginTop: -H * 0.95 + barH + 14, transform: `scale(${punch.scale})`, opacity: interpolate(frame, [at + i * 7 + 8, at + i * 7 + 22], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}), textShadow: punch.flash > 0 ? `0 0 ${14 * punch.flash}px ${col}88` : "none"}}>
        {shown >= 0 ? "+" : "−"}{Math.abs(shown).toFixed(2)}
      </div>
      <div style={{fontSize: 24, fontWeight: 600, color: MUTED, marginTop: "auto"}}>{name}</div>
    </div>
  );
};

export const S13Replication: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const barsAt = t(wordTime(8, "dissolved") || 12);
  const verdictAt = t(wordTime(8, "scatters") || 19);
  const thesisAt = t(wordTime(8, "moves") || 29);
  const float = useFloat(1, 2.5);
  const breath = useBreath(2);
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 26, padding: "70px 90px"}}>
        <Eyebrow delay={10}>the replication battery &middot; six new voices &middot; same judges</Eyebrow>
        <Headline delay={t(1.0)} size={48}>Then we did what reviewers ask.</Headline>
        <div style={{...float, display: "flex", alignItems: "center", gap: 8, background: CARD, borderRadius: 22, padding: "26px 44px 20px", boxShadow: breath, opacity: interpolate(frame, [barsAt - 16, barsAt], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
        {VOICES.map((vv, i) => (
          <VoiceBar key={vv.name} name={vv.name} v={vv.v} at={barsAt} i={i} />
        ))}
        </div>
        <div style={{fontFamily: MONO, fontSize: 27, color: MUTED, opacity: interpolate(frame, [verdictAt, verdictAt + 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
          Indian shift across all six voices: <span style={{color: INK, fontWeight: 700}}>{"−"}0.76</span> &middot; p = 0.35 &middot; indistinguishable from zero
        </div>
        <div style={{fontSize: 34, fontWeight: 700, color: INK, opacity: interpolate(frame, [thesisAt, thesisAt + 20], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}), borderTop: `2px solid ${FAINT}`, paddingTop: 18}}>
          The voice, not the accent, moves the score.
        </div>
      </AbsoluteFill>
    </Canvas>
  );
};

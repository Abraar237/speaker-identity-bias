import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, Headline, secToFrame, useCount, usePunch, useFloat, useBreath} from "../common";
import {GOOD, MUTED, INK, CARD} from "../theme";
import {wordTime} from "../timeline";

// Real numbers (results/qwen2audio_summary.txt): uk +2.92 p=0.012,
// ng +2.29 p=0.016, in +1.98 p=0.042 vs US baseline, n=48 each.
const MONO = "'SF Mono', Menlo, monospace";

const UpBar: React.FC<{label: string; value: number; p: string; at: number}> = ({label, value, p, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grow = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 60, mass: 0.9}});
  const shown = useCount(at + 4, value, 46);
  const punch = usePunch(at + 50, 0.15);
  const baseW = interpolate(frame, [at - 8, at + 10], [0, 260], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 250}}>
      <div style={{fontFamily: MONO, fontSize: 44, fontWeight: 700, color: GOOD, opacity: interpolate(frame, [at + 8, at + 22], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}), transform: `scale(${punch.scale})`, textShadow: punch.flash > 0 ? `0 0 ${18 * punch.flash}px ${GOOD}88` : "none"}}>
        +{shown.toFixed(2)}
      </div>
      <div style={{width: 150, height: Math.max(0, 330 * (value / 3.2) * grow), background: GOOD, borderRadius: 10, alignSelf: "center"}} />
      <div style={{width: baseW, height: 3, background: INK}} />
      <div style={{fontSize: 28, fontWeight: 700, color: INK}}>{label}</div>
      <div style={{fontFamily: MONO, fontSize: 20, color: MUTED, opacity: interpolate(frame, [at + 26, at + 40], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>{p}</div>
    </div>
  );
};

export const S8ThirdFamily: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const oppAt = t(wordTime(6, "opposite") || 17);
  const ukAt = t(wordTime(6, "british") || 20);
  const ngAt = t(wordTime(6, "nigerian") || 23);
  const inAt = t(wordTime(6, "indian") || 26);
  const float = useFloat(2, 3);
  const breath = useBreath(4);
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 34}}>
        <Eyebrow delay={10}>third judge family &middot; qwen2-audio &middot; open-weight</Eyebrow>
        <Headline delay={t(wordTime(6, "download") || 10)} size={52}>Same clips. A judge anyone can run.</Headline>
        <div style={{...float, display: "flex", alignItems: "flex-end", gap: 70, background: CARD, borderRadius: 22, padding: "40px 60px 30px", boxShadow: breath, opacity: interpolate(frame, [oppAt - 20, oppAt], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
          <UpBar label="British" value={2.92} p="p = 0.012" at={ukAt} />
          <UpBar label="Nigerian" value={2.29} p="p = 0.016" at={ngAt} />
          <UpBar label="Indian" value={1.98} p="p = 0.042" at={inAt} />
        </div>
        <div style={{fontSize: 26, color: MUTED, opacity: interpolate(frame, [oppAt, oppAt + 20], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
          score shift vs the American baseline &middot; every non-American accent scores <span style={{color: GOOD, fontWeight: 700}}>higher</span>
        </div>
      </AbsoluteFill>
    </Canvas>
  );
};

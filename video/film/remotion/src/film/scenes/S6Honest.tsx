import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, secToFrame} from "../common";
import {GOOD, MUTED, INK, CARD, FAINT} from "../theme";
import {wordTime} from "../timeline";

// Axis B: all five delivery perturbations n.s. (all |shift| <= 1.5, p > 0.1).
// Nigerian accent (Pro): +1.04, p=0.26, trended positive - reported plainly.
// Hand-drawn-style inline SVG icons (no emoji, per house gif/film rules).
const IC = "#3a352b";
const ICONS: Record<string, React.ReactNode> = {
  pause: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <rect x="14" y="10" width="8" height="32" rx="2.5" fill={IC} />
      <rect x="30" y="10" width="8" height="32" rx="2.5" fill={IC} />
    </svg>
  ),
  faster: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <path d="M8 12 L26 26 L8 40 Z" fill={IC} />
      <path d="M26 12 L44 26 L26 40 Z" fill={IC} />
    </svg>
  ),
  slower: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <path d="M44 12 L26 26 L44 40 Z" fill={IC} />
      <path d="M26 12 L8 26 L26 40 Z" fill={IC} />
    </svg>
  ),
  phone: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <path d="M10 18 C10 12, 42 12, 42 18 L40 26 C34 22, 18 22, 12 26 Z" fill={IC} />
      <rect x="22" y="26" width="8" height="14" rx="3" fill={IC} />
      <rect x="14" y="38" width="24" height="5" rx="2.5" fill={IC} />
    </svg>
  ),
  noise: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <path d="M6 26 Q13 12, 20 26 T34 26 T48 26" stroke={IC} strokeWidth="4.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
};

const TILES = [
  {icon: "pause", label: "filled pauses"},
  {icon: "faster", label: "faster"},
  {icon: "slower", label: "slower"},
  {icon: "phone", label: "phone codec"},
  {icon: "noise", label: "background noise"},
];

const Tile: React.FC<{icon: string; label: string; at: number}> = ({icon, label, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 15, stiffness: 100}});
  return (
    <div style={{opacity: interpolate(s, [0, 1], [0, 1]), background: CARD, borderRadius: 16, padding: "24px 26px", width: 240, boxShadow: "0 4px 18px rgba(27,24,16,0.08)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12}}>
      <div style={{height: 52, display: "flex", alignItems: "center"}}>{ICONS[icon]}</div>
      <div style={{fontSize: 22, color: MUTED}}>{label}</div>
      <div style={{width: 170, height: 3, background: FAINT, position: "relative"}}>
        <div style={{position: "absolute", left: "46%", top: -7, width: 24, height: 17, background: MUTED, borderRadius: 4}} />
      </div>
      <div style={{fontSize: 20, color: MUTED}}>no significant shift</div>
    </div>
  );
};

export const S6Honest: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const start = t(wordTime(5, "five") || 2.0);
  const ngAt = t(wordTime(5, "nigerian") || 16.0);
  const ng = spring({frame: frame - ngAt, fps, config: {damping: 15, stiffness: 90}});
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 42, padding: 80}}>
        <Eyebrow delay={6}>what we have not shown, said plainly</Eyebrow>
        <div style={{display: "flex", gap: 26, flexWrap: "wrap", justifyContent: "center"}}>
          {TILES.map((tl, i) => (
            <Tile key={tl.label} icon={tl.icon} label={tl.label} at={start + i * 9} />
          ))}
        </div>
        {frame > ngAt - 6 && (
          <div style={{opacity: interpolate(ng, [0, 1], [0, 1]), transform: `translateY(${interpolate(ng, [0, 1], [24, 0])}px)`, background: CARD, borderRadius: 16, padding: "26px 44px", boxShadow: "0 6px 24px rgba(27,24,16,0.10)", display: "flex", alignItems: "center", gap: 26}}>
            <div style={{fontSize: 30, fontWeight: 700, color: GOOD}}>Nigerian accent: +1.0</div>
            <div style={{fontSize: 24, color: MUTED}}>trended higher, the opposite of our prediction &middot; p = 0.26 &middot; reported as found</div>
          </div>
        )}
      </AbsoluteFill>
    </Canvas>
  );
};

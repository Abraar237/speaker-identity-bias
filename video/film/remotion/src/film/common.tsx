import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {loadFont as loadFraunces} from "@remotion/google-fonts/Fraunces";
import {loadFont as loadInter} from "@remotion/google-fonts/Inter";
import {CANVAS, INK, MUTED} from "./theme";

const fraunces = loadFraunces();
const inter = loadInter();
export const HEAD = fraunces.fontFamily;
export const BODY = inter.fontFamily;
export const DEVA = "'Tiro Devanagari Hindi','Devanagari MT',serif";

export const Canvas: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  // soft scene transitions: 0.3s fade-in, 0.4s fade-out inside the GAP
  const fade =
    interpolate(frame, [0, 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) *
    interpolate(frame, [durationInFrames - 26, durationInFrames - 4], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{backgroundColor: CANVAS, fontFamily: BODY, color: INK}}>
      <AbsoluteFill style={{opacity: fade}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const useRise = (delayFrames: number, stiff = 90) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delayFrames, fps, config: {damping: 16, stiffness: stiff, mass: 0.8}});
  return {
    opacity: interpolate(s, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px)`,
  };
};

export const Eyebrow: React.FC<{children: React.ReactNode; delay?: number}> = ({children, delay = 0}) => {
  const st = useRise(delay);
  return (
    <div style={{...st, fontFamily: BODY, fontSize: 26, letterSpacing: 5, textTransform: "uppercase", color: MUTED, fontWeight: 600}}>
      {children}
    </div>
  );
};

export const Headline: React.FC<{children: React.ReactNode; delay?: number; size?: number}> = ({children, delay = 0, size = 64}) => {
  const st = useRise(delay);
  return (
    <div style={{...st, fontFamily: HEAD, fontSize: size, fontWeight: 600, lineHeight: 1.15, color: INK}}>
      {children}
    </div>
  );
};

// per-word staggered reveal of a headline phrase
export const WordReveal: React.FC<{text: string; delay: number; size?: number; color?: string; family?: string}> = ({text, delay, size = 54, color = INK, family}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{fontFamily: family ?? HEAD, fontSize: size, fontWeight: 600, lineHeight: 1.2, color, display: "flex", flexWrap: "wrap", gap: "0 16px", justifyContent: "center"}}>
      {words.map((w, i) => {
        const s = spring({frame: frame - delay - i * 4, fps, config: {damping: 15, stiffness: 110}});
        return (
          <span key={i} style={{opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [18, 0])}px)`}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const secToFrame = (sec: number, fps = 60) => Math.round(sec * fps);


// ---------- animation toolkit (re-animation pass) ----------

// continuous ambient float: +-amp px slow sine, phase-shifted by seed
export const useFloat = (seed = 0, amp = 3, period = 150) => {
  const frame = useCurrentFrame();
  return {transform: `translateY(${Math.sin((frame + seed * 37) / (period / (2 * Math.PI))) * amp}px)`};
};

// breathing shadow for cards: pairs with useFloat for "alive" cards
export const useBreath = (seed = 0) => {
  const frame = useCurrentFrame();
  const k = 0.5 + 0.5 * Math.sin((frame + seed * 53) / 26);
  return `0 ${6 + 3 * k}px ${26 + 10 * k}px rgba(27,24,16,${0.09 + 0.035 * k})`;
};

// count-up/down to a final value: starts at `at`, runs `dur` frames, small
// overshoot then settles and HOLDS the final value forever after.
export const useCount = (at: number, value: number, dur = 50, overshoot = 0.06) => {
  const frame = useCurrentFrame();
  if (frame <= at) return 0;
  const t = Math.min(1, (frame - at) / dur);
  const eased = 1 - Math.pow(1 - t, 3);
  const os = frame > at + dur
    ? 1
    : eased * (1 + overshoot * Math.sin(Math.min(1, t * 1.15) * Math.PI));
  return value * (t >= 1 ? 1 : os);
};

// emphasis beat: brief scale punch + returns flash progress (1 at hit, decays)
export const usePunch = (at: number, strength = 0.16, dur = 22) => {
  const frame = useCurrentFrame();
  const k = frame < at ? 0 : Math.max(0, 1 - (frame - at) / dur);
  const scale = 1 + strength * Math.sin(Math.min(1, (frame - at) / dur) * Math.PI) * (frame >= at ? 1 : 0);
  return {scale: frame >= at ? scale : 1, flash: k};
};

// dots flowing left->right along a horizontal track (pipeline language)
export const FlowDots: React.FC<{width: number; color: string; count?: number; speed?: number; size?: number; opacity?: number}> =
  ({width, color, count = 4, speed = 1.6, size = 10, opacity = 0.9}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: "relative", width, height: size + 4}}>
      <div style={{position: "absolute", top: "50%", left: 0, width, height: 2, background: color, opacity: 0.22, transform: "translateY(-50%)"}} />
      {Array.from({length: count}).map((_, i) => {
        const x = ((frame * speed + (i * width) / count) % (width + 30)) - 15;
        const edge = Math.min(1, Math.min((x + 15) / 40, (width + 15 - x) / 40));
        return (
          <div key={i} style={{position: "absolute", left: x, top: "50%", width: size, height: size, borderRadius: "50%", background: color, opacity: Math.max(0, opacity * edge), transform: "translateY(-50%)", boxShadow: `0 0 ${size}px ${color}55`}} />
        );
      })}
    </div>
  );
};

// SVG arrow that draws itself (down / flat / up), for verdict cards
export const DrawArrow: React.FC<{dir: "down" | "flat" | "up"; color: string; at: number; size?: number}> = ({dir, color, at, size = 96}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 28], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const L = 120;
  const off = L * (1 - t);
  const head = t > 0.85 ? (t - 0.85) / 0.15 : 0;
  const paths = {
    down: {line: "M48 12 L48 74", head: "M30 58 L48 80 L66 58"},
    up: {line: "M48 84 L48 22", head: "M30 38 L48 16 L66 38"},
    flat: {line: "M14 48 L82 48", head: ""},
  } as const;
  const p = paths[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <path d={p.line} stroke={color} strokeWidth={11} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={off} />
      {p.head && <path d={p.head} stroke={color} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={head} />}
    </svg>
  );
};

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

export const Canvas: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: CANVAS, fontFamily: BODY, color: INK}}>
    {children}
  </AbsoluteFill>
);

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

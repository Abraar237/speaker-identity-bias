import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, Headline, secToFrame, useCount, usePunch, useFloat, useBreath, FlowDots} from "../common";
import {SLATE, HOT, GOOD, MUTED, INK, CARD} from "../theme";
import {wordTime} from "../timeline";

// Pro: Indian -2.5 (p=0.005). Flash: Indian -0.04 (p=1.0). Same audio.
const Panel: React.FC<{title: string; shift: number; p: string; color: string; at: number; verdict: string; seed: number}> = ({title, shift, p, color, at, verdict, seed}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - at + 14, fps, config: {damping: 15, stiffness: 90}});
  const g1 = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 65}});
  const g2 = spring({frame: frame - at - 12, fps, config: {damping: 13, stiffness: 65}});
  const shown = useCount(at + 20, Math.abs(shift), 40);
  const punch = usePunch(at + 58, shift === 0 ? 0.08 : 0.16);
  const float = useFloat(seed, 2.5);
  const breath = useBreath(seed);
  return (
    <div style={{...float, opacity: interpolate(enter, [0, 1], [0, 1]), transform: `${float.transform} translateY(${interpolate(enter, [0, 1], [30, 0])}px)`}}>
      <div style={{background: CARD, borderRadius: 20, padding: "34px 44px", width: 620, boxShadow: breath, display: "flex", flexDirection: "column", alignItems: "center", gap: 20}}>
        <div style={{fontSize: 34, fontWeight: 700, color: INK}}>{title}</div>
        <div style={{display: "flex", alignItems: "flex-end", gap: 48, height: 300}}>
          <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8}}>
            <div style={{width: 120, height: Math.max(0, 270 * g1), background: SLATE, borderRadius: 10}} />
            <div style={{fontSize: 22, color: MUTED}}>American</div>
          </div>
          <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8}}>
            <div style={{width: 120, height: Math.max(0, (270 + shift * 10.5) * g2), background: color, borderRadius: 10}} />
            <div style={{fontSize: 22, color: MUTED}}>Indian</div>
          </div>
        </div>
        <div style={{fontSize: 28, fontWeight: 700, color, transform: `scale(${punch.scale})`, fontVariantNumeric: "tabular-nums", textShadow: punch.flash > 0 ? `0 0 ${18 * punch.flash}px ${color}77` : "none"}}>
          {shift === 0 ? "no gap" : `−${shown.toFixed(1)} points`} &middot; <span style={{color: MUTED, fontWeight: 500}}>p = {p}</span>
        </div>
        <div style={{fontSize: 24, color: MUTED}}>{verdict}</div>
      </div>
    </div>
  );
};

export const S4TwoJudges: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const disagreeAt = t(wordTime(3, "disagree"));
  const dotsO = interpolate(frame, [t(0.4), t(1.4)], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 26}}>
        <Eyebrow delay={6}>the exact same audio, two judges</Eyebrow>
        <div style={{opacity: dotsO}}>
          <FlowDots width={520} color={MUTED} count={5} speed={2.2} size={9} />
        </div>
        <div style={{display: "flex", gap: 60}}>
          <Panel title="Gemini 3.1 Pro" shift={-2.5} p="0.005" color={HOT} at={t(1.2)} verdict="penalises the accent" seed={1.3} />
          <Panel title="Gemini 3.6 Flash" shift={0} p="1.0" color={GOOD} at={t(2.1)} verdict="scores them the same" seed={3.7} />
        </div>
        {frame > disagreeAt && (
          <Headline delay={disagreeAt} size={44}>Same company. Same audio. Two different answers.</Headline>
        )}
      </AbsoluteFill>
    </Canvas>
  );
};

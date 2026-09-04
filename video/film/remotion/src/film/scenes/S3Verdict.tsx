import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, secToFrame, useCount, usePunch, useFloat, useBreath} from "../common";
import {SLATE, HOT, MUTED, INK, CARD} from "../theme";
import {wordTime} from "../timeline";

// Real numbers (results/analysis.json axis_a, gemini-3.1-pro-preview neutral):
// US baseline shown at 78; Indian shift -2.5, CI [-4.06,-0.94], p=0.005.
const Bar: React.FC<{label: string; sub: string; value: number; color: string; at: number; seed: number}> = ({label, sub, value, color, at, seed}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 70, mass: 0.9}});
  const shown = useCount(at, value, 55);
  const float = useFloat(seed, 2.5);
  return (
    <div style={{...float, display: "flex", flexDirection: "column", alignItems: "center", gap: 14}}>
      <div style={{fontSize: 46, fontWeight: 700, color: INK, fontVariantNumeric: "tabular-nums", opacity: interpolate(frame, [at + 6, at + 20], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
        {shown.toFixed(1)}
      </div>
      <div style={{width: 190, height: Math.max(0, 430 * (value / 80) * s), background: color, borderRadius: 12}} />
      <div style={{fontSize: 30, fontWeight: 700, color: INK}}>{label}</div>
      <div style={{fontSize: 22, color: MUTED}}>{sub}</div>
    </div>
  );
};

export const S3Verdict: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const growAt = t(wordTime(2, "grade"));
  const gapAt = t(wordTime(2, "lower"));
  const pAt = t(wordTime(2, "chance"));
  const showGap = frame > gapAt;
  const showP = frame > pAt;
  const punch = usePunch(gapAt + 4, 0.2);
  const pPunch = usePunch(pAt, 0.12);
  const cardFloat = useFloat(7, 3);
  const breath = useBreath(3);
  const gapShown = useCount(gapAt + 2, 2.5, 34);
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 30}}>
        <Eyebrow delay={6}>judge: gemini 3.1 pro &middot; identical words</Eyebrow>
        <div style={{display: "flex", alignItems: "flex-end", gap: 110}}>
          <Bar label="American accent" sub="baseline" value={78.0} color={SLATE} at={growAt} seed={1} />
          <Bar label="Indian accent" sub="same words" value={75.5} color={HOT} at={growAt + 10} seed={2.6} />
        </div>
        {showGap && (
          <div style={{...cardFloat, position: "absolute", right: 300, top: 250}}>
            <div style={{background: CARD, borderRadius: 14, padding: "18px 28px", boxShadow: breath, opacity: interpolate(frame, [gapAt, gapAt + 18], [0, 1], {extrapolateRight: "clamp"}), transform: `scale(${punch.scale})`}}>
              <div style={{fontSize: 52, fontWeight: 700, color: HOT, fontVariantNumeric: "tabular-nums", textShadow: punch.flash > 0 ? `0 0 ${22 * punch.flash}px ${HOT}88` : "none"}}>
                &minus;{gapShown.toFixed(1)} points
              </div>
              <div style={{fontSize: 24, color: MUTED}}>95% CI [&minus;4.1, &minus;0.9]</div>
              {showP && (
                <div style={{fontSize: 28, color: INK, marginTop: 8, fontWeight: 600, transform: `scale(${pPunch.scale})`, transformOrigin: "left center"}}>
                  p = 0.005 &middot; about 1 in 200
                </div>
              )}
            </div>
          </div>
        )}
      </AbsoluteFill>
    </Canvas>
  );
};

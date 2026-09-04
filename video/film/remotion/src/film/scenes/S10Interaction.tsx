import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, WordReveal, secToFrame, useCount, usePunch, useFloat, useBreath} from "../common";
import {HOT, SLATE, MUTED, INK, CARD} from "../theme";
import {wordTime} from "../timeline";

// Real numbers (results/interaction_test.txt): audio -2.50 vs own-transcript
// +1.88; diff-of-diffs -6.04, CI [-8.54,-3.54], p=0.0004, n=24.
const MONO = "'SF Mono', Menlo, monospace";
const H = 210; // px per 4 points

const MiniBar: React.FC<{label: string; value: number; color: string; at: number; seed: number}> = ({label, value, color, at, seed}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const g = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 62, mass: 0.9}});
  const h = Math.abs(value) * (H / 4) * g;
  const up = value > 0;
  const shown = useCount(at + 6, Math.abs(value), 40);
  const float = useFloat(seed, 2.5);
  return (
    <div style={{...float, display: "flex", flexDirection: "column", alignItems: "center", width: 300}}>
      <div style={{height: H, display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
        {up && <div style={{width: 130, height: Math.max(0, h), background: color, borderRadius: 8}} />}
      </div>
      <div style={{width: 280, height: 3, background: INK}} />
      <div style={{height: H * 0.8}}>
        {!up && <div style={{width: 130, height: Math.max(0, h), background: color, borderRadius: 8}} />}
      </div>
      <div style={{fontFamily: MONO, fontSize: 36, fontWeight: 700, color, marginTop: -40, fontVariantNumeric: "tabular-nums"}}>
        {value > 0 ? "+" : "−"}{shown.toFixed(2)}
      </div>
      <div style={{fontSize: 24, color: MUTED, marginTop: 8}}>{label}</div>
    </div>
  );
};

export const S10Interaction: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const quoteAt = t(wordTime(8, "significant", 3) || 9);
  const growAt = t(wordTime(8, "tested") || 13);
  const braceAt = t(wordTime(8, "larger") || 16);
  const braceO = interpolate(frame, [braceAt, braceAt + 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const gapShown = useCount(braceAt + 4, 6.04, 44);
  const punch = usePunch(braceAt + 50, 0.18);
  const cardFloat = useFloat(4.2, 3);
  const breath = useBreath(2.5);
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 20}}>
        <Eyebrow delay={6}>testing the difference itself</Eyebrow>
        {frame > quoteAt - 4 && (
          <div style={{maxWidth: 1250}}>
            <WordReveal text={'"A difference in significance is not a significant difference."'} delay={quoteAt} size={44} />
          </div>
        )}
        <div style={{display: "flex", gap: 60, alignItems: "center", marginTop: 8}}>
          <MiniBar label="hearing the audio" value={-2.5} color={HOT} at={growAt} seed={1.1} />
          <MiniBar label="reading its own transcript" value={1.88} color={SLATE} at={growAt + 12} seed={3.3} />
          <div style={{...cardFloat, opacity: braceO}}>
            <div style={{background: CARD, borderRadius: 16, padding: "26px 34px", boxShadow: breath, transform: `scale(${punch.scale})`}}>
              <div style={{fontSize: 24, color: MUTED}}>the gap itself</div>
              <div style={{fontFamily: MONO, fontSize: 46, fontWeight: 700, color: HOT, fontVariantNumeric: "tabular-nums", textShadow: punch.flash > 0 ? `0 0 ${20 * punch.flash}px ${HOT}88` : "none"}}>
                &minus;{gapShown.toFixed(2)}
              </div>
              <div style={{fontFamily: MONO, fontSize: 24, color: INK, marginTop: 6}}>p = 0.0004</div>
              <div style={{fontSize: 20, color: MUTED, marginTop: 4}}>about 1 in 2,500</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Canvas>
  );
};

import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Canvas, Eyebrow, secToFrame} from "../common";
import {HOT, SLATE, MUTED, INK, CARD} from "../theme";
import {HEAD} from "../common";
import {wordTime} from "../timeline";

// Real numbers (results/interaction_test.txt): audio -2.50 vs own-transcript
// +1.88; diff-of-diffs -6.04, CI [-8.54,-3.54], p=0.0004, n=24.
const MONO = "'SF Mono', Menlo, monospace";
const H = 210; // px per 4 points

const MiniBar: React.FC<{label: string; value: number; color: string; grow: number}> = ({label, value, color, grow}) => {
  const h = Math.abs(value) * (H / 4) * grow;
  const up = value > 0;
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", width: 300}}>
      <div style={{height: H, display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
        {up && <div style={{width: 130, height: h, background: color, borderRadius: 8}} />}
      </div>
      <div style={{width: 280, height: 3, background: INK}} />
      <div style={{height: H * 0.8}}>
        {!up && <div style={{width: 130, height: h, background: color, borderRadius: 8}} />}
      </div>
      <div style={{fontFamily: MONO, fontSize: 36, fontWeight: 700, color, marginTop: -40}}>
        {value > 0 ? "+" : "−"}{Math.abs(value).toFixed(2)}
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
  const grow = interpolate(frame, [growAt, growAt + 40], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const braceO = interpolate(frame, [braceAt, braceAt + 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 20}}>
        <Eyebrow delay={6}>testing the difference itself</Eyebrow>
        <div style={{fontFamily: HEAD, fontSize: 44, fontWeight: 600, color: INK, maxWidth: 1250, textAlign: "center", opacity: interpolate(frame, [quoteAt, quoteAt + 20], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
          &ldquo;A difference in significance is not a significant difference.&rdquo;
        </div>
        <div style={{display: "flex", gap: 60, alignItems: "center", marginTop: 8}}>
          <MiniBar label="hearing the audio" value={-2.5} color={HOT} grow={grow} />
          <MiniBar label="reading its own transcript" value={1.88} color={SLATE} grow={grow} />
          <div style={{opacity: braceO, background: CARD, borderRadius: 16, padding: "26px 34px", boxShadow: "0 6px 24px rgba(27,24,16,0.12)"}}>
            <div style={{fontSize: 24, color: MUTED}}>the gap itself</div>
            <div style={{fontFamily: MONO, fontSize: 46, fontWeight: 700, color: HOT}}>&minus;6.04</div>
            <div style={{fontFamily: MONO, fontSize: 24, color: INK, marginTop: 6}}>p = 0.0004</div>
            <div style={{fontSize: 20, color: MUTED, marginTop: 4}}>about 1 in 2,500</div>
          </div>
        </div>
      </AbsoluteFill>
    </Canvas>
  );
};

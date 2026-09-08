import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Canvas, Eyebrow, WordReveal, secToFrame, usePunch, useFloat, useBreath} from "../common";
import {HOT, GOOD, MUTED, INK, CARD} from "../theme";
import {wordTime} from "../timeline";

const MONO = "'SF Mono', Menlo, monospace";

export const S15Reversal: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const stampAt = t(wordTime(10, "down") || 3.5);
  const survAt = t(wordTime(10, "replication") || 8);
  const methodAt = t(wordTime(10, "working") || 13);
  const warnAt = t(wordTime(10, "warning") || 15.5);
  const punch = usePunch(survAt, 0.14);
  const float = useFloat(2, 3);
  const breath = useBreath(1);
  const strike = interpolate(frame, [survAt, survAt + 24], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 44, padding: "90px 130px"}}>
        <Eyebrow delay={8}>pre-registered &middot; reported as found</Eyebrow>
        <div style={{...float, background: CARD, borderRadius: 22, padding: "44px 64px", boxShadow: breath, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, transform: `${float.transform} scale(${punch.scale})`}}>
          <div style={{position: "relative", fontFamily: MONO, fontSize: 56, fontWeight: 700, color: HOT, opacity: interpolate(frame, [stampAt, stampAt + 16], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
            {"−"}2.5 &middot; p = 0.005
            <div style={{position: "absolute", left: "-4%", top: "52%", width: `${108 * strike}%`, height: 7, background: INK, borderRadius: 3, opacity: 0.85}} />
          </div>
          <div style={{fontSize: 30, color: MUTED, opacity: interpolate(frame, [survAt + 10, survAt + 26], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
            our own headline &middot; did not survive our own replication
          </div>
        </div>
        {frame > methodAt - 4 && (
          <div style={{fontSize: 40, fontWeight: 700, color: GOOD, opacity: interpolate(frame, [methodAt, methodAt + 18], [0, 1], {extrapolateRight: "clamp"})}}>
            That is not a failure. That is the method working.
          </div>
        )}
        {frame > warnAt - 4 && (
          <div style={{maxWidth: 1250, textAlign: "center", opacity: interpolate(frame, [warnAt, warnAt + 20], [0, 1], {extrapolateRight: "clamp"})}}>
            <WordReveal
              text="A single-voice, single-rubric audit can manufacture an accent bias that is not there."
              delay={warnAt}
              size={46}
              color={INK}
            />
          </div>
        )}
      </AbsoluteFill>
    </Canvas>
  );
};

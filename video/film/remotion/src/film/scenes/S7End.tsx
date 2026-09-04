import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Canvas, Headline, Eyebrow, secToFrame} from "../common";
import {MUTED, INK, GOOD, HOT} from "../theme";
import {wordTime} from "../timeline";

export const S7End: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const fixAt = t(wordTime(11, "transcript") || 5.0);
  const cardAt = t(wordTime(11, "score") || 15.5);
  const cardIn = interpolate(frame, [cardAt, cardAt + 30], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 42, padding: 120}}>
        <Headline delay={t(0.6)} size={62}>
          Which audio judge you pick is not a neutral choice.
        </Headline>
        {frame > fixAt - 4 && (
          <div style={{fontSize: 40, color: GOOD, fontWeight: 700, opacity: interpolate(frame, [fixAt, fixAt + 20], [0, 1], {extrapolateRight: "clamp"})}}>
            Grading from a transcript is a real, tested fix.
          </div>
        )}
        <div style={{opacity: cardIn, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginTop: 30}}>
          <div style={{fontSize: 34, fontWeight: 700, color: HOT, letterSpacing: 1}}>Vizuara Research</div>
          <div style={{fontSize: 26, color: INK}}>Does the Voice Change the Grade?</div>
          <div style={{fontSize: 23, color: MUTED}}>github.com/Abraar237/speaker-identity-bias</div>
        </div>
      </AbsoluteFill>
    </Canvas>
  );
};

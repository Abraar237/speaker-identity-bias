import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Canvas, Eyebrow, WordReveal, secToFrame} from "../common";
import {HOT, GOOD, MUTED, INK, CARD, FAINT} from "../theme";
import {wordTime} from "../timeline";

const MONO = "'SF Mono', Menlo, monospace";

const JudgeCard: React.FC<{name: string; verdict: string; num: string; color: string; arrow: string; at: number; frame: number}> = ({name, verdict, num, color, arrow, at, frame}) => {
  const o = interpolate(frame, [at, at + 20], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <div style={{opacity: o, transform: `translateY(${(1 - o) * 24}px)`, background: CARD, borderRadius: 20, padding: "36px 44px", width: 420, boxShadow: "0 8px 30px rgba(27,24,16,0.10)", display: "flex", flexDirection: "column", alignItems: "center", gap: 14}}>
      <div style={{fontSize: 28, fontWeight: 700, color: INK}}>{name}</div>
      <div style={{fontSize: 84, color, lineHeight: 1}}>{arrow}</div>
      <div style={{fontFamily: MONO, fontSize: 34, fontWeight: 700, color}}>{num}</div>
      <div style={{fontSize: 22, color: MUTED}}>{verdict}</div>
    </div>
  );
};

export const S9ThreeDirections: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const a1 = t(wordTime(7, "penalises") || 3);
  const a2 = t(wordTime(7, "react") || 5.5);
  const a3 = t(wordTime(7, "rewards") || 8);
  const punchAt = t(wordTime(7, "property") || 15);
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 44}}>
        <Eyebrow delay={6}>same audio &middot; same words &middot; three verdicts</Eyebrow>
        <div style={{display: "flex", gap: 44}}>
          <JudgeCard name="Gemini 3.1 Pro" verdict="penalises Indian accent" num="&minus;2.5" color={HOT} arrow="&darr;" at={a1} frame={frame} />
          <JudgeCard name="Gemini 3.6 Flash" verdict="no reaction at all" num="&minus;0.04" color={FAINT} arrow="&mdash;" at={a2} frame={frame} />
          <JudgeCard name="Qwen2-Audio" verdict="rewards every accent" num="+2 to +2.9" color={GOOD} arrow="&uarr;" at={a3} frame={frame} />
        </div>
        {frame > punchAt && (
          <WordReveal text="The direction belongs to the judge." delay={punchAt} size={50} />
        )}
      </AbsoluteFill>
    </Canvas>
  );
};

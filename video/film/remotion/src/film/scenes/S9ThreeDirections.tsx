import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, WordReveal, secToFrame, useCount, usePunch, useFloat, useBreath, DrawArrow} from "../common";
import {HOT, GOOD, MUTED, INK, CARD, FAINT} from "../theme";
import {wordTime} from "../timeline";

const MONO = "'SF Mono', Menlo, monospace";

const JudgeCard: React.FC<{name: string; verdict: string; color: string; dir: "down" | "flat" | "up"; at: number; seed: number; num: React.ReactNode}> =
  ({name, verdict, color, dir, at, seed, num}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 15, stiffness: 95}});
  const punch = usePunch(at + 40, 0.13);
  const float = useFloat(seed, 3);
  const breath = useBreath(seed);
  return (
    <div style={{...float, opacity: interpolate(s, [0, 1], [0, 1]), transform: `${float.transform} translateY(${interpolate(s, [0, 1], [24, 0])}px)`}}>
      <div style={{background: CARD, borderRadius: 20, padding: "36px 44px", width: 420, boxShadow: breath, display: "flex", flexDirection: "column", alignItems: "center", gap: 14}}>
        <div style={{fontSize: 28, fontWeight: 700, color: INK}}>{name}</div>
        <DrawArrow dir={dir} color={color} at={at + 10} />
        <div style={{fontFamily: MONO, fontSize: 34, fontWeight: 700, color, fontVariantNumeric: "tabular-nums", transform: `scale(${punch.scale})`, textShadow: punch.flash > 0 ? `0 0 ${16 * punch.flash}px ${color}77` : "none"}}>
          {num}
        </div>
        <div style={{fontSize: 22, color: MUTED}}>{verdict}</div>
      </div>
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
  const proN = useCount(a1 + 14, 2.5, 36);
  const qwenN = useCount(a3 + 14, 2.9, 36);
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 44}}>
        <Eyebrow delay={6}>same audio &middot; same words &middot; three verdicts</Eyebrow>
        <div style={{display: "flex", gap: 44}}>
          <JudgeCard name="Gemini 3.1 Pro" verdict="penalises Indian accent" color={HOT} dir="down" at={a1} seed={1.2}
            num={<>&minus;{proN.toFixed(1)}</>} />
          <JudgeCard name="Gemini 3.6 Flash" verdict="no reaction at all" color={FAINT} dir="flat" at={a2} seed={3.4}
            num={<>&minus;0.04</>} />
          <JudgeCard name="Qwen2-Audio" verdict="rewards every accent" color={GOOD} dir="up" at={a3} seed={5.6}
            num={<>+2 to +{qwenN.toFixed(1)}</>} />
        </div>
        {frame > punchAt && (
          <WordReveal text="The direction belongs to the judge." delay={punchAt} size={50} />
        )}
      </AbsoluteFill>
    </Canvas>
  );
};

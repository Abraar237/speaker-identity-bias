import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {Canvas, Eyebrow, secToFrame, useFloat} from "../common";
import {MUTED, INK, GOOD, HOT, CARD} from "../theme";
import {wordTime} from "../timeline";

const ITEMS = [
  {key: "voice", text: "more than one voice per accent"},
  {key: "rubric", text: "more than one rubric"},
  {key: "speech", text: "real human speech, not just synthetic"},
  {key: "family", text: "a judge from more than one family"},
];

const Check: React.FC<{at: number; text: string}> = ({at, text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 100, mass: 0.8}});
  const draw = interpolate(frame, [at + 4, at + 22], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const L = 40;
  return (
    <div style={{display: "flex", alignItems: "center", gap: 20, opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateX(${interpolate(s, [0, 1], [-22, 0])}px)`}}>
      <svg width={44} height={44} viewBox="0 0 44 44">
        <circle cx={22} cy={22} r={20} stroke={GOOD} strokeWidth={3.5} fill="none" opacity={0.5} />
        <path d="M12 23 L19 30 L32 15" stroke={GOOD} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} />
      </svg>
      <div style={{fontSize: 33, fontWeight: 600, color: INK}}>{text}</div>
    </div>
  );
};

export const S17Closing: React.FC<{audioStart: number}> = ({audioStart}) => {
  const frame = useCurrentFrame();
  const t = (sec: number) => audioStart + secToFrame(sec);
  const ats = [
    t(wordTime(12, "voice", 1) || 4),
    t(wordTime(12, "rubric") || 7),
    t(wordTime(12, "speech") || 9.5),
    t(wordTime(12, "family") || 13),
  ];
  const fixAt = t(wordTime(12, "transcript") || 18);
  const cardAt = t(wordTime(12, "said") || 23);
  const cardIn = interpolate(frame, [cardAt, cardAt + 30], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const float = useFloat(2.2, 3);
  const brandPulse = 1 + 0.015 * Math.sin(frame / 22);
  return (
    <Canvas>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 36, padding: "80px 140px"}}>
        <Eyebrow delay={8}>what to demand of any audio-judge audit &mdash; including ours</Eyebrow>
        <div style={{background: CARD, borderRadius: 22, padding: "38px 60px", display: "flex", flexDirection: "column", gap: 22, boxShadow: "0 8px 30px rgba(27,24,16,0.10)"}}>
          {ITEMS.map((it, i) => (
            <Check key={it.key} at={ats[i]} text={it.text} />
          ))}
        </div>
        {frame > fixAt - 4 && (
          <div style={{fontSize: 34, color: GOOD, fontWeight: 700, opacity: interpolate(frame, [fixAt, fixAt + 18], [0, 1], {extrapolateRight: "clamp"})}}>
            Grading from a transcript is still the one tested fix.
          </div>
        )}
        <div style={{...float, opacity: cardIn, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 14, transform: `${float.transform} scale(${brandPulse})`}}>
          <div style={{fontSize: 32, fontWeight: 700, color: HOT, letterSpacing: 1}}>Vizuara Research</div>
          <div style={{fontSize: 25, color: INK}}>Does the Voice Change the Grade?</div>
          <div style={{fontSize: 22, color: MUTED}}>github.com/Abraar237/speaker-identity-bias</div>
        </div>
      </AbsoluteFill>
    </Canvas>
  );
};

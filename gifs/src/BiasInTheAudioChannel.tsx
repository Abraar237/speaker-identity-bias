import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RoughRect, RoughPath, ArrowHead } from "./lib/Rough";
import { FlowDots } from "./lib/FlowDots";
import { Gear } from "./lib/Icons";
import { Cubic, cubicD } from "./lib/bezier";
import {
  PAPER, CARD, INK, MUTED, SLATE, SLATE_SOFT, MAGENTA, MAGENTA_SOFT,
  WARM, WARM_SOFT, Txt, loadGifFonts, fillCycle,
} from "./shared";

// three horizontal lanes from the clip card to three judge boxes
const lane = (y: number): Cubic => ({
  p0: { x: 330, y },
  p1: { x: 420, y },
  p2: { x: 520, y },
  p3: { x: 610, y },
});
const laneTop = lane(330);
const laneMid = lane(560);
const laneBot = lane(790);

const PERIOD = 120;
const OFFSET = 40;

const Meter: React.FC<{
  y: number; shift: number; color: string; cyc: number; strong?: boolean; verdict: string;
}> = ({ y, shift, color, cyc, strong = false, verdict }) => {
  const zero = 905;
  const scale = 120 / 3;
  const w = Math.abs(shift) * scale * cyc;
  const val = (shift * cyc).toFixed(1);
  return (
    <>
      <svg width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>
        <line x1={zero} y1={y - 34} x2={zero} y2={y + 34} stroke={MUTED} strokeWidth={2} strokeDasharray="5 5" />
        <rect
          x={shift >= 0 ? zero : zero - w}
          y={y - 15}
          width={Math.max(w, 1)}
          height={30}
          fill={color}
          opacity={strong ? 0.9 : 0.5}
          rx={3}
        />
      </svg>
      <Txt x={zero - 145} y={y - 66} size={strong ? 30 : 25} w={290} align="center" color={strong ? color : MUTED}>
        {shift >= 0 ? `+${val}` : val}
      </Txt>
      <Txt x={zero - 145} y={y + 40} size={18} w={290} align="center" color={strong ? color : MUTED}>
        {verdict}
      </Txt>
    </>
  );
};

export const BiasInTheAudioChannel: React.FC = () => {
  loadGifFonts();
  const frame = useCurrentFrame();
  const cyc = fillCycle(frame + OFFSET, PERIOD);

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>
        {/* the one clip, spanning all three lanes */}
        <RoughRect x={70} y={270} w={260} h={580} fill={CARD} stroke={INK} seed={41} strokeWidth={2.6} />
        {/* waveform */}
        <RoughPath
          d="M 110 560 q 8 -30 17 0 q 9 34 18 0 q 8 -44 17 0 q 9 38 18 0 q 8 -26 17 0 q 9 30 18 0 q 8 -38 17 0 q 9 26 18 0 q 8 -32 17 0 q 9 22 18 0"
          stroke={MAGENTA}
          seed={42}
          strokeWidth={3}
        />

        {/* three lanes */}
        <path d={cubicD(laneTop)} stroke={MAGENTA} strokeWidth={2} opacity={0.4} fill="none" />
        <path d={cubicD(laneMid)} stroke={SLATE} strokeWidth={2} opacity={0.35} fill="none" />
        <path d={cubicD(laneBot)} stroke={WARM} strokeWidth={2} opacity={0.35} fill="none" />
        <ArrowHead x={610} y={330} angle={0} color={MAGENTA} />
        <ArrowHead x={610} y={560} angle={0} color={SLATE} />
        <ArrowHead x={610} y={790} angle={0} color={WARM} />
        <FlowDots path={laneTop} color={MAGENTA} nDots={3} period={80} radius={5.6} />
        <FlowDots path={laneMid} color={SLATE} nDots={2} period={80} radius={5} phase={0.33} />
        <FlowDots path={laneBot} color={WARM} nDots={2} period={80} radius={5} phase={0.66} />

        {/* three judge boxes */}
        <RoughRect x={614} y={276} w={146} h={108} fill={MAGENTA_SOFT} stroke={MAGENTA} seed={43} strokeWidth={2.4} />
        <RoughRect x={614} y={506} w={146} h={108} fill={SLATE_SOFT} stroke={SLATE} seed={44} strokeWidth={2.4} />
        <RoughRect x={614} y={736} w={146} h={108} fill={WARM_SOFT} stroke={WARM} seed={45} strokeWidth={2.4} />
      </svg>
      <Gears />

      <Txt x={40} y={24} size={46} w={1000} align="center" color={INK}>
        The bias lives in the audio channel
      </Txt>
      <Txt x={40} y={86} size={24} w={1000} align="center" color={MUTED}>
        one Indian-accented answer, graded three ways by the same judge
      </Txt>

      <Txt x={85} y={300} size={25} w={230} align="center" color={INK}>
        one spoken answer
      </Txt>
      <Txt x={85} y={378} size={20} w={230} align="center" color={MUTED} lineHeight={1.4}>
        Indian accent, words identical to the American version
      </Txt>
      <Txt x={85} y={620} size={20} w={230} align="center" color={MUTED}>
        Gemini 3.1 Pro judges it three ways
      </Txt>

      {/* lane labels */}
      <Txt x={350} y={272} size={22} w={240} color={MAGENTA}>
        hear the audio
      </Txt>
      <Txt x={350} y={502} size={22} w={240} color={SLATE}>
        read its own transcript
      </Txt>
      <Txt x={350} y={732} size={22} w={240} color={WARM}>
        read the gold transcript
      </Txt>

      <Meter y={330} shift={-2.5} color={MAGENTA} cyc={cyc} strong verdict="penalty, p = 0.006" />
      <Meter y={560} shift={1.9} color={SLATE} cyc={cyc} verdict="gone, p = 0.14" />
      <Meter y={790} shift={-0.8} color={WARM} cyc={cyc} verdict="gone, p = 0.51" />

      <Txt x={40} y={920} size={28} w={1000} align="center" color={INK}>
        take away the sound, the penalty disappears
      </Txt>
      <Txt x={40} y={1010} size={22} w={1000} align="center" color={MUTED}>
        score shift, Indian minus American accent, same words in every cell
      </Txt>
    </AbsoluteFill>
  );
};

// small gears inside the three judge boxes, own component so the svg above stays static
const Gears: React.FC = () => (
  <svg width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>
    <Gear cx={687} cy={330} r={22} period={120} color={MAGENTA} />
    <Gear cx={687} cy={560} r={22} period={120} color={SLATE} />
    <Gear cx={687} cy={790} r={22} period={120} color={WARM} />
  </svg>
);

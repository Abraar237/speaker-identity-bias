import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RoughRect, RoughPath, ArrowHead } from "./lib/Rough";
import { FlowDots } from "./lib/FlowDots";
import { Gear } from "./lib/Icons";
import { Cubic, cubicD } from "./lib/bezier";
import {
  PAPER, CARD, INK, MUTED, SLATE, SLATE_SOFT, MAGENTA, MAGENTA_SOFT,
  Txt, loadGifFonts, fillCycle,
} from "./shared";

// clip card -> two judges
const pL: Cubic = {
  p0: { x: 470, y: 400 },
  p1: { x: 420, y: 460 },
  p2: { x: 330, y: 480 },
  p3: { x: 280, y: 530 },
};
const pR: Cubic = {
  p0: { x: 610, y: 400 },
  p1: { x: 660, y: 460 },
  p2: { x: 750, y: 480 },
  p3: { x: 800, y: 530 },
};

const PERIOD = 120;
const OFFSET = 40;

export const TwoJudgesTwoVerdicts: React.FC = () => {
  loadGifFonts();
  const frame = useCurrentFrame();
  const cyc = fillCycle(frame + OFFSET, PERIOD);
  const proVal = (-2.5 * cyc).toFixed(1);
  const flashVal = (-0.0 * cyc).toFixed(1);
  const zeroL = 285;
  const zeroR = 805;
  const scale = 150 / 3;
  const wPro = 2.5 * scale * cyc;

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>
        {/* the one clip */}
        <RoughRect x={340} y={190} w={400} h={210} fill={CARD} stroke={INK} seed={51} strokeWidth={2.6} />
        <RoughPath
          d="M 400 340 q 8 -26 17 0 q 9 30 18 0 q 8 -38 17 0 q 9 32 18 0 q 8 -22 17 0 q 9 26 18 0 q 8 -32 17 0 q 9 22 18 0 q 8 -28 17 0 q 9 20 18 0 q 8 -24 17 0 q 9 18 18 0 q 8 -30 17 0 q 9 24 18 0 q 8 -20 17 0"
          stroke={INK}
          seed={52}
          strokeWidth={2.8}
        />

        {/* clip -> judges */}
        <path d={cubicD(pL)} stroke={MAGENTA} strokeWidth={2} opacity={0.35} fill="none" />
        <path d={cubicD(pR)} stroke={SLATE} strokeWidth={2} opacity={0.35} fill="none" />
        <ArrowHead x={280} y={530} angle={2.35} color={MAGENTA} />
        <ArrowHead x={800} y={530} angle={0.8} color={SLATE} />
        <FlowDots path={pL} color={MAGENTA} nDots={3} period={80} radius={5.4} />
        <FlowDots path={pR} color={SLATE} nDots={3} period={80} radius={5.4} phase={0.5} />

        {/* judge cards */}
        <RoughRect x={120} y={534} w={330} h={140} fill={MAGENTA_SOFT} stroke={MAGENTA} seed={53} strokeWidth={2.6} />
        <RoughRect x={630} y={534} w={330} h={140} fill={SLATE_SOFT} stroke={SLATE} seed={54} strokeWidth={2.6} />
        <Gear cx={180} cy={604} r={26} period={120} color={MAGENTA} />
        <Gear cx={690} cy={604} r={26} period={120} color={SLATE} />

        {/* verdict meters: zero lines + bars */}
        <line x1={zeroL} y1={770} x2={zeroL} y2={860} stroke={MUTED} strokeWidth={2} strokeDasharray="5 5" />
        <line x1={zeroR} y1={770} x2={zeroR} y2={860} stroke={MUTED} strokeWidth={2} strokeDasharray="5 5" />
        <rect x={zeroL - wPro} y={800} width={Math.max(wPro, 1)} height={30} fill={MAGENTA} opacity={0.9} rx={3} />
        <rect x={zeroR - 1} y={800} width={2} height={30} fill={SLATE} opacity={0.7} rx={1} />
      </svg>

      <Txt x={40} y={24} size={46} w={1000} align="center" color={INK}>
        Two judges, two verdicts
      </Txt>
      <Txt x={40} y={86} size={24} w={1000} align="center" color={MUTED}>
        the same Indian-accented clip, scored by two judges from one company
      </Txt>

      <Txt x={370} y={210} size={25} w={340} align="center" color={INK}>
        one spoken answer
      </Txt>
      <Txt x={370} y={252} size={20} w={340} align="center" color={MUTED}>
        Indian accent, words frozen
      </Txt>

      <Txt x={220} y={572} size={25} w={220} color={MAGENTA}>
        Gemini 3.1 Pro
      </Txt>
      <Txt x={220} y={608} size={18} w={220} color={MUTED}>
        the stronger model
      </Txt>
      <Txt x={730} y={572} size={25} w={220} color={SLATE}>
        Gemini 3.6 Flash
      </Txt>
      <Txt x={730} y={608} size={18} w={220} color={MUTED}>
        the faster model
      </Txt>

      {/* verdict numbers */}
      <Txt x={135} y={716} size={38} w={300} align="center" color={MAGENTA}>
        {proVal}
      </Txt>
      <Txt x={655} y={716} size={38} w={300} align="center" color={SLATE}>
        {flashVal}
      </Txt>
      <Txt x={135} y={866} size={20} w={300} align="center" color={MAGENTA}>
        penalty, p = 0.005
      </Txt>
      <Txt x={655} y={866} size={20} w={300} align="center" color={SLATE}>
        no penalty, p = 1.0
      </Txt>

      <Txt x={40} y={932} size={28} w={1000} align="center" color={INK}>
        same audio, same rubric, opposite conclusions
      </Txt>
      <Txt x={40} y={1012} size={22} w={1000} align="center" color={MUTED}>
        score shift vs the American baseline, identical words in both clips
      </Txt>
    </AbsoluteFill>
  );
};

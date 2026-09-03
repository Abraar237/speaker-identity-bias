import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RoughRect, RoughPath, ArrowHead } from "./lib/Rough";
import { FlowDots } from "./lib/FlowDots";
import { Gear } from "./lib/Icons";
import { Cubic, cubicD } from "./lib/bezier";
import {
  PAPER, CARD, INK, MUTED, SLATE, SLATE_SOFT, MAGENTA, MAGENTA_SOFT,
  WARM, WARM_SOFT, VIRGIL, Txt, loadGifFonts, fillCycle,
} from "./shared";

const GOOD = "#1c7a55";
const GOOD_SOFT = "#ddeee6";

// four voice chips -> judge
const mk = (x0: number, y0: number, x1: number, y1: number): Cubic => ({
  p0: { x: x0, y: y0 },
  p1: { x: x0, y: y0 + 60 },
  p2: { x: x1, y: y1 - 70 },
  p3: { x: x1, y: y1 },
});
const pUS = mk(160, 452, 470, 560);
const pUK = mk(415, 452, 510, 560);
const pIN = mk(665, 452, 570, 560);
const pNG = mk(920, 452, 610, 560);

// tiny hand-drawn waveform squiggle
const wave = (cx: number, cy: number, seed: number, color: string) => (
  <RoughPath
    d={`M ${cx - 52} ${cy} q 6 -16 13 0 q 7 18 14 0 q 6 -24 13 0 q 7 20 14 0 q 6 -14 13 0 q 7 16 14 0 q 6 -20 13 0 q 7 14 14 0`}
    stroke={color}
    seed={seed}
    strokeWidth={2.6}
  />
);

const PERIOD = 120;
const OFFSET = 40;

// delta bar around a zero line: half-width 190 covers +-3 points
const DeltaRow: React.FC<{
  y: number; label: string; shift: number; color: string; cyc: number;
  strong?: boolean; note?: string;
}> = ({ y, label, shift, color, cyc, strong = false, note }) => {
  const zero = 560;
  const scale = 190 / 3; // px per point
  const w = Math.abs(shift) * scale * cyc;
  const val = (shift * cyc).toFixed(1);
  return (
    <>
      <Txt x={120} y={y - 15} size={strong ? 25 : 22} w={250} color={strong ? color : INK}>
        {label}
      </Txt>
      <svg width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect
          x={shift >= 0 ? zero : zero - w}
          y={y - 13}
          width={Math.max(w, 1)}
          height={26}
          fill={color}
          opacity={strong ? 0.9 : 0.55}
          rx={3}
        />
      </svg>
      <Txt
        x={shift >= 0 ? zero + 200 : zero - 320}
        y={y - 15}
        size={strong ? 27 : 22}
        w={120}
        align={shift >= 0 ? "left" : "right"}
        color={strong ? color : MUTED}
      >
        {shift >= 0 ? `+${val}` : val}
      </Txt>
      {note ? (
        <Txt x={880} y={y - 12} size={18} w={180} color={strong ? color : MUTED}>
          {note}
        </Txt>
      ) : null}
    </>
  );
};

export const SameWordsDifferentVoice: React.FC = () => {
  loadGifFonts();
  const frame = useCurrentFrame();
  const cyc = fillCycle(frame + OFFSET, PERIOD);

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>
        {/* frozen answer card */}
        <RoughRect x={240} y={128} w={600} h={120} fill={CARD} stroke={INK} seed={21} />

        {/* four voice chips */}
        <RoughRect x={60} y={330} w={200} h={122} fill={SLATE_SOFT} stroke={SLATE} seed={22} />
        <RoughRect x={315} y={330} w={200} h={122} fill={WARM_SOFT} stroke={WARM} seed={23} />
        <RoughRect x={565} y={330} w={200} h={122} fill={MAGENTA_SOFT} stroke={MAGENTA} seed={24} />
        <RoughRect x={820} y={330} w={200} h={122} fill={GOOD_SOFT} stroke={GOOD} seed={25} />
        {wave(160, 424, 26, SLATE)}
        {wave(415, 424, 27, WARM)}
        {wave(665, 424, 28, MAGENTA)}
        {wave(920, 424, 29, GOOD)}

        {/* card -> chips fan lines (static) */}
        <RoughPath d="M 420 250 L 175 322" stroke={MUTED} seed={30} strokeWidth={1.8} />
        <RoughPath d="M 500 250 L 420 322" stroke={MUTED} seed={31} strokeWidth={1.8} />
        <RoughPath d="M 590 250 L 660 322" stroke={MUTED} seed={32} strokeWidth={1.8} />
        <RoughPath d="M 665 250 L 905 322" stroke={MUTED} seed={33} strokeWidth={1.8} />

        {/* chips -> judge flows */}
        <path d={cubicD(pUS)} stroke={SLATE} strokeWidth={2} opacity={0.3} fill="none" />
        <path d={cubicD(pUK)} stroke={WARM} strokeWidth={2} opacity={0.3} fill="none" />
        <path d={cubicD(pIN)} stroke={MAGENTA} strokeWidth={2} opacity={0.35} fill="none" />
        <path d={cubicD(pNG)} stroke={GOOD} strokeWidth={2} opacity={0.3} fill="none" />
        <ArrowHead x={470} y={560} angle={1.35} color={SLATE} />
        <ArrowHead x={510} y={560} angle={1.5} color={WARM} />
        <ArrowHead x={570} y={560} angle={1.75} color={MAGENTA} />
        <ArrowHead x={610} y={560} angle={1.9} color={GOOD} />
        <FlowDots path={pUS} color={SLATE} nDots={2} period={80} radius={5} />
        <FlowDots path={pUK} color={WARM} nDots={2} period={80} radius={5} phase={0.25} />
        <FlowDots path={pIN} color={MAGENTA} nDots={3} period={80} radius={5.6} phase={0.5} />
        <FlowDots path={pNG} color={GOOD} nDots={2} period={80} radius={5} phase={0.75} />

        {/* judge card */}
        <RoughRect x={400} y={556} w={280} h={130} fill={CARD} stroke={INK} seed={34} strokeWidth={2.8} />
        <Gear cx={452} cy={620} r={28} period={120} color={INK} />

        {/* zero line for delta rows */}
        <line x1={560} y1={742} x2={560} y2={1000} stroke={MUTED} strokeWidth={2} strokeDasharray="6 6" />
      </svg>

      <Txt x={40} y={24} size={46} w={1000} align="center" color={INK}>
        Same words, different voice
      </Txt>
      <Txt x={40} y={86} size={24} w={1000} align="center" color={MUTED}>
        one spoken answer, four accents, scored blind by an audio judge
      </Txt>

      <Txt x={270} y={148} size={25} w={540} align="center" color={INK}>
        one answer, text frozen
      </Txt>
      <Txt x={270} y={192} size={20} w={540} align="center" color={MUTED}>
        every clip carries the identical words
      </Txt>

      <Txt x={60} y={338} size={22} w={200} align="center" color={SLATE}>
        American
      </Txt>
      <Txt x={315} y={338} size={22} w={200} align="center" color={WARM}>
        British
      </Txt>
      <Txt x={565} y={338} size={22} w={200} align="center" color={MAGENTA}>
        Indian
      </Txt>
      <Txt x={820} y={338} size={22} w={200} align="center" color={GOOD}>
        Nigerian
      </Txt>

      <Txt x={492} y={594} size={25} w={180} color={INK}>
        audio judge
      </Txt>
      <Txt x={492} y={630} size={18} w={180} color={MUTED}>
        Gemini 3.1 Pro
      </Txt>

      <Txt x={120} y={712} size={22} w={700} color={MUTED}>
        score shift vs the American baseline
      </Txt>

      <DeltaRow y={790} label="American" shift={0} color={SLATE} cyc={cyc} note="baseline" />
      <DeltaRow y={850} label="British" shift={-0.4} color={WARM} cyc={cyc} />
      <DeltaRow y={910} label="Indian" shift={-2.5} color={MAGENTA} cyc={cyc} strong note="p = 0.005" />
      <DeltaRow y={970} label="Nigerian" shift={1.0} color={GOOD} cyc={cyc} />

      <Txt x={40} y={1016} size={22} w={1000} align="center" color={MUTED}>
        identical words, temperature 0, one clip per call, judge blind to the study
      </Txt>
    </AbsoluteFill>
  );
};

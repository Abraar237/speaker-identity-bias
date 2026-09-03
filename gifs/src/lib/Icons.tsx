import React from "react";
import { useCurrentFrame } from "remotion";
import { INK } from "./theme";

// Hand-drawn-ish gear that rotates in place. period = frames per revolution.
export const Gear: React.FC<{
  cx: number;
  cy: number;
  r: number;
  period: number;
  color?: string;
}> = ({ cx, cy, r, period, color = INK }) => {
  const frame = useCurrentFrame();
  const angle = (frame / period) * 360;
  const teeth = 8;
  const inner = r * 0.62;
  const spokes = Array.from({ length: teeth }, (_, i) => {
    const a = (i / teeth) * Math.PI * 2;
    return {
      x1: cx + Math.cos(a) * inner,
      y1: cy + Math.sin(a) * inner,
      x2: cx + Math.cos(a) * r,
      y2: cy + Math.sin(a) * r,
    };
  });
  return (
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      <circle cx={cx} cy={cy} r={inner} stroke={color} strokeWidth={3} fill="none" />
      <circle cx={cx} cy={cy} r={r * 0.24} stroke={color} strokeWidth={2.6} fill="none" />
      {spokes.map((s, i) => (
        <line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={color}
          strokeWidth={4.5}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
};

// Checkmark that redraws itself on a loop (stroke-dash "self-writing" icon).
export const TickLoop: React.FC<{
  cx: number;
  cy: number;
  size: number;
  color: string;
  period?: number;
}> = ({ cx, cy, size, color, period = 120 }) => {
  const frame = useCurrentFrame();
  const t = (frame % period) / period;
  // draw during first 25% of the cycle, hold visible for the rest
  const progress = Math.min(1, t / 0.25);
  const len = size * 2.4;
  const d = `M ${cx - size * 0.55} ${cy} L ${cx - size * 0.12} ${cy + size * 0.42} L ${
    cx + size * 0.62
  } ${cy - size * 0.45}`;
  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={len}
      strokeDashoffset={len * (1 - progress)}
    />
  );
};

// Small pulsing "!" flame-substitute: an exclamation chip that gently throbs.
export const PulseMark: React.FC<{
  cx: number;
  cy: number;
  color: string;
  period?: number;
}> = ({ cx, cy, color, period = 60 }) => {
  const frame = useCurrentFrame();
  const s = 1 + 0.12 * Math.sin((frame / period) * Math.PI * 2);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <line x1={0} y1={-11} x2={0} y2={4} stroke={color} strokeWidth={5} strokeLinecap="round" />
      <circle cx={0} cy={12} r={3.2} fill={color} />
    </g>
  );
};

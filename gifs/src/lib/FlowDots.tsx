import React from "react";
import { useCurrentFrame } from "remotion";
import { Cubic, pointAtLength } from "./bezier";

type Props = {
  path: Cubic;
  color: string;
  nDots?: number;
  period?: number; // frames for one dot to travel the full path
  radius?: number;
  phase?: number; // 0..1 stagger between parallel paths
  halo?: boolean; // soft outer circle; off for strict two-color renders
  ease?: boolean | "out"; // smoothstep, or "out" = launch fast then decelerate
};

// Dots flowing along a bezier path. Runs from frame 0, loops seamlessly
// when period divides the composition duration.
export const FlowDots: React.FC<Props> = ({
  path,
  color,
  nDots = 3,
  period = 60,
  radius = 5,
  phase = 0,
  halo = true,
  ease = false,
}) => {
  const frame = useCurrentFrame();
  const dots = Array.from({ length: nDots }, (_, i) => {
    const raw = ((frame / period + phase + i / nDots) % 1 + 1) % 1;
    const frac =
      ease === "out"
        ? 1 - (1 - raw) * (1 - raw)
        : ease
          ? raw * raw * (3 - 2 * raw)
          : raw;
    const p = pointAtLength(path, frac);
    // fade in/out at the ends so dots do not pop
    const edge = Math.min(frac, 1 - frac);
    const opacity = Math.min(1, edge * 8);
    return { p, opacity, key: i };
  });
  return (
    <>
      {dots.map(({ p, opacity, key }) => (
        <g key={key} opacity={opacity}>
          {halo ? (
            <circle cx={p.x} cy={p.y} r={radius * 1.9} fill={color} opacity={0.18} />
          ) : null}
          <circle cx={p.x} cy={p.y} r={radius} fill={color} />
        </g>
      ))}
    </>
  );
};

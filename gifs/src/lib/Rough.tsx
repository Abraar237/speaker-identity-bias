import React, { useMemo } from "react";
import rough from "roughjs/bin/rough";
import { INK } from "./theme";

const generator = rough.generator();

// Linework is intentionally static: a fixed seed keeps the hand-drawn look
// without the "boiling" wobble, so only dots and icons draw the eye.
export const useBoilSeed = (base: number): number => base;

type PathInfo = { d: string; stroke: string; strokeWidth: number; fill?: string };

const renderPaths = (paths: PathInfo[], key: string) =>
  paths.map((p, i) => (
    <path
      key={`${key}-${i}`}
      d={p.d}
      stroke={p.stroke === "none" ? "none" : p.stroke}
      strokeWidth={p.strokeWidth}
      fill={p.fill ?? "none"}
      strokeLinecap="round"
    />
  ));

type RectProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  stroke?: string;
  seed: number;
  strokeWidth?: number;
  roughness?: number;
};

export const RoughRect: React.FC<RectProps> = ({
  x,
  y,
  w,
  h,
  fill,
  stroke = INK,
  seed,
  strokeWidth = 2.4,
  roughness = 1.4,
}) => {
  const boil = useBoilSeed(seed);
  const paths = useMemo(() => {
    const drawable = generator.rectangle(x, y, w, h, {
      seed: boil,
      roughness,
      bowing: 1.2,
      stroke,
      strokeWidth,
      fill: fill ?? undefined,
      fillStyle: "solid",
    });
    return generator.toPaths(drawable) as PathInfo[];
  }, [x, y, w, h, fill, stroke, boil, strokeWidth, roughness]);
  return <>{renderPaths(paths, `r${seed}`)}</>;
};

type CircleProps = {
  cx: number;
  cy: number;
  r: number;
  fill?: string;
  stroke?: string;
  seed: number;
  strokeWidth?: number;
};

export const RoughCircle: React.FC<CircleProps> = ({
  cx,
  cy,
  r,
  fill,
  stroke = INK,
  seed,
  strokeWidth = 2.4,
}) => {
  const boil = useBoilSeed(seed);
  const paths = useMemo(() => {
    const drawable = generator.circle(cx, cy, r * 2, {
      seed: boil,
      roughness: 1.2,
      stroke,
      strokeWidth,
      fill: fill ?? undefined,
      fillStyle: "solid",
    });
    return generator.toPaths(drawable) as PathInfo[];
  }, [cx, cy, r, fill, stroke, boil, strokeWidth]);
  return <>{renderPaths(paths, `c${seed}`)}</>;
};

type PathProps = {
  d: string;
  stroke?: string;
  seed: number;
  strokeWidth?: number;
  dashed?: boolean;
};

export const RoughPath: React.FC<PathProps> = ({
  d,
  stroke = INK,
  seed,
  strokeWidth = 2,
  dashed = false,
}) => {
  const boil = useBoilSeed(seed);
  const paths = useMemo(() => {
    const drawable = generator.path(d, {
      seed: boil,
      roughness: 1,
      bowing: 1,
      stroke,
      strokeWidth,
      strokeLineDash: dashed ? [7, 7] : undefined,
    });
    return generator.toPaths(drawable) as PathInfo[];
  }, [d, stroke, boil, strokeWidth, dashed]);
  return (
    <>
      {paths.map((p, i) => (
        <path
          key={`p${seed}-${i}`}
          d={p.d}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashed ? "7 7" : undefined}
        />
      ))}
    </>
  );
};

// Small hand-drawn arrowhead (a "V") pointing along angle (radians).
export const ArrowHead: React.FC<{
  x: number;
  y: number;
  angle: number;
  color?: string;
  size?: number;
}> = ({ x, y, angle, color = INK, size = 12 }) => {
  const a1 = angle + Math.PI * 0.82;
  const a2 = angle - Math.PI * 0.82;
  const d = `M ${x + Math.cos(a1) * size} ${y + Math.sin(a1) * size} L ${x} ${y} L ${
    x + Math.cos(a2) * size
  } ${y + Math.sin(a2) * size}`;
  return (
    <path d={d} stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
  );
};

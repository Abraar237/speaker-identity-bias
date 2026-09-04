// Flat clean-chart helpers for the voice-project concept cards.
// Style reference: professional animated chart card — white card, flat bars,
// thin gridlines, monospace values, sans labels, replay pill. No rough.js.
import React from "react";
import { useCurrentFrame } from "remotion";

export const PAGE = "#faf9f5";
export const CARD = "#ffffff";
export const INK = "#16130d";
export const INK2 = "#3a352b";
export const MUTED = "#6d665a";
export const FAINT = "#a49c8c";
export const GRID = "#e9e5dc";
export const SLATE = "#155e8c";
export const HOT = "#b3006b";
export const SHELF = "#c0641a";
export const GOOD = "#1c7a55";
export const GREY = "#a49c8c";

export const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
export const MONO = "'SF Mono', Menlo, 'Courier New', monospace";

// One rise, long hold, gentle fade to restart.
// rise 0..0.25 (smoothstep), hold 0.25..0.95 (70% of loop at final value),
// fade 0.95..1 (opacity ramp handled via fadeAlpha).
export const growth = (frame: number, dur = 240): number => {
  const t = frame / dur;
  if (t < 0.25) {
    const u = t / 0.25;
    return u * u * (3 - 2 * u);
  }
  return 1;
};
export const fadeAlpha = (frame: number, dur = 240): number => {
  const t = frame / dur;
  if (t < 0.95) return 1;
  const u = (t - 0.95) / 0.05;
  return 1 - u * u * (3 - 2 * u);
};

export const T: React.FC<{
  x: number; y: number; size: number; color: string; w?: number;
  align?: "left" | "center" | "right"; font?: string; weight?: number;
  spacing?: string; children: React.ReactNode; opacity?: number;
}> = ({ x, y, size, color, w = 700, align = "left", font = SANS,
       weight = 500, spacing = "0.1px", children, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w,
    fontFamily: font, fontSize: size, fontWeight: weight, color,
    textAlign: align, lineHeight: 1.25, letterSpacing: spacing, opacity }}>
    {children}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 28, top: 28, width: 1024,
    height: 1024, background: CARD, borderRadius: 22,
    border: `1px solid ${GRID}`,
    boxShadow: "0 2px 14px rgba(22,19,13,0.05)" }}>
    {children}
  </div>
);

export const ReplayPill: React.FC = () => (
  <div style={{ position: "absolute", right: 34, top: 30,
    border: `1.5px solid ${GRID}`, borderRadius: 999,
    padding: "8px 22px", fontFamily: SANS, fontSize: 20,
    color: MUTED, background: "#fdfcfa" }}>
    replay
  </div>
);

export const Swatch: React.FC<{ x: number; y: number; color: string; label: string; w?: number }>
  = ({ x, y, color, label, w = 400 }) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex",
    alignItems: "center", gap: 10, width: w }}>
    <div style={{ width: 26, height: 9, borderRadius: 5, background: color }} />
    <div style={{ fontFamily: SANS, fontSize: 21, color: INK2 }}>{label}</div>
  </div>
);

// signed monospace value, minus sign U+2212
export const fmt = (v: number, dp = 1): string => {
  const s = Math.abs(v).toFixed(dp);
  if (v > 0) return `+${s}`;
  if (v < 0) return `−${s}`;
  return `${(0).toFixed(dp)}`;
};

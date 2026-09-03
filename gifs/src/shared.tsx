import React from "react";
import { continueRender, delayRender, staticFile } from "remotion";

// House palette for the concept cards: light warm canvas, dark ink,
// pastel accents. Kept separate from lib/theme.ts (the kvsquare palette)
// so the copied library files stay untouched.
export const PAPER = "#f6f4ef";
export const CARD = "#fffdf8";
export const INK = "#1b1810";
export const MUTED = "#6f675a";

export const SLATE = "#155e8c";
export const SLATE_SOFT = "#dcE9f3";
export const MAGENTA = "#b3006b";
export const MAGENTA_SOFT = "#f4dcea";
export const WARM = "#c0641a";
export const WARM_SOFT = "#f6e4d1";

export const VIRGIL = "Virgil, 'Comic Sans MS', cursive";
// Virgil has no Devanagari glyphs; Hindi text uses a real Devanagari face.
export const DEVA = "'Tiro Devanagari Hindi', 'Devanagari MT', serif";

let loaded = false;
export const loadGifFonts = (): void => {
  if (loaded || typeof document === "undefined") {
    return;
  }
  loaded = true;
  const handle = delayRender("Loading gif fonts");
  const virgil = new FontFace("Virgil", `url(${staticFile("fonts/Virgil.woff2")})`);
  const tiro = new FontFace(
    "Tiro Devanagari Hindi",
    `url(${staticFile("fonts/TiroDevanagariHindi.woff2")})`
  );
  Promise.all([virgil.load(), tiro.load()])
    .then((fonts) => {
      fonts.forEach((f) => document.fonts.add(f));
      continueRender(handle);
    })
    .catch((err) => {
      console.error("gif fonts failed to load", err);
      continueRender(handle);
    });
};

export const Txt: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  w?: number;
  align?: "left" | "center" | "right";
  font?: string;
  lineHeight?: number;
  children: React.ReactNode;
}> = ({ x, y, size, color, w = 600, align = "left", font = VIRGIL, lineHeight = 1.25, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      fontFamily: font,
      fontSize: size,
      color,
      textAlign: align,
      lineHeight,
    }}
  >
    {children}
  </div>
);

// Meter fill cycle that loops seamlessly: rises 0 to 1, holds full, then
// drains fast so the value at the last frame of the cycle is back near 0
// (frame 0 and frame 239 of the composition look the same).
// riseEnd/holdEnd are fractions of the period.
export const fillCycle = (
  frame: number,
  period: number,
  riseEnd = 0.7,
  holdEnd = 0.88
): number => {
  const t = (frame % period) / period;
  if (t < riseEnd) {
    const u = t / riseEnd;
    return u * u * (3 - 2 * u); // smoothstep rise
  }
  if (t < holdEnd) {
    return 1;
  }
  const u = (t - holdEnd) / (1 - holdEnd);
  return 1 - u * u * (3 - 2 * u); // smooth drain back to 0
};

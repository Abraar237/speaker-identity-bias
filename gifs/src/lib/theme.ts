export const FPS = 30;
export const DUR = 240; // 8s seamless loop
export const W = 1080;
export const H = 1080;

export const INK = "#20242c";
export const PAPER = "#fdfcf7";
export const MUTED = "#6b7280";

export const ORANGE = "#e2571b";
export const ORANGE_SOFT = "#ffe8d6";
export const ORANGE_PANEL = "#fff7ee";

export const GREEN = "#0d8a63";
export const GREEN_SOFT = "#cdeede";
export const GREEN_PANEL = "#f0faf4";

export const BLUE = "#2456c4";
export const BLUE_SOFT = "#dbe7ff";

export const VIRGIL = "Virgil, 'Comic Sans MS', cursive";

export type Palette = {
  ink: string;
  paper: string;
  muted: string;
  orange: string;
  orangeSoft: string;
  orangePanel: string;
  green: string;
  greenSoft: string;
  greenPanel: string;
  blue: string;
  blueSoft: string;
  hotText: string;
  glow: boolean;
  panel: string;
  font: string;
};

export const COLOR_PALETTE: Palette = {
  ink: INK,
  paper: PAPER,
  muted: MUTED,
  orange: ORANGE,
  orangeSoft: ORANGE_SOFT,
  orangePanel: ORANGE_PANEL,
  green: GREEN,
  greenSoft: GREEN_SOFT,
  greenPanel: GREEN_PANEL,
  blue: BLUE,
  blueSoft: BLUE_SOFT,
  hotText: "#ffffff",
  glow: true,
  panel: "#ffffff",
  font: VIRGIL,
};

// Black canvas, bright neon accents, glows on.
export const DARK_PALETTE: Palette = {
  ink: "#f5f7fa",
  paper: "#000000",
  muted: "#9aa4b2",
  orange: "#ff8c3a",
  orangeSoft: "#45220c",
  orangePanel: "#170d05",
  green: "#2ee6a8",
  greenSoft: "#0d3d2c",
  greenPanel: "#061a13",
  blue: "#6b96ff",
  blueSoft: "#131f3a",
  hotText: "#000000",
  glow: true,
  panel: "#0c0f15",
  font: VIRGIL,
};

// Strict two-color variant: black paper, white ink, no soft glows.
export const BW_PALETTE: Palette = {
  ink: "#ffffff",
  paper: "#000000",
  muted: "#ffffff",
  orange: "#ffffff",
  orangeSoft: "#000000",
  orangePanel: "#000000",
  green: "#ffffff",
  greenSoft: "#000000",
  greenPanel: "#000000",
  blue: "#ffffff",
  blueSoft: "#000000",
  hotText: "#000000",
  glow: false,
  panel: "#000000",
  font: VIRGIL,
};

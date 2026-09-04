import {FPS} from "./theme";
import a1 from "./seg1.align.json";
import a2 from "./seg2.align.json";
import a3 from "./seg3.align.json";
import a4 from "./seg4.align.json";
import a5 from "./seg5.align.json";
import a6 from "./seg6.align.json";
import a7 from "./seg7.align.json";
import a8 from "./seg8.align.json";
import a9 from "./seg9.align.json";
import a10 from "./seg10.align.json";
import a11 from "./seg11.align.json";
import a12 from "./seg12.align.json";

// measured durations of seg1..seg12 wavs (loudnormed, 44.1k)
const DUR = [9.66, 13.56, 20.06, 14.26, 16.49, 25.36, 31.07, 20.57, 22.29, 23.73, 25.03, 28.00];
const LEAD = 1.4; // opening breath before seg1
const GAP = 1.3; // gap between scenes; cuts land here
const TAIL = 3.6; // end-card hold

export const ALIGNS = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12] as {
  words: {word: string; start: number; end: number}[];
}[];

export type Seg = {start: number; frames: number; audioStart: number; dur: number};

export const SEGS: Seg[] = (() => {
  const out: Seg[] = [];
  for (let i = 0; i < DUR.length; i++) {
    const scene = DUR[i] + GAP;
    out.push({
      start: 0,
      frames: Math.round((scene + (i === 0 ? LEAD : 0) + (i === 11 ? TAIL : 0)) * FPS),
      audioStart: i === 0 ? Math.round(LEAD * FPS) : 0,
      dur: DUR[i],
    });
  }
  let acc = 0;
  for (let i = 0; i < out.length; i++) {
    out[i].start = acc;
    acc += out[i].frames;
  }
  return out;
})();

export const TOTAL_FRAMES = SEGS[11].start + SEGS[11].frames;

export const NARRATION_WINDOWS = SEGS.map((s) => [
  s.start + s.audioStart,
  s.start + s.audioStart + Math.round(s.dur * FPS),
]);

export const wordTime = (segIdx: number, needle: string, nth = 1): number => {
  const words = ALIGNS[segIdx].words;
  let count = 0;
  for (const w of words) {
    if (w.word.toLowerCase().replace(/[^a-z0-9.]/g, "").includes(needle.toLowerCase())) {
      count++;
      if (count === nth) return w.start;
    }
  }
  return 0;
};

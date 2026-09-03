import React from "react";
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from "remotion";
import {SEGS, NARRATION_WINDOWS, TOTAL_FRAMES} from "./timeline";
import {S1Hook} from "./scenes/S1Hook";
import {S2EightVoices} from "./scenes/S2EightVoices";
import {S3Verdict} from "./scenes/S3Verdict";
import {S4TwoJudges} from "./scenes/S4TwoJudges";
import {S5Decomp} from "./scenes/S5Decomp";
import {S6Honest} from "./scenes/S6Honest";
import {S7End} from "./scenes/S7End";

const musicVolume = (frame: number): number => {
  let v = 0.3;
  for (const [a, b] of NARRATION_WINDOWS) {
    if (frame > a - 25 && frame < b + 15) {
      v = 0.1;
      break;
    }
  }
  const fadeIn = interpolate(frame, [0, 90], [0, 1], {extrapolateRight: "clamp"});
  const fadeOut = interpolate(frame, [TOTAL_FRAMES - 160, TOTAL_FRAMES - 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return v * fadeIn * fadeOut;
};

const SCENES = [S1Hook, S2EightVoices, S3Verdict, S4TwoJudges, S5Decomp, S6Honest, S7End];

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/music_bed.mp3")} volume={musicVolume(frame) as unknown as number} />
      {SEGS.map((seg, i) => {
        const Scene = SCENES[i] as React.FC<{audioStart: number; durSec?: number}>;
        return (
          <Sequence key={i} from={seg.start} durationInFrames={seg.frames}>
            <Scene audioStart={seg.audioStart} durSec={seg.dur} />
            <Sequence from={seg.audioStart}>
              <Audio src={staticFile(`audio/seg${i + 1}.wav`)} />
            </Sequence>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

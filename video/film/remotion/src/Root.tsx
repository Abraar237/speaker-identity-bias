import React from "react";
import {Composition} from "remotion";
import {Film} from "./film/Film";
import {TOTAL_FRAMES} from "./film/timeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="film" component={Film} durationInFrames={TOTAL_FRAMES}
      fps={60} width={1920} height={1080} />
  </>
);

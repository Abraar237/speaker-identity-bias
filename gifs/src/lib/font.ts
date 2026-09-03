import { continueRender, delayRender, staticFile } from "remotion";

let loaded = false;

export const loadVirgil = (): void => {
  if (loaded || typeof document === "undefined") {
    return;
  }
  loaded = true;
  const handle = delayRender("Loading Virgil font");
  const font = new FontFace("Virgil", `url(${staticFile("fonts/Virgil.woff2")})`);
  font
    .load()
    .then((f) => {
      document.fonts.add(f);
      continueRender(handle);
    })
    .catch((err) => {
      // Fail the render loudly rather than silently falling back to a wrong font.
      console.error("Virgil failed to load", err);
      continueRender(handle);
    });
};

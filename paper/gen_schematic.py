#!/usr/bin/env python3
"""Generate the Figure 1 pipeline schematic with Nano Banana 2 (gemini-3.1-flash-image).

The image is a schematic, not data. Every string in it is fixed in the prompt below and must be
checked by eye after each generation, because image models can misspell.

    python3 paper/gen_schematic.py [out.png] [model]

Reads GEMINI_API_KEY from the environment, else from the project .env.
"""
import base64, json, os, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "paper", "aaai", "assets", "fig1_schematic.png")
MODEL = sys.argv[2] if len(sys.argv) > 2 else "gemini-3.1-flash-image"

PROMPT = """Create a clean scientific diagram for an academic research paper. Flat vector style, pure white background, thin dark-gray outlines, soft pastel fills, a clear sans-serif typeface, generous spacing. No shadows, no gradients, no 3D, no people, no faces, no decoration, no title, no watermark. Portrait layout, four sections stacked top to bottom, joined by three short thick downward arrows.

SECTION 1. Small heading: "1. Same answer, fixed words". Below it one wide rounded card, light gray fill, with a small document icon on its left. Text in the card on two lines: "24 interview answers" and "text frozen before any audio".

SECTION 2. Small heading: "2. Change only the voice". Below it three rounded cards side by side, each with a tiny waveform icon. Each card has a bold title and one small line under it:
left card, light blue fill: "TTS, one voice" and "4 accents x 2 genders";
middle card, light purple fill: "TTS, six more voices" and "same items, same accents";
right card, light orange fill: "Real speech" and "L2-ARCTIC, 6 first languages".

SECTION 3. Small heading: "3. Three audio judges score it". Below it three small chip icons in one row with labels underneath: "Gemini 3.1 Pro", "Gemini 3.6 Flash", "Qwen2-Audio-7B". Under them two small pill-shaped tags side by side: "grade the audio" and "grade the transcript".

SECTION 4. Small heading: "4. What holds up". Below it three rounded result boxes side by side. Left box, light gray fill, two lines: "One voice" and "Indian -2.5". Middle box, light green fill, two lines: "Six more voices" and "effect gone". Right box, light red fill, two lines: "Real speech" and "-4 to -16 points".

At the very bottom, one line of larger bold text: "One voice per accent is not enough to measure bias."

Spell every quoted string exactly as written, including numbers and minus signs. All text must be large and easy to read when the image is printed 8 centimetres wide. Do not add any other words, numbers or labels."""


def main():
    key = os.environ.get("GEMINI_API_KEY")
    if not key and os.path.exists(os.path.join(ROOT, ".env")):
        for line in open(os.path.join(ROOT, ".env")):
            if line.startswith("GEMINI_API_KEY="):
                key = line.split("=", 1)[1].strip()
    if not key:
        sys.exit("GEMINI_API_KEY not set")
    body = {"contents": [{"parts": [{"text": PROMPT}]}],
            "generationConfig": {"responseModalities": ["IMAGE"],
                                 "imageConfig": {"aspectRatio": "3:4", "imageSize": "2K"}}}
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key}",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=300))
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read()[:400].decode('utf-8', 'replace')}")
    for part in r["candidates"][0]["content"]["parts"]:
        if "inlineData" in part:
            open(OUT, "wb").write(base64.b64decode(part["inlineData"]["data"]))
            print("wrote", OUT, part["inlineData"].get("mimeType"))
            return
    sys.exit("no image in response: " + json.dumps(r)[:400])


if __name__ == "__main__":
    main()

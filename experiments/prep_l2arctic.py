"""Axis A-prime prep: select 8 sentence IDs present in ALL 24 L2 speakers and
all 6 native voices, extract, resample to 16 kHz mono, loudnorm exactly like
the study's other clips. Writes clips/l2arctic/{speaker}_{L1}_{gender}_{sid}.wav
and experiments/l2arctic/SELECTION.md.
"""
import pathlib, subprocess, sys, zipfile

HERE = pathlib.Path(__file__).parent
RAW = HERE / "l2arctic" / "raw"
NAT = RAW / "natives"
OUT = HERE / "clips" / "l2arctic"
OUT.mkdir(parents=True, exist_ok=True)

# Speaker -> (L1, gender), from the corpus README (v5.0, 24 speakers)
L2 = {
    "ABA": ("arabic", "m"), "SKA": ("arabic", "f"), "YBAA": ("arabic", "m"), "ZHAA": ("arabic", "f"),
    "BWC": ("mandarin", "m"), "LXC": ("mandarin", "f"), "NCC": ("mandarin", "f"), "TXHC": ("mandarin", "m"),
    "ASI": ("hindi", "m"), "RRBI": ("hindi", "m"), "SVBI": ("hindi", "f"), "TNI": ("hindi", "f"),
    "HJK": ("korean", "f"), "HKK": ("korean", "m"), "YDCK": ("korean", "f"), "YKWK": ("korean", "m"),
    "EBVS": ("spanish", "m"), "ERMS": ("spanish", "m"), "MBMPS": ("spanish", "f"), "NJS": ("spanish", "f"),
    "HQTV": ("vietnamese", "m"), "PNV": ("vietnamese", "f"), "THV": ("vietnamese", "f"), "TLV": ("vietnamese", "m"),
}
NATIVES = {"bdl": "m", "rms": "m", "jmk": "m", "awb": "m", "slt": "f", "clb": "f"}


def loudnorm(src, dst):
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(src), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
         "-ar", "16000", "-ac", "1", str(dst)],
        check=True, capture_output=True)


def main():
    ext = RAW / "extracted"
    ext.mkdir(exist_ok=True)

    # per-speaker zips inside the big pack were already extracted by the driver
    # into RAW/extracted/<SPK>/wav/. Verify presence.
    coverage = {}
    for spk in L2:
        wavdir = ext / spk / "wav"
        if not wavdir.is_dir():
            sys.exit(f"missing wav dir for {spk}: {wavdir}")
        coverage[spk] = {p.stem for p in wavdir.glob("arctic_*.wav")}
    for spk in NATIVES:
        wavdir = NAT / f"cmu_us_{spk}_arctic" / "wav"
        coverage[spk] = {p.stem for p in wavdir.glob("arctic_*.wav")}

    common = set.intersection(*coverage.values())
    chosen = sorted(common)[:8]
    if len(chosen) < 8:
        sys.exit(f"only {len(chosen)} common sentence IDs found")

    lines = ["# Axis A-prime selection", "",
             f"8 sentence IDs present in all 30 voices (of {len(common)} common): "
             + ", ".join(chosen), "",
             "| speaker | L1 | gender | wavs present |", "|---|---|---|---|"]
    for spk, (l1, g) in sorted(L2.items()):
        lines.append(f"| {spk} | {l1} | {g} | {len(coverage[spk])} |")
    for spk, g in sorted(NATIVES.items()):
        lines.append(f"| {spk} | eng | {g} | {len(coverage[spk])} |")
    (HERE / "l2arctic" / "SELECTION.md").write_text("\n".join(lines) + "\n")

    n = 0
    for spk, (l1, g) in L2.items():
        for sid in chosen:
            dst = OUT / f"{spk}_{l1}_{g}_{sid}.wav"
            if not dst.exists():
                loudnorm(ext / spk / "wav" / f"{sid}.wav", dst)
            n += 1
    for spk, g in NATIVES.items():
        for sid in chosen:
            dst = OUT / f"{spk}_eng_{g}_{sid}.wav"
            if not dst.exists():
                loudnorm(NAT / f"cmu_us_{spk}_arctic" / "wav" / f"{sid}.wav", dst)
            n += 1
    print(f"prepped {n} clips -> {OUT}")
    print("chosen:", ", ".join(chosen))


if __name__ == "__main__":
    main()

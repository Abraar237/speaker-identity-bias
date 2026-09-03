"""QA the rendered film: duration, stream sanity, integrated loudness, black
frames at seam times, and -14 LUFS remaster if needed."""
import json, pathlib, re, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent
FINAL = HERE.parent / "final.mp4"


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "quiet", "-print_format", "json",
                          "-show_format", "-show_streams", str(path)],
                         capture_output=True, text=True).stdout
    return json.loads(out)


def loudness(path):
    r = subprocess.run(["ffmpeg", "-i", str(path), "-af",
                        "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True)
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S)
    return json.loads(m.group(0)) if m else None


p = probe(FINAL)
dur = float(p["format"]["duration"])
streams = {s["codec_type"]: s for s in p["streams"]}
print(f"duration: {dur:.2f}s | video: {streams['video']['width']}x{streams['video']['height']} "
      f"@{eval(streams['video']['avg_frame_rate']):.0f}fps | audio: {streams['audio']['codec_name']}")

ln = loudness(FINAL)
print(f"integrated loudness: {ln['input_i']} LUFS (TP {ln['input_tp']})")
li = float(ln["input_i"])
if abs(li + 14) > 1.0:
    print("remastering to -14 LUFS...")
    tmp = HERE.parent / "final_-14.mp4"
    subprocess.run(["ffmpeg", "-y", "-i", str(FINAL), "-c:v", "copy", "-af",
                    f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={ln['input_i']}:"
                    f"measured_TP={ln['input_tp']}:measured_LRA={ln['input_lra']}:"
                    f"measured_thresh={ln['input_thresh']}:offset={ln['target_offset']}:linear=true",
                    "-c:a", "aac", "-b:a", "256k", str(tmp)], check=True, capture_output=True)
    tmp.replace(FINAL)
    ln2 = loudness(FINAL)
    print(f"after remaster: {ln2['input_i']} LUFS")

# black-frame check across the whole film
r = subprocess.run(["ffmpeg", "-i", str(FINAL), "-vf", "blackdetect=d=0.3:pix_th=0.10",
                    "-an", "-f", "null", "-"], capture_output=True, text=True)
blacks = re.findall(r"black_start:(\S+) black_end:(\S+)", r.stderr)
print("black periods >=0.3s:", blacks if blacks else "none")
print("QA done")

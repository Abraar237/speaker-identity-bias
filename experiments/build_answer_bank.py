#!/usr/bin/env python3
"""CP3 step 1: build the frozen 24-item answer bank.

Authors once via a frozen text model, then writes answer_bank.json and NEVER
regenerates it if that file already exists (content must be identical across every
condition by construction). Medium quality tier only (target score band 40-75, per
the script-bias lesson on range restriction).
"""

import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from cost_tracker import log_cost, check_budget  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(__file__).resolve().parent / "answer_bank.json"

KEY = next(
    line.split("=", 1)[1].strip()
    for line in (ROOT / ".env").read_text().splitlines()
    if line.startswith("GEMINI_API_KEY=")
)

MODEL = "gemini-3.5-flash"

DOMAINS = [
    "science", "history", "cooking", "health", "technology",
    "culture", "geography", "personal finance", "daily-life advice", "education",
]
# 24 items across 10 domains: 4 domains get 3 items, 6 domains get 2 items.
COUNTS = [3, 3, 3, 2, 3, 2, 2, 2, 2, 2]
assert sum(COUNTS) == 24

PROMPT_TMPL = """You are authoring test stimuli for a research study on evaluation
bias. Write {n} DISTINCT interview-style question-and-spoken-answer pairs in the
domain of "{domain}".

Each answer must be MEDIOCRE, not good. A strict grader scoring for correctness,
completeness, helpfulness, and clarity on a 0-100 scale should give each answer
somewhere between 40 and 65 points — noticeably worse than a solid answer, never a
complete or confident one. Achieve this by doing SEVERAL of the following in each
answer, not just one:
- Answer only PART of the question and ignore or brush past the rest
- Be vague and hand-wavy instead of concrete ("it's kind of complicated", "there's
  a bunch of factors", "I don't remember exactly")
- Include one clear gap, oversimplification, or minor inaccuracy
- Ramble slightly or lose the thread partway through
- End weakly without a real conclusion

Each answer must also be:
- 30 to 60 words, written as natural SPOKEN language (contractions OK, hedging
  words like "well," "I think," "kind of" are good, no bullet points, no markdown),
  first person where natural.
- Free of any accent-revealing spelling, regional slang, or culturally-specific
  content that would hint at who is speaking — the answer's WORDS must work equally
  naturally regardless of who says them.
- Self-contained: a reader needs no other context to grade it.

Return STRICT JSON: a list of {n} objects, each with keys "question" and "answer".
No other text, no markdown fences."""


def call(body):
    import urllib.request
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": KEY},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


def gen_domain(domain, n):
    body = {
        "contents": [{"parts": [{"text": PROMPT_TMPL.format(n=n, domain=domain)}]}],
        "generationConfig": {
            "temperature": 0.8, "responseMimeType": "application/json",
        },
    }
    resp = call(body)
    log_cost(MODEL, f"answerbank-{domain}", resp.get("usageMetadata", {}), phase="cp3-answerbank")
    txt = resp["candidates"][0]["content"]["parts"][0]["text"]
    items = json.loads(txt)
    assert len(items) == n, f"{domain}: expected {n}, got {len(items)}"
    for it in items:
        it["domain"] = domain
        wc = len(it["answer"].split())
        if not (25 <= wc <= 70):
            print(f"  WARNING: {domain} item word count {wc} outside 25-70", file=sys.stderr)
    return items


def main():
    if OUT.exists():
        print(f"{OUT} already exists — answer bank is frozen. Not regenerating.")
        data = json.loads(OUT.read_text())
        print(f"{len(data)} items loaded.")
        return

    all_items = []
    for domain, n in zip(DOMAINS, COUNTS):
        check_budget()
        print(f"generating {n} items for '{domain}'...")
        items = gen_domain(domain, n)
        all_items.extend(items)

    for i, it in enumerate(all_items):
        it["item_id"] = f"item{i:02d}"

    OUT.write_text(json.dumps(all_items, indent=2, ensure_ascii=False))
    print(f"\nWrote {len(all_items)} items to {OUT}")
    total = check_budget()
    print(f"Running spend: ${total:.4f}")


if __name__ == "__main__":
    main()

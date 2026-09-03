#!/usr/bin/env python3
"""One-off: calibrate the answer-bank prompt so generated answers actually land
in the 40-75 score band under the REAL judge + rubric, before regenerating all 24
items. Generates a few candidate answers with an aggressively-weakened prompt and
scores them with gemini-3.6-flash using the exact rubric judge_runner.py uses."""

import json
import pathlib
import sys
import urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from cost_tracker import log_cost, check_budget  # noqa: E402
from judge_runner import RUBRIC_NEUTRAL, SCORE_SCHEMA  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[1]
KEY = next(
    line.split("=", 1)[1].strip()
    for line in (ROOT / ".env").read_text().splitlines()
    if line.startswith("GEMINI_API_KEY=")
)

GEN_MODEL = "gemini-3.5-flash"
JUDGE_MODEL = "gemini-3.6-flash"

WEAK_PROMPT = """Write a spoken interview answer to this question: "{question}"

The answer must be MEDIOCRE, not good. A strict grader scoring for correctness,
completeness, helpfulness, and clarity on a 0-100 scale should give this answer
somewhere between 45 and 65 points — noticeably worse than a solid answer, not a
complete answer. Achieve this by doing SEVERAL of the following, not just one:
- Answer only PART of the question and ignore or brush past the rest
- Be vague and hand-wavy instead of concrete ("it's kind of complicated", "there's
  a bunch of factors", "I don't remember exactly")
- Include one clear gap, oversimplification, or minor inaccuracy
- Ramble slightly or lose the thread partway through
- End weakly without a real conclusion

30 to 60 words, natural spoken register (contractions OK, no bullet points),
first person where natural. No accent-revealing spelling or regional slang.

Return STRICT JSON: {{"answer": "..."}}. No other text, no markdown fences."""


def call(model, body):
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": KEY},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


def gen_weak_answer(question):
    body = {
        "contents": [{"parts": [{"text": WEAK_PROMPT.format(question=question)}]}],
        "generationConfig": {"temperature": 0.9, "responseMimeType": "application/json"},
    }
    resp = call(GEN_MODEL, body)
    log_cost(GEN_MODEL, "calibrate-gen", resp.get("usageMetadata", {}), phase="cp3-calibrate")
    return json.loads(resp["candidates"][0]["content"]["parts"][0]["text"])["answer"]


def judge_text(text):
    body = {
        "contents": [{"parts": [{"text": f"{RUBRIC_NEUTRAL}\n\n(This is a text transcript "
                                          f"of a spoken answer; grade the audio-equivalent "
                                          f"content.)\n\nAnswer: {text}"}]}],
        "generationConfig": {"temperature": 0, "responseMimeType": "application/json",
                              "responseSchema": SCORE_SCHEMA,
                              "thinkingConfig": {"thinkingLevel": "MINIMAL"}},
    }
    resp = call(JUDGE_MODEL, body)
    log_cost(JUDGE_MODEL, "calibrate-judge", resp.get("usageMetadata", {}), phase="cp3-calibrate")
    return json.loads(resp["candidates"][0]["content"]["parts"][0]["text"])


TEST_QUESTIONS = [
    "Can you explain how photosynthesis works in plants?",
    "What is the difference between mass and weight?",
    "What is your approach to designing a new unit of study for your students?",
    "How do you decide when to refinance a mortgage?",
    "What's a good way to keep a cast iron pan from rusting?",
]


def main():
    print("Generating + judging calibration candidates...\n")
    for q in TEST_QUESTIONS:
        check_budget()
        answer = gen_weak_answer(q)
        verdict = judge_text(answer)
        wc = len(answer.split())
        print(f"Q: {q}")
        print(f"A ({wc}w): {answer}")
        print(f"SCORE: {verdict.get('score')}  | reason: {verdict.get('reason')}\n")
    print(f"Spend so far: ${check_budget():.4f}")


if __name__ == "__main__":
    main()

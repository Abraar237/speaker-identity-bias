#!/usr/bin/env python3
"""Shared cost tracker for all experiment runners in this project.

Hard-stop budget set by user override on 2026-09-03: HARD_STOP_USD = 20.00
(tighter than MISSION.md's original $40 hard stop / $50 total cap).

Usage from a runner script:
    from cost_tracker import log_cost, check_budget
    ...
    resp = call(model, body)
    log_cost(model, "judge-<item_id>-<condition>", resp["usageMetadata"])
    check_budget()   # raises SystemExit if HARD_STOP_USD is exceeded
"""

import json
import pathlib
import time

ROOT = pathlib.Path(__file__).resolve().parent
COST_LOG = ROOT / "cost_log.jsonl"

HARD_STOP_USD = 20.00  # user override, 2026-09-03 (was $40 in MISSION.md)
TOTAL_CAP_USD = 50.00  # unchanged ceiling from MISSION.md

# $/1M tokens, conservative placeholders — pin exact rates at CP2 sign-off.
PRICE = {
    "gemini-3.1-flash-tts-preview": {"in": 0.50, "out": 10.00},
    "gemini-2.5-pro-preview-tts": {"in": 1.00, "out": 20.00},
    "gemini-3.6-flash": {"in": 0.50, "out": 3.00},
    "gemini-3.1-pro-preview": {"in": 2.00, "out": 12.00},
}


def _read_all():
    if not COST_LOG.exists():
        return []
    return [json.loads(l) for l in COST_LOG.read_text().splitlines() if l.strip()]


def total_spend():
    return sum(r["est_cost_usd"] for r in _read_all())


def log_cost(model, tag, usage, phase="unassigned"):
    tin = usage.get("promptTokenCount", 0)
    tout = usage.get("candidatesTokenCount", 0) + usage.get("thoughtsTokenCount", 0)
    p = PRICE.get(model, {"in": 1.0, "out": 5.0})
    cost = (tin * p["in"] + tout * p["out"]) / 1e6
    with COST_LOG.open("a") as f:
        f.write(json.dumps({
            "ts": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "phase": phase, "model": model, "tag": tag,
            "tokens_in": tin, "tokens_out": tout, "est_cost_usd": round(cost, 6),
        }) + "\n")
    return cost


def check_budget():
    spent = total_spend()
    if spent >= HARD_STOP_USD:
        raise SystemExit(
            f"HARD STOP: logged spend ${spent:.4f} >= cap ${HARD_STOP_USD:.2f}. "
            "Halting all further API calls. Review experiments/cost_log.jsonl."
        )
    return spent


if __name__ == "__main__":
    spent = total_spend()
    print(f"Total logged spend: ${spent:.4f} / hard-stop ${HARD_STOP_USD:.2f} "
          f"/ total cap ${TOTAL_CAP_USD:.2f}")

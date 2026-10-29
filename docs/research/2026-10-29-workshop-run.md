# 2026-10-29: legal-agent-workshop run outcomes

Date: 2026-10-29. Source: terminal session running the workshop end to end. Purpose: research data for measurable outcomes. Status: observed outcomes, in the workshop's folder only; no workshop code copied into umwayi-rm.

## What ran

Setup: venv plus openai SDK installed, 21 case documents seeded, preflight passed, Meta key confirmed for muse-spark-1.3 and sam-3.1. Session 1 used the finished solution loop. Session 2 used the finished checks.

## Outcomes

1. Session 1 run answered after 21 turns with 11 facts and an unverified memo.
2. Verification tests: 58 tests ran, OK with 11 skipped.
3. Memo check on the Session 1 run: FAILS. Memo rules passed; the claims check refused 5 findings for saying more than their quotes support (dates, speakers, and attributions the quotes do not contain).
4. Checklist check: FAILS at 67% coverage, with feedback naming missing kinds (attribution, authenticity) without revealing ground truth.
5. Branched run with verification on: the memo was refused twice by the checks, revised, then filed at turn 31 and PASSED the memo check. Checklist stayed 67% (accepted after 3 tries per the rules, score kept).
6. Attorney review: approved with the 67% noted. Run ended done.

## Transferable mechanics (for part 2 analysis, not yet adopted)

- Checks live inside the tools at forward-motion moments, so the model cannot skip them; umwayi-rm already does this for proposals.
- Two-layer memo review: deterministic consistency rules first, then one model call judging claim-vs-quote support. Umwayi-rm has the first layer only.
- Checklist coverage against hidden ground truth with leakage-free feedback. Umwayi-rm has no run-level completeness check.
- Refusal budgets with escalation to a person (3 tries, then accept-and-flag or stop). Umwayi-rm has the refusal budget but no handoff state.
- Attorney sign-off as a distinct recorded state after checks pass. Umwayi-rm approval exists but records no check trail on the proposal.

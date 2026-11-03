# docs/final-48h-packets.md: optional packets before submission

Written 2026-11-02 from a scan of main (c47883f). These are proposals for Miguel to accept or drop. Nothing here is a feature. Deadline: Nov 4, 16:00 EAT. Each packet follows the repo's template: goal, acceptance checks first, files, stages with gates, report-back.

## H-21: accept both spellings of the Baseten key (recommended, small)

Why: the code reads only `BASENTEN_API_KEY` (src/index.ts lines 27, 29, 43; src/adapters/baseten.ts; src/adapters/vision.ts; docker-compose.yml; README). A reviewer who sets `BASETEN_API_KEY` (the correct spelling) gets the fake model with no error. That is the first thing a judge with their own key would do.

Goal: either spelling works. The README documents the correct one.

Acceptance checks, written first:
1. A test where only `BASETEN_API_KEY` is set builds the live Baseten adapter, not the fake one.
2. A test where only `BASENTEN_API_KEY` is set still builds the live adapter.
3. A test where both are set prefers `BASETEN_API_KEY`.
4. A test where neither is set uses the fake adapter and the voice and photo routes answer `model_off`.
5. `docker-compose.yml` passes both variables. README quick start uses `BASETEN_API_KEY`, and says the old spelling still works.
6. Full suite passes. No key appears in any log or file.

Stages: 1 write the failing tests; 2 add one helper that reads the key; 3 replace the three direct reads; gate: typecheck and full suite. Report-back: what changed, what the checks show, what is not verified.

## H-22: bind the demo port to the loopback interface (optional)

Why: compose publishes `3000:3000` on every interface, and `app.listen(port)` binds all interfaces. A demo on a shared network exposes the demo reset route. It is a local demo, so risk is low.

Acceptance checks: `docker compose up -d --wait` serves `/health` at `http://localhost:3000`; `ss` or `docker port` shows `127.0.0.1:3000`; the fresh-clone proof in the README still works. Change: `"127.0.0.1:${API_PORT:-3000}:3000"` in the compose file.

Risk: a judge running Docker on a remote host reaches nothing. State the override in the README. Decide whether that is worth it before the deadline.

## H-23: add `docs/faq.md` (optional, docs only)

A draft is in this folder. Acceptance: every answer cites a file that exists, and every number matches the run files. Review the "How was it built?" answer yourself.

## Not before submission

Anything else from the notes of 27 Oct to 2 Nov: verification thresholds, mutation testing, the decision gate and the agent security rules. They go to `docs/plans/` in UMWAYI. The freeze is on.

## Still open on your side (from the repo's own queue)

H-01 credit confirmations saved; H-03 Discord question; H-14 and D-11 interviews (the submission text says 0); D-12 hours; H-16 video; H-17 submit. The model terms check (whether "Built with Muse Spark Open" is required) is still open because the licence file is gated; the console and Lab footers already display the phrase, so the risk is covered either way. The pitch text still carries the placeholder "[if the terms require this wording]" in its Open source line. Remove it or answer it before pasting.

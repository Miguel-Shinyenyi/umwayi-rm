# Umwayi-RM

An open-source follow-through agent for community skills-training programmes.

Built for the Meta Global AI Developer Hackathon (Indie Developer track, Build for Your World). Solo entry by Miguel Shinyenyi, Nairobi.

Status on 2026-10-26: planning only. No code exists yet. The first code commit will be dated Oct 27 or later.

## What it will do

Programme staff record a note or review their programme. An agent reads the records through tools, then proposes events, commitments and follow-up drafts, each citing the records behind it. Staff approve every change. Progress and queue order come from code, not from the model.

## What it will not do

Score or rank people by risk. Send messages. Replace staff judgement. Claim to be secure or compliant.

## Feature status

| Feature | Status |
|---|---|
| Core state: candidates, goals, commitments, events, progress | not built |
| Deterministic intervention queue | not built |
| MCP server and agent runs | not built |
| Proposal inbox and approval | not built |
| Voice note intake | not built |
| Eval suite and run traces | not built |
| Staff console and Lab | not built |
| Synthetic seed and reset | not built |

Words used here: built, tested, manual-verified, not verified. Nothing is "verified" without a check recorded in `docs/hackathon-log.md`.

## Models

Muse Spark Open (`meta-models/muse-spark-open-1026`) on Baseten. Meta Model API as fallback. Capabilities are checked on Day 1 and recorded in the log. A feature whose capability fails is cut.

## Prior work, named

- Design token values (colours, radii, type scale) from the author's own routine-machine project, copied as CSS variables.
- Method: a queue with acceptance checks, short start-of-task context, an archive with an index. From the author's UMWAYI hub.
- No code from other repositories.

Planning documents dated Oct 24 to 26 are in this repository. The originals of the first plan are in `docs/archive/2026-10-24-planning-v1/`.

## Quick start

Not available yet. This section is filled in on Day 7 and tested on a fresh clone.

## Documents

| File | What it is |
|---|---|
| `HACKATHON.md` | Plan v2: scope, schedule, definition of done |
| `docs/rules.md` | Official rules and how we meet them |
| `docs/agent-design.md` | The agent: tools, guardrails, evals, traces |
| `docs/api-contract.md` | Endpoints, errors, model adapter |
| `docs/design-decisions.md` | Visual and interaction decisions |
| `docs/demo-script.md` | The three minute video |
| `docs/pitch-deck.md` | Submission text |
| `docs/hackathon-log.md` | Dated decisions and evidence |
| `docs/research/` | Interviews and sourced claims |
| `queue.md` | Open work, one task at a time |
| `PROJECT.md` | Architecture and sequence |

## Known limitations

All data is synthetic. No programme has used it. Demand over spreadsheets is a hypothesis. Authentication is minimal. Data protection is not assessed. Model outputs are checked only on a small local set.

## Licence

MIT, pending confirmation (decision D-10 in `queue.md`).

# Umwayi-RM

An open-source secretary for savings groups. It turns voice notes and photos of a paper ledger into proposed entries, asks when it is unsure, and drafts gentle reminders. The treasurer approves everything.

Built for the Meta Global AI Developer Hackathon (Indie Developer track, Build for Your World). Solo entry by Miguel Shinyenyi, Nairobi. Built on Muse Spark Open.

Status on 2026-10-27: planning only. No code exists yet. The first code commit will be dated Oct 27 or later.

## What it will do

A treasurer speaks a note or photographs a ledger page. An agent reads it into proposals, each quoting the words behind it, and asks a question when a note is ambiguous (for example, two members with the same name). Code keeps the ledger, computes balances and overdue contributions, and compares a paper page with stored entries. The treasurer approves, edits or rejects. Nothing is sent and no money moves.

## What it will not do

Move money. Advise on lending or investments. Score, rate or rank members. Send messages. Replace the treasurer's judgement. Claim to be secure or compliant.

## What is tested

Whether a short curated set of rules (an identity, rules written from past mistakes, an understand-first step) makes the agent ask instead of guess, and whether a short core with a verbatim, traceable archive handles old records better than truncation. The protocol is in `docs/experiments.md`, written before any run. Effects are expected to be small, and a null result will be reported.

## Feature status

| Feature | Status |
|---|---|
| Ledger core: groups, members, commitments, append-only entries | not built |
| Deterministic "Today" list | not built |
| MCP server and agent runs | not built |
| Proposals inbox and approval | not built |
| Voice note intake | not built |
| Photo reading and reconciliation | not built |
| Reminder drafts (copy only) | not built |
| Eval suite, run traces, Lab | not built |
| Synthetic seed and reset | not built |

Words used here: built, tested, manual-verified, not verified. Nothing is "verified" without a check recorded in `docs/hackathon-log.md`.

## Models

Muse Spark Open (`meta-models/muse-spark-open-1026`) on Baseten. Meta Model API as fallback. Capabilities (tool calling, audio, image, handwriting, Swahili) are checked on Day 1 and recorded in the log. A feature whose capability fails is cut. Built with Muse Spark Open; the exact display wording is checked against the model terms.

## Prior work, named

- Concepts from the author's routine-machine project: commitments, evidence tiers, statement matching from its savings feature, deterministic progress. Rebuilt from scratch; no code copied.
- Design token values (colours, radii, type scale) from routine-machine, copied as CSS variables.
- Method from the author's UMWAYI hub: a queue with acceptance checks, short start-of-task context, an archive with an index and checksums.
- Existing tools in this space include Chamasoft, M-Chama and Fundi Chama. This project does not claim to be the first.
- No code from other repositories.

Planning documents dated Oct 24 to 27 are in this repository. Earlier plans are in `docs/archive/`.

## Quick start

Not available yet. This section is filled in on Day 7 and tested on a fresh clone.

## Documents

| File | What it is |
|---|---|
| `HACKATHON.md` | Plan v3: scope, schedule, definition of done |
| `docs/rules.md` | Official rules and how we meet them |
| `docs/agent-design.md` | The agent: tools, restraint rules, memory, guardrails |
| `docs/experiments.md` | The test protocol, hypotheses and decision rules |
| `docs/api-contract.md` | Records, endpoints, guarantees |
| `docs/design-decisions.md` | Visual and interaction decisions |
| `docs/demo-script.md` | The three minute video |
| `docs/pitch-deck.md` | Submission text |
| `docs/hackathon-log.md` | Dated decisions and evidence |
| `docs/research/` | Landscape notes and interviews, with sources |
| `queue.md` | Open work, one task at a time |
| `PROJECT.md` | Architecture and sequence |

## Known limitations

All data is synthetic. No group has used it. Demand over notebooks and existing apps is a hypothesis. Authentication is minimal. Data protection is not assessed. Model outputs are checked only on a small local set.

## Dependencies

Runtime: express (MIT), pg (MIT). Dev: typescript (Apache-2.0), vitest (MIT), tsx (MIT), @types/express, @types/node, @types/pg.

## Licence

MIT.

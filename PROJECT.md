# PROJECT.md: sequencing and architecture (v3)

Read after `HACKATHON.md`. Nothing here is built until the log says so.

## 1. What this is and is not

Is: an open-source secretary for savings groups, with a deterministic ledger, an agent that only proposes, and a measured restraint layer.
Is not: a payments app, a lender, a credit scorer, a chat tutor, a general agent framework, or a product launch.

Lineage: Routine Machine began as personal follow-through, with a savings feature fed by M-Pesa statements. Umwayi-RM rebuilds the concepts (commitments, evidence tiers, statement matching) for a group, from scratch. Rule inherited: state stays deterministic and intelligence must be justified by data.

## 2. Architecture

```
Console (Next.js) ----HTTP----> API service (TypeScript)
                                  |-- ledger: groups, members, commitments,
                                  |           append-only entries, evidence tiers
                                  |-- today (deterministic), reconciliation
                                  |-- proposals + idempotent approval
                                  |-- agent runner (loop, guardrails, traces)
                                  |-- pack: identity + rules (curated)
                                  |-- archive: verbatim items, checksums, gists
                                  |-- MCP server (same process)
                                  |-- lab: runs, evals
                                  v
                              Postgres          Model: Muse Spark Open on Baseten
                                                Fallback: Meta Model API
```

- Modular monolith. One deploy unit, Docker Compose locally.
- Postgres is the system of record. Entries and proposals are append only.
- The model sits behind one adapter. Switching it off leaves "Today" and balances working.
- Stack is a proposal (decision D-9): TypeScript service.

## 3. Data model

groups, members, commitments, entries, proposals (with quotes), runs (with ordered steps and model id), findings, archive_items (verbatim, sha256, gist), eval_runs, treasurer tokens. Every table has `created_at`; demo rows have `demo = true`. Details: `docs/api-contract.md`.

## 4. Sequence

Follows the day table in `HACKATHON.md` section 9. Order of build: contract and protocol, ledger, "Today", MCP and agent, voice, photo, evals and the H1 run, console and Lab, seed, video.

Rules for sequence:
- The experiment protocol is committed and the test split frozen before the first counted run.
- Ledger and fallback before any model feature.
- H1 before H2. H2 before H3.
- A feature not shown in the video and not tested is cut.

## 5. Rejected, and why

| Idea | Why not |
|---|---|
| Brain harness alone (identity, rules, archive, no product) | No user, weak demo, and the reassurance framing risks the mental-health-advice anti-project |
| Training programme follow-up agent (plan v2) | Closer to "AI for Education"; no first-hand link; archived |
| Employer retention risk (plan v1) | Near the "job application screener" and "personality analyzer" classes; profiles people |
| Lending or credit decisions for groups | Financial advice, member scoring, and harm if wrong |
| Sending SMS or WhatsApp reminders | Auto-sending is out; drafts are copy only |
| Chat interface | Anti-project class; not the product |
| Vector search as the main feature | "Basic RAG" class; the ledger is structured. The archive recall is a tool, measured in H2 |
| Multi-agent orchestration | No measured need |
| Copying Routine Machine code | New work only |
| Real M-Pesa statements | Real personal data; synthetic statements only |

## 6. Records

`docs/hackathon-log.md` for decisions and evidence. `docs/experiments.md` for the protocol, `docs/evals/` for run output. `queue.md` for tasks. History in `docs/archive/`, with `docs/archive/INDEX.md`.

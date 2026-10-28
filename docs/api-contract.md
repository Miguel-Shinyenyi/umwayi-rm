# docs/api-contract.md: HTTP and MCP contract (plan v3, draft)

Draft. Changes need a line in `docs/design-decisions.md`. All records are synthetic and labelled demo.

Conventions: JSON, UTC timestamps, ids are opaque strings, money is integer KES (no decimals in the demo), errors are `{ "error": { "code", "message" } }`. Writes that matter take an `Idempotency-Key` header.

## Records

| Record | Fields |
|---|---|
| group | id, name, currency, demo (bool), constitution_ref |
| member | id, group_id, display_name, aliases[] |
| commitment | id, group_id, member_id, kind (`contribution` or `loan_repayment`), amount, due_rule (monthly day or one date) |
| entry | id, group_id, member_id, kind, amount, period (`YYYY-MM`), occurred_on, evidence_tier, source_ref, approved_by, created_at. Append only. Corrections are new entries that reference the old one |
| evidence_tier | `statement_confirmed`, `treasurer_confirmed`, `agent_proposed_approved`, `self_reported` |
| proposal | id, group_id, run_id, type (`entry`, `question`, `draft_reminder`), payload, quotes[], status (`pending`, `approved`, `rejected`, `expired`), decided_by, decided_at |
| run | id, group_id, intake_ref, model_id, prompt_version, steps[], started_at, ended_at, status |
| finding | id, group_id, kind (`only_on_paper`, `only_in_ledger`, `amount_differs`), refs[], status (`open`, `resolved`) |
| archive_item | id, group_id, kind (`meeting`, `ledger_month`, `constitution`), verbatim, sha256, gist, created_at |

## HTTP endpoints

| Method and path | Purpose |
|---|---|
| `GET /health` | Liveness |
| `GET /groups/{id}` | Group, members, commitments |
| `GET /groups/{id}/today` | Deterministic list: overdue, unmatched findings, open questions. Same input, same order |
| `GET /groups/{id}/entries?member&period` | Ledger entries |
| `POST /groups/{id}/intake/note` | Body: `{ text }` or `{ audio }`. Starts a run. Returns run id |
| `POST /groups/{id}/intake/page` | Body: `{ image }`. Starts a run that reads a ledger page. Returns run id |
| `GET /runs/{id}` | Run with steps and model id |
| `GET /groups/{id}/proposals?status` | Proposals inbox |
| `POST /proposals/{id}/approve` | Applies the entry. Idempotent. Returns the entry |
| `POST /proposals/{id}/reject` | Rejects |
| `POST /proposals/{id}/edit` | Edit payload before approval; keeps the original in the audit log |
| `POST /questions/{id}/answer` | Treasurer answers a question proposal; the agent continues the run |
| `GET /groups/{id}/findings` | Reconciliation findings |
| `GET /lab/runs` | Saved eval runs and traces (read only) |
| `POST /demo/reset` | Reseeds the synthetic group. Disabled outside demo mode |

Access: a treasurer token per group. A token for one group is denied (403) on another. Authentication is minimal and not production-grade.

## MCP tools

Names, risk and effect are in `docs/agent-design.md`. Every tool call is recorded in the run with arguments and a one-line result. No tool approves, sends, edits the ledger or contacts anyone.

## Guarantees the tests must prove

- Approving the same proposal twice creates one entry.
- Entries cannot be edited or deleted; a correction is a new entry that references the old one.
- A proposal whose quotes are not in the source is rejected before it reaches the inbox.
- A proposal carries at most 3 quotes. Every refusal records its reason in the run trace.
- `today` returns the same order for the same data.
- Access to another group's records returns 403.
- With the model off, intake falls back to manual entry and `today` still works.

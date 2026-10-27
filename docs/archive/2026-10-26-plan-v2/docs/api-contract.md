# docs/api-contract.md: API contract v2

Status: design, nothing built. Replaces v1 (archived). Names may change when the code is written; keep one concept per endpoint.

## 1. Conventions

- JSON over HTTP under `/api/v1`. Times are ISO 8601 UTC. Display time zone: Africa/Nairobi.
- Ids are UUIDs. Every row has `created_at`. Events and proposals are append only.
- Every write takes an `Idempotency-Key` header. Repeating a key with the same body returns the first response. Repeating it with a different body returns 409.
- Every read and write is scoped by `programme_id` from the signed-in staff member. A learner or programme outside that scope returns 404.
- Staff auth: one demo account per role (staff, super-admin), set by environment variables. Not production-grade. Do not call it secure.
- Demo rows carry `demo: true`. The console shows a "Demo data" badge.

## 2. Primitives

| Primitive | Endpoints | Notes |
|---|---|---|
| candidates | `POST/GET /candidates`, `GET /candidates/{id}` | A learner. Display name stays in the database; agents see ids |
| goals | `POST /candidates/{id}/goals`, `GET`, `PATCH status` | With milestones. Legal status moves only |
| commitments | `POST /candidates/{id}/commitments`, `POST /commitments/{id}/complete`, `.../cancel` | Owner, due date |
| events | `POST /candidates/{id}/events`, `GET /candidates/{id}/events` | Append only. `source`: `staff_confirmed`, `agent_proposed_approved`, `unverified` |
| progress | `GET /candidates/{id}/progress` | Computed. Read only |
| interventions | `GET /programmes/{id}/interventions` | Ranked, with `reasons[]` from rules. Read only |
| proposals | `GET /programmes/{id}/proposals`, `POST /proposals/{id}/approve`, `.../edit`, `.../reject` | The only place the agent writes |
| agent runs | `POST /programmes/{id}/agent/intake`, `POST /programmes/{id}/agent/review`, `GET /agent/runs`, `GET /agent/runs/{id}` | Intake takes text or audio. Returns a run id; proposals appear in the inbox |
| outcomes | `GET /programmes/{id}/outcomes` | Computed from stored events |
| lab | `GET /lab/evals`, `GET /lab/runs`, `GET /lab/health` | Super-admin only |

## 3. Ranking rule (frozen on Day 3)

Score = sum of fixed weights for: overdue commitment, due check-in, evidence gap (milestone complete with no staff-confirmed event), days since last event over a threshold. Ties break by earliest due time, then id. The weights live in one file and in `docs/api-contract.md` once frozen. The raw score is never shown. The reasons are.

## 4. Approval

`POST /proposals/{id}/approve` creates the event or commitment in one transaction, marks the proposal approved and records who approved it. Repeating it with the same key changes nothing. Approving a proposal whose cited ids no longer exist returns 409.

Editing creates a new proposal version; the original stays. Rejecting records a reason code.

## 5. Errors

One envelope everywhere: `{ "error": { "code": "...", "message": "...", "details": [...] } }`. Codes: `validation_failed`, `not_found`, `conflict`, `idempotency_mismatch`, `forbidden`, `model_unavailable`, `rate_limited`. No stack traces. No secrets.

## 6. MCP tools

Defined in `docs/agent-design.md` section 3. Same envelope on errors. Same scope checks as HTTP.

## 7. Model adapter

Inputs: task type (`intake`, `review`), record ids, prompt version. Outputs: schema-validated JSON proposals with `cited_event_ids` and `source_quote`. Stored per call: provider, model id, prompt version, input ids, output, latency, tokens, outcome. Config: `MODEL_PROVIDER`, `MODEL_ID`, `MODEL_BASE_URL`, `MODEL_FALLBACK_ONLY`, `MODEL_TIMEOUT_MS` (default 30000). Fail closed to the fallback in `docs/agent-design.md` section 5.

## 8. Open

- Freeze date for ranking weights (Day 3).
- Audio upload size limit and format for the demo.
- Whether intake runs synchronously for the video or as a polled run.

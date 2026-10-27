# docs/api-contract.md — Umwayi-RM API Contract

> **Status:** Draft skeleton. Fill in before implementation, then treat as the contract the tests
target.
> **Rule 1:** The database is the system of record. AI output is a proposal, never a stored fact.
> **Rule 2:** Every endpoint and MCP tool documents: purpose, auth/scope, request schema,
response schema, error cases, idempotency (writes), ownership/scope checks.
> **Rule 3:** Progress, due dates, completion status, and overdue flags are computed by
application logic from stored records. Never by the model.
> **Rule 4:** If this file and `HACKATHON.md` disagree, `HACKATHON.md` wins and this file is
corrected.

---

## 1. Conventions

- **Base path:** `/api/v1`
- **Content type:** `application/json`
- **Auth:** Bearer token (hackathon scope); must enforce organisation + programme scope on
every read and write
- **IDs:** opaque, stable, non-guessable (UUIDv7 recommended)
- **Timestamps:** ISO-8601 UTC; document any local-time display rules separately
- **Idempotency:** writes that can be retried accept `Idempotency-Key` header; same key +
same payload = no duplicate state
- **Errors:** consistent envelope (see §3)
- **Pagination:** cursor-based for list endpoints (`?limit=&cursor=`)
- **Provenance:** every event records `source` (`user-confirmed` | `agent-reported` |
`unverified`) and optional evidence reference
- **Determinism:** progress, due dates, overdue flags computed in application logic from stored
records
- **Demo labelling:** every record created by the seed carries `demo: true`; the UI shows a
"Demo data" badge

---

## 2. Primitives and endpoints

### 2.1 Programmes

**Purpose:** top-level scope. A candidate belongs to a programme; a staff member belongs to a
programme; a queue is scoped to a programme.

| Method | Path | Purpose |
|---|---|---|
| POST | `/programmes` | Create programme |
| GET | `/programmes/{id}` | Retrieve programme |
| PATCH | `/programmes/{id}` | Update metadata |
| GET | `/programmes` | List (scoped to authenticated org) |

**Create — request:**
```json
{
  "name": "Backend Engineering Cohort 7",
  "external_ref": "demo-umwayi-v1/programme/backend-cohort-7",
  "demo": true,
  "metadata": { "cohort": "Backend Engineering Cohort 7", "region": "KE" }
}
```

**Create — response:**
```json
{
 "id": "prg_01H...",
 "name": "Backend Engineering Cohort 7",
 "external_ref": "demo-umwayi-v1/programme/backend-cohort-7",
 "demo": true,
 "created_at": "2026-10-26T10:00:00Z"
}
```

**Errors:** `400` invalid payload, `403` scope violation, `409` duplicate `external_ref` within org.

---

### 2.2 Staff

**Purpose:** the programme staff member who owns commitments and uses the queue.

| Method | Path | Purpose |
|---|---|---|
| POST | `/staff` | Create staff member |
| GET | `/staff/{id}` | Retrieve |
| GET | `/programmes/{id}/staff` | List staff in programme |

**Create — request:**
```json
{
  "programme_id": "prg_01H...",
  "display_name": "Programme Lead",
  "role": "programme_lead",
  "external_ref": "demo-umwayi-v1/staff/programme-lead",
  "demo": true
}
```

**Roles:** `programme_lead` | `case_worker` | `me_lead` | `super_admin` (Lab only).

**Errors:** `400`, `403`, `409`.

---

### 2.3 Candidates

**Purpose:** the person whose outcome is tracked.

| Method | Path | Purpose |
|---|---|---|
| POST | `/candidates` | Create candidate |
| GET | `/candidates/{id}` | Retrieve candidate |
| PATCH | `/candidates/{id}` | Update status/metadata |
| GET | `/programmes/{id}/candidates` | List (scoped, paginated) |

**Create — request:**
```json
{
  "programme_id": "prg_01H...",
  "display_name": "Amina",
  "status": "active",
  "external_ref": "demo-umwayi-v1/candidate/amina",
  "demo": true,
  "metadata": { "cohort": "Backend Engineering Cohort 7" }
}
```

**Status values:** `active` | `placed` | `completed` | `withdrawn`.

**Errors:** `400`, `403`, `409`.

---

### 2.4 Goals and milestones

**Purpose:** objective and measurable success criteria.

| Method | Path | Purpose |
|---|---|---|
| POST | `/candidates/{id}/goals` | Create goal with milestones |
| GET | `/candidates/{id}/goals` | List goals for candidate |
| GET | `/goals/{id}` | Retrieve goal |
| PATCH | `/goals/{id}` | Update status |
| POST | `/goals/{id}/milestones` | Add milestone |
| PATCH | `/milestones/{id}` | Update milestone status/evidence |

**Create goal — request:**
```json
{
  "title": "Placed in a backend engineering role within 90 days",
  "success_criteria": "Signed offer + confirmed start date",
  "due_at": "2027-01-24T00:00:00Z",
  "demo": true,
  "milestones": [
    { "key": "backend-track", "title": "Complete backend track", "due_at": "2026-11-15T00:00:00Z"
},
    { "key": "mock-interview", "title": "Pass mock interview", "due_at": "2026-12-01T00:00:00Z"
},
    { "key": "interviews", "title": "Attend 3 interviews", "due_at": "2026-12-20T00:00:00Z" }
  ]
}
```

**Milestone states:** `pending` | `completed` | `overdue`. `overdue` is derived, not stored.

**Errors:** `400`, `403`, `404`, `409`.

---

### 2.5 Commitments

**Purpose:** intended staff action with owner and due date.

| Method | Path | Purpose |
|---|---|---|
| POST | `/candidates/{id}/commitments` | Create commitment |
| GET | `/candidates/{id}/commitments` | List commitments |
| GET | `/commitments/{id}` | Retrieve |
| POST | `/commitments/{id}/complete` | Mark complete |
| POST | `/commitments/{id}/cancel` | Cancel |

**Create — request:**
```json
{
  "title": "Week-2 retention check-in",
  "owner_id": "staff_456",
  "due_at": "2026-11-20T09:00:00Z",
  "linked_goal_id": "goal_789",
  "demo": true
}
```

**State transitions:** `open → completed`, `open → cancelled`. Completed and cancelled are
terminal.

**Errors:** `400`, `403`, `404`, `409`, `410` (already terminal).
---

### 2.6 Events (append-only)

**Purpose:** record of what happened, with provenance.

| Method | Path | Purpose |
|---|---|---|
| POST | `/candidates/{id}/events` | Append event |
| GET | `/candidates/{id}/events` | List events (paginated) |
| GET | `/events/{id}` | Retrieve |

**Append — request:**
```json
{
  "type": "milestone.completed",
  "occurred_at": "2026-11-14T16:30:00Z",
  "source": "user-confirmed",
  "milestone_id": "ms_01H...",
  "evidence": { "note": "Trainer sign-off attached", "ref": "demo://evidence/trainer-signoff" },
  "demo": true
}
```

**Event types (initial):**
- `milestone.completed`
- `milestone.unconfirmed` (correction: reverses an earlier confirmed event)
- `commitment.completed`
- `commitment.missed`
- `placement.confirmed`
- `retention.confirmed` (day-30, day-60, day-90 in `evidence.day`)
- `note.added`

**Rules:**
- Append-only. Corrections are new events (e.g. `milestone.unconfirmed`) that supersede earlier
ones.
- `source` must be one of `user-confirmed` | `agent-reported` | `unverified`.
- `Idempotency-Key` header required. Same key + same payload = same `event_id`, no
duplicate.

**Errors:** `400`, `403`, `404`, `409` (idempotency conflict with different payload).

---
### 2.7 Check-ins

**Purpose:** future follow-up scheduling.

| Method | Path | Purpose |
|---|---|---|
| POST | `/candidates/{id}/check-ins` | Schedule check-in |
| GET | `/candidates/{id}/check-ins` | List |
| PATCH | `/check-ins/{id}` | Update state |

**States:** `scheduled` | `due` | `completed` | `missed`. `due` and `missed` are derived from
`due_at` and clock.

---

### 2.8 Progress (computed, read-only)

**Purpose:** deterministic status from stored records.

| Method | Path | Purpose |
|---|---|---|
| GET | `/candidates/{id}/progress` | Candidate progress |
| GET | `/programmes/{id}/progress` | Programme rollup (scoped) |

**Response:**
```json
{
  "candidate_id": "cand_01H...",
  "goal_id": "goal_789",
  "completed": 1,
  "outstanding": 2,
  "overdue": 1,
  "milestones": [
    { "id": "ms_1", "title": "Complete backend track", "state": "completed", "evidence":
"user-confirmed" },
    { "id": "ms_2", "title": "Pass mock interview", "state": "outstanding", "due_at":
"2026-12-01T00:00:00Z" },
    { "id": "ms_3", "title": "Attend 3 interviews", "state": "overdue", "due_at":
"2026-12-20T00:00:00Z" }
  ]
}
```

**Rules:** computed from events + milestone state + clock; never from model output.
---

### 2.9 Interventions (derived, read-only)

**Purpose:** ranked next actions for staff. **This is the hero surface of the demo.**

| Method | Path | Purpose |
|---|---|---|
| GET | `/programmes/{id}/interventions` | Ranked queue |

**Query parameters:** `limit` (default 20, max 100), `cursor`, `kind` (filter by type).

**Response:**
```json
{
  "items": [
    {
      "id": "int_01H...",
      "kind": "commitment.due",
      "candidate_id": "cand_01H...",
      "candidate_display_name": "Amina",
      "commitment_id": "com_01H...",
      "due_at": "2026-11-20T09:00:00Z",
      "reason": "due",
      "days_overdue": 2,
      "rank_score": 0.93,
      "rationale": "This check-in was due 2 days ago. The last recorded event was the mock
interview completion.",
      "rationale_source": "model"
    }
  ],
  "next_cursor": null
}
```

**Rationale source values:** `model` | `fallback` | `cached`. If `fallback`, the string is a
deterministic template (e.g. "This check-in is due in 0 days."). The queue does not fail if the
model is unavailable.

**Ranking formula (must be documented and tested):**

```
rank_score =
    w_kind * kind_weight(kind)
  + w_overdue * overdue_weight(days_overdue)
  + w_evidence * evidence_weight(unverified_evidence)
  - w_recent * recently_touched_penalty(last_event_at)
```

Initial weights (tune, then freeze before Day 7):
- `kind_weight`: `commitment.due` = 1.0, `milestone.overdue` = 0.9, `check-in.due` = 0.8,
`evidence.gap` = 0.7
- `overdue_weight`: `min(days_overdue, 14) / 14`
- `evidence_weight`: 1.0 if the item depends on unverified evidence, else 0.0
- `recently_touched_penalty`: 1.0 if `last_event_at` within 24h, else 0.0

**Tie-breaker:** older `due_at` first; then lower `id` (lexicographic) for determinism.

**Rules:**
- The ranking is deterministic given the same records and clock.
- The `rationale` is generated by the AI adapter; it must not change the ranking or the `kind`,
`reason`, `days_overdue`, or `rank_score` fields.
- `rank_score` is exposed for debugging and Q&A; the UI does not display it as a raw number.
The UI shows order and `reason`.

**Errors:** `403`, `404`.

---

### 2.10 Outcomes (computed, read-only)

**Purpose:** placement and retention metrics from stored records.

| Method | Path | Purpose |
|---|---|---|
| GET | `/programmes/{id}/outcomes` | Programme outcomes |

**Response:**
```json
{
  "programme_id": "prg_01H...",
  "as_of": "2026-11-04T00:00:00Z",
  "placements_confirmed": 12,
  "retention_day_30": { "confirmed": 10, "missed": 1, "unknown": 1 },
  "retention_day_60": { "confirmed": 8, "missed": 2, "unknown": 2 },
  "retention_day_90": { "confirmed": 5, "missed": 1, "unknown": 2 },
  "candidates_active": 3,
 "candidates_completed": 12,
 "data_sufficiency": {
   "day_30": "sufficient",
   "day_60": "sufficient",
   "day_90": "insufficient"
 }
}
```

**Rules:**
- Every metric computed from events with `source = user-confirmed`.
- No projections, no forecasts, no risk scores.
- `data_sufficiency` is `insufficient` when fewer than 5 candidates have reached the window. The
UI shows "not enough data yet" rather than a misleading zero.

---

### 2.11 Lab records (super-admin only)

**Purpose:** experiment log. Every success, failure, projection is recorded. This is the source
for pitch slide 12.

| Method | Path | Purpose |
|---|---|---|
| POST | `/lab-records` | Append lab record |
| GET | `/lab-records` | List (paginated) |
| GET | `/lab-records/{id}` | Retrieve |

**Append — request:**
```json
{
  "kind": "experiment",
  "title": "Baseten Muse Spark Open latency",
  "status": "completed",
  "outcome": "pass",
  "notes": "p50 850ms, p95 1.4s across 5 runs; structured output reliable; cost per call $0.003",
  "evidence_ref": "docs/hackathon-log.md#2026-10-27"
}
```

**Kinds:** `experiment` | `decision` | `verification` | `blocker` | `projection`.
**Statuses:** `proposed` | `in_progress` | `completed` | `abandoned`.
**Outcomes:** `pass` | `fail` | `partial` | `pending`.
**Auth:** `super_admin` only. The Lab view in the UI reads from this endpoint.

---

## 3. Error envelope

```json
{
  "error": {
    "code": "validation_error",
    "message": "Human-readable summary",
    "details": [
      { "field": "due_at", "issue": "must be in the future" }
    ],
    "request_id": "req_01H..."
  }
}
```

**Codes:** `validation_error` (400), `unauthorized` (401), `forbidden` (403), `not_found` (404),
`conflict` (409), `gone` (410), `rate_limited` (429), `internal_error` (500).

**Rules:** every error includes `request_id`; log it server-side; never leak stack traces or SQL to
the client.

---

## 4. MCP tools

> Expose only operations needed for the demo. Validate every argument. Return errors in the
same envelope shape as the HTTP API where possible.

| Tool | Purpose | Args | Returns |
|---|---|---|---|
| `create_goal` | Create goal + milestones for a candidate | `candidate_id`, `title`,
`success_criteria?`, `due_at?`, `milestones[]` | `goal` |
| `record_event` | Append an event to a candidate timeline | `candidate_id`, `type`,
`occurred_at`, `source`, `milestone_id?`, `evidence?`, `idempotency_key` | `event` |
| `get_progress` | Retrieve computed progress for a candidate or goal | `candidate_id`,
`goal_id?` | `progress` |
| `list_interventions` | List ranked follow-ups for a programme | `programme_id`, `limit?` |
`interventions` |
| `create_commitment` | Record a staff commitment | `candidate_id`, `title`, `owner_id`, `due_at`,
`linked_goal_id?` | `commitment` |
| `get_outcomes` | Retrieve programme outcomes | `programme_id` | `outcomes` |
| `draft_followup` (optional) | Draft a follow-up message from records (AI; returns proposal only) |
`candidate_id`, `commitment_id?` | `proposal` (text + cited event IDs) |

**Guardrails:**
- `draft_followup` returns a proposal for human review — never auto-sends.
- All tools enforce organisation / programme scope.
- Every tool validates its arguments against a schema; invalid args return the error envelope.
- No tool performs schema changes on the database. (This is the Supabase rejection, restated
as a contract rule.)

---

## 5. AI adapter contract

> Small adapter in front of the Meta AI model (Muse Spark Open via Baseten; Muse Spark 1.3
via Meta Model API as fallback). The adapter returns *proposals*, which the application
validates before showing to staff.

**Inputs:**
- Structured record IDs (candidate, goal, commitments, events).
- Prompt version identifier.
- Task type (`rationale` | `case_summary` | `followup_draft`).

**Outputs (schema-validated JSON):**
- `rationale`: `{ "rationale": "string", "cited_event_ids": [...] }`
- `case_summary`: `{ "summary": "string", "cited_event_ids": [...], "not_proven": [...] }`
- `followup_draft`: `{ "draft_message": "string", "cited_event_ids": [...],
"requires_human_approval": true }`

**Must:**
- Cite only supplied record IDs.
- Never invent events.
- Fail closed on schema errors (return `fallback` with a deterministic string).
- Have a deterministic fallback used by the demo when the model is unavailable.
- Store for debugging: model/provider, prompt version, input record IDs, output, timestamp. No
secrets.

**Fallback behaviour:**
- If the model call fails (timeout, rate limit, schema error), the adapter returns `{ "rationale":
"<deterministic template>", "rationale_source": "fallback" }`.
- The template is: `"This {kind} is {due_status}. The last recorded event was {last_event_type}."`
- The queue still renders. The UI shows the fallback string without an error banner.
**Configuration:**
- `META_AI_ENABLED` (bool)
- `META_AI_FALLBACK_ONLY` (bool) — when `true`, the adapter always returns the fallback.
This is a supported demo mode, not a failure.
- `META_AI_MODEL` (string)
- `META_AI_BASE_URL` (string)
- `META_AI_REQUEST_TIMEOUT_MS` (int, default 15000)

---

## 6. Open questions to resolve before implementation

- Auth model and scope enforcement strategy (organisation + programme). Bearer token is the
hackathon default; document the choice in `docs/hackathon-log.md`.
- Whether `external_ref` uniqueness is enforced per programme or per org.
- Ranking formula weights — tune, then freeze before Day 7. Record the frozen values in a log
entry.
- Whether check-ins and commitments are separate concepts in storage or views over one
table.
- Timezone policy for "overdue": UTC vs. org timezone vs. candidate local. Default: UTC;
document exceptions.
- Whether `rationale` is generated on every queue render or on queue state change. If latency is
high, generate on state change and cache. Decide after the Baseten latency experiment.

---

## 7. What this file is not

- It is not the brief. That is `HACKATHON.md`. If they disagree, the brief wins and this file is
corrected.
- It is not the OpenAPI spec. The spec is generated from this contract once the endpoints are
implemented; the spec is the artefact, this file is the source of truth for the spec.
- It is not the demo script. That is `docs/demo-script.md`. The demo calls these endpoints; it
does not redefine them.

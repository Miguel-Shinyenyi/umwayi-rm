# PROJECT.md — Umwayi-RM Project Sequencing & Architecture

> **Purpose:** The sequencing, architecture, and decision rationale for Umwayi-RM. This file is
inherited from the Routine Machine project and updated for the hackathon pivot. It sits between
the brief (`HACKATHON.md`) and the artefacts (`docs/*`).
> **Rule 1:** If this file and `HACKATHON.md` disagree, `HACKATHON.md` wins and this file is
corrected.
> **Rule 2:** If this file and `docs/api-contract.md` disagree on an endpoint or schema,
`docs/api-contract.md` wins and this file is corrected.
> **Rule 3:** This file records *why* the architecture is shaped this way. It does not duplicate the
contract, the design decisions, or the pitch. It points to them.

---

## 1. What this project is (and is not)

**Is:** A hackathon prototype of a deterministic intervention queue and evidence-backed
candidate timeline for skills-training programme staff, with a stated pivot to retention-risk
intelligence sold to employers.

**Is not:** A product launch, a validated business, or a general-purpose agent framework. The
predictor does not exist. Employer willingness-to-pay is unvalidated. See `HACKATHON.md`
§1.6.

**Inherited from Routine Machine:** The visual discipline, the design tokens, the
deterministic-state philosophy, the "intelligence must be justified by data" rule, and the
follow-through framing.

**New for the hackathon:** The organisational boundary (programme staff, not individuals), the
pivot (retention intelligence for employers), the intervention queue as the hero surface, the Lab
view, and the Muse Spark / Baseten model choice.

---

## 2. The three phases of Routine Machine (and where this sits)
Routine Machine was designed in phases, with each phase gated on evidence from the
previous one. Umwayi-RM inherits that discipline.

| Phase | What it proves | Status |
|---|---|---|
| **Phase 1 — Personal routines** | A person can track consistency without unrealistic plans.
Deterministic statistics before adaptive prioritisation. | Built (inherited repo) |
| **Phase 2 — Organisational coordination** | An organisation can coordinate staff toward
measurable outcomes with a deterministic queue. | **This hackathon — foundation demo** |
| **Phase 3 — Retention intelligence** | The signals from the queue predict retention risk; an
employer will pay for the signal. | **Not started. Hypothesis.** |

The hackathon builds Phase 2 and pitches Phase 3. It does not claim Phase 3 is proven. This is
the "adaptive phase remains gated on collecting sufficient real-world data" rule from the original
Routine Machine, applied to the pivot.

**Consequence for the build:** The queue must be deterministic and auditable *before* any AI
is added. The AI is a rationale layer, not a decision layer. If the queue cannot be explained
without the model, it is not ready to be a data foundation for Phase 3.

---

## 3. Architecture overview

### 3.1 The shape

```
┌───────────────────────────────────────────────────────────
──────┐
│               Frontend (Next.js)               │
│ Overview · Candidates · Timeline · Interventions · Outcomes · │
│ Lab · API/Integrate                            │
└──────────────────────────────┬────────────────────────────
──────┘
                   │ HTTPS / JSON
┌──────────────────────────────▼───────────────────────────
───────┐
│              API (Spring Boot, modular monolith)      │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │candidates│ │ goals │ │commitments│ │ events │              │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │check-ins │ │ progress │ │interventions│ │ outcomes │  │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │agent-tools│ │ai-assistant│ │ audit │ │ lab │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└──────────────────────────────┬────────────────────────────
──────┘
                  │
        ┌────────────────┼────────────────┐
        │          │          │
┌─────────────▼──────┐ ┌───────▼───────┐ ┌──────▼──────┐
│ PostgreSQL       │ │ MCP server │ │ Meta AI       │
│ (system of     │ │ (TypeScript) │ │ (Muse Spark │
│ record)      ││            │ │ via Baseten)│
└────────────────────┘ └────────────────┘ └──────────────┘
```

### 3.2 Why a modular monolith

The inherited Routine Machine project was a backend + Python intelligence service split. **That
split is not repeated here.** For a 10-day hackathon:

- A modular monolith is faster to build, test, and deploy.
- The AI adapter is a small module inside the API, not a separate service. It has a clean
interface (`docs/api-contract.md` §5), so it can be extracted later if needed.
- The MCP server is the only separate process, because it is a different runtime and a different
protocol. It calls the same API as the frontend.

Add a separate service only when a clear integration or runtime boundary justifies it. None does
yet.

### 3.3 Why PostgreSQL

- The inherited stack uses PostgreSQL. It is understood, tested, and reliable.
- The data model is relational: candidates have goals, goals have milestones, commitments link
to goals, events link to candidates and milestones, interventions are derived from commitments
and check-ins.
- The queue ranking uses deterministic SQL + application logic. No vector store, no graph
database, no document store.
- **Supabase was considered and rejected.** See `HACKATHON.md` §5.1 and
`docs/hackathon-log.md` (2026-10-24 entry). The reasons: dynamic schema alteration is a
determinism and security risk; the free tier pauses after 7 days of inactivity; bandwidth and
realtime limits are tight.
### 3.4 Why the queue is deterministic (and the AI is not)

This is the architecture's core discipline, inherited from Routine Machine's "intelligence must be
justified by data" rule.

- **The queue ranking** is a deterministic function of stored records and the clock. Same inputs
→ same order. The formula and weights are in `docs/api-contract.md` §2.9.
- **The AI rationale** is a sentence explaining *why* an item is queued. It does not change the
ranking, the `kind`, the `reason`, the `days_overdue`, or the `rank_score`. If the model is
unavailable, the rationale is a deterministic template and the queue still works.
- **Progress, due dates, completion status, overdue flags** are computed by application logic.
They are not model output.

This matters because the pivot depends on the queue being trustworthy as a data foundation. If
the queue were model-decided, the data would be model-shaped, and the retention signal
would be built on sand.

---

## 4. Data model (conceptual)

The full schema is in `docs/api-contract.md`. This is the conceptual shape.

```
Organisation (implicit for hackathon; single-tenant)
  └── Programme
    ├── Staff (role: programme_lead | case_worker | me_lead | super_admin)
    ├── Candidate
    │ ├── Goal
    │ │ └── Milestone
    │ ├── Commitment (owner = Staff, linked to Goal optionally)
    │ ├── Check-in (scheduled follow-up)
    │ └── Event (append-only, with source + evidence)
    └── Lab record (kind: experiment | decision | verification | blocker | projection)
```

**Derived, not stored:**
- `progress` — computed from events + milestone state + clock
- `interventions` — computed from commitments + check-ins + evidence gaps + ranking formula
- `outcomes` — computed from events with `source = user-confirmed`
- Milestone `overdue` state — derived from `due_at` and clock

**Stored, append-only:**
- `events` — corrections are new events (`milestone.unconfirmed`), never edits to old events
- `lab-records` — every experiment, decision, verification, blocker, projection

**Why derived state is not stored:** storing computed state creates drift between the source of
truth and the cache. For a 10-day prototype with a small dataset, computing on read is fast
enough and eliminates a whole class of bugs. If performance becomes an issue (unlikely at
demo scale), caching can be added later, with the cache invalidated on every write.

---

## 5. Implementation sequence

The order is deliberate. It matches `HACKATHON.md` §6 and `docs/hackathon-log.md` task
queue.

### Days 1–2: Foundations
1. **Day 1:** Read Official Rules when published; record deadlines in the log. Claim Baseten
credit; verify Muse Spark Open reachable. Inspect `routine-machine/design-reference/` HTML
files. Lock the demo scenario and pitch narrative.
2. **Day 2:** Write the API contract (`docs/api-contract.md` §2.1–2.9) against the primitives.
Sketch the UI. Draft the pitch deck skeleton.

**Gate:** Do not start coding until the contract is written and the demo path is rehearsed on
paper.

### Days 3–4: Core API
3. **Day 3:** Programmes, staff, candidates, goals, milestones. Migrations. Integration tests for
each.
4. **Day 4:** Commitments, events (with idempotency), check-ins. Progress calculation.
Outcome calculation.

**Gate:** Every endpoint returns the documented schema; every write is idempotent; scope
checks are in place.

### Day 5: The queue
5. **Day 5:** Intervention queue ranking (deterministic formula, tie-breaker). `GET
/programmes/{id}/interventions`. MCP integration (`create_goal`, `record_event`, `get_progress`,
`list_interventions`, `create_commitment`, `get_outcomes`). Test: same inputs → same order;
same write with same key → same event.

**Gate:** The queue is deterministic and explainable. The MCP agent can complete the
end-to-end path.

### Day 6: AI rationale
6. **Day 6:** AI adapter (Muse Spark Open via Baseten; fallback to Muse Spark 1.3;
deterministic fallback template). Queue rationale (one sentence per item). Case summary /
follow-up draft if time permits. Test: model unavailable → fallback string, queue still works;
model returns invalid JSON → fallback string.

**Gate:** The queue works with the model disabled. The AI never changes the ranking.

### Day 7: Frontend and Lab
7. **Day 7:** Frontend: Overview, Candidates, Timeline, Interventions, Outcomes, API/Integrate.
Lab view (super-admin): experiment records, observability, pitch materials, task reminders.
Seed script finalised. Reset procedure documented.

**Gate:** All six surfaces render real API state. The Lab shows the experiment log. The seed
script produces the demo state deterministically.

### Day 8: Failure cases and hardening
8. **Day 8:** Test failures, retries, idempotency, access control. Test the model-unavailable
case. Test the duplicate-event case. Fix defects. Run the full demo path end to end with timing.

**Gate:** The demo path runs cleanly in ≤ 3:20. Every failure case has a documented fallback.

### Day 9: Pitch and docs
9. **Day 9:** Finish the pitch deck (slide copy, speaker notes, citations verified in
`docs/research/competitors.md`). Visual review against HTML references. Update
`README.md` feature status table. Update `docs/hackathon-log.md` with verifications. Record
the timing decision (deck + demo combined vs. separate).

**Gate:** The deck is exportable to PDF and PPTX with no font substitution. The deck and the
demo fit the judging format.

### Day 10: Freeze and submit
10. **Day 10:** Freeze features. Rehearse the pitch and the demo. Verify environment
variables, links, and seed. Submit before the deadline. Do not code on the last day.

**Gate:** Submission complete. The demo runs from a clean clone. The pitch claims match the
implementation.

---

## 6. Module responsibilities (the short version)

Detailed in `docs/api-contract.md` §2 and §5.

| Module | Responsibility | Does not |
|---|---|---|
| `candidates` | Person records | Compute progress |
| `goals` | Objectives and milestones | Store evidence |
| `commitments` | Staff actions with due dates | Compute overdue (that is `interventions`) |
| `events` | Append-only activity with provenance | Edit past events |
| `check-ins` | Scheduled follow-ups | Send notifications |
| `progress` | Computed candidate status | Store its output |
| `interventions` | Ranked queue | Generate rationale (that is `ai-assistant`) |
| `outcomes` | Programme metrics from confirmed events | Project or forecast |
| `agent-tools` | MCP tool definitions | Bypass scope checks |
| `ai-assistant` | Rationale, case summaries, follow-up drafts | Change ranking, store facts, send
anything |
| `audit` | State change attribution | Expose to non-admin UI |
| `lab` | Experiment records | Hold candidate data |

---

## 7. What was rejected, and why

Recorded so we do not re-propose them. Full detail in `docs/design-decisions.md` and
`docs/hackathon-log.md`.

| Rejected | Why | Recorded in |
|---|---|---|
| Supabase as the backend | Dynamic schema is a determinism and security risk; free tier
pauses after 7 days | `docs/hackathon-log.md` 2026-10-24 |
| Chat interface as the primary demo | Unvalidated; time-consuming; the queue is deterministic
and demonstrable | `docs/design-decisions.md` DD-053 |
| AI as the decision layer | Would make the data foundation untrustworthy | `HACKATHON.md`
§4.2 |
| Modal or Fireworks as the inference partner | Smaller credit or higher burn rate; Baseten has
the best credit + rate limit combination | `docs/hackathon-log.md` 2026-10-24 |
| Muse Spark 1.3 as the primary model | Not available through partner platforms; would
consume Meta credits faster | `docs/hackathon-log.md` 2026-10-24 |
| Raw `rank_score` in the UI | Invites over-trust in an unvalidated formula |
`docs/design-decisions.md` DD-052 |
| Dark-only theme | The reference ships light-first; staff work in bright environments |
`docs/design-decisions.md` DD-050 |
| Heavy brand illustration on working surfaces | Competes with state; obscures candidate data |
`docs/design-decisions.md` DD-051 |
| Pitching the tracker as the business | No buyer with budget; no willingness-to-pay evidence |
`docs/hackathon-log.md` 2026-10-24 council review |

---
## 8. Pivot thesis (the short version)

The pitch is in `docs/pitch-deck.md`. The synthesis of verified claims is in
`docs/research/competitors.md`. This is the one-paragraph version for contributors who need
the shape of the business without reading the deck.

> Programme staff follow up with candidates every day. Their follow-ups slip. The evidence
scatters. The queue captures the signals — commitment kept or missed, evidence confirmed or
unverified, milestone on time or overdue — as labeled data. Employers who hire from training
pipelines lose developers in the first 90 days to soft-skill failures, not technical ones. The
employer bears the cost. The signal is what they would pay for. The queue is how the signal
gets collected. The hackathon proves the queue works. The next experiment proves the signal
correlates with retention. We are honest about which is which.

---

## 9. Records discipline

Three files carry the record, each with a different role:

| File | Holds | Updated when |
|---|---|---|
| `HACKATHON.md` | Scope, rules, task queue, DoD | At scope changes (rare; corrections, not
edits) |
| `docs/hackathon-log.md` | Dated decisions, experiments, verifications, blockers, limitations |
Every decision, experiment, verification, blocker |
| `docs/api-contract.md` | Endpoints, schemas, errors, MCP tools, AI adapter | When the
contract changes (before the code, not after) |

Design decisions live in `docs/design-decisions.md`. Competitor claims and verified citations live
in `docs/research/competitors.md`. The pitch lives in `docs/pitch-deck.md`. The demo path lives
in `docs/demo-script.md`. The onboarding lives in `README.md`.

**Rule:** never write "verified" in any of these files without a corresponding entry in
`docs/hackathon-log.md` with evidence. The status vocabulary is `built`, `tested`,
`manual-verified`, `deployed`, `not verified`. `deployed` is rare for the hackathon; it means the
artefact is running in the demo environment, not just locally.

---

## 10. What this file is not

- It is not the brief. That is `HACKATHON.md`. If they disagree, the brief wins.
- It is not the contract. That is `docs/api-contract.md`. If they disagree on a schema, the contract
wins.
- It is not the design log. That is `docs/design-decisions.md`.
- It is not the pitch. That is `docs/pitch-deck.md`.
- It is not the record. That is `docs/hackathon-log.md`.

It is the shape of the project: what it is, why it is built this way, what was rejected, and in what
order it gets built. When in doubt, follow the sequence in §5 and record deviations in the log.

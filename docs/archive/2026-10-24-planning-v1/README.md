# Umwayi-RM

> **An AI-assisted platform that helps organisations turn skills training into sustained
employment.**
>
> For the hackathon, the product is a **deterministic intervention queue** and
**evidence-backed candidate timeline** for programme staff. The commercial thesis is a
**pivot**: the queue is the data foundation for **retention-risk intelligence sold to employers**
who hire from training pipelines. The hackathon proves the foundation. The pitch states the
pivot honestly.

**Status:** Hackathon prototype (Meta Global AI Developer Hackathon). Not production-ready.
Demo data is synthetic and labelled. See [`HACKATHON.md`](./HACKATHON.md) for the full
scope and the pivot, and [`docs/pitch-deck.md`](./docs/pitch-deck.md) for the deliverable.

---

## The honest summary

This repo is a **foundation demo**, not a product launch.

**What it demonstrates:**
- A deterministic, explainable intervention queue for programme staff.
- An evidence-backed candidate timeline with provenance.
- A measured outcome dashboard (no projections, no risk scores).
- A Lab view for the builder: experiment records, observability, pitch materials.
- A pivot: the queue collects the data foundation for retention intelligence sold to employers.

**What it does not demonstrate:**
- That the queue improves retention.
- That the retention-risk signal is accurate. (The predictor does not exist yet.)
- That employers will pay.
- That programme staff prefer this over spreadsheets.

These are the next experiments. The hackathon is the first one. See
[`docs/hackathon-log.md`](./docs/hackathon-log.md) for the running record.

---
## Where this comes from

Routine Machine began as a personal-routines app: help a person maintain consistency when
hype culture dysregulates them. It became an organisational coordination platform. For this
hackathon, it is an **agent-queryable follow-through layer** with a pivot to retention intelligence.
The core philosophy is unchanged: help people and systems keep track of objectives,
commitments, evidence, and unfinished work.

See [`HACKATHON.md`](./HACKATHON.md) §1.1 for the boundary table.

---

## Stack

- **Backend API:** Java / Spring Boot
- **Database:** PostgreSQL
- **Agent interface:** MCP server (TypeScript)
- **Frontend:** Next.js / TypeScript — a compact staff console to inspect and demonstrate
records
- **Local environment:** Docker Compose
- **AI:** Muse Spark Open via Baseten (primary), Muse Spark 1.3 via Meta Model API
(fallback), with a deterministic fallback that keeps the queue working if the model is unavailable

The application is a modular monolith. It is not split into services unnecessarily.

See [`HACKATHON.md`](./HACKATHON.md) §5 for the architecture rationale, including why
Supabase was rejected.

---

## Quick start (from a clean environment)

**Prerequisites:** Docker + Docker Compose, JDK 21, Node 20+, `jq`, `curl`.

```bash
# 1. Clone and configure
git clone <repo-url> umwayi-rm
cd umwayi-rm
cp .env.example .env
# edit .env: META_AI_API_KEY, DATABASE_URL, APP_SECRET

# 2. Bring up the stack
docker compose up -d --build
# 3. Apply migrations
docker compose exec api ./gradlew flywayMigrate

# 4. Seed demo data (clearly labelled, resettable)
docker compose exec api ./scripts/seed-demo.sh

# 5. Verify
curl -s localhost:8080/api/v1/health | jq .
curl -s localhost:8080/api/v1/programmes?demo=true | jq '.[].id'

# 6. Open the dashboard
open http://localhost:3000
```

The seed script writes records with `demo: true`; the UI shows a "Demo data" badge on every
relevant screen. No real candidate or organisation data is included.

**Reset to a clean demo state:**

```bash
docker compose down -v && docker compose up -d --build \
  && docker compose exec api ./gradlew flywayMigrate \
  && docker compose exec api ./scripts/seed-demo.sh
```

**Fallback-only mode** (if Baseten credit is exhausted or the model is unavailable):

```bash
# In .env:
META_AI_FALLBACK_ONLY=true

# Then restart the API
docker compose restart api
```

The queue still works. Every rationale is a deterministic template. This is a supported demo
mode, not a failure.

---

## What is built (honest feature status)
> This section reflects what has actually been built and tested, not what is planned. Check
[`docs/hackathon-log.md`](./docs/hackathon-log.md) for evidence. Never mark a row as verified
unless there is a corresponding verification entry in the log.

| Feature | Status | Notes |
|---|---|---|
| Programmes, staff, candidates | _TBD_ | |
| Goals and milestones | _TBD_ | |
| Commitments (create, complete, cancel) | _TBD_ | |
| Events (append-only, provenance) | _TBD_ | `user-confirmed` / `agent-reported` / `unverified` |
| Deterministic progress calculation | _TBD_ | From stored records + clock |
| Intervention queue (ranked) | _TBD_ | Deterministic; explainable |
| Queue rationale (AI, one sentence) | _TBD_ | Fallback string when model unavailable |
| Outcomes dashboard | _TBD_ | Measured only; no projections |
| Lab view (super-admin) | _TBD_ | Experiment records, observability, pitch materials |
| MCP tools (`create_goal`, `record_event`, `get_progress`, `list_interventions`,
`create_commitment`, `get_outcomes`) | _TBD_ | |
| Idempotency on writes | _TBD_ | `Idempotency-Key` header |
| Organisation / programme scope enforcement | _TBD_ | |
| Dark theme + accessibility pass | _TBD_ | |
| Demo reset | _TBD_ | |

**Status values:** `built`, `tested`, `manual-verified`, `deployed`, `not verified`. Update this table
only when the corresponding verification entry exists in the log.

---

## The pivot (why this is a business, not a tracker)

The submitted product — a follow-up tracker for training organisations — is the data foundation,
not the business.

- **The problem:** Employers lose junior developers in the first 90 days to soft-skill failures, not
technical ones. The employer bears the cost. The signals that predict failure exist early, in
follow-ups that happen or don't.
- **The product:** The intervention queue captures those signals as labeled data —
commitment kept or missed, evidence confirmed or unverified, milestone on time or overdue.
- **The business:** Sell the retention-risk signal to the employer who bears the churn cost. The
queue is how the data gets collected. The signal is what the employer pays for.

**What is not proven:** the signal's accuracy, employer willingness-to-pay, staff preference over
spreadsheets. These are the next experiments. See [`HACKATHON.md`](./HACKATHON.md)
§1.6 and [`docs/hackathon-log.md`](./docs/hackathon-log.md) §Limitations.
The pitch states this honestly. See [`docs/pitch-deck.md`](./docs/pitch-deck.md), especially slide
10 ("Not proven").

---

## API and agent interface

See [`docs/api-contract.md`](./docs/api-contract.md) for endpoints, request/response examples,
error envelope, MCP tool definitions, and the AI adapter contract.

Key conventions:
- Base path `/api/v1`
- Opaque IDs, ISO-8601 UTC timestamps
- `Idempotency-Key` on retryable writes
- Consistent error envelope with `request_id`
- Every read/write enforces organisation + programme scope
- The queue ranking is deterministic; the model writes the `rationale`, not the ranking

---

## Design

Visual discipline follows the Routine Machine design language. Before changing the interface,
review:

- **`routine-machine/design-reference/`** — HTML files are the primary visual reference; open
them in a browser.
-
[`docs/design.md`](https://github.com/Miguel-Shinyenyi/routine-machine/blob/main/docs/design.
md) — tokens, interaction rules, quality gates.
-
[`docs/frontend.md`](https://github.com/Miguel-Shinyenyi/routine-machine/blob/main/docs/fronte
nd.md) — frontend structure.
-
[`PROJECT.md`](https://github.com/Miguel-Shinyenyi/routine-machine/blob/main/PROJECT.md)
— sequencing and architecture.
- [`docs/design-decisions.md`](./docs/design-decisions.md) — deviations from the reference and
their reasons.

**Design principles:** calm over hype, one accent colour (amber), subtle depth, purposeful
motion, real state over mock UI, restrained shepherd motif (brand identity, not control
metaphor), developer/staff clarity. See [`HACKATHON.md`](./HACKATHON.md) §3 for details,
including the visual review gate.
---

## AI boundaries

- The database is the system of record.
- Progress, due dates, completion status, and overdue flags are computed by application logic.
- AI output is a proposal for staff review; it is not stored as fact.
- **Human approval is required** before any AI-drafted message is sent or any consequential
action is taken.
- Structured model output is schema-validated; failures fall back deterministically for the demo.
- No secrets, private candidate data, or real personal information are included in the repo or
demo.
- The model's "prune" capability may *propose* removing context files it deems unnecessary; it
requires explicit user approval and is logged in the Lab.

See [`HACKATHON.md`](./HACKATHON.md) §4 and
[`docs/api-contract.md`](./docs/api-contract.md) §5.

---

## Known limitations (honest)

> Updated during and after the build. See [`docs/hackathon-log.md`](./docs/hackathon-log.md)
§Limitations for dated entries.

- Demo data is synthetic; no real programme staff or candidates have used the system yet.
- Market demand for a dedicated follow-through API (vs. spreadsheets / case-management
tools) is a hypothesis, not validated.
- Placement vs. retention as the strongest first signal is unresolved.
- ATS / LMS / HRIS integrations are not built.
- Predictive risk scores are out of scope; the intervention queue uses explicit rules only.
- The retention-risk signal does not exist. The predictor has not been trained or tested.
- Employer willingness-to-pay is unvalidated.
- Mobile responsiveness has only been verified at the stated viewports (record which).
- Authentication / authorisation is minimal; not production-grade.
- Data-protection posture (e.g. Kenya Data Protection Act) has not been formally assessed; do
not describe the system as compliant.
- The chat interface is not part of the demo. It is a last-resort experiment if time permits after the
queue, timeline, dashboard, Lab, pitch deck, and submission are complete.

---

## Repository structure
```
umwayi-rm/
├── HACKATHON.md               # brief: scope, pivot, rules, task queue, DoD
├── README.md               # this file
├── PROJECT.md              # sequencing / architecture (inherited)
├── .env.example          # environment template; copy to .env
├── docs/
│ ├── hackathon-log.md       # dated decisions, experiments, verifications, blockers
│ ├── api-contract.md      # endpoints, MCP tools, errors, AI adapter contract
│ ├── design-decisions.md # deviations from HTML references, with reasons
│ ├── demo-script.md        # rehearsal path, setup, reset, fallback, timing
│ ├── pitch-deck.md        # slide copy, speaker notes, citations
│ ├── design.md          # tokens & rules (inherited)
│ ├── frontend.md         # frontend structure (inherited)
│ └── research/
│    └── competitors.md     # sourced competitor observations, verified claims
├── routine-machine/       # inherited Routine Machine repository (reference)
│ └── design-reference/     # HTML visual reference — primary design source
├── scripts/
│ └── seed-demo.sh          # demo data seeder (demo:true records)
├── backend/            # Spring Boot API + modules
├── mcp-server/          # MCP tool definitions & adapter
├── frontend/          # Next.js staff console
└── docker-compose.yml
```

---

## The Lab

The Lab is a super-admin view for the builder, not for programme staff. It shows:
- **Experiment records** — every success, failure, projection, dated, with evidence links.
- **System observability** — health, request rate, error rate, queue latency.
- **Pitch materials** — deck slides, demo script, submission narrative.
- **Task reminders** — upcoming tasks from `docs/hackathon-log.md` with due dates.

**No candidate data on the Lab screen.** The Lab is aggregate observability and experiment
records only. This is a deliberate design decision, recorded in
[`docs/design-decisions.md`](./docs/design-decisions.md) §DD-024.

---

## Demo
The exact demo path is in [`docs/demo-script.md`](./docs/demo-script.md). Summary:

- **6 steps, 3:00 target, 4:00 hard stop.**
- The queue is the hero. The chat is not in the demo.
- AI provides a one-sentence rationale per item; fallback string if unavailable.
- One failure case is demonstrated (duplicate event with same idempotency key).

Reset to clean state before any rehearsal:

```bash
docker compose down -v && docker compose up -d --build \
  && docker compose exec api ./gradlew flywayMigrate \
  && docker compose exec api ./scripts/seed-demo.sh
```

---

## Contributing / next steps

- Follow the execution order in [`HACKATHON.md`](./HACKATHON.md) §6 (design and pitch
first, then coding, then submission).
- Work one task at a time; record decisions and verifications in
[`docs/hackathon-log.md`](./docs/hackathon-log.md).
- New ideas go into `Later` unless they are required for the central demo.
- Do not claim a feature works unless it is listed as `tested` or `manual-verified` in the log with
evidence.
- If the deck and the brief disagree, the brief wins and the deck is corrected.

---

## Licence and attribution

- Submission code: original work for this hackathon.
- Inherited Routine Machine assets: see the parent repository's licence and
[`HACKATHON.md`](./HACKATHON.md) §3.2 for asset-reuse notes.
- Third-party open-source dependencies: licence-compatible; see per-package licence files.
- Do not import third-party assets (fonts, images, illustrations) without verifying usage rights.
- Competitor claims in the pitch cite their sources in
[`docs/research/competitors.md`](./docs/research/competitors.md). The repo does not
screenshot competitor products.

---

## The one-sentence version
> **We built a deterministic intervention queue for skills-training programme staff. It is the data
foundation for retention-risk intelligence sold to employers who hire from these pipelines. The
hackathon proves the foundation. The next experiment proves the signal. We are honest about
which is which.**
```

`README.md` is now a proper Markdown file. Key decisions it makes explicit:

- **The honest summary** is the first section. Anyone who clones the repo sees what it
demonstrates and what it does not, before they see the stack.
- **The pivot is stated in the README**, not buried in the deck. This is deliberate: the repo and
the pitch must not disagree.
- **The feature status table** uses the same status vocabulary as the log (`built`, `tested`,
`manual-verified`, `deployed`, `not verified`) and is entirely `TBD` because nothing is verified
yet. This is honest; it will be filled in as the build proceeds.
- **The Lab** has its own section with the rule that no candidate data appears there — matching
DD-024.
- **The demo** section points to `docs/demo-script.md` and repeats the reset command, so a
reviewer can rehearse without reading the demo script first.
- **The one-sentence version** at the end is the sentence the judges should remember: *"We
built a deterministic intervention queue... The hackathon proves the foundation. The next
experiment proves the signal. We are honest about which is which."*

---

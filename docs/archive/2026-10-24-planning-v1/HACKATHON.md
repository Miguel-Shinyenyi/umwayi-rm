# HACKATHON.md — Umwayi-RM Meta AI Developer Hackathon Build, Pitch & Operations
Brief

> **Purpose:** A source-of-truth instruction manual for building, pitching, and submitting
**Umwayi-RM** during the Meta Global AI Developer Hackathon. The hackathon is a **pitch
evaluation**, not a field test. The goal is to demonstrate that the idea is credible, the data
foundation is real, and the pivot to a viable business is coherent — not to prove that staff will
use the product.

**Status:** Hackathon plan, not a record of completed implementation.
**Primary builder:** Miguel Shinyenyi
**Product direction:** Data foundation for retention intelligence (Agent Infrastructure boundary,
pivoted)
**Primary deliverable:** A working prototype (deterministic intervention queue +
evidence-backed timeline + outcome dashboard), a pitch that states the pivot honestly, and a
technical explanation of what is and is not proven.

---

## 0. Meta-instructions: how to use this brief

- Do not execute a prompt just because it was given. First check it against the hackathon goal,
remaining time, scope, safety, and acceptance criteria.
- Work on one task at a time. Keep a short queue with `Now`, `Next`, `Later`, and `Blocked`
priorities.
- Use one core orchestrator for planning and context. Delegate a specific task to one agent at a
time. Every delegated task must state its goal, relevant context/files, expected output,
acceptance criteria, and where to record the result.
- Design the user journey, the pitch narrative, and the API contract before implementation.
- Prefer working vertical slices over broad scaffolding. A feature is not done because files exist;
it is done when behaviour is verified.
- Keep decisions, research, implementation status, test results, and known gaps in
version-controlled Markdown records.
- Do not invent users, metrics, testimonials, model performance, customer commitments, or
completed features.
- Use real usage data only when it exists. Clearly label synthetic demo data.
- New ideas go into `Later` unless needed for the central demo.
- Preserve time for end-to-end testing, the demo script, the pitch, and submission. Do not code
until the final minute.
- If an instruction conflicts with official hackathon rules, security, or factual accuracy, resolve the
conflict before proceeding.
- **The pitch is the deliverable.** The demo supports the pitch. The code supports the demo. Do
not let the code consume the time needed for the pitch.

---

## 1. Product thesis and scope

### 1.1 Product boundary: keeping the Routine Machine philosophy, changing the boundary

Routine Machine has always been about **follow-through** — helping someone keep track of
what they said they would do, what actually happened, and what is still unfinished. The
philosophy stays the same; the *boundary* shifts at each stage:

| Stage | Boundary | Who is served | What "follow-through" means |
|---|---|---|---|
| **Original idea** | Personal routines | An individual | Help a person maintain routines and
habits over time |
| **Business platform** | Organisational coordination | An organisation | Help organisations
coordinate people toward measurable outcomes |
| **Agent infrastructure** | Agent-queryable state | Software agents | Give agents a reliable,
queryable way to track objectives, commitments, evidence, and unfinished work |
| **Pivot (hackathon thesis)** | Retention intelligence | Employers who hire from training
pipelines | Sell the signal that a placed developer is at risk of soft-skill failure in the first 90 days |

The philosophy (consistency survives hype) is unchanged. The boundary has moved to the
buyer with budget.

### 1.2 The product we demo, the business we pitch (locked)

**What we demo (the submitted product):**
Umwayi-RM is a deterministic **intervention queue** and **evidence-backed candidate
timeline** for programme staff at skills-training organisations. It surfaces overdue commitments,
due check-ins, and evidence gaps, ranked by explicit rules. Staff use it to follow up. Every
confirmed follow-up is a labeled data point.

**What we pitch (the pivot):**
The queue is the **data foundation for retention-risk intelligence sold to employers** who hire
from training pipelines. Employers lose junior developers in the first 90 days to soft-skill failures,
not technical ones. The queue collects the signals — commitments kept, follow-ups missed,
evidence confirmed — that become the training set for a retention-risk signal. The hackathon
proves the foundation. The pitch states the pivot honestly.

**What we do not claim:**
- That the queue improves retention. (Untested.)
- That the retention-risk signal is accurate. (Does not exist yet.)
- That employers will pay. (Unvalidated.)
- That programme staff are the customer. (They are the data source.)

### 1.3 Target users (two, in sequence)

1. **Programme staff** (demo user): case workers, programme managers, M&E leads at
skills-training organisations. They use the queue. They are not the buyer.
2. **Employers** (pitch buyer): companies that hire junior developers from training pipelines.
They bear the cost of early churn. They buy the signal.

Do not confuse the two in the pitch. The demo shows the staff user. The pitch names the
employer buyer.

### 1.4 The minimum useful vertical slice (what the hackathon builds)

1. A **candidate** with a goal ("placed in a backend engineering role within 90 days") and
measurable milestones.
2. A **commitment** with an owner (staff member) and due date ("week-2 retention check-in").
3. An **event / evidence record** when something happens (training completed, interview
attended, offer accepted, 30-day retention confirmed), with provenance (user-confirmed vs.
agent-reported vs. unverified).
4. A **deterministic progress calculation** from stored records and explicit rules.
5. A **ranked intervention queue** surfacing due and overdue follow-ups, explainable.
6. A **one-sentence AI rationale** per queued item (Meta AI), non-critical: if the model is
unavailable, the queue still works with a fallback string.
7. A **compact staff dashboard**: candidate timelines, intervention queue, outcome dashboard.
8. A **Lab view** (super-admin) showing experiment records, system observability, pitch
materials, and task reminders.

The product is the **API and reliable state model**. The dashboard exists to inspect and
demonstrate that model. The pitch exists to state the pivot.

### 1.5 Explicitly out of scope

Unless the central demo cannot work without them, do not build:
- A general-purpose agent framework or model gateway
- A new database engine, vector database, or hosting platform
- A full workflow orchestration engine or multi-agent orchestration
- Autonomous actions with real-world consequences
- A large integration catalogue (ATS, HRIS, LMS connectors — later)
- Billing, subscriptions, complex organisation administration, or enterprise SSO
- A mobile app
- Predictive risk scores or adaptive recommendations (the pivot is stated, not built)
- Production-scale multi-region deployment
- The Shepherd chat interface (last resort if time permits; not core)
- The full long-term Routine Machine feature set (chat platform, cohort branding, leaderboards)

### 1.6 What the hackathon proves and what it does not

**Proves:**
- A deterministic, explainable intervention queue is buildable and demoable in 10 days.
- The data model exists to generate retention-risk signals later.
- The pivot is coherent and grounded in a real buyer with a real cost of failure.

**Does not prove:**
- That the queue improves retention.
- That the retention-risk signal is accurate.
- That employers will pay.
- That programme staff prefer this over spreadsheets.

These are the next experiments. The pitch states this honestly.

### 1.7 Pivot options (ranked by board consensus)

| Pivot | Buyer | Willingness-to-Pay Evidence | Pitchability | Risk |
|---|---|---|---|---|
| **A: Retention Intelligence (Employers)** | Employers who hire from training pipelines |
Medium (attrition prediction market exists) | High | Crowded category |
| **B: Outcome Verification (Funders)** | DFIs, governments, foundations | Low-Medium
(institutional) | Medium | Long sales cycle |
| **C: Consistency Infrastructure (Training Orgs)** | Training organisations | None | Low (honest
but not a business) | No buyer |
| **D: Onboarding Tracker (Employers)** | Employers (direct) | Low (HRIS competition) | Medium
| Weak differentiation |

**Pitch A. Mention B as the second act. Keep C as the origin story. Do not pitch D.**

---

## 2. Product contract and acceptance criteria

### 2.1 Core primitives

| Primitive | Responsibility | Minimum behaviour |
|---|---|---|
| `candidates` | The person whose outcome is tracked | Create, retrieve, update status |
| `goals` | Objective and success criteria | Create, retrieve, update status |
| `commitments` | Intended staff action, owner, due date | Create, list, complete, cancel |
| `events` | Append-only record of what happened | Record source, timestamp, type, optional
evidence |
| `check-ins` | Future follow-up | Store due time and state; surface due items |
| `progress` | Computed status | Return completed, outstanding, overdue, evidence-backed
milestones |
| `interventions` | Ranked next actions | Derived from commitments + check-ins + rules;
read-only |
| `lab_records` | Experiment log | Append-only; analyzed by the model; super-admin read-only |

Names can change after API design, but avoid duplicating concepts across endpoints.

### 2.2 Minimum acceptance criteria

- A staff member can create a candidate, goal, and milestones through the documented
interface.
- An agent can record an event and retrieve updated progress.
- Progress is computed from stored records and explicit rules, not invented by an LLM.
- Repeating a write with the same idempotency key does not create duplicate state.
- Due and overdue status is derived from a defined clock and due-date rule.
- The system distinguishes **user-confirmed evidence**, **agent-reported events**, and
**unverified claims**.
- Errors have consistent, documented responses.
- Ownership and scope (organisation / programme) are checked on every read and write.
- MCP tools expose only operations needed for the demo and validate arguments.
- The main workflow is tested end to end from agent call → database → returned progress.
- A fresh developer can run the project from the README.
- The demo works with seeded synthetic data if model API access fails.
- Seeded or simulated data is clearly labelled.
- The intervention queue ranks items deterministically and displays a one-sentence AI rationale
per item.
- The Lab view shows experiment records and system observability.

### 2.3 Open product questions

- Do programme staff want a dedicated follow-through API, or can they solve this with
spreadsheets?
- Is the strongest first signal placement (pre-employment) or retention (post-placement)?
- Which primitive saves organisations the most implementation time — evidence-backed
timelines, or the queue?
- Is MCP enough for adoption, or is an SDK necessary first?
- Which state should Umwayi-RM own versus delegate to an ATS / LMS / HRIS?
- **Will employers pay for a retention-risk signal derived from training-pipeline data?** (The
pivot's core question. Unvalidated. State honestly.)
Record evidence and counter-evidence in `docs/research/`. Do not silently turn assumptions
into decisions.

---

## 3. Design system and visual references

### 3.1 Sources of truth (reference design folder + repository)

Review these before changing the interface. **The HTML files in the design reference folder of
the Routine Machine repository are the primary visual reference** — inspect them directly in a
browser, not just in prose.

- **Design reference folder (HTML):** `routine-machine/design-reference/` — open the `.html`
files in a browser and compare against the implementation. These define the intended look,
layout, and interaction feel.
-
[`docs/design.md`](https://github.com/Miguel-Shinyenyi/routine-machine/blob/main/docs/design.
md) — mission, visual language, tokens, interaction rules, quality gates.
-
[`docs/frontend.md`](https://github.com/Miguel-Shinyenyi/routine-machine/blob/main/docs/fronte
nd.md) — frontend structure.
-
[`PROJECT.md`](https://github.com/Miguel-Shinyenyi/routine-machine/blob/main/PROJECT.md)
— sequencing, architecture, rule that intelligence must be justified by data.
- [Routine Machine project
page](https://miguel-shinyenyi.github.io/miguel-site/projects/routine-machine/)
- [Routine Machine repository](https://github.com/Miguel-Shinyenyi/routine-machine)

The original interface is a personal shepherd-themed application. **Umwayi-RM is
organisational infrastructure for employment outcomes**, so reuse its visual discipline — not its
end-user navigation labels wholesale.

### 3.2 The Shepherd analogy (carried into the UI and pitch)

The shepherd metaphor is the brand's spine. It should appear in the UI as restrained identity,
and in the pitch as the narrative frame. It must not obscure technical concepts.

| Shepherd concept | Product meaning | UI expression |
|---|---|---|
| **The flock** | The cohort of candidates | The programme view, the candidate list |
| **The shepherd** | The programme staff member | The user role, the intervention queue owner
|
| **The path** | The candidate's journey | The timeline |
| **The gate** | A milestone | Milestone markers on the timeline |
| **The stray** | A candidate at risk | A flagged item in the intervention queue |
| **The staff** | The commitment / follow-up | The commitment record |
| **The fold** | The outcome (placement, retention) | The outcome dashboard |
| **The lab** | The experiment log | The Lab view (super-admin) |

**In the pitch:** "We are building the shepherd's staff for programme staff. The queue is the
staff. The data is the flock's path. The business is selling the signal of a stray to the employer
who owns the fold."

**In the UI:** restrained shepherd/field motif in the logo, the sign-in screen, and empty states.
Never on working surfaces.

### 3.3 Design principles

- **Calm over hype.** No gradients, flashing, confetti, streak pressure, or exaggerated AI claims.
- **Clarity first.** Plain language, visible state, clear status, concise headings.
- **One accent colour.** Amber primary; green for successful completion; other colours semantic
only.
- **Subtle depth.** White grouped surfaces on a quiet canvas. Avoid nested-card overload.
- **Motion has a purpose.** Brief interaction feedback; nothing moves without a reason. Respect
reduced-motion.
- **Real state over mock UI.** Every number, status, chart, activity item in the demo comes from
the API or is labelled seeded data.
- **Staff clarity.** The shepherd motif is brand, not metaphor for controls.
- **Engagement is cross-cutting.** Every interaction (button, form, queue item) has a clear, felt
response (loading, success, error, state change).

### 3.4 Starting design tokens from `docs/design.md`

Treat these as starting reference. Adjust only where the product genuinely needs a change;
document deviations.

| Token | Light theme | Dark theme | Use |
|---|---|---|---|
| Canvas | `#F5F5F7` | `#000000` | Main page background |
| Surface | `#FFFFFF` | `#1C1C1E` | Main panels and grouped surfaces |
| Secondary surface | `#F5F5F7` | `#2C2C2E` | Inset areas |
| Ink | `#1D1D1F` | `#F5F5F7` | Main text |
| Muted text | `#6E6E73` | `#A1A1A6` | Supporting text |
| Hairline | `#E5E5EA` | `#38383A` | Separators |
| Accent | `#E9A23B` | `#F0AE4E` | Primary action, selection, progress |
| Accent text | `#9A5208` | `#F0AE4E` | Accent labels and links |
| Success | `#1B7332` / `#E3F5E7` | `#30D158` / `#16301C` | Completed state |
| Private | `#2F5A72` / `#EEF3F7` | `#8EC5E8` / `#12232E` | Private or restricted state |

Use semantic CSS variables rather than raw colours. Verify contrast in both themes.

### 3.5 Layout, typography, and components

- System font stack, sentence case, restrained typography.
- 18px card radius, 14px list radius, 12px inset tile radius, capsule primary buttons (from source
design).
- Readable on laptops, usable at 390px.
- Programme-staff console structure:
  - **Overview:** programme status, recent activity, queue shortcut.
  - **Candidates:** candidate records, goals, milestones.
  - **Timeline:** per-candidate chronological evidence.
  - **Interventions:** ranked due/overdue follow-ups (the primary demo surface).
  - **Outcomes:** progression and retention dashboard.
  - **Lab (Super Admin):** experiment records, observability, pitch materials, task reminders.
  - **API / Integrate:** API examples and MCP setup.
- One prominent primary action per view.
- Real buttons for actions, links for navigation. Design pointer, hover, focus, disabled, loading,
success, error states.
- Charts minimal; provide table or textual equivalent when important.
- Restrained shepherd/field motif only as brand identity.

### 3.6 Interaction and accessibility rules

- Keyboard navigation works across the main flow.
- Visible `:focus-visible` styles.
- WCAG 2.2 AA contrast targets where applicable.
- Accessible names and correct semantics.
- Respect `prefers-reduced-motion` and `prefers-reduced-transparency`.
- Show pending, success, empty, validation-error, network-error, disabled states.
- Never use colour alone for completion or failure.
- Do not claim mobile verification until inspected at a mobile viewport.

### 3.7 Visual review gate

1. Run the app and inspect the actual rendered page.
2. Compare against the **HTML reference files** in `routine-machine/design-reference/` and
`docs/`.
3. Check light and dark themes.
4. Check desktop and a real narrow viewport.
5. Exercise the main workflow with real API responses.
6. Record deliberate deviations in `docs/design-decisions.md`.
7. Fix layout, interaction, and copy defects before polish.

---

## 4. AI behaviour and boundaries

### 4.1 Model selection and use (Meta AI)

**Chosen model:** **Muse Spark Open via Baseten** (primary), **Muse Spark 1.3 via Meta
Model API** (fallback for complex reasoning).

**Rationale:**
- **Baseten:** $100 credit + 2M TPM limit (highest among partners). Per-second billing avoids
idle cost. MCP integration documented.
- **Muse Spark Open:** 816B total / 42B active, 1M context, natively multimodal, agentic.
Covered by Baseten credit.
- **Muse Spark 1.3 via Meta Model API:** reserved for complex case summaries; $150 Meta
credits.
- **Modal** (runner-up): strong Python DX, but higher H100 rate burns credit faster.
- **Fireworks:** $25 credit too small for sustained use.

**AI capabilities (scoped):**
- **Intervention queue rationale:** one sentence per queued item explaining *why* it is queued,
grounded in records. Non-critical: fallback string if model unavailable.
- **Case summaries (optional):** evidence-based summary from candidate timeline, for staff
review.
- **Follow-up drafts (optional):** personalised message draft, for staff review. Never auto-sent.
- **Shepherd chat (last resort only):** conversational interface. Build only if time permits after the
queue, timeline, dashboard, and Lab are done.

**Implementation scope:** Ship the queue rationale. Add case summaries or follow-up drafts
only if time permits. The chat is out unless everything else is done.

### 4.2 Keep authoritative state deterministic

- The database is the system of record.
- Progress, due dates, completion status, overdue flags are computed by application logic.
- AI output is a proposal, not a database fact.
- Do not let an LLM invent event history, mark a goal complete without evidence, or silently
change a commitment.
- Store model/provider, prompt version, input record IDs, output where safe.
- Validate structured output against a schema.
- Handle timeouts, malformed output, unavailable credentials, rate limits.
- Provide a deterministic fallback for the core demo.
- **Require human approval before any AI-generated message is sent or any consequential
action is taken.**

### 4.3 Data and privacy (heightened: real people's livelihoods)

- Use **synthetic candidate data** for the public demo unless explicit written permission.
- No secrets, tokens, or private candidate data in logs, screenshots, commits, recordings.
- API keys server-side, out of source control.
- Collect only demo data.
- Clear delete/reset path for demo records.
- Do not describe the product as secure, compliant, or production-ready without evidence.
- Note data-protection considerations (Kenya Data Protection Act, hackathon terms) in `docs/`.

---

## 5. Architecture and engineering

### 5.1 Stack (stick to current; do not switch to Supabase)

- Backend API: Java / Spring Boot
- Database: PostgreSQL
- Agent interface: MCP server (TypeScript if faster)
- Frontend: Next.js / TypeScript
- Local environment: Docker Compose
- AI: Muse Spark Open via Baseten (primary); Muse Spark 1.3 via Meta Model API (fallback)

**Why not Supabase:**
- Dynamic schema alteration is a determinism and security risk; `service_role` key bypasses
row-level security.
- Free tier pauses after 7 days inactivity (fatal for demo).
- Current Spring Boot + Postgres stack is proven and understood.

### 5.2 Suggested modules

- `candidates`: people, programmes, status
- `goals`: objectives, milestones
- `commitments`: staff actions, due dates, owners, lifecycle
- `events`: append-only activity and evidence
- `interventions`: ranked due items, review scheduling
- `progress`: deterministic aggregation, status calculation
- `outcomes`: placement and retention metrics
- `agent-tools`: MCP tool definitions, validation
- `ai-assistant`: Meta AI summarisation adapter
- `audit`: state changes, source attribution
- `lab`: experiment records

Keep modules small. Avoid abstractions that do not support a demonstrated use case.

### 5.3 Data integrity rules

- Stable identifiers, timestamps with documented timezone policy.
- Record event source and evidence provenance.
- Transactions for state changes that must happen together.
- Idempotency for retried writes.
- Validate ownership and scope (organisation / programme) on every read and write.
- Legal state transitions, not arbitrary status strings.
- Event history append-only where feasible; corrections explicit and auditable.
- Progress reproducible from stored records.
- Never use a risk score to exclude a person or take a consequential action.
- **The model's "prune" capability:** may *propose* removing context files it deems
unnecessary. Must be logged in the Lab and require explicit user approval with a stated reason
before execution.

### 5.4 Tests and verification

At minimum, test:
- Candidate, goal, milestone creation
- Commitment creation, due-date calculation
- Event append, duplicate/idempotency behaviour
- Progress calculation from known events
- Invalid input, consistent error responses
- Cross-organisation or cross-programme access denial
- MCP argument validation, error handling
- Meta AI output validation, fallback
- Full demo path from agent tool call through storage to updated status
- Queue ranking determinism and explainability

Tests alone do not prove the demo works. Run the stack and verify the workflow end to end.

---

## 6. Hackathon task queue and schedule

**Official hackathon reference:** https://cerebralvalley.ai/e/meta-ai-developer-hackathon —
check the page and Official Rules before planning the final hours.

**Key dates (per the hackathon page; subject to change by Meta):**
- Oct 13, 9:00 AM ET — Applications open
- Oct 25, 11:59 PM ET — Application deadline (or earlier if 20,000 spots fill)
- Oct 26 — Hackathon begins with kickoff livestream
- Oct 27 – Nov 4 — Live workshops + office hours (Discord)
- Nov 4, 9:00 PM ET — Project submissions due
- Nov 4 – Nov 8 — Judging
- Nov 9 — Closing ceremony

**Tracks:** Indie Developer (solo/students, teams up to 4) **or** Startup (technical founders).
Pick one. **Judging:** Impact 30%, Use of Meta AI Tooling 25%, Technical Depth & Execution
20%, Demo 25%. **$150 Meta Model API credits** over 10 days. Submission portal:
https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit.

Record all rules, deadlines, eligibility in `docs/hackathon-log.md` before building.

| Order | Task | Priority | Acceptance criteria |
|---|---|---|---|
| 1 | Read official rules/waiver; record deadlines, track choice | Now | Requirements in
`docs/hackathon-log.md` |
| 2 | Confirm demo workflow and pitch narrative | Now | One-sentence problem, demo path,
pivot statement agreed |
| 3 | Claim Baseten credit; verify Muse Spark Open availability | Now | Model reachable; latency
measured |
| 4 | Inspect repo + HTML design reference folder; choose architecture | Now | References
reviewed; no duplicate scaffolding |
| 5 | Define API contract and data model | Now | Requests/responses, state transitions
documented |
| 6 | Implement candidates, goals, commitments, events, progress | Now | API integration tests
pass |
| 7 | Implement intervention queue (deterministic ranking) | Now | Ranking deterministic;
explainable |
| 8 | Implement MCP integration | Now | Agent creates goal, records event, retrieves progress |
| 9 | Add AI queue rationale (one sentence per item, fallback string) | Next | Validated output,
grounded in records, fallback present |
| 10 | Build compact dashboard: timeline, queue, outcomes | Next | Shows real API state and
main workflow |
| 11 | Build Lab (super-admin): experiment records, observability, pitch materials, task reminders
| Next | Shows records, logs, slides |
| 12 | Seed clearly labelled demo data | Next | Repeatable setup and reset |
| 13 | Test failures, retries, access control | Next | Results documented |
| 14 | Polish design and accessibility against HTML references | Next | Visual review gate
completed |
| 15 | **Build pitch deck and slides** | **Critical near deadline** | Deck states pivot honestly;
slides designed against design tokens |
| 16 | Prepare demo script, architecture explanation, README, submission | Critical near
deadline | Fresh run succeeds; claims match implementation |
| 17 | Record limitations, next steps | Critical near deadline | No hidden blockers, no
unsupported claims |

### Ten-day outline

- **Day 1:** Read rules/waiver, inspect repo + HTML references, lock demo scenario, pitch
narrative, pivot statement. Claim Baseten credit.
- **Day 2:** Define API contract, data model, UI sketch, pitch deck skeleton.
- **Days 3–4:** Build and test core API (candidates, goals, commitments, events, progress).
- **Day 5:** Build intervention queue (deterministic ranking, explainability). Add MCP integration.
- **Day 6:** Add AI queue rationale (fallback string). Add case summary / follow-up draft if time.
- **Day 7:** Build compact dashboard (timeline, queue, outcomes). Build Lab view.
- **Day 8:** Test failures, idempotency, permissions, full workflow. Seed demo data.
- **Day 9:** Visual review against HTML references. **Finish pitch deck.** Documentation,
demo script, submission materials.
- **Day 10:** Freeze features. Rehearse pitch and demo. Verify links, environment. Submit.

If fewer than ten days remain, cut features rather than compressing pitch and submission
preparation. The pitch is the deliverable.

---

## 7. Demo story, pitch narrative, and evidence

### 7.1 The demo (what judges see)

Use a fictional skills-training organisation ("Umwayi Skills Lab") and candidate ("Amina").

1. Staff open the **Intervention Queue**. Three items: overdue milestone, due check-in,
evidence gap (milestone marked complete, no `user-confirmed` event).
2. Each item shows a one-sentence AI rationale: *"This check-in was due 2 days ago. Last
recorded event: mock interview completion."*
3. Staff click through to the **candidate timeline**. Confirm evidence on the evidence-gap item.
4. Queue updates. The confirmed item disappears.
5. Staff open the **Outcomes** dashboard. Placement and retention metrics from stored
records.
6. Staff open the **Lab**. Experiment log, observability, pitch materials.
7. **Pitch moment:** "This queue is the data foundation. Every confirmed follow-up is a labeled
example. The next step is training a retention-risk signal on this data and selling it to
employers."
Demonstrate one failure case (duplicate event with same idempotency key) and one
model-unavailable case (fallback string).

The demo should prove one useful capability (a deterministic queue with provenance and
explainability) rather than many disconnected screens.

### 7.2 What to measure (and what not to claim)

Record real measurements where practical:
- Time and steps for an agent to create and update a candidate goal
- Correctness of progress calculation against a known fixture
- Duplicate-event behaviour
- Behaviour when the Meta AI API is unavailable
- Queue ranking determinism (same inputs → same order)

Do not invent latency, productivity gains, accuracy percentages, customer demand, or cost
savings. Label measurements as local demo results, not production benchmarks.

### 7.3 The pitch (what judges hear) — the deliverable

**Structure (5 minutes, then Q&A):**

1. **Origin (30s):** "We started with a simple observation: hype culture dysregulates people.
The antidote is consistency. We built a consistency tracker for training programmes. That led us
here."
2. **Problem (45s):** "Training programmes produce developers. Employers lose them in the
first 90 days to soft-skill failures, not technical ones. The employer bears the cost. No one is
capturing the early signals."
3. **What we built (60s):** "A deterministic intervention queue and evidence-backed timeline for
programme staff. Every confirmed follow-up is a labeled data point. The queue is explainable,
auditable, and works without AI in the critical path."
4. **The pivot (60s):** "The queue is the data foundation for retention-risk intelligence sold to
employers. The hackathon proves the foundation. The signal is the next step. We are honest:
the predictor does not exist yet. Employer willingness-to-pay is unvalidated. This is a thesis, not
a product."
5. **Why it matters (45s):** "Andela's own data says soft skills, not technical ability, cause
retention failure. The employer pays for that failure. We are building the data to flag it before it
happens."
6. **The ask (30s):** "Partner with one training organisation and one employer. Let us collect
queue data and test whether early signals correlate with retention outcomes. The hackathon
proves we can build the foundation. The next step proves the signal."
7. **Limitations (30s):** "What we have not proven: signal accuracy, employer
willingness-to-pay, staff preference over spreadsheets. What we have proven: the data model
exists and the queue works."
8. **The lab (15s):** "Our experiment log is in the Lab view. Every success, failure, projection is
recorded. The hackathon is the first experiment."

**Deck structure (10-12 slides):**

| Slide | Content | Visual |
|---|---|---|
| 1 | Title: Umwayi-RM — The Shepherd's Staff | Logo (restrained shepherd motif), amber
accent |
| 2 | The origin: hype → consistency | Timeline of the origin story |
| 3 | The problem: training → placement → retention failure | Simple flow diagram |
| 4 | The insight: soft skills, not technical, cause failure | Quote from Andela data; citation |
| 5 | What we built: the intervention queue | Screenshot of queue (real UI) |
| 6 | How it works: deterministic, explainable, auditable | Diagram: records → rules → queue |
| 7 | The data foundation | Diagram: confirmed follow-ups → labeled data |
| 8 | The pivot: retention intelligence for employers | Buyer, cost of failure, market evidence |
| 9 | What we have proven | Demo results, test results |
| 10 | What we have not proven | Honest limitations |
| 11 | The ask | Partner, next step |
| 12 | The Lab: experiment log | Screenshot of Lab view |

**Deck design rules:**
- Same design tokens as the UI (amber, white-on-canvas, system font, 18px radius).
- One idea per slide. No bullet walls.
- Every claim has a citation or a "not proven" label.
- No fake metrics, no fake customers, no fake testimonials.
- The shepherd motif appears on the title slide and the closing slide only.

### 7.4 Submission narrative (for the portal)

1. **Problem:** Organisations train people; employers lose them to soft-skill failures in the first
90 days; no one captures the early signals.
2. **Solution (demo):** A deterministic intervention queue and evidence-backed timeline for
programme staff. Every confirmed follow-up is a labeled data point.
3. **Pivot:** The queue is the data foundation for retention-risk intelligence sold to employers.
The hackathon proves the foundation.
4. **Technical choices:** Deterministic state, idempotency, provenance, human-approved AI
summaries, Muse Spark Open via Baseten.
5. **Limitations:** Predictor does not exist. Employer willingness-to-pay unvalidated. Staff
preference over spreadsheets unvalidated. The hackathon is a foundation demo, not a product
launch.
6. **Next step:** Partner with one training org and one employer to collect queue data and test
signal correlation.
---

## 8. Market and competitor discipline

Study adjacent products: case-management tools, ATS/LMS/HRIS, agent memory services,
MCP servers, durable workflow engines, retention analytics platforms. Do not claim no one else
supports long-running agents or candidate tracking.

For every competitor claim, record:
- Product and source URL
- What it demonstrably does
- What remains unclear
- Where Umwayi-RM overlaps
- What potential difference still needs validation

Keep this research in `docs/research/competitors.md`, not in the demo UI.

**Key claims to verify before the pitch:**
- Andela's 90-day churn data and soft-skill failure attribution (cite source).
- Employee attrition prediction market size and growth (cite source).
- Generation Kenya or comparable org's outcome-based payout structure (cite source).

---

## 9. Records and repository hygiene

Maintain these files:
- `HACKATHON.md` — this instruction manual and scope decisions
- `docs/hackathon-log.md` — dated decisions, experiments, verification results, blockers,
rules/deadlines
- `docs/api-contract.md` — endpoint/tool definitions, requests/responses, state transitions
- `docs/design-decisions.md` — design comparisons against HTML references, deliberate
deviations
- `docs/demo-script.md` — exact demo path, setup, reset, fallback
- `docs/pitch-deck.md` — slide-by-slide content, speaker notes, citations
- `docs/research/competitors.md` — sourced competitor observations, open questions
- `README.md` — setup, architecture, supported features, limitations, demo instructions

For each completed task, record what changed, why, tests or verification, results, known gaps,
file paths or commit.

Never say "verified" unless verification was performed. Distinguish `built`, `tested`,
`manual-verified`, `deployed`, `not verified`.
---

## 10. Definition of done

- [ ] One clear problem, target user (programme staff), and buyer (employer) are stated.
- [ ] The core API contract is documented.
- [ ] The demo workflow runs end to end from an agent tool call.
- [ ] The intervention queue ranks items deterministically and displays a one-sentence AI
rationale per item.
- [ ] Candidates, goals, commitments, events, and progress use real stored state.
- [ ] Progress is deterministic and explainable.
- [ ] The system handles duplicate writes and at least one failure case.
- [ ] Meta AI (Muse Spark) output is validated, grounded in records, has a fallback.
- [ ] AI-generated messages require human approval before sending.
- [ ] The **Lab** view shows experiment records and observability.
- [ ] The model's "prune" capability requires user approval and is logged.
- [ ] No secrets or private data are exposed; demo data is synthetic and labelled.
- [ ] UI is inspected in a real browser at desktop and mobile widths, against HTML references.
- [ ] Main interactions have loading, empty, success, error states.
- [ ] Tests pass; results recorded.
- [ ] README setup works from a clean environment.
- [ ] Demo data is labelled and resettable.
- [ ] **The pitch deck is finished and states the pivot honestly.**
- [ ] **The pitch explicitly states what the hackathon does not prove.**
- [ ] **The pitch cites sources for Andela data, market size, and buyer cost of failure.**
- [ ] No fake predictor or risk score is shown in the demo or the deck.
- [ ] Known limitations and next validation steps are stated.
- [ ] Submission completed before the official deadline.

---

## 11. Final operating rule

**The pitch is the deliverable. The demo supports the pitch. The code supports the demo.**

Umwayi-RM should not pretend to be smarter than its evidence. The queue is deterministic. The
AI explains, it does not decide. The pivot is stated honestly: the queue is the data foundation for
retention intelligence sold to employers. The hackathon proves the foundation. The next step
proves the signal.

The hackathon succeeds if a judge understands the problem, sees the foundation working,
hears the pivot stated honestly, and believes the next experiment is worth funding — not
because the demo contains AI, but because the thesis is credible and the builder is honest
about what is not yet proven.

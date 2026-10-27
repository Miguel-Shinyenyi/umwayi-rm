# docs/hackathon-log.md — Umwayi-RM Hackathon Log

> **Purpose:** Dated decisions, experiments, verification results, blockers, rules and deadlines.
This is the running record and the evidence base for the pitch's honesty claims.
> **Rule 1:** Append, do not rewrite. Corrections are new dated entries that supersede earlier
ones.
> **Rule 2:** Status vocabulary: `proposed`, `accepted`, `rejected`, `superseded`, `built`,
`tested`, `manual-verified`, `deployed`, `not verified`, `blocked`, `done`. Never write "verified"
without the evidence below it.
> **Rule 3:** Every entry cites its source: a file path, a commit SHA, a command output, a URL
+ date read.
> **Rule 4:** This file is the Lab's data source. The pitch's slide 12 (the Lab) points here.

---

## How to use this log
Append a new entry for:
- Every decision that changes scope, architecture, the demo path, or the pitch.
- Every rule / deadline / eligibility fact read from the official hackathon pages.
- Every experiment (what was tried, what happened, what was learned).
- Every verification (what was run, expected vs actual, pass/fail).
- Every blocker (what is stuck, what unblocks it, owner).
- Every council or board review that changes direction.

Each entry uses the template below. Keep entries short — one decision per entry where
possible.

### Entry template

```
### YYYY-MM-DD — <short title>
**Type:** decision | rule | experiment | verification | blocker | change | council
**Status:** proposed | accepted | rejected | superseded | built | tested | manual-verified | not
verified | blocked | done
**Context:** Why this matters / what prompted it.
**What changed / what was done:** Concrete description.
**Evidence:** Commands run, links, file paths, commit SHAs, screenshots, test output.
**Result:** Outcome and confidence level.
**Open questions / follow-ups:** What still needs doing, if anything.
```

---

## Pre-hackathon: rules, deadlines and eligibility

### 2026-10-24 — Official rules, deadlines, and track chosen
**Type:** rule
**Status:** accepted
**Context:** Hackathon operates under a waiver and Official Rules; scope, eligibility,
submission, and IP terms constrain what we build and how we present it. The hackathon page
was read on 2026-10-24.

**Sources checked:**
- Hackathon main page: https://cerebralvalley.ai/e/meta-ai-developer-hackathon — read
2026-10-24
- Event waiver / application overview:
https://cerebralvalley.ai/e/meta-ai-developer-hackathon/waiver — read 2026-10-24
- Official Rules: to be published before Oct 26, 2026 — must be read and accepted before the
hackathon begins
- Submission portal: https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit
**Facts recorded (per hackathon page, subject to change by Meta):**
- Applications opened: Oct 13, 2026, 9:00 AM ET
- Application deadline: Oct 25, 2026, 11:59 PM ET (or earlier if 20,000 spots fill)
- Applicant approval notification: by Oct 26, 2026, 9:00 AM ET
- Hackathon begins: Oct 26, 2026, with kickoff livestream
- Live workshops + office hours: Oct 27 – Nov 4, 2026 (Discord)
- Submissions due: Nov 4, 2026, 9:00 PM ET
- Judging: Nov 4 – Nov 8, 2026
- Closing ceremony: Nov 9, 2026
- **Tracks:** Indie Developer (solo/students, teams up to 4) **or** Startup (technical founders).
Pick one only.
- **Judging weights:** Impact 30%, Use of Meta AI Tooling 25%, Technical Depth & Execution
20%, Demo 25%.
- **Meta Model API credits:** $150 over the 10-day build.
- **Prize pool:** $1,000,000 total; Indie track: $150k / $100k / $75k / $50k / $25k; Startup track:
$250k / $150k / $75k / $50k / $25k; plus up to $50k in bonus prizes.
- **Inference partners:** Baseten (100𝑐𝑟𝑒𝑑𝑖𝑡 + 2𝑀𝑇𝑃𝑀), 𝑀𝑜𝑑𝑎𝑙(100 credit), Fireworks ($25
credit + workshop).
- **Themes:** "Build for Your World" (domain-specific problem) and "Push the Frontier" (new
capabilities). Umwayi-RM fits "Build for Your World."
- **Eligibility notes:** 18+; not in sanctioned jurisdictions (Belarus, China, Russia, Ukraine, Syria,
Crimea/Donetsk/Luhansk, Cuba, North Korea, Iran); not employees/contractors/interns of Meta
or Cerebral Valley; not government-affiliated.
- **IP terms:** Entrant retains ownership; grants Organizers a perpetual, irrevocable, worldwide,
royalty-free, non-exclusive licence to use the submission for marketing and demonstration.

**Track chosen:** _Indie Developer or Startup — decide before Day 1 and record here._
**Rationale:** _TBD._

**Open questions / follow-ups:**
- Read the Official Rules when published (before Oct 26); accept them in the portal.
- Confirm submission format requirements (video length, repo access, etc.) when published.

---

## Scope and product decisions

### 2026-10-24 — Council review: submitted product is not a business; pivot adopted
**Type:** council
**Status:** accepted
**Context:** Three adversarial review frameworks (LLM Council, Board with
Offers/Monopoly/Product lenses, Claude Council) were run against the submitted thesis
(intervention tracker for training NGOs). The hackathon is a pitch evaluation, not a field test.
**Findings (converged across all three councils):**
- The submitted product (tracking for training organisations) has no visible buyer with budget
and no willingness-to-pay evidence.
- The pivot — retention-risk intelligence sold to employers who hire from training pipelines —
has a buyer with budget, a clear cost of failure, and a market that exists.
- The pivot is the business thesis. The tracker is the data foundation.
- The AI must not be the core value; it is a summarisation layer. The queue is deterministic.

**Decision:**
- Demo the deterministic intervention queue and evidence-backed timeline as the data
foundation.
- Pitch the pivot explicitly. Do not fake the predictor.
- State what the hackathon does **not** prove.
- Rank pivots: A (retention intelligence for employers) primary; B (outcome verification for
funders) secondary; C (consistency infrastructure) origin story; D (onboarding tracker) rejected.

**Evidence:**
- Council reports summarised in `HACKATHON.md` §1.7.
- Verified claims and sources in `docs/research/competitors.md`.
- Pitch structure and slide copy in `docs/pitch-deck.md`.

**Result:** Pivot adopted. The submitted framing is not pitched as the business. The pivot is
pitched as the thesis. Confidence: medium-high (the pivot is credible; willingness-to-pay is
unvalidated).

**Open questions / follow-ups:**
- Employer willingness-to-pay (next experiment, not hackathon claim).
- Signal accuracy (next experiment, not hackathon claim).
- Whether training orgs would pay for the queue as a standalone tool (open).

---

### 2026-10-24 — Demo scope narrowed: chat removed, queue is the hero
**Type:** decision
**Status:** accepted
**Context:** The Shepherd chat was in earlier drafts as the primary interaction layer. Council
review and time constraints forced a re-scope.

**Decision:**
- The chat interface is removed from the demo. It is a last-resort experiment if time permits after
the queue, timeline, dashboard, Lab, pitch deck, and submission are complete.
- The intervention queue is the hero surface of the demo.
- AI provides a one-sentence rationale per queued item. If the model is unavailable, a fallback
string is shown; the queue still works.
- The demo path is 6 steps, 3:00 target, 4:00 hard stop (see `docs/demo-script.md`).

**Evidence:** `docs/demo-script.md` §2 and §8; `HACKATHON.md` §1.4, §4.1, §7.1.

**Result:** Scope narrowed. Confidence: high.

**Open questions / follow-ups:**
- If time permits on Day 8–9, evaluate whether a minimal chat adds to the demo without risking
the pitch. Default: no.

---

## Model and infrastructure decisions

### 2026-10-24 — Baseten chosen as inference partner; Muse Spark Open primary, Muse
Spark 1.3 fallback
**Type:** decision
**Status:** accepted
**Context:** Three inference partners were offered on the hackathon page. A choice was
needed before any AI code was written.

**Comparison:**

| Partner | Credit | Rate Limit | Billing | Fit |
|---|---|---|---|---|
| **Baseten** | **$100** | **2M TPM** | Per-second GPU | **Chosen** — highest credit + rate
limit, MCP integration documented |
| Modal | 100|𝑁𝑜𝑡𝑠𝑝𝑒𝑐𝑖𝑓𝑖𝑒𝑑|𝑃𝑒𝑟 − 𝑠𝑒𝑐𝑜𝑛𝑑𝐺𝑃𝑈(~3.95/hr H100) | Runner-up — strong DX, credit
burns faster |
| Fireworks | $25 | Not specified | Per-token | Weakest fit — smallest credit |

**Model choice:**
- **Primary:** Muse Spark Open via Baseten (covered by $100 credit; 816B/42B active; 1M
context; multimodal; agentic).
- **Fallback:** Muse Spark 1.3 via Meta Model API ($150 credits; reserved for complex
reasoning).
- **Not chosen:** Muse Spark 1.3 as primary — not available through partner platforms, so it
would consume Meta credits faster than necessary.

**Evidence:**
- Hackathon page partner listings (read 2026-10-24).
- Model availability confirmed via partner documentation (to be re-verified when credit is
claimed).

**Result:** Partner and model chosen. Confidence: medium-high (need to verify Muse Spark
Open latency on Baseten once credit is claimed).

**Open questions / follow-ups:**
- Claim the Baseten credit; record claim date and credit amount in a new entry.
- Verify Muse Spark Open reachability and latency; record measured latency.
- Confirm the fallback string behaviour in `ai-assistant` adapter.
- Record the `META_AI_FALLBACK_ONLY=true` test result once implemented.

---

### 2026-10-24 — Do not switch to Supabase; keep Spring Boot + Postgres
**Type:** decision
**Status:** accepted
**Context:** Considered switching the backend to Supabase to enable model-driven schema
changes (adding columns dynamically). The consideration was rejected.

**Reasons for rejection:**
- **Dynamic schema alteration** is a determinism and security risk. It requires the `service_role`
key, which bypasses row-level security. Not acceptable for a 10-day demo.
- **Free tier pauses after 7 days of inactivity**, which would break the demo between
rehearsals.
- **Bandwidth and realtime limits** on the free tier are tight for a chat platform (though the chat
is now out of scope).
- The current Spring Boot + Postgres stack is proven and understood.

**Evidence:** `HACKATHON.md` §5.1.

**Result:** Stack unchanged. Confidence: high.

**Open questions / follow-ups:** None.

---

## Experiments

### YYYY-MM-DD — Muse Spark Open latency on Baseten
**Type:** experiment
**Status:** proposed
**Context:** Need to know whether Muse Spark Open via Baseten is fast enough for the queue
rationale (one sentence per item, 3 items = 3 model calls per queue render).
**What to do:** Send 3 representative prompts (one per queue item type) and record:
- End-to-end latency per call (p50, p95 over 5 runs).
- Token count (input, output).
- Whether structured output (JSON) is reliably returned.
- Cost per call.
**Evidence (to fill in):** `docs/experiments/baseten-latency.md` (or a section here).
**Result:** _TBD._
**Open questions / follow-ups:** If latency > 2s per call, consider caching the rationale per
queue state or generating rationale on queue state change (event-driven) rather than on every
render.

---

### YYYY-MM-DD — Idempotency behaviour under retry
**Type:** experiment
**Status:** proposed
**Context:** The demo step 5 relies on idempotency. If the API does not deduplicate correctly,
the demo fails.
**What to do:** Send the same `POST /candidates/{id}/events` twice with the same
`Idempotency-Key` header; verify:
- Second call returns the same `event_id`, no duplicate row.
- Different key with same payload creates a new event (expected).
**Evidence (to fill in):** curl output, DB count.
**Result:** _TBD._
**Open questions / follow-ups:** If the API does not deduplicate, implement it before Day 5.

---

## Verifications

### YYYY-MM-DD — End-to-end demo path verified
**Type:** verification
**Status:** not verified
**Context:** Confirm the demo path (`docs/demo-script.md` §2) works with real state, not
mocked, from the seed to the final screen.
**What to do:** Run the 6-step demo path against the seeded demo, timed. Record:
- Per-step timing.
- Any fallback used and why.
- Any UI defect found.
**Evidence (to fill in):** screen recording path, timing log, screenshot paths.
**Result:** _TBD._
**Open questions / follow-ups:** Any step over its target time; any defect blocking a step.

---
### YYYY-MM-DD — Seed script produces deterministic demo state
**Type:** verification
**Status:** not verified
**Context:** The demo must reset to identical state each run.
**What to do:** Run `scripts/seed-demo.sh`, record the returned IDs, run `docker compose
down -v` and re-seed, compare IDs and state.
**Evidence (to fill in):** output of `curl -s localhost:8080/api/v1/candidates?demo=true | jq '.[].id'`
on run 1 and run 2; the seed script's git SHA.
**Result:** _TBD._
**Open questions / follow-ups:** If IDs differ between runs (because the DB generates new
UUIDs), confirm the demo does not depend on specific IDs.

---

## Blockers

### YYYY-MM-DD — <blocker title>
**Type:** blocker
**Status:** blocked
**Context:** _What is stuck._
**What changed / what was done:** _Attempts so far._
**Evidence:** _Error messages, links._
**Result:** _Current state._
**Open questions / follow-ups:** _What unblocks this; owner; target date._

---

## Pitch and timing decisions

### YYYY-MM-DD — Pitch timing strategy
**Type:** decision
**Status:** proposed
**Context:** `docs/pitch-deck.md` and `docs/demo-script.md` both overrun their targets when
the full deck and the full demo are combined. A strategy must be chosen before rehearsal.

**Options:**
1. Run the demo as a separate segment (judging format permitting) — deck stays ~6:00.
2. Cut slides 2 and 7 from the live pitch — deck ~7:30 with demo.
3. Compress the demo to 60 seconds (steps 1–4 only) — total ~7:00.

**Decision:** _TBD — record before first rehearsal._
**Evidence:** `docs/pitch-deck.md` §Timing summary; `docs/demo-script.md` §8.
**Result:** _TBD._
**Open questions / follow-ups:** Confirm the judging format (deck-only, demo-only, or
combined) when Official Rules are published.

---

### YYYY-MM-DD — Deck build tool and export path
**Type:** decision
**Status:** proposed
**Context:** The deck must be exportable to PDF and PPTX for submission, with no font
substitution issues.
**Decision:** _TBD — Google Slides / Keynote / HTML-to-PDF._
**Evidence:** _TBD._
**Result:** _TBD._
**Open questions / follow-ups:** Test export on Day 9.

---

## Limitations and open research (the Lab's evidence base)

### 2026-10-24 — Limitations log started
**Type:** change
**Status:** accepted
**Context:** The brief requires honest recording of what is simulated, unbuilt, and awaiting
real-user validation. This log is the source for pitch slide 10.

**Limitations currently accepted:**
- Demo data is synthetic; no real programme staff or candidates have used the system yet.
- Market demand for a dedicated follow-through API (vs. spreadsheets / case-management
tools) is a hypothesis, not validated.
- Placement vs. retention as the strongest first signal is unresolved.
- ATS / LMS / HRIS integrations are not built.
- Predictive risk scores are out of scope; the intervention queue uses explicit rules only.
- Mobile responsiveness has only been verified at the stated viewports (record which).
- Authentication / authorisation is minimal; not production-grade.
- Data-protection posture (e.g. Kenya Data Protection Act) has not been formally assessed; do
not describe the system as compliant.
- The retention-risk signal does not exist. The predictor has not been trained or tested.
- Employer willingness-to-pay is unvalidated.

**Open questions / follow-ups:**
- Add entries as the build progresses; remove entries only when the limitation is genuinely
resolved.
- Keep this section aligned with `HACKATHON.md` §1.6 and `README.md` Known Limitations.
---

## What this file is not

- It is not the brief. That is `HACKATHON.md`. If this log and the brief disagree, the brief wins
and this log is corrected by a new entry.
- It is not the pitch deck. That is `docs/pitch-deck.md`. The log supplies evidence; the deck cites
it.
- It is not a substitute for `docs/research/competitors.md`. That file holds the verified external
claims; this log records the decisions that depended on them.

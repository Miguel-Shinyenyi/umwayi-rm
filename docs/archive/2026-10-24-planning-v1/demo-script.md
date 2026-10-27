# docs/demo-script.md — Umwayi-RM Demo Script

> **Purpose:** The exact, rehearsed path through the demo — setup, the narrative, reset, and
fallback. If this script cannot be run cleanly from a fresh environment, the demo is not ready.
> **Rule 1:** Every number, status, and chart shown must come from the API or be labelled as
seeded sample data.
> **Rule 2:** AI output is a *proposal* for staff review, never an automatic action.
> **Rule 3:** The demo supports the pitch. It does not replace it. `docs/pitch-deck.md` is the
deliverable.
> **Rule 4:** If a step fails live, use the fallback for that step. Do not improvise a claim that was
not demonstrated.

**Status:** Draft — rehearse and update after each run. Record run results in
`docs/hackathon-log.md`.
**Total demo time:** 3:00 target, 4:00 hard stop.
**Presenter:** Miguel Shinyenyi.

---

## 0. Pre-demo checklist (run ~15 minutes before)

- [ ] `.env` populated (Meta AI API key / Baseten key, DB URL, JWT/session secret) — never
committed.
- [ ] `docker compose up -d` healthy (Postgres + API + frontend + MCP server).
- [ ] Migrations applied and demo seed loaded (`scripts/seed-demo.sh`).
- [ ] Baseten credit confirmed, Muse Spark Open reachable **or** fallback mode confirmed
working.
- [ ] Browser at demo resolution (e.g. 1440×900), light theme by default; dark theme toggled
once in rehearsal.
- [ ] Tabs pre-opened: Overview, Candidates → Amina, Interventions, Outcomes, Lab.
- [ ] Terminal window pre-opened with the MCP client ready (in case the agent step is shown via
CLI).
- [ ] Fallback artefacts ready: recorded screen capture of the demo path, plus a static HTML
snapshot of the dashboard.
- [ ] Timer visible: total demo target **3:00**; hard stop **4:00**.
- [ ] `docs/hackathon-log.md` open to note anything that goes wrong during rehearsal.

---

## 1. Cast and scenario (fictional, labelled as demo data)

- **Organisation:** Umwayi Skills Lab (fictional).
- **Programme:** Backend Engineering Cohort 7.
- **Candidate:** **Amina** — completed training, awaiting placement, needs follow-up.
- **Staff member:** "Programme Lead" (you, the presenter, in the staff role).
- **Agent:** an MCP-connected assistant that calls Umwayi-RM tools (used for one step only —
the queue is the hero).

**Labelling:** every screen in demo mode shows a subtle "Demo data" badge; the seed script
writes a `demo: true` flag visible via the API. No real candidate data is used.

---

## 2. The demo narrative (the canonical 6-step path, 3:00 target)

> Each step lists: **what to show**, **what to say (one line)**, **what proves it worked**, and
**fallback if it fails**.
> The demo is 6 steps, not 8. The chat is not in the demo. The queue is the hero.

### Step 1 — Frame the problem (20s, Overview tab)
- **Show:** Overview page: service status, recent activity, queue shortcut.
- **Say:** "Programme staff have to follow up with candidates every day. Follow-ups slip.
Evidence is scattered. This is the queue that prevents the slip."
- **Proves:** The system is live and exposes real state.
- **Fallback:** Narrate from the static HTML snapshot.

### Step 2 — The intervention queue (45s, Interventions tab)
- **Show:** The intervention queue: three items — an overdue milestone, a due check-in, an
evidence gap. Each item shows a one-sentence AI rationale.
- **Say:** "Three items. Ranked by explicit rules, not by a model. The model writes one
sentence explaining *why* each is queued. If the model is down, the queue still works."
- **Proves:** `GET /programmes/{id}/interventions` returns ranked items with `reason` and a
rationale string. The ranking is deterministic and explainable.
- **Fallback:** Show the JSON response in the terminal.

### Step 3 — The candidate timeline (45s, Candidates → Amina → Timeline)
- **Show:** Amina's timeline: reverse-chronological events, each with a provenance badge
(`user-confirmed` / `agent-reported` / `unverified`). The evidence-gap item is visible.
- **Say:** "Every event has provenance. User-confirmed evidence is different from
agent-reported claims. The queue surfaces the gaps — milestones marked complete with no
confirmed evidence."
- **Proves:** The timeline shows real stored events with source attribution. The evidence-gap
item is derived from the record, not invented.
- **Fallback:** Show the JSON for the candidate's events.

### Step 4 — Confirm evidence and watch the queue update (40s, Timeline → Interventions)
- **Show:** Click the evidence-gap item. Confirm the evidence (mark `user-confirmed`). Return
to the queue. The item is gone. The remaining items re-rank.
- **Say:** "Staff confirm evidence. The queue updates. Every confirmation is a labeled data
point — commitment kept, evidence confirmed, milestone on time."
- **Proves:** The write path works. The queue is derived from state, not a static list.
- **Fallback:** Show the `POST /candidates/{id}/events` call in the terminal, then refresh the UI.

### Step 5 — Agent records an event (30s, MCP terminal)
- **Show:** In the MCP client, call `record_event` for "milestone.completed" (mock interview
passed), `source: user-confirmed`, `idempotency_key: <uuid>`. Then refresh the timeline.
- **Say:** "An agent records what happened — with provenance and an idempotency key.
Re-running the same call returns the same event; no duplicate."
- **Proves:** Event appears in the timeline with the `user-confirmed` badge. Re-running the
same call returns the same event ID.
- **Fallback:** Show the pre-recorded terminal capture, then show the event already in the
timeline via the UI.

### Step 6 — Outcomes and the Lab (20s, Outcomes → Lab)
- **Show:** Outcomes dashboard: placement and retention counts from stored records. Then
the Lab: experiment log, observability, pitch materials.
- **Say:** "The outcomes are measured from records, not projected. The Lab records every
experiment. This hackathon is experiment number one."
- **Proves:** `GET /programmes/{id}/outcomes` returns computed metrics. The Lab shows log
entries and observability data.
- **Fallback:** Show the JSON for outcomes; show the Lab screenshot.

---

## 3. Spoken narrative (submission voice-over outline, ~60–90s)
> Use this as the skeleton for the demo video voice-over. Adapt wording; keep claims matched
to what was verified.
> The full pitch narrative is in `docs/pitch-deck.md`. This is the demo-only voice-over.

1. **Hook:** "Programme staff train people. Their follow-ups slip. The evidence is scattered. The
employer pays the cost of early churn."
2. **What we built:** "A deterministic intervention queue and an evidence-backed timeline.
Every confirmed follow-up is a labeled data point."
3. **How it works:** "The queue is ranked by explicit rules. The model writes one sentence
explaining why each item is there. If the model is down, the queue still works."
4. **The pivot (one line only):** "The queue is the data foundation for retention intelligence sold
to the employer who bears the churn cost. The hackathon proves the foundation."
5. **Limitations:** "The predictor does not exist yet. Employer willingness-to-pay is unvalidated.
This is a thesis, not a product."

---

## 4. Reset procedure (repeatable demo state, under 60 seconds)

> Must produce identical starting state each run.

```bash
# 1. Stop and reset database volume
docker compose down -v

# 2. Rebuild and start services
docker compose up -d --build

# 3. Run migrations
docker compose exec api ./gradlew flywayMigrate

# 4. Seed demo data (writes demo:true records)
docker compose exec api ./scripts/seed-demo.sh

# 5. Verify seed
curl -s localhost:8080/api/v1/health | jq .
curl -s localhost:8080/api/v1/candidates?demo=true | jq '.[].id'
```

**Success criteria:** Amina exists with a goal, 2 milestones outstanding, 1 completed, and a
retention commitment due in 2 days. Record the seed script's git SHA in the log.

---
## 5. Fallback plan (if live demo breaks)

Priority order:

1. **Live UI + live API** (preferred).
2. **Live UI + pre-recorded MCP terminal capture** (if the model/agent fails).
3. **Static HTML snapshot + pre-recorded screen capture** (if the stack is down).
4. **Slide-only narrative** (worst case) — still state the problem, the design, and the verified
pieces honestly.

**Non-negotiable:** whatever fallback is used, do not claim something was "live" or "verified"
that wasn't. Say "this is a recorded run" if it is.

---

## 6. What NOT to do in the demo

- Do not type live API keys or secrets on screen.
- Do not open real candidate data, real org data, or personal messages.
- Do not claim metrics, latency, or productivity gains that were not measured.
- Do not auto-send the AI follow-up — always show the human approval gate.
- Do not present unbuilt features as "coming soon" during the demo; that's for the narrative, not
the demo.
- Do not exceed the 4-minute hard stop.
- Do not demo the chat interface. It is not part of the demo. If asked, say "the chat is a later
experiment; the queue is the foundation."
- Do not show a fake predictor or risk score. The pivot is stated in the pitch, not faked in the UI.

---

## 7. Post-demo checklist

- [ ] Log run result in `docs/hackathon-log.md` (verification entry): what was shown, live vs.
recorded, what failed, what was improvised.
- [ ] Save the recording with timestamp and store path.
- [ ] Note any candidate limitations surfaced during Q&A.
- [ ] If anything claimed in the pitch wasn't demonstrated, correct the pitch and the brief.
- [ ] If the demo overran the 3:00 target, log which step was slow and why.
- [ ] If any fallback was used, log which one and why.

---

## 8. Timing summary
| Step | Surface | Time | Cumulative |
|---|---|---|---|
| 1 | Overview | 0:20 | 0:20 |
| 2 | Interventions | 0:45 | 1:05 |
| 3 | Timeline | 0:45 | 1:50 |
| 4 | Timeline → Interventions | 0:40 | 2:30 |
| 5 | MCP terminal | 0:30 | 3:00 |
| 6 | Outcomes → Lab | 0:20 | 3:20 |
| **Total** | | **~3:20** | **3:20** |

**This exceeds the 3:00 target by 20 seconds.** The honest fix is one of:

1. **Compress step 5 to 15s** (show the event already recorded; do not type in terminal live) →
3:05.
2. **Compress step 3 to 30s** (show the timeline briefly, do not walk through every event) →
3:05.
3. **Cut step 6 to 15s** (show outcomes only, skip Lab; the Lab is on slide 12 of the deck) →
3:15.

**Decision to record in `docs/hackathon-log.md` before rehearsal:** which compression is used,
and why. Do not ship a demo that overruns the format.

---

## 9. Pre-rehearsal checklist (run once per rehearsal)

- [ ] Fresh reset performed (section 4).
- [ ] Seed verified (Amina exists, 3 queue items, 1 overdue).
- [ ] All six surfaces loaded once (Overview, Interventions, Timeline, Outcomes, Lab, MCP
terminal).
- [ ] Timer started before step 1.
- [ ] Fallback artefacts confirmed available (screen capture, static snapshot).
- [ ] No browser extensions or notifications visible.
- [ ] Screen resolution and font size match the presenter's setup.
- [ ] If using a secondary display, the demo is on the primary.

---

## 10. What this file is not

- It is not the pitch deck. That is `docs/pitch-deck.md`. The deck is the deliverable; the demo
supports it.
- It is not the brief. That is `HACKATHON.md`. If this file and the brief disagree, the brief wins
and this file is corrected.
- It is not a record of a completed run. That is `docs/hackathon-log.md`. This file is the script; the
log is the evidence.

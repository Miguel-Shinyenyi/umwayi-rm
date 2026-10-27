# HACKATHON.md: Umwayi-RM, plan v2 (2026-10-26)

Replaces the plan of 2026-10-24. That plan is kept unchanged in `docs/archive/2026-10-24-planning-v1/`.

Builder: Miguel Shinyenyi, solo. Track: Indie Developer. Problem statement: Build for Your World.
Model: Muse Spark Open on Baseten, model id `meta-models/muse-spark-open-1026`.
Status: a plan. Nothing in this file is built until `docs/hackathon-log.md` says so.

## 0. Why v2 exists

The official rules were read on 2026-10-26. Three things in plan v1 do not survive them.

1. New work only. The demo may show only what is built from Oct 27. Plan v1 inherited Routine Machine code and tests. v2 starts a new public repo and rewrites everything it needs.
2. Sample anti-projects. The list names "AI Job Application Screener", "Personality Analyzers", "simple AI for Education chatbots" and "Basic RAG Applications". Plan v1 sold a retention-risk signal on candidates to employers. That is a screener and a profiler. Its AI was one sentence per queue item, which is a thin integration. v2 drops both.
3. Judging. Impact is 30%, Meta tooling 25%, Technical depth 20%, Demo 25%. Plan v1 said "the pitch is the deliverable". The rubric scores a working product and a three minute video. v2 says: the working demo is the deliverable.

Full rule list and compliance table: `docs/rules.md`.

## 1. The product

One sentence: Umwayi-RM is an open-source follow-through agent for community skills-training programmes. It reads what has happened to each learner, finds who is slipping, and proposes the next follow-up. Staff approve every action.

Who it helps first: the staff of small training programmes and the learners who fall through when a follow-up is missed. Free, self-hostable, MIT licence.

What changed from v1:

| | v1 | v2 |
|---|---|---|
| First beneficiary | Employers who buy a risk signal | Programme staff and learners |
| Business | Sell retention intelligence | Open source. Funding route is a later question |
| AI role | One sentence of rationale | An agent that investigates, drafts and extracts, all as proposals |
| Risk scores on people | Planned for later | Never. Not built, not pitched |
| Input | Typed records | Typed records plus a voice note or a photo of a paper register |

The deterministic core stays. Progress, due dates, overdue flags and queue order come from stored records and explicit rules. The model never decides state.

## 2. The demo, in one path

A fictional programme, "Umwayi Skills Lab", with 12 synthetic learners. Every record is labelled demo data.

1. Staff record a 20 second voice note after a session. The agent turns it into proposed events and one proposed commitment. Each proposal quotes the words it came from.
2. Staff approve two, edit one. State changes only on approval.
3. Staff press "Morning review". The agent walks the programme with read tools. The screen shows its steps.
4. The queue shows five ranked follow-ups. Order is deterministic. Each has a drafted message that cites the events it rests on.
5. Staff approve a draft and copy it. Nothing is sent by the system.
6. Failure cases: the model is switched off and the queue still works; the same approval sent twice changes nothing.
7. The Lab shows run traces and eval results.

Target 3:00. Hard stop 3:30. Video rules and script: `docs/demo-script.md`.

## 3. The agent

Design: `docs/agent-design.md`. Summary:

- Workflow first, one agent second. A fixed pipeline computes state. One agent loop handles the two open-ended jobs: intake of a note, and the morning review.
- Single agent. No multi-agent split until a measured failure needs it.
- Tools through an MCP server. Read tools are low risk. Proposal tools write only to a proposals table. No tool changes learner state. No tool sends a message.
- Layered guardrails: schema check, citation check, tool risk ratings, turn limit, human approval.
- Evals are built before prompts are tuned. Results are local, labelled, and shown in the Lab.

The agent is the product's front door. It is also what the rubric and the Best Agentic Use-Case prize look for.

## 4. Use of Meta tooling

- Muse Spark Open on Baseten for the agent loop, tool calls, voice or photo intake and drafting. This also targets the Best Build on Meta Open Weight Models prize, which asks the partner to verify the model.
- Meta Model API ($150 credit) as the fallback model and for any model Baseten does not host.
- Day 1 verification, recorded in the log before anything depends on it: tool calling works, audio input works, image input works, latency, Swahili drafting quality. If a capability fails, its feature is cut, not faked.

## 5. Scope

Build:
- Candidates, goals, commitments, events (append only), progress, interventions.
- Idempotent writes, provenance on every event (user confirmed, agent proposed, unverified).
- MCP server with the tools in `docs/agent-design.md`.
- Agent runs: intake and morning review. Proposal inbox with approve, edit, reject.
- Staff console: Overview, Candidates and timeline, Interventions, Proposals, Lab.
- Eval suite and run traces.
- Synthetic seed and reset.

Do not build: employer views, risk scores, a chat interface, billing, mobile app, ATS or LMS connectors, multi-tenant admin, a general agent framework.

Stretch, only after the freeze checklist is green: photo of a paper register as a second intake.

## 6. Reuse from Umwayi and Routine Machine

New work only means code is not reused. Method, design values and lessons are.

| Borrow | From | How |
|---|---|---|
| Queue with acceptance checks, one task at a time | UMWAYI `queue.md` | New `queue.md` in the repo |
| Short start-of-task context, archive instead of delete | UMWAYI `archive/` | New `CLAUDE.md` under 600 words; history in `docs/archive/` |
| Understanding-first rules | UMWAYI `docs/understanding-first.md` | One-page copy, cited as prior method |
| Prompt template: acceptance checks first, staged gates | UMWAYI `docs/agent-practices.md` | Every prompt to Claude Code |
| Idempotency, provenance, append-only events | Invoice-Financing, Routine Machine | Patterns rewritten from scratch |
| Design tokens (colour, radius, type) | Routine Machine `docs/design.md` | Values copied as CSS variables. Listed in README as prior work |
| Hub-sync dedupe by content hash | Routine Machine | Idea reused for intake dedupe. Code rewritten |
| Owner-only observability page | Routine Machine `/watchtower` | The Lab idea, rebuilt smaller |

The README names everything in the second and fourth rows as prior work. The first commit of code is dated Oct 27 or later.

## 7. Schedule (Nairobi time)

Submission closes Nov 4, 9:00 PM ET, which is Nov 5, 05:00 EAT (US clocks change on Nov 1). Internal deadline: Nov 4, 16:00 EAT. Sessions: Oct 27 and Oct 28, 19:00 EAT; Oct 30, 19:00 EAT. Office hours weekdays 10:00 to 11:00 ET: 17:00 to 18:00 EAT until Oct 31, then 18:00 to 19:00 EAT.

Assumption: about 3 hours a day of your time for decisions, review, recording and the pitch. Claude Code does the coding under reviewed prompts. If your hours differ, tell me and the days move.

| Day | Date | Goal | Done when |
|---|---|---|---|
| 0 | Mon Oct 26 | Rules, plan, credits requested, public repo with docs only | Credits requested; repo public; no code |
| 1 | Tue Oct 27 | Verify the model; repo scaffold; API contract | Model facts logged; `docker compose up` runs an empty API |
| 2 | Wed Oct 28 | Core state: candidates, goals, commitments, events | Tests pass for create, idempotency, access denial |
| 3 | Thu Oct 29 | Progress and queue, deterministic | Same input gives same order; fixtures pass |
| 4 | Fri Oct 30 | MCP server and the first agent run | Agent reads a programme through tools |
| 5 | Sat Oct 31 | Proposals and approval; voice intake | Voice note becomes approved events |
| 6 | Sun Nov 1 | Evals, guardrails, fallback | Eval run saved; model-off mode works |
| 7 | Mon Nov 2 | Console polish, Lab, seed and reset | Fresh clone runs from README |
| 8 | Tue Nov 3 | Feature freeze; record the video; write the submission | Video recorded; repo public check |
| 9 | Wed Nov 4 | Submit by 16:00 EAT | Portal receipt saved |

If a day slips, cut from the stretch list, then from Lab polish. Never cut evals, the fallback or the video.

## 8. Pitch

Pitch order, 3 minutes, no deck needed beyond a title and a closing card:

1. The problem, in one scene from a real programme (only if you have one; otherwise say it is a hypothesis you are testing).
2. The demo path above.
3. How the agent stays safe: proposals only, citations, approval.
4. What is not proven, in one breath.
5. The ask: one pilot programme, one month, and a plain list of what you will measure.

Evidence for the problem has to be real. Day 1 task: contact two programme staff and record what they say, with permission, in `docs/research/interviews.md`. Until that exists, the problem is stated as a hypothesis.

## 9. What the hackathon does not prove

- That staff prefer this to spreadsheets and WhatsApp.
- That drafted follow-ups improve learner outcomes.
- That any model output is accurate beyond the local eval set.
- That the product is secure, compliant with the Kenya Data Protection Act, or production-ready.

## 10. Definition of done

- [ ] Public repo. First code commit is Oct 27 or later. README lists prior work.
- [ ] Demo path runs from a fresh clone.
- [ ] Agent runs on `meta-models/muse-spark-open-1026`; trace in the Lab.
- [ ] Voice intake works, or the feature is cut and the video does not show it.
- [ ] Every agent output is a proposal; nothing is sent; approval is idempotent.
- [ ] Queue is deterministic; model-off mode works.
- [ ] Eval run saved with date, model id and prompt version. Labelled local.
- [ ] All data synthetic and labelled. No secrets in the repo or the video.
- [ ] Three minute video recorded, link public, shows only work built in the window.
- [ ] Submission in by Nov 4, 16:00 EAT.

## 11. Operating rules (kept from v1)

- Check each prompt against the goal and the remaining days before running it.
- One task at a time. Queue in `queue.md`.
- Never write "verified" unless a check was run. Use: built, tested, manual-verified, not verified.
- Do not invent users, metrics, quotes, latency or accuracy.
- If a rule, the code and a claim disagree, fix the claim.

# HACKATHON.md: Umwayi-RM, plan v3 (2026-10-27)

Replaces plan v2 (2026-10-26) and v1 (2026-10-24). Both are kept unchanged in `docs/archive/`.

Builder: Miguel Shinyenyi, solo. Track: Indie Developer. Problem statement: Build for Your World.
Models: Muse Spark Open on Baseten (`meta-models/muse-spark-open-1026`). Meta Model API as fallback.
Status: a plan. Nothing here is built until `docs/hackathon-log.md` says so.

## 0. What changed and why

Miguel chose the savings-group direction on 2026-10-27, after a research and council review (decision D-14). Reasons, in order:

1. Impact and Demo are 55% of the score. A savings group's paper ledger and voice notes give a problem a judge sees solved on screen.
2. The problem is first-hand for a Nairobi builder. (Confirm with two interviews. See `docs/research/interviews.md`.)
3. The ideas Miguel wants to test, restraint against eager guessing and a traceable archive, become measured engineering inside a real product instead of a harness with no user.
4. The agent never writes the ledger. Code does. The model proposes, code checks, the treasurer approves.

The council's scores were model opinions, not data. They ranked this direction first, the programme agent second and the brain harness alone third. The brain harness alone has no user, a weak demo and a mental-health-advisor risk if the reassurance framing is shown. That framing stays out of the product and the video.

## 1. The product

One sentence: Umwayi-RM is an open-source secretary for savings groups. It turns a treasurer's voice notes and photos of the paper ledger into proposed entries, checks them against a deterministic ledger, asks when it is unsure, and drafts gentle reminders. The treasurer approves everything.

Who it helps first: treasurers and members of small savings groups (chamas), who keep records in notebooks and chat messages. Free, self-hostable, MIT licence (decision D-10).

What it does not do: move money, advise on lending, score or rate members, send messages, or decide anything.

Facts for the pitch, with their limits (details in `docs/research/chama-landscape.md`):
- The Ministry of Co-operatives is reported to say chamas manage over Sh300 billion in assets. This is a news report of a ministry statement, not a measured figure.
- One columnist says most groups still use notebooks and that digital tool adoption is low. It is the author's own observation, with no source given.
- Chamasoft, M-Chama, Fundi Chama and a Postbank chama app already exist. We are not the first record-keeping tool. We differ in what we start from (voice notes and paper pages groups already produce) and in how it behaves (asks before guessing, labels evidence). Whether that matters to treasurers is not proven.

## 2. How the Routine Machine ideas live inside it

New work only: nothing is copied from Routine Machine. These ideas are rebuilt from scratch.

| Routine Machine idea | In Umwayi-RM |
|---|---|
| Commitment | A member's promise: contribution due on a date, loan repayment due |
| Evidence and provenance | Every ledger entry carries an evidence tier: statement-confirmed, treasurer-confirmed, agent-proposed and approved, self-reported |
| Deterministic progress | Balances, due, overdue and discrepancies are computed by code |
| Intervention queue | The treasurer's "Today" list: overdue contributions, unmatched items, questions the agent is waiting on |
| Granary (savings, month targets, M-Pesa statement import) | Concept only. Stretch: match synthetic M-Pesa statement lines to entries as the strongest evidence tier |
| Understanding first, rules from mistakes, eager execution | The curated agent pack, measured in section 5 |
| Idempotency, reconciliation (Invoice-Financing) | Idempotent approval; paper-page versus ledger reconciliation |

What flows back: if the evidence tiers and the restraint rules measure well, they are candidates for Routine Machine's granary later. That is a later task, not part of this entry.

## 3. The demo path

A fictional group, "Tumaini Savings Group", 12 synthetic members, monthly contributions. Every record is labelled demo data.

1. The treasurer speaks a note after a meeting: who paid, who promised what. The agent returns proposals, each quoting the words behind it.
2. One line is ambiguous (two members share a first name). The agent does not guess. It asks one question. The treasurer answers.
3. The treasurer photographs a paper ledger page. The agent reads it into proposed rows. Code compares them with the stored ledger and lists discrepancies.
4. The treasurer approves, edits or rejects. State changes only on approval.
5. "Today" shows overdue contributions. The agent drafts gentle reminders that cite the entries behind them. Copy only. Nothing is sent.
6. Failure cases: the model is switched off and "Today" still works; approving twice changes nothing.
7. The Lab shows the run trace and the eval chart: the same model with and without the curated pack, with the honest numbers.

Target 2:50. Script: `docs/demo-script.md`.

## 4. The agent

Design: `docs/agent-design.md`. Summary:
- Workflow first. Code computes state. One agent loop handles intake, photo reading, reconciliation questions and reminder drafts.
- Single agent. MCP tools with risk ratings. Proposal tools write only to a proposals table.
- Restraint layer: before proposing an entry the agent checks for name collisions, missing months, amounts that do not match a commitment and loan-versus-contribution confusion. If any check fails, it asks.
- Layered guardrails: schema, citation, turn limits, human approval.
- Traceable memory: a short group core is always loaded; older notes sit in a verbatim archive with one-line gists and checksums; the agent fetches by pointer and the fetch is logged.

## 5. Measured engineering (the tests)

Protocol: `docs/experiments.md`. Written and frozen before any test run.

- H1, restraint: the curated pack lowers wrong proposals on ambiguous notes compared with a generic "ask when unsure" block of the same length.
- H2, archive: core plus traceable archive keeps stale-fact updates and old "needle" facts better than truncation or plain retrieval at the same token budget.
- H3, compaction (stretch): rules survive a summary.

Expect small effects. A null result is reported. With 40 test scenarios only effects of about 15 points or more are detectable. Results are local, on synthetic data, and never called accuracy in the field.

H1 is the priority. H2 only after the demo path and the fallback are green. H3 only after H2.

## 6. Use of Meta tooling

- Muse Spark Open on Baseten: agent loop, tool calls, voice and photo intake, drafting.
- Meta Model API ($150 credit): fallback model; Muse Voice Transcribe if Muse Spark Open's audio input is weak.
- Day 1 checks recorded before anything depends on them: tool calling, audio input, image input on handwriting, latency, Swahili. A failed capability cuts its feature.
- Licence: press coverage says products using Muse Spark Open must display "Built with Muse Spark Open". Verify in the model terms and show it in the README, the console footer and the video.

## 7. Scope

Build: groups, members, commitments, ledger entries (append only), evidence tiers, proposals and approval, clarification questions, "Today", voice intake, photo reconciliation, reminder drafts, MCP server, run traces, eval suite, Lab, synthetic seed and reset.

Stretch, in order: M-Pesa statement matching with synthetic statements; H2; H3; Swahili drafts if the model passes the Day 1 check.

Do not build: payments, lending decisions, credit scores, member ratings, chat, accounts for many groups, a mobile app, SMS or WhatsApp sending, a general agent framework.

## 8. Rules that shape the build

Full list in `docs/rules.md`.
- First code commit is Oct 27 or later. README names prior work.
- Synthetic data only. No real names, numbers, statements or voices in the repo or video.
- The system moves no money and gives no financial advice. It never scores or rates a member.
- Kenya Data Protection Act: noted, not assessed. Do not call the product compliant.
- Anti-project positions are in `docs/rules.md`.

## 9. Schedule (Nairobi time)

Submission closes Nov 4, 9:00 PM ET, which is Nov 5, 05:00 EAT (US clocks change on Nov 1). Internal deadline: Nov 4, 16:00 EAT. Sessions: Oct 27 and Oct 28, 19:00 EAT; Oct 30, 19:00 EAT. Office hours weekdays 10:00 to 11:00 ET: 17:00 to 18:00 EAT until Oct 31, then 18:00 to 19:00 EAT.

Assumption: about 3 hours a day of your time for decisions, review, recording and interviews. Claude Code does the coding under reviewed prompts. If your hours differ (D-12), the days move.

| Day | Date | Goal | Done when |
|---|---|---|---|
| 0 | Mon Oct 26 and Tue Oct 27 morning | Plan, rules, credits requested, repo public with docs only | Credits requested; no code |
| 1 | Tue Oct 27 | Model checks; scaffold; contract; write and freeze `docs/experiments.md` | Model facts logged; empty API runs; protocol committed |
| 2 | Wed Oct 28 | Ledger core: groups, members, commitments, entries | Tests: create, idempotency, access denial |
| 3 | Thu Oct 29 | Balances, due, discrepancies, "Today", deterministic | Fixtures pass; same input same order |
| 4 | Fri Oct 30 | MCP server; first agent run on a typed note; restraint checks | Agent proposes and asks through tools; trace stored |
| 5 | Sat Oct 31 | Voice intake; photo reading; approval | Voice and photo become approved entries |
| 6 | Sun Nov 1 | Eval suite and H1 run on the frozen test set; fallback | Results saved, including nulls |
| 7 | Mon Nov 2 | Console, Lab, seed and reset; H2 if time | Fresh clone runs from README |
| 8 | Tue Nov 3 | Freeze; record video; write submission | Video recorded; repo public check |
| 9 | Wed Nov 4 | Submit by 16:00 EAT | Receipt saved |

If a day slips, cut stretch items, then Lab polish. Never cut the fallback, the H1 run or the video.

## 10. Pitch

Three minutes, built on the demo path:
1. The problem in one scene from a real group, only if an interview supports it. Otherwise state it as a hypothesis.
2. The demo.
3. How it stays safe: proposals, evidence tiers, approval, a model that asks.
4. The measured result, with its limits.
5. What is not proven. The ask: one pilot group for a month.

## 11. What the entry does not prove

- That treasurers prefer it to notebooks or existing apps.
- That it reduces record errors in real groups.
- That the curated pack works beyond the local synthetic test set or beyond one model.
- That it is secure or compliant.

## 12. Definition of done

- [ ] Public repo, first code commit Oct 27 or later, prior work named.
- [ ] Demo path runs from a fresh clone.
- [ ] Agent runs on `meta-models/muse-spark-open-1026`; the trace shows the model id.
- [ ] Every agent output is a proposal; nothing sent; approval idempotent.
- [ ] Balances and discrepancies come from code; model-off mode works.
- [ ] H1 run saved with date, model id, prompt version and command. Frozen test split used once.
- [ ] Synthetic data only, labelled; no secrets in repo or video.
- [ ] "Built with Muse Spark Open" shown if the terms require it.
- [ ] Three minute video public; shows only work from the window.
- [ ] Submitted by Nov 4, 16:00 EAT.

## 13. Operating rules (kept)

Check each prompt against the goal and the days left. One task at a time, in `queue.md`. Never write "verified" without a recorded check. Do not invent users, quotes, numbers, latency or accuracy. If a claim and the code disagree, fix the claim.

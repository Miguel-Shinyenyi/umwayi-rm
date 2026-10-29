# 2026-10-29: workshop gap analysis (part 2)

Date: 2026-10-29. Source: handbook plus observed workshop run versus umwayi-rm code read this turn. Purpose: research data driving part 3. Status: analysis, not results.

## Already matching

- Checks inside the tools at forward-motion moments: quote containment, 3-quote cap, member collision refusal, and refusal budgets all run in the propose handlers and cannot be skipped. Matches the workshop's core placement rule.
- Quote refusal with feedback naming the failing check, never the expected label. Matches the kit's refusal behavior.
- Refusal budget forcing a question after 3 failures. Matches the 3-tries rule in shape; the question proposal is the handoff.
- Pack as system prompt every turn, turn and tool budgets, traces. Matches the playbook and loop discipline.

## Gaps adopted for part 3

1. G1 Approval-time verification with a recorded trail. Approval revalidates payload schema but never rechecks quotes, and records only decided-by/at. Adopt: recheck quotes, collision, and amount at approve time, and store the check list plus timestamp on the proposal so the inbox can show it (the sign-off card analog).
2. G2 Claim-vs-quote model check. The workshop's claims check caught what rules missed (5 findings). Umwayi-rm has no second layer. Adopt: at approve time, when a model is available, one call judging whether each quote supports the proposed entry; record the verdict in the trail. Model-off approvals record code-checks-only.
3. G3 Persisted run records with traces. The contract defines run, but intake returns the trace without storing it and proposals carry a null runId. Adopt: save the run (intake ref, model id, prompt version, steps, status) and link proposals to it; show the trace in the console inbox (the turn-timeline analog for the demo).
4. G4 Run completeness coverage. No check asks whether every intake line was addressed. Adopt: code reports lines-covered/total in the run record. No auto-filing; the treasurer sees the gap.
5. G5 Reminder names-no-other-member check. Reminder payload is validated structurally, but the pack rule against naming other members is prompt-only. Adopt: code rejects reminder text containing another member's name or alias (string match against the member list).

## Deliberately not adopted

- Ground-truth coverage scoring: there is no hidden ground truth at runtime; the frozen evals cover measurement offline.
- Cross-turn resume: intake runs are short and synchronous; returned traces suffice.
- A separate attorney role: the treasurer is the attorney and approval is the sign-off.
- Read-everything evidence-request checks: intake has no unread corpus; archive reads are covered by recall logging.

## Out of scope for part 3

Rubric items needing Miguel: interviews, Discord wording, the video, submission. No new model capabilities; nothing outside HACKATHON.md section 7.

# Working in Umwayi-RM

Read this file at the start of every task. Keep it short.

## Read in this order

1. `HACKATHON.md`: scope, schedule, definition of done.
2. `queue.md`: the current task. Do one task at a time.
3. Only the doc for the area you touch: `docs/api-contract.md`, `docs/agent-design.md`, `docs/experiments.md`, `docs/design-decisions.md`.
4. `docs/archive/INDEX.md` only if a task needs old history. Never read the archive otherwise.

## Rules

- New work only. First code commit is Oct 27 or later. Never paste code from another repository. Design token values are the one allowed import and are listed in the README.
- State is deterministic. Balances, due dates, discrepancies and the Today order come from stored records and explicit rules, never from a model.
- The agent proposes. The treasurer approves. No tool sends a message, approves a proposal or edits the ledger. Entries are append only.
- Money rules: the system moves no money, gives no lending or investment advice, and never scores, rates or ranks a member. Reminder drafts are copy only and name no other member.
- Experiments: do not touch the frozen test split during dev. Record date, model id, prompt version and seed for every run. Report null results.
- Synthetic data only, labelled demo. No real names, numbers or M-Pesa statements. No secrets in code, logs, screenshots or video.
- Write "verified" only after a check was run. Use: built, tested, manual-verified, not verified.
- Do not invent users, metrics, quotes, latency or accuracy.
- Do not build features outside `HACKATHON.md` section 7.
- No em dashes in anything written here.
- Do not push unless the task says so.
- Save substantive research responses verbatim under docs/research/ as dated notes. Research notes are testable data and feed evals.

## Every task prompt starts with

Goal in one sentence. Acceptance checks. Files to read. Stages with a gate after each if the task has more than three parts. A report-back section: what changed, how it was checked, what is not verified.

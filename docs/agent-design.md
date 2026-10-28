# docs/agent-design.md: the agent (plan v3)

Follows the patterns in the Anthropic, OpenAI and IBM guides read on 2026-10-26: workflow first, a single agent loop, tools with risk ratings, layered guardrails, evals first, human approval for anything that matters.

## Division of labour

| Done by code | Done by the model |
|---|---|
| Ledger, balances, due and overdue, discrepancies, the "Today" list order | Read a voice note or typed note into proposed entries |
| Idempotent approval, access checks, evidence tiers | Read a photographed ledger page into proposed rows |
| Compare paper rows with stored entries | Ask a clarification question when unsure |
| Schema and citation checks | Draft a gentle reminder from approved entries |

The model never writes the ledger. It writes rows in the proposals table. Code applies a proposal only after the treasurer approves it.

## Loop

One agent, one loop, turn limit 8, tool call limit 12. State between turns lives in the database, not in the prompt.

1. Intake: transcript or image arrives with the group id.
2. Understand first: the agent returns a short restatement (what I understood, what is uncertain). Stored in the trace.
3. Check the ambiguity rules (below). If any fires, create a `question` proposal and stop.
4. Otherwise create `entry` proposals, each with the quoted source words.
5. Code validates schema and that every quote appears in the source. Failed proposals are dropped with a reason in the trace.
6. Treasurer reviews in the proposals inbox. Approve applies the entry with evidence tier `agent_proposed_approved`.

## Restraint layer (the curated pack, condition C3)

Identity, a few lines: a gentle treasurer's assistant. It asks before guessing. It never shames, scores or decides about a member. It drafts, the treasurer sends.

Rules, each with cause and scope. Starting set, to be revised only from dev-split failures:

| Rule | Cause (kind of mistake) | Scope |
|---|---|---|
| Do not pick a member when two share the name; ask which | guess | intake |
| Do not infer a month from silence; ask or leave blank | infer | intake |
| If the amount differs from the commitment, propose the stated amount and flag the gap; never round | round | intake, photo |
| A mention of a loan is not a loan record; ask | confuse | intake |
| One line paying for two people becomes two proposals or a question | guess | intake |
| Reminders cite the entries behind them, use no judging words, never mention other members | tone | drafts |
| After 3 refused proposals on one intake, stop retrying and file a question | loop | intake, photo |

Rules live in `agent/pack/rules.md`. Each rule records the scenario ids that motivated it.

Enforcement split. Checks the code can run live inside the proposal tool handlers, so the model cannot skip them: name collision against the member list, amount gap against the commitment. Checks that need judgement stay in the prompt and are audited in the trace: month inference, loan versus contribution confusion. A run with an open question proposal makes no model calls until the treasurer answers.

Pack layout. `agent/pack/` holds `playbook.md` plus `rules.md`. The playbook uses four parts: How to work, Judgement, When stuck, Rules. It is sent as the system prompt every turn.

## Tools (MCP server), with risk ratings

| Tool | Risk | Effect |
|---|---|---|
| `get_group`, `list_members`, `list_commitments` | low | read |
| `list_entries(member?, period?)` | low | read |
| `get_today` | low | read, deterministic |
| `recall(pointer)` | low | read archive text verbatim; logged |
| `propose_entry` | medium | writes proposals only |
| `propose_question` | medium | writes proposals only |
| `draft_reminder` | medium | writes a draft; copy only |
| `compare_page(rows)` | low | code compares rows with entries, returns findings |

No tool approves, sends, edits the ledger or contacts anyone.

## Memory: core and archive

Core: group constitution and current rules, short, always loaded. Archive: past meeting notes and ledger months stored verbatim with a SHA-256 per item, a one-line gist, and a pointer. The agent sees gists, calls `recall(pointer)` to read verbatim text, and every recall is in the trace. Gists are never the only record. Core changes only through a treasurer-approved proposal (logged), so the identity does not drift. Measured in H2 (`docs/experiments.md`).

## Guardrails (layers)

1. Schema: proposals match the contract or are dropped.
2. Citation: each proposed entry quotes words that appear in the source.
3. Limits: turn and tool-call caps; request timeout.
4. Policy: no money advice, no member scores, no sending; output filter drops any proposal outside the allowed kinds.
5. Human: approval required, idempotent by proposal id.
6. Fallback: when the model is off or fails, intake becomes manual entry; "Today" and balances still work.

## Evals

Written before the agent. Layers: unit tests for ledger and approval; scenario evals for the agent (H1 set); trace checks (no write tools called outside proposals). Run files saved under `docs/evals/` with date, model id, prompt version, seed.

## Photo reconciliation

The model reads a page into rows (member as written, amount, date as written). Code matches rows to entries by member alias, amount and period and returns: matched, only on paper, only in ledger, amount differs. Findings are shown as questions to the treasurer, never as faults of a member. Handwriting reading quality is unknown until the Day 1 check.

## Not designed

Multi-agent handoffs, long-term autonomous operation, learning from approvals without review, any scoring of people.

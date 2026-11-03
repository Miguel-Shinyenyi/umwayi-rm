# docs/faq.md: hard questions about Umwayi-RM

Draft written 2026-11-02 from the repository as it stands (main at c47883f). Every answer points at a file. A hard question is a test of the product, not an attack. If an answer here is "we do not know", that is the answer.

## Is this a basic RAG app or a thin wrapper around a model?

No retrieval over documents drives it. Code owns the ledger, balances, the Today list and the paper-versus-ledger comparison. The agent only writes proposals through risk-rated MCP tools, and a person approves. See `docs/agent-design.md` and `docs/api-contract.md`. The archive recall tool is one tool the agent can call for old records, and it was tested as a hypothesis (H2), not sold as the product.

## Why should anyone trust a model near a savings ledger?

The model never writes the ledger. Entries are append only. A proposal must quote words that appear in the source, and that claim is checked again when the treasurer approves. Approving twice makes one entry. With the model off, manual entry and the Today list still work. Tests: `tests/verify.test.ts`, `tests/demo-fallback.test.ts`, `tests/ledger.memory.test.ts`.

## Did the restraint rules work?

The main claim was not supported. On the frozen split, three seeds, curated and generic prompts both made 0 wrong proposals out of 48 ambiguous scenarios. That is a floor effect: any full-length prompt avoided guessing, and only the bare condition guessed (7 of 48). What did replicate: the generic "ask when unsure" prompt passed 24 of 72 clear scenarios, the curated pack 67 of 72. Telling the model to ask made it ask constantly. Source: `docs/research/2026-10-29-h1-verdict.md`, run files in `docs/evals/`. One model, synthetic notes, small sample.

## Did the archive help?

Not shown. On seed 7, core plus archive scored 19 of 20 and plain retrieval 20 of 20, after a rescore. The archive used about 6.2 times the retrieval prompt tokens. The claim was not supported. Source: `docs/evals/h2-seed7-analysis.json`.

## Has any treasurer used it?

No. There are 0 interviews so far. The problem is a hypothesis we believe is common. Source: `docs/research/interviews.md`.

## Is this better than Chamasoft, M-Chama or Fundi Chama?

Unknown. We did not test against them. We claim a different starting point (voice notes and photos of paper pages, a model that asks before guessing, evidence labels), not a better product. Source: `docs/research/chama-landscape.md`.

## What if the model misreads a handwritten page?

The page reading produces proposed rows. Code compares them with stored entries and lists differences as questions. Nothing changes until approval. Handwriting accuracy was not measured on real pages, only on synthetic ones. Source: `docs/research/2026-10-28-h11-photo.md`.

## Does it work in Swahili?

One fluent formal draft passed an author check on Day 1. One reader judged it. It is not a measurement. Source: `docs/research/2026-10-28-h04-model-checks.md`.

## Can reminders pressure or shame members?

Reminders are drafts with cited entries. Nothing is sent. They name no other member, and a guard rejects reminder text that names someone other than the target. The treasurer decides. The product does not score or rank members. Source: `docs/agent-design.md`, `tests/verify.test.ts`.

## What about data protection?

Only synthetic data is used. No assessment under the Kenya Data Protection Act was done, and we do not claim compliance. A real pilot needs one first. Source: `docs/rules.md`.

## How secure is it?

Not production grade. Authentication is a per-group token. The demo mode and the reset route are for demonstrations. Source: `docs/api-contract.md`, README known limitations.

## What happens when the model or network fails?

Voice and photo intake answer `model_off`. Manual entry and the Today list keep working, and a test proves the demo path in that mode. Source: `tests/demo-fallback.test.ts`.

## Why Muse Spark Open?

The event requires Meta models. It is open weight, it called tools correctly in our Day 1 check, and the trace shows the model id for every run. Voice goes through Muse Voice Transcribe because Muse Spark Open does not take audio directly (Day 1 check). Source: `docs/research/2026-10-28-h04-model-checks.md`.

## How was it built?

TypeScript service, Postgres, an MCP server, a console. The author wrote the plans and decisions and reviewed each task. A coding assistant wrote most of the code under staged prompts with acceptance checks first, and every change went through a pull request. The commit history shows it. (Author to confirm this wording before publishing.)

## What would you do with another month?

Interview treasurers and run one pilot group for a month, build a harder ambiguous test set (the current one cannot separate good prompts from each other), and assess data protection.

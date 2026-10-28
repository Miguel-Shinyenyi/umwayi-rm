# docs/experiments.md: measured engineering protocol

Status: protocol, not results. Written 2026-10-27, before any test run. Commit it, then freeze the test split (hash recorded below) before the first run that counts.

Purpose: Miguel's working belief is that an agent behaves better when it carries a short curated identity, rules written from past mistakes, an understand-first step, and a core that stays small while older material sits in a traceable archive. Prior work already shows pieces of this (core plus archive memory exists in Letta and in Anthropic's memory tool), so none of it is claimed as new. The question here is narrow: does it help this agent, on this task, with this model.

Everything below runs on synthetic data, locally, on `meta-models/muse-spark-open-1026`. Results describe this setup only. They are not field accuracy.

## What counts as a wrong proposal

A proposal is wrong if it would change the ledger to something the source words do not support. Scored by code against a labelled expected outcome:

- guess: picks a member, month or amount when the scenario is ambiguous, instead of asking
- round: changes an amount to match a commitment
- infer: fills a month or date from silence
- confuse: records a loan note as a contribution, or the reverse
- over-ask: asks a question when the scenario is clear (counted separately, see controls)

Each scenario has one labelled expected outcome: `propose` (clear) or `ask` (ambiguous, with the reason). A scenario passes when the agent matches it and, for `propose`, the entry equals the expected entry.

## H1: restraint (primary)

Claim: the curated pack lowers wrong proposals on ambiguous notes versus a generic block of the same length.

Conditions, same model, same tools, same temperature:
- C0 bare: tool descriptions only
- C1 placebo: neutral text of equal length (about the group, no rules)
- C2 generic: equal length, "ask when unsure, do not guess"
- C3 curated: identity (a few lines), the rules with cause and scope, and the understand-first step (restate what was understood and what is uncertain, then propose)

Scenarios: about 60 synthetic voice-note transcripts and typed notes. Mix: about 30 ambiguous (name collisions, missing month, amount differs from commitment, loan versus contribution, two people paying in one line) and about 30 clear. Split 20 dev and 40 frozen test, stratified by type. Rules in C3 are written from failures seen on the dev split only. The test split is run once per condition and seed for the result that counts.

Seeds: 3 per condition. Resample by scenario, not by run, when computing intervals (bootstrap).

Primary metric: wrong-proposal rate on ambiguous test scenarios, C3 versus C2.
Controls: pass rate on clear scenarios (guards against a model that always asks); over-ask rate; mean tokens per run; cost.

Detectable effect: with about 20 ambiguous test scenarios, only differences of about 15 points or more are detectable. Smaller effects are reported as not detected, not as no effect.

Decision rule, fixed now: H1 is supported if C3 beats C2 on the primary metric by at least 15 points with the bootstrap interval excluding zero, and the clear-scenario pass rate drops by no more than 5 points. Anything else is reported as not supported, with the numbers.

## H2: core plus traceable archive (second)

Claim: at a fixed token budget, a short core plus a verbatim archive with gist index and a `recall` tool answers questions about old meetings and updated rules better than (a) truncating old notes, or (b) plain similarity retrieval.

Note: Muse Spark Open has a 1M token context. Putting everything in context is a strong baseline and is run as the reference (condition F). The claim is about a fixed small budget, not about beating full context.

Data: a synthetic group history of 12 months (meeting notes, ledger months, three constitution amendments, a few rule updates). Questions: about 30, in three kinds: needle (an old fact), stale (a fact that changed later), identity (a rule from the core that must still hold). Split 10 dev and 20 frozen test.

Conditions: T truncation, R plain retrieval, A core plus archive with gist index and `recall`, F full context (reference).
Metrics: answer correct (code-checked against labels), stale-fact error rate, rule-held rate, tokens used, rehydration count. Every archive fetch is logged with pointer and checksum so an answer can be traced to verbatim text.
Decision rule: A is supported over T and R if it is higher on correct answers with the interval excluding zero at the same budget. F is reported but not a target.

## H3: rules survive compaction (stretch)

Claim: when a long session is summarised, rules in the core still hold after the summary, because they are reloaded from the core and not from the summary.
Design: after a summary step, run the H1 ambiguous scenarios again. Compare a summary-only condition with a core-reload condition.
Run only if H1 and H2 are done and the demo path is green.

## Rules for running

1. This file is committed before the first counted run. The test split's SHA-256 is written under "Frozen" below at freeze time.
2. Dev work (writing rules, tuning prompts) uses the dev split only. Touching the test split during dev voids the run; log it and re-split with new scenarios.
3. Every run saves: date, model id, prompt version, seed, command, raw outputs, scores.
4. Null and negative results are reported with the same prominence as positive ones.
5. The demo's chart reads from saved run files, not from typed numbers.
6. No claim beyond the setup: synthetic, local, one model, small n.
7. Refusal feedback given to the agent never quotes the expected labels. The agent sees what kind of answer is missing, never the answer.
8. An offline fake model harness ships with the scaffold. All deterministic tests run through it with no live API calls.

## Frozen

Test split hash (SHA-256), frozen 2026-10-28:
- evals/h1/scenarios.json: c2e72c78b246cedabadee849e32413767edbe1fff5e2cf403e16cf122b8b7cda
- evals/h2/questions.json: 381f249fa0cc8f7fd1f4b8e98c4e65b2d572ba2538ce4a46d45c41b1ae57aad2
- evals/h1/group.json: 7647decfed94c58acb2b023a57ee852add3b6ef7a4225037890c9adf83cf063d
- evals/h1/commitments.json: 1c005fd7ffbbbb7385c409b28bbede6ead29de2ccdd09b3d25acabec7429d473
H1 test ids (40): 003-006, 009-012, 015-018, 021-024, 027-030, 041-060. H2 test ids (20): 004-010, 014-020, 025-030. Re-hash if review changes any file before merge.
Protocol commit: the merge commit of the H-05 branch, recorded after merge.

## Prior work this builds on (to cite in the README)

Core plus archival memory: Letta (MemGPT) and Anthropic's memory tool. Long-context decay and distractor effects: published studies read for the article (see the hub article's source list). The reconsolidation-style idea (core changes only through a logged review) is untested here and was not searched for novelty.

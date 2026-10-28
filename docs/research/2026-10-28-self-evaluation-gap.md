# 2026-10-28: Sweep limitation went unrecorded

Date: 2026-10-28. Source: terminal session with the coding assistant, plus the user's catch the same day. Purpose: research data for measurable outcomes. Status: notes, not results.

## What happened

The research sweep rule shipped covering research capture only. Its limitation, no compliance re-read of the rules, surfaced through the user's question about sweep scope, not through my own review. I answered the question and adopted the widened sweep, but wrote no record of the limitation or of the fact that the user caught it. The user then caught that silence too: no details in research, no self evaluation, no honest record.

## Acknowledgment

Second miss in the same area. The first was skipping research capture on H-04. This one is walking past a rule weakness without recording it. Both were caught by the user. My process currently detects nothing about itself. That is the honest record.

## Root cause

1. I treat questions as things to answer, not as findings to record. The sweep question exposed a rule gap, and I filed it under conversation instead of evidence.
2. The sweep checks the work against the rules, but nothing checks the rules against the work. No step asks whether the rules held up this turn.
3. No self-evaluation prompt exists anywhere in the finishing sequence.

## Fix proposed

1. Same-turn record. Any noticed limitation, miss, or user catch gets a research note in the same turn it surfaces, before reporting. No batching, no deferring.
2. Sweep gains a self-evaluation question: "What did I miss, weaken, or leave unrecorded this turn?" Every report-back answers it, even when the answer is nothing found.
3. Rule weaknesses found this way carry a proposed amendment in the same note.
4. Proposed new AGENTS.md bullet, awaiting approval: "When a limitation or miss surfaces, record it in research the same turn it surfaces. End every report-back with what was missed or left unrecorded, if anything."

## How this is tested

Over the next three tasks, each report-back carries the self-evaluation answer. Any user catch in that window restarts the count and gets its own note same-turn.

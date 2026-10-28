# 2026-10-28: Commit and PR style to emulate

Date: 2026-10-28. Source: read of routine-machine merged PRs and commit messages, same day. Purpose: research data for measurable outcomes. Status: notes, not results.

## Observed in routine-machine

- Commits are atomic per part with scoped summary lines: "Backlog P, part 1: today is the person's day on the frontend (Today, Path, Tally, sidebar)". Multi-batch work numbers its parts: "batches 9 and 10 of 13 (observability and reliability targets; change, recovery and cost)".
- One-line summary plus a Co-Authored-By trailer. Detail does not live in the body. It lives in the PR and the status log.
- Big PRs compound many commits (PR 9 held 94) into one structured description: Goal, What is in it grouped by prompt or part, Checks that ran with real numbers (488 tests, 0 failures), Not checked (honest gaps, including first-time CI), How to undo (revert plus migration notes), Open questions.
- The status log records each step with its checks and what was not checked, matching our hackathon log habit.

## Adopted here

One commit per part with a scoped summary line. PR descriptions carry goal, contents by part, real checks with numbers, not checked, how to undo, and open questions. Persisted as an AGENTS.md rule the same day.

## Deliberately not adopted

The Co-Authored-By trailer. Their commits credit a named model with an email. No verified identity or email exists for this agent's trailer, so none is written rather than inventing one.

## How this is tested

The next PR follows the shape. Review checks the sections exist and the numbers match the commands that ran.

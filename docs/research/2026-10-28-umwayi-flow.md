# 2026-10-28: UMWAYI core-agent flow and project implementation

Date: 2026-10-28. Source: read of UMWAYI docs/agent-practices.md, queue.md, SYNC_LOG.md, projects/routine-machine.md, routine-machine CLAUDE.md, PROJECT.md, docs/status-log.md, and miguel-site CLAUDE.md and PROJECT.md. Purpose: research data for measurable outcomes. Status: notes, not results.

## The loop, hub as core agent

1. The hub holds the plan. queue.md is the one list of work with packets (goal, context, acceptance checks, where the outcome is recorded). backlog.md keeps every line as history. projects/*.md files are pointers plus status; detail lives in the repos. The journal feeds observations. SYNC_LOG.md records dated moves as Source, Updated, What moved, Confidence, honest about read versus run.
2. The core agent works one task at a time in chat. It refines the brief against the goal and the plan, then writes a staged prompt from the template: goal in two or three sentences, decisions already made, read-first files only, acceptance checks before the work, stage 1 only with later stages named in one line each, safety rules each with its test, and a report-back section. It hands that prompt to one project agent in the repo. The repo files only bring that agent up to date.
3. Blocking questions go to Miguel as queue section D with a recommendation. Nothing is pruned, closed, or dropped without his yes.
4. Results flow back into the hub: the repo status log plus the agent report update the queue row, the project file, the backlog lines, and a SYNC_LOG entry.

## Project side, routine-machine and miguel-site

- Repo root holds PROJECT.md (what, why, problem, stack, phases, rules), a CLAUDE.md with a routing table per component, one doc per component, and a status log of date, phase, status, and notes that record checks, gaps, and bugs found, not just completions.
- miguel-site splits truth: code lives in the repo, content lives in UMWAYI under site/, and the build syncs it with a privacy check. The hub owns content truth. The repo owns rendering truth.
- routine-machine hub-sync reads UMWAYI journal lines through a short-lived unlock. The key comes from the environment and is never stored.
- Observed conventions: tests before implementation, current phase only, component doc updated in the same change as the code, flag ambiguity instead of deciding silently, and checks before done that name real builds and real browser widths.

## What umwayi-rm already mirrors

queue.md with acceptance checks, AGENTS.md routing, the hackathon log as dated evidence, archive plus index, staged prompts with gates, PR review points, and the atomic commit rule now pending. The shape matches. The prompt template wording is the main gap.

## Proposed adoptions, awaiting approval

1. Adopt the staged-prompt template explicitly for queue packets: decisions made, read-first, checks first, stage 1 only, safety with tests, report-back. AGENTS.md already shapes task prompts; the template wording is the addition.
2. Keep the per-task evidence rows habit. The hackathon log already matches the status log pattern.
3. No hub wiring. umwayi-rm stays standalone under the new-work rule. No content sync, no journal reads.
4. Borrow the checks-before-done habit for the console later: name real browser widths, never CSS judgment.

## How this is tested

If adopted, the next queue packet follows the template and review checks the sections exist.

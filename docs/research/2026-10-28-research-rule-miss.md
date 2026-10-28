# 2026-10-28: Missed research capture on H-04

Date: 2026-10-28. Source: terminal session with the coding assistant, plus the user's catch the same day. Purpose: research data for measurable outcomes. Status: notes, not results.

## What happened

The recurrent research rule, committed 2026-10-28, says substantive research responses are saved verbatim under docs/research/ as dated notes. I then ran the full H-04 probe series, wrote the findings only to the hackathon log, and reported the task done. The user caught the miss: "did you consider the research update as well?" I backfilled three notes the same day: 2026-10-28-h04-model-checks.md, 2026-10-28-voice-transcribe-plumbing.md, and 2026-10-28-voice-transcribe-quality.md.

## Acknowledgment

I failed to follow the research rule on H-04. I wrote the rule, then did not apply it to the next research heavy task. The log entry is not an excuse. The rule names research notes as the home for reusable findings, and I skipped that home. The user caught what my own process should have caught.

## Root cause

1. The rule has no trigger point. It says what to save, never when to check.
2. I miscategorized the work. Measured build verification felt log only, so H-04 verdicts never got the research question asked about them.
3. The report-back shape has no research line. Nothing in the finishing sequence forces the sweep.

## Prevention

1. End-of-task sweep, mandatory. Before the final report of any task, re-read my own substantive responses from that task and ask: does this hold findings, verdicts, or analysis a later task will test? If yes, save the verbatim notes first, then report.
2. Fixed definition. Any response with measured verdicts, timings, model behavior, or analysis another task tests is research. A log record does not exempt it.
3. Report-back gains a standing line: "Research notes:" followed by saved paths or by none with a one line reason.
4. Proposed rule amendment, awaiting approval: append the sweep and the definition to the research bullet in AGENTS.md so the trigger lives with the rule.

## How this is tested

Over the next three tasks, each final report carries the research line, and the named notes exist in docs/research/ or the reason holds. A miss restarts the count.

# 2026-10-28: Legal agent workshop comparison

Date: 2026-10-28. Source: terminal session with the coding assistant, saved verbatim under the recurrent research rule. Compared: meta-models/legal-agent-workshop (cloned beside this repo) against docs/agent-design.md, docs/experiments.md, and docs/api-contract.md. Purpose: research data for measurable outcomes. Status: notes, not results.

## Verbatim record

The workshop builds a legal agent in two sessions: an agentic loop first, then a verification layer the model cannot skip. Our design already matches its spine: model proposes, code checks, human approves. Five ideas are worth curating in, and all fit without copying code since they are Python and we are TypeScript:

1. Checks inside the tools. Their checks run at fixed points in tool handlers, so the model cannot skip them. Our restraint rules should say the same: name collision and amount gap run as code inside the proposal handlers, not as agent self discipline.
2. Refusal budget. Their memo refused 3 times goes to a person. Add a rule: after 3 refused proposals on one intake, the agent must file a question instead of retrying.
3. Quiet runs. Their runs make no model calls while waiting on a person. State this for our open question proposals.
4. Playbook shape. Their system prompt uses How to work, Judgement, When stuck, Rules. Give our pack the same four parts.
5. Ground rules for coding prompts. Their handbook opens every session with build only what was asked, touch only named files, and report files, tests, and limits. Adopt that shape for our queue packets. It matches your understand first rule.

Two more map without change: offline tests with a fake model equal our model off fallback, and their ground truth secrecy equals our frozen test split discipline. Do not adopt model graded evals or their confidentiality tooling. Both sit outside our scope.

## How this is tested

Items 1 to 3 feed the restraint rules measured in H1. Item 4 shapes the pack used in conditions C3. Item 5 shapes queue packets, checked by review of each task report.

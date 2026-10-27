# docs/pitch-deck.md: submission text and optional slides

v2 replaces the 12 slide deck. The video is the pitch. These are the words for the portal and, if wanted, two cards for the video.

## Portal text

Problem: Small skills-training programmes follow up with learners by hand, in spreadsheets and chats. When a follow-up slips, a learner can fall away unseen. (State this as a hypothesis until `docs/research/interviews.md` has real quotes.)

What we built: Umwayi-RM, an open-source follow-through agent. Staff record a voice note or review the programme. The agent reads the records through tools, proposes events, commitments and follow-up drafts, and cites the records behind each. Staff approve every change. A deterministic core computes progress and queue order.

How it uses Meta models: Muse Spark Open (`meta-models/muse-spark-open-1026`) on Baseten runs the agent loop, tool calls, voice intake and drafting. Meta Model API is the fallback.

Technical choices: workflow first, single agent, MCP tools with risk ratings, proposals table, idempotent approval, citation checks, eval suite, run traces, model-off mode.

What is not proven: that staff prefer it to spreadsheets, that follow-ups improve outcomes, that outputs are accurate beyond the local eval set, that it is secure or compliant.

Next step: one pilot programme for a month.

New work: all code in this repository was written from Oct 27. Prior work: design token values from the author's routine-machine project, listed in the README.

## Title card

Umwayi-RM. A follow-through agent for community training programmes. Open source. One shepherd line, nothing else.

## Closing card

Not proven (three bullets). Repo URL. Licence. Prior work line.

## Citations

Only verified claims may appear. Verified list: `docs/research/competitors.md`, "Verified claims". The Andela churn quote is about employer matches, not about training programmes. Do not use it to describe the problem for staff.

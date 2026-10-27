# queue.md

One list of open work. One task at a time. Status: now, next, later, blocked, done. Acceptance checks come first.

## Decisions waiting for Miguel

| ID | Decision | Recommendation |
|---|---|---|
| D-9 | Stack: TypeScript service, or Java and Spring Boot with a separate MCP process | TypeScript: one language for API, MCP and schemas; fewer containers |
| D-10 | Licence | MIT |
| D-11 | Is the problem first-hand? Which programme staff can you interview this week? | Two interviews by Nov 1 |
| D-12 | Daily hours you can give Nov 1 to Nov 4 | State a number so the plan can move days |
| D-13 | Photo of a paper register as a second intake | Only after the freeze checklist is green |

## Tasks

| ID | Task | Status | Acceptance checks | Result goes in |
|---|---|---|---|---|
| H-01 | Request Baseten $100 credit; submit Meta $150 form; check Billing | now | Confirmation emails or screens saved (no card data) | `docs/hackathon-log.md` |
| H-02 | Create public repo `umwayi-rm` with the docs only and a LICENSE | now | Repo public when logged out; no code; README lists prior work | log |
| H-03 | Ask on Discord #questions about "AI for Education" | next | Answer recorded | log |
| H-04 | Day 1 model check: tool calling, audio, image, latency, Swahili | next | Each result recorded with date and command | log |
| H-05 | Scaffold repo, Docker Compose, empty API, CI | next | `docker compose up` serves `/health` | log |
| H-06 | Core state and tests | later | Create, idempotency, access denial tests pass | log |
| H-07 | Queue, deterministic, fixtures | later | 12 fixtures pass; same input same order | log |
| H-08 | MCP server and the first agent run | later | Agent reads a programme through tools; trace stored | log |
| H-09 | Proposals and approval; voice intake | later | Voice note becomes approved events; duplicate approval changes nothing | log |
| H-10 | Evals, guardrails, fallback | later | Eval run saved; model-off mode passes the demo path | `docs/evals/` |
| H-11 | Console, Lab, seed and reset | later | Fresh clone runs from the README | log |
| H-12 | Interviews with two programme staff | next | `docs/research/interviews.md` has real rows, or says none | interviews file |
| H-13 | Freeze, record the video, write submission text | later | Video link public; repo public; text matches code | log |
| H-14 | Submit | later | Portal receipt saved before Nov 4, 16:00 EAT | log |

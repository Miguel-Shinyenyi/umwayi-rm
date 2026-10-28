# queue.md

One list of open work. One task at a time. Status: now, next, later, blocked, done. Acceptance checks come first.

## Decisions

| ID | Decision | Status | Recommendation |
|---|---|---|---|
| D-9 | Stack: TypeScript service, or Java and Spring Boot with a separate MCP process | answered 2026-10-28: TypeScript service | none |
| D-10 | Licence | answered 2026-10-28: MIT | none |
| D-11 | Is the problem first-hand? Which treasurer or group member can you interview this week? | waiting | Two interviews by Nov 1 |
| D-12 | Daily hours you can give Nov 1 to Nov 4 | waiting | State a number so the plan can move days |
| D-13 | Photo of a paper ledger as a second intake | answered by D-14: included | Voice first; photo after the ledger and approval work |
| D-14 | Direction | answered 2026-10-27: savings-group agent, with the restraint and archive ideas as measured engineering inside it | none |

## Tasks

| ID | Task | Status | Acceptance checks | Result goes in |
|---|---|---|---|---|
| H-01 | Request Baseten $100 credit; submit Meta $150 form; check Billing | now (Miguel, own accounts) | Confirmation emails or screens saved (no card data) | `docs/hackathon-log.md` |
| H-02 | Create public repo `umwayi-rm` with the docs only and a LICENSE | done 2026-10-28 | Repo public when logged out; no code; README lists prior work | log |
| H-03 | Ask on Discord #questions about "basic RAG", "image analyzer" and the "Built with Muse Spark Open" wording | next | Answer recorded | log |
| H-04 | Day 1 model check: tool calling, audio input, image input on handwriting, latency, Swahili; read the model terms for the display requirement | done 2026-10-28 | Each result recorded with date and command | log |
| H-05 | Write and commit the synthetic scenario sets (60 notes, 30 archive questions); freeze the test split hashes | done 2026-10-28 | Hashes in `docs/experiments.md`; split committed | experiments |
| H-06 | Scaffold repo, Docker Compose, empty API, CI | now | `docker compose up` serves `/health` | log |
| H-07 | Ledger core and tests | later | Create, idempotency, append-only, access denial tests pass | log |
| H-08 | Today, reconciliation, fixtures | later | 12 fixtures pass; same input same order | log |
| H-09 | MCP server and the first agent run with the pack | later | Agent proposes and asks through tools; trace stored | log |
| H-10 | Proposals, approval, voice intake | later | Voice note becomes approved entries; duplicate approval changes nothing | log |
| H-11 | Photo reading and reconciliation findings | later | Page becomes proposed rows; findings listed | log |
| H-12 | H1 run on the frozen test split; fallback mode | later | Run saved with date, model id, prompt version, seed; model-off passes the demo path | `docs/evals/` |
| H-13 | Console, Lab, seed and reset | later | Fresh clone runs from the README | log |
| H-14 | Interviews with two treasurers or members | next | `docs/research/interviews.md` has real rows, or says none | interviews |
| H-15 | H2 run (stretch) | later | Only after H-13 is green | `docs/evals/` |
| H-16 | Freeze, record the video, write submission text | later | Video link public; repo public; text matches saved results | log |
| H-17 | Submit | later | Portal receipt saved before Nov 4, 16:00 EAT | log |

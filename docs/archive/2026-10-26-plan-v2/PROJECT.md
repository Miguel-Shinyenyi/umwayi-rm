# PROJECT.md: sequencing and architecture (v2)

Read after `HACKATHON.md`. Nothing here is built until the log says so.

## 1. What this is and is not

Is: an open-source follow-through agent for community skills-training programmes, with a deterministic core.
Is not: a risk scorer, a screener, a chat tutor, a general agent framework, or a product launch.

Lineage: Routine Machine began as personal follow-through. Umwayi-RM moves the same idea to programme staff. Rule inherited: intelligence must be justified by data, and state stays deterministic.

## 2. Architecture

```
Console (Next.js) ----HTTP----> API service (TypeScript)
                                  |-- core: candidates, goals, commitments,
                                  |         events, progress, interventions
                                  |-- proposals + approval
                                  |-- agent runner (loop, guardrails, traces)
                                  |-- MCP server (same process)
                                  |-- lab: runs, evals
                                  v
                              Postgres          Model: Muse Spark Open on Baseten
                                                Fallback: Meta Model API
```

- Modular monolith. One deploy unit, Docker Compose locally.
- Postgres is the system of record. Events and proposals are append only.
- The model is behind one adapter. Switching it off leaves the queue working.
- Stack is a proposal (decision D-9): TypeScript service. Spring Boot remains possible.

## 3. Data model

candidates, goals, milestones, commitments, events, check_ins, proposals (with versions and cited ids), agent_runs (with ordered tool calls), eval_runs, programmes, staff. Every table has `created_at`; demo rows have `demo = true`.

## 4. Sequence

Follows the day table in `HACKATHON.md` section 7. Order of build: contract, core state, queue, MCP and agent, proposals, evals, console, Lab, seed, video.

Rules for sequence:
- Evals before prompt tuning.
- Queue and fallback before any model feature.
- Voice intake before photo intake; photo only after the freeze checklist is green.
- A feature not shown in the video and not tested is cut.

## 5. Rejected, and why

| Idea | Why not |
|---|---|
| Sell a retention-risk signal to employers | Near the "job application screener" and "personality analyzer" anti-projects; profiles people for a third party; no evidence; off the community-first aim |
| One-sentence AI label as the AI feature | A thin integration; low on the tooling score |
| Chat interface | Anti-project class; not the product |
| Vector store and document retrieval | "Basic RAG" class; the data is structured |
| Multi-agent orchestration | No measured need |
| Supabase | Dynamic schema and service-role keys fit badly with a determinism rule |
| Copying Routine Machine code | New work only |
| Predictive scoring of learners | Never. A system that scores people invites misuse |

## 6. Records

`docs/hackathon-log.md` for decisions and evidence. `docs/evals/` for eval output. `queue.md` for tasks. History in `docs/archive/`, with `docs/archive/INDEX.md`.

# docs/agent-design.md: the agent

Sources: Anthropic, "Building effective agents"; OpenAI, "A practical guide to building agents"; IBM, "How to build an AI agent"; the gerred.github.io series (its index page only; chapters not read). Each rule below says where it came from. Rules not tied to a source are our own.

## 1. Where an agent is the right tool

Rule (OpenAI, Anthropic): use a deterministic solution when one works. Add an agent only where the number of steps cannot be fixed in advance.

| Job | Fixed steps? | Design |
|---|---|---|
| Compute progress, due dates, overdue flags | Yes | Code. No model |
| Rank the intervention queue | Yes | Code with explicit weights |
| Turn a note about several learners into records | No. A note may mention one learner or five | Agent loop |
| Review a programme and decide what to say to whom | No. Depends on what the records show | Agent loop |
| Approve, send, change state | Yes, and high risk | Human only |

## 2. Shape

- One agent with tools, run in a loop until it returns a final answer, hits the turn limit or fails (OpenAI: start single-agent).
- No multi-agent split. Split only if a measured failure shows tangled prompts or wrong tool picks that better tool descriptions do not fix (OpenAI).
- State lives in Postgres. No vector store. Context is built from tool calls, so there is no document retrieval step.
- Model: `meta-models/muse-spark-open-1026` on Baseten. Fallback model on the Meta Model API. Prototype on the strongest model, set evals, then try cheaper settings (OpenAI).

## 3. Tools (MCP server)

Tools are written like docstrings for a junior developer, with an example and edge cases (Anthropic). Arguments are shaped so errors are hard to make: ids only, never names (Anthropic poka-yoke).

| Tool | Kind | Risk | What it does |
|---|---|---|---|
| `list_interventions(programme_id, limit)` | read | low | The ranked queue, from code |
| `get_candidate_timeline(candidate_id)` | read | low | Events, commitments, check-ins with ids |
| `get_progress(candidate_id)` | read | low | Computed status |
| `get_programme_overview(programme_id)` | read | low | Counts and due items |
| `propose_event(candidate_id, type, occurred_at, source_quote, idempotency_key)` | proposal | medium | Writes a row to `proposals`. Not an event |
| `propose_commitment(candidate_id, title, due_at)` | proposal | medium | Same |
| `propose_followup_draft(candidate_id, language, cited_event_ids, text)` | proposal | medium | Draft text with citations |
| none | send, approve, change state | high | Not exposed to the agent. Staff only, through the console |

Every tool validates arguments against a schema and returns errors in the standard envelope. No tool changes the database schema.

## 4. Guardrails

Layered, because no single layer is enough (OpenAI). Added as real failures appear.

1. Input: notes are treated as data. Instructions inside a note are ignored. Candidate names are replaced with ids before a model sees them.
2. Relevance: if a note has nothing about programme learners, the agent returns "nothing to propose" and no proposals.
3. Tool risk: read tools run freely. Proposal tools write only to `proposals`. High-risk actions have no tool.
4. Output schema: every proposal is checked against a schema. A failure counts as a miss.
5. Citation check: every cited event id must exist and belong to that candidate and programme. A draft that states a fact not in the cited records is rejected. Checked by code first; an optional second model call grades the rest (Anthropic evaluator-optimizer, stretch).
6. Limits: at most 8 tool calls per run and 30 seconds per model call. Two schema failures in one run stop the run and mark it "fallback used" (OpenAI failure thresholds).
7. Human approval: nothing changes state, and nothing is sent, without a staff click. Approval carries an idempotency key.

## 5. Fallback

If the model is unreachable, slow or invalid, the queue still renders from code. Each item shows: "This follow-up is {due_status}. The last recorded event was {last_event_type}." Intake in fallback mode shows a form instead of a transcript. `MODEL_FALLBACK_ONLY=true` forces this mode for the demo failure case.

## 6. Evals, built first

(OpenAI, IBM: define success and build evals before tuning.)

| Suite | Cases | Measures |
|---|---|---|
| Queue | 12 synthetic programme states with expected order | Exact order match. Pure code, no model |
| Intake | 20 hand-labelled notes with expected events | Precision and recall of proposed events; share with a valid quote |
| Review | 10 states with known slipping learners | Share of slipping learners flagged; share of drafts with valid citations |
| Safety | 8 notes with injected instructions | Share where the agent ignores the instruction |

Results go to `docs/evals/` with date, model id, prompt version and the command. They are local results on synthetic data. They are never described as accuracy in the field. If a suite is not run, the Lab says "not run".

## 7. Observability

Each run stores: run id, model id, prompt version, ordered tool calls with arguments and results, validation outcomes, latency, token counts, and whether fallback was used. The Lab lists runs and shows one trace. No secrets in traces. Demo traces contain synthetic data only.

## 8. Autonomy, stated honestly

The agent plans its own steps and chooses its own tool calls inside a run. It cannot act on the world. That is the line we draw, and it matches "human intervention for high-risk actions" in OpenAI's guide. Judges for the agentic prize look at level of autonomy, effectiveness and usefulness. We show the first by the visible trace, the second by the evals, the third by the staff approval flow.

## 9. Open items

- Confirm on Day 1 that the model supports tool calling, audio input and image input on Baseten, and measure latency.
- Confirm Swahili draft quality with a 5 sample check by Miguel. If poor, drafts are English only.
- Choose the transcription path: Muse Spark Open audio input, or Muse Voice Transcribe on the Meta Model API.

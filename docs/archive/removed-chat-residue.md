# Removed chat residue

Text that followed each file in the source PDF. It is a model's chat commentary, not file content. Kept here unchanged so nothing is lost.

## After `docs/research/competitors.md`

```

`docs/research/competitors.md` is now reproduced as an actual Markdown file — not text inside
a code block's prose. The filename header, the `>` blockquote rules, the `###` claim sections,
the exact-quote blocks, the `UNVERIFIED` table, the entry templates, and the synthesis section
are all first-class Markdown that renders correctly in any viewer.

**Proceed to `docs/demo-script.md` next?**

```markdown

## After `docs/demo-script.md`

```

`docs/demo-script.md` is now a proper Markdown file, not prose inside a code block. It is
scoped to the pivot: **6 steps, no chat, queue as the hero, AI rationale only as explanation, pivot
stated in one line in the voice-over.**

**Key changes from earlier drafts:**
- The demo is now **3:00 target / 4:00 hard stop** (was 5:00/6:00) to fit the pitch format
alongside the deck.
- The chat is **explicitly removed** from the demo; the Shepherd chat is a later experiment, not
the demo.
- **Step 4 is new**: confirm evidence and watch the queue update — this is the live
demonstration that the queue is derived from state, not static.
- **Step 6 is the pivot moment**: outcomes and Lab, then the one-line pivot in the voice-over.
- The timing table honestly shows the overrun and names three compression options — the
decision must be logged before rehearsal.

**Proceed to `docs/hackathon-log.md` next?** That file will record the council decision, the pivot
adoption, the Baseten claim, the model verification, the timing decision, and the rules/deadlines
— as dated entries.

```markdown

## After `docs/hackathon-log.md`

```

`docs/hackathon-log.md` is now a proper Markdown file. It is pre-populated with the decisions
that have actually been made in this session — **council pivot, chat removal, Baseten/model
choice, no-Supabase, limitations** — and with the experiments, verifications, and timing
decisions still to come, each as a dated entry template to fill in.

**What is deliberately left as `TBD`:** credit claim date, track choice, latency measurements,
idempotency test, E2E run, seed determinism, timing strategy, deck build tool. Those are facts
you will record as you do them. The log is honest because it distinguishes decisions from
evidence.

**Proceed to `docs/api-contract.md` next?**

```markdown

## After `docs/api-contract.md`

```

`docs/api-contract.md` is now a proper Markdown file. Key additions since the earlier skeleton:

- **`/programmes` and `/staff`** are now first-class (the seed script depends on them).
- **`/interventions`** is fully specified: ranking formula, weights, tie-breaker, `rationale_source`
values, and the rule that AI cannot change the ranking.
- **`/outcomes`** specifies `data_sufficiency` (so the UI can say "not enough data yet" instead of
a misleading zero).
- **`/lab-records`** is specified with kinds, statuses, and outcomes — matching the Lab view.
- **MCP tools** now include `get_outcomes`, and the "no schema changes" rule is restated as a
contract rule (the Supabase rejection).
- **AI adapter contract** now has concrete input/output schemas per task type, the fallback
template, and the `FALLBACK_ONLY` mode.
- **Open questions** include the ranking-weights freeze date and the `rationale` caching
decision (pending the Baseten latency experiment).

**Proceed to `docs/design-decisions.md` next?**

```markdown

## After `docs/design-decisions.md`

```

`docs/design-decisions.md` is now a proper Markdown file. Key additions since the earlier
skeleton:

- **DD-010 through DD-026** are the product-specific decisions: the shepherd analogy's UI
treatment, the demo badge, the timeline, the queue, the rationale inset, the outcome dashboard,
the Lab, the prune flow, and the AI proposal panel.
- **DD-030 and DD-031** are the accessibility decisions (badge contrast, focus-visible).
- **DD-040 and DD-041** are the pitch-deck design decisions (same tokens, "not proven" slide
as a feature).
- **DD-050 through DD-053** are rejected deviations recorded so they are not re-proposed:
dark-only theme, heavy illustration, raw `rank_score` display, chat in the demo.
- **U-1 through U-5** are the unresolved questions, each with a proposal.
**Proceed to `README.md` next?** That is the last of the seven files and will translate the brief,
the stack, the honest feature status, and the pivot statement into fresh-clone onboarding.

```markdown

## After `README.md`

## All seven files are now written

| File | Status |
|---|---|
| `HACKATHON.md` | Written (earlier) |
| `docs/pitch-deck.md` | Written |
| `docs/research/competitors.md` | Written |
| `docs/demo-script.md` | Written |
| `docs/hackathon-log.md` | Written |
| `docs/api-contract.md` | Written |
| `docs/design-decisions.md` | Written |
| `README.md` | Written (this file) |

**What remains, and cannot be done in this session:**
- Fill the `Date read` fields in `docs/research/competitors.md` when you actually read each
source.
- Fill the `TBD` rows in `README.md` as features are built and verified.
- Fill the `TBD` entries in `docs/hackathon-log.md` as experiments run and verifications happen.
- Write the deck copy into a slide tool and rehearse it.
- Run the seed script, the demo, and the timing tests.

**Do you want me to produce the `PROJECT.md` update** (the inherited
sequencing/architecture doc that the README points to), or is the seven-file set the scope for
now?

```markdown

## After `PROJECT.md`

```

`PROJECT.md` is now a proper Markdown file. It fills the gap the README pointed to:

- **§2** places the hackathon inside the three-phase Routine Machine framework and states
clearly that Phase 3 (retention intelligence) has not started.
- **§3** gives the architecture diagram and the reasoning: modular monolith, PostgreSQL,
deterministic queue with AI as a rationale layer only.
- **§4** is the conceptual data model, distinguishing stored from derived state and explaining
why derived state is not cached.
- **§5** is the ten-day sequence with explicit gates ("do not start coding until the contract is
written", "do not code on the last day").
- **§6** is the module responsibility table with the "does not" column — the discipline that
prevents scope creep.
- **§7** records what was rejected and why, with links to where the decision is recorded.
- **§8** is the one-paragraph pivot thesis for contributors who need the shape without the deck.
- **§9** is the records discipline: which file holds what, and the "never write verified without
evidence" rule.

---

## All eight files are now written

| File | Role | Written |
|---|---|---|
| `HACKATHON.md` | Brief: scope, pivot, rules, task queue, DoD | ✓ |
| `PROJECT.md` | Sequencing, architecture, rejected decisions | ✓ |
| `README.md` | Fresh-clone onboarding, honest status, pivot statement | ✓ |
| `docs/pitch-deck.md` | The deliverable: slide copy, speaker notes, citations | ✓ |
| `docs/research/competitors.md` | Verified claims, sources, adjacent products | ✓ |
| `docs/demo-script.md` | Rehearsal path, setup, reset, fallback, timing | ✓ |
| `docs/hackathon-log.md` | Dated decisions, experiments, verifications, blockers | ✓ |
| `docs/api-contract.md` | Endpoints, MCP tools, errors, AI adapter contract | ✓ |
| `docs/design-decisions.md` | Deviations from HTML references, with reasons | ✓ |

**What remains, and cannot be done in this session:**
- Read the Official Rules when published (before Oct 26).
- Claim the Baseten credit; record the date and amount in the log.
- Fill the `Date read` fields in `docs/research/competitors.md`.
- Run the Baseten latency experiment; record the result.
- Freeze the ranking weights before Day 7.
- Fill the `TBD` rows in `README.md` as features are built and verified.
- Fill the `TBD` entries in `docs/hackathon-log.md` as experiments and verifications happen.
- Write the deck copy into a slide tool; rehearse; export to PDF and PPTX.
- Rehearse the demo; record the actual timing; make the compression decision.

The documentation set is complete. The build can start.

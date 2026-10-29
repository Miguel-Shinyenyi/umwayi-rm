# docs/hackathon-log.md: Hackathon log (started 2026-10-26, plan v3 from 2026-10-27)

Append only. Corrections are new entries. Status words: proposed, accepted, rejected, superseded, built, tested, manual-verified, not verified, blocked, done. Never write "verified" without the evidence under it. Every entry cites a source.

The v1 log (Oct 24) is in `docs/archive/2026-10-24-planning-v1/hackathon-log.md`. Its limitations list is carried forward below.

Entry template:

```
### YYYY-MM-DD: short title
Type: decision | rule | experiment | verification | blocker
Status:
Context:
Evidence:
Result:
Next:
```

### 2026-10-26: Rules read from the signed-in event pages
Type: rule
Status: accepted
Context: The pages need a login. Miguel signed in; the pages were read the same day.
Evidence: Participant Guide (details page) and Official Rules and Waiver, read 2026-10-26. Summary in `docs/rules.md`.
Result: New work only, public repo, three minute video, sample anti-projects list, rubric weights, Baseten model id `meta-models/muse-spark-open-1026`, submission Nov 4 9:00 PM ET.
Next: Reread the guide on Nov 2. Ask on Discord #questions whether a staff-facing agent for training programmes counts as "AI for Education".

### 2026-10-26: Pivot from employer retention intelligence to a community follow-through agent
Type: decision
Status: accepted (Miguel asked for community first and for a pivot clear of the anti-project list)
Context: Plan v1 pitched a retention-risk signal sold to employers, with AI limited to one sentence of rationale. The council review of 2026-10-24 backed it as a business thesis. The hackathon rubric scores Impact, Meta tooling, Technical depth and the Demo, not business credibility. The anti-project list names a job application screener and personality analyzers.
Evidence: `docs/rules.md`; v1 log entry "Council review"; `HACKATHON.md` section 0.
Result: Employer pivot dropped. No risk scores on people, ever. The council's point that AI must not decide is kept: the agent proposes, staff approve, code computes state. The council's point that no buyer is validated stays true, and is stated as not proven.
Next: Interview two programme staff for real evidence.

### 2026-10-26: Track and licence
Type: decision
Status: proposed
Context: Indie track fits a solo builder. The Startup track needs an active employee of a startup.
Result: Indie Developer. Licence MIT, unless Miguel decides otherwise.
Next: Miguel confirms. Add `LICENSE` on Day 0.

### 2026-10-26: Prior work and the new-work rule
Type: decision
Status: accepted
Context: The demo may show only what is built in the window.
Result: New repository. No routine-machine code copied. Design token values only, listed in the README. First code commit on Oct 27 or later. Planning documents are labelled as planning.
Next: Check the commit history before submitting.

### 2026-10-26: Stack
Type: decision
Status: proposed
Context: Plan v1 kept Java and Spring Boot. The build is fresh, the agent loop, MCP server and schema validation are TypeScript-native, and nine days is short.
Result: Recommend one TypeScript service (HTTP API plus MCP server in one process), Postgres in Docker, Next.js console. Miguel decides; Spring Boot stays possible with a separate MCP process.
Next: Decision D-9 in `queue.md`.

### 2026-10-26: Data
Type: decision
Status: accepted
Result: Synthetic data only. Demo rows are labelled. No secrets in the repo, logs or video. The Kenya Data Protection Act is noted, not assessed. The product is not described as secure or compliant.

### 2026-10-27: Direction chosen, savings-group agent (D-14)
Type: decision
Status: accepted (Miguel chose it)
Context: Five options were listed on 2026-10-26. Miguel then asked to revisit the idea behind his work: a model shaped to his perspective through a curated identity, rules from mistakes, an understand-first step and an archive. A research and council review followed.
Evidence: Review notes in the author's hub (journal 2026-10-27 and the article "A folder is not a brain until you measure it"). Council scores are model opinions, not data.
Result: Plan v3. Product is a secretary for savings groups. The restraint and archive ideas are tested inside it (`docs/experiments.md`). Plan v2 (training programme agent) is archived in `docs/archive/2026-10-26-plan-v2/`.
Next: Interviews (D-11), model checks (H-04), freeze the scenario sets (H-05).

### 2026-10-27: Brain ideas treated as measured engineering, not as a product claim
Type: decision
Status: accepted
Context: Core plus archival memory is already built elsewhere (Letta, Anthropic's memory tool). Long context and distractors degrade models in published studies. Human memory is a motivation, not evidence: weights are frozen, an unloaded archive has no effect, and human gist is lossy while an AI archive can be exact.
Result: Three hypotheses with decision rules fixed before running: H1 restraint (primary), H2 archive (second), H3 compaction (stretch). Expect small effects with about 40 test scenarios. Report nulls. The reassurance or wellbeing framing stays out of the product and video because of the medical and mental-health anti-project.
Next: Write the scenario sets; commit; freeze.

### 2026-10-27: Chama landscape read
Type: verification
Status: manual-verified (sources read 2026-10-27; see `docs/research/chama-landscape.md`)
Result: Competitors exist (Chamasoft, M-Chama, Fundi Chama, a Postbank chama app). No uniqueness claim. The Sh300 billion figure is a news report of a ministry statement. The low adoption claim is a columnist's observation with no source.
Next: Interviews to test whether voice and paper intake with asking behaviour matters to treasurers.

### Experiments and verifications

None run yet. Day 1 list (v3):

- Model access on Baseten with the hackathon id.
- Tool calling, audio input, image input on handwriting, latency, Swahili drafting quality.
- Model terms: is "Built with Muse Spark Open" required?
- Credits: Meta form, Baseten request.

## Limitations (carried forward and updated)

- All data is synthetic. No treasurer or group has used the system.
- Demand over notebooks and existing chama apps is a hypothesis.
- No M-Pesa integration; statement matching, if built, uses synthetic statements.
- No scores on members, by design.
- Restraint and archive results will be small-n, synthetic, one model.
- Authentication is minimal and not production-grade.
- Data protection posture is not assessed.
- Model outputs are checked only against a small local eval set.
- Swahili support is unverified until the Day 1 check.

### 2026-10-28: H-02 done, public repo live with docs only
Type: verification
Status: done
Context: queue.md H-02.
Evidence: `gh repo view` returns public repo Miguel-Shinyenyi/umwayi-rm, default branch main, 16 commits, docs only plus MIT LICENSE. Commit dates of Oct 27 morning match actual writing time of the docs.
Result: Repo public. No code. README lists prior work. H-01 still open: API keys are held locally, request confirmations are not yet saved.
Next: H-04 Day 1 model checks.

### 2026-10-28: Stack and licence decided (D-9, D-10)
Type: decision
Status: accepted (Miguel chose both)
Context: queue.md D-9 and D-10.
Evidence: Miguel reply 2026-10-28: TypeScript for D-9; MIT LICENSE already committed for D-10.
Result: One TypeScript service (API plus MCP server in one process). Licence MIT.
Next: H-06 scaffold follows the TypeScript choice.

### 2026-10-28: H-04 Day 1 model checks on Baseten
Type: verification
Status: done with one caveat (primary terms unread, see below)
Context: queue.md H-04. Model meta-models/muse-spark-open-1026 on https://inference.baseten.co/v1. Key from a local 600 file, piped, never printed. Temperature 0, seed 7. Four curl probe rounds ran 14:23 to 14:33 EAT.
Evidence:
- Tool calling PASS, 1.2s. tools=[get_member_balance], tool_choice auto. Returned tool_calls with name get_member_balance and arguments {"member": "Wanjiku"}.
- Text PASS, 1.4s, with reasoning_effort low. Returned exactly "Sawa".
- Image PASS for acceptance, 3.1s, with reasoning_effort low. Described a 1px PNG as tiny blurry pixelated image. Handwriting reading not tested here. Deferred to H-11 synthetic photos.
- Audio FAIL. The model states it cannot hear or process audio, and prompt audio_tokens stayed 0. Direct audio intake is cut under the plan rule that a failed capability cuts its feature. Voice now depends on a Muse Voice Transcribe check, whose Meta key is not yet provisioned.
- Swahili PASS, author-judged, 2.5s, with reasoning_effort low. Returned a fluent formal thanks draft for five hundred shillings. One reader judged it. Not a metric. Swahili drafts stay in stretch scope.
- Latency is highly variable: 1.2 to 4.7s warm, 27s model list, 68s first call, 113s one image call, one 180s timeout. Verdict: usable with timeouts of 60s or more, retries, and low reasoning effort.
- Adapter rule: reasoning_effort low is mandatory. Default effort burned 20, 400, and 2000 token budgets with finish length and empty content across three rounds.
- Model id works exactly as the plan writes it. No short form needed.
- Terms: primary license unread. The Hugging Face file returns 401 without an accepted license login. Ten secondary sources agree the display line is required, and the README already carries it provisionally. Followup: read the primary text with an accepted account.
- Token spend across probes is about 4k tokens. Billing unchecked. Baseten key verified live. Modal key held but unused.
Result: capabilities recorded with date and command. Voice design switches to transcribe first. Adapter defaults are low effort with generous timeouts.
Next: H-05 scenarios written for transcribed voice, H-06 scaffold with the adapter defaults, terms followup.

### 2026-10-28: H-04 followup, Voice Transcribe plumbing works
Type: verification
Status: partial (plumbing verified, speech quality open)
Context: H-04 audio FAIL on Baseten moved voice to Muse Voice Transcribe on the Meta Model API.
Evidence:
- GET /models on https://api.meta.ai/v1 lists 9 models including muse-voice-transcribe-1.0. No muse-spark-open there, so the chat fallback cannot be the same model. Fallback is muse-spark-1.3 for chat plus transcribe for voice.
- POST /v1/asr/transcribe is not OpenAI style. /audio/transcriptions returns 404. Working shape: multipart request JSON {"model", "audioEncoding": "WAV"} plus an audio part, mono s16le WAV at 16 or 24 kHz. Found by probing server errors plus a provider doc.
- A 1s 16kHz tone returned HTTP 200 in 5.5s with an empty transcript. Plumbing verified end to end.
- Speech quality unverified. macOS say cannot write files in this sandbox, so no synthetic speech sample exists yet.
Result: the transcribe path is viable. The quality check waits on a real speech sample.
Next: transcribe a user recorded reading of a synthetic script, then H-10 intake uses transcribe first.

### 2026-10-28: H-04 followup, Voice Transcribe speech quality verified
Type: verification
Status: done
Context: transcribe plumbing verified earlier. Quality waited on speech.
Evidence: user supplied a 9s WhatsApp voice note (Ogg Opus, kept outside the repo), converted with ffmpeg to 16kHz mono WAV, posted to /v1/asr/transcribe with muse-voice-transcribe-1.0. HTTP 200 in 3.9s. Transcript withheld: the sample is a personal recording and the repo carries synthetic data only. Verdict: a short English payment line transcribed sensibly end to end.
Result: voice transcribe path verified for quality and plumbing. H-10 intake uses transcribe first.
Next: H-05 scenarios, H-06 scaffold.

### 2026-10-28: H-05 scenario sets written and frozen
Type: experiment
Status: done (hashes recorded; protocol commit pointer follows the merge)
Context: queue.md H-05. Protocol in docs/experiments.md, H1 and H2.
Evidence: evals/h1/scenarios.json (60: 20 dev, 40 test, stratified 2/4 per ambiguous subtype and 10/20 clear), evals/h1/group.json plus commitments.json (12 synthetic members including the Brian collision pair, 500 and 1000 contributions, one 2000 loan repayment), evals/h2/questions.json (30: 10 dev, 20 test; needle 3/7, stale 3/7, identity 4/6; every question carries needs for the H-15 history build). Validation: JSON parses, no duplicate ids, all member refs resolve, all labels complete. SHA-256 recorded in docs/experiments.md. Checked with a python3 validation snippet plus shasum, run 2026-10-28.
Result: splits frozen. Dev work uses dev ids only. Test ids run once per condition per seed for counted results.
Next: H-06 scaffold. If PR review changes any scenario file, re-hash before merge. The 12-month H2 history gets built for H-15 from the needs lists.

### 2026-10-28: H-06 scaffold built, compose proof pending CI
Type: verification
Status: in progress (unit and build green; compose acceptance unproven locally)
Context: queue.md H-06. TypeScript plus express, vitest, Docker Compose with api plus postgres:16, GitHub Actions CI.
Evidence:
- npm run typecheck clean. npm test 3 passed. npm run build emits dist. Lockfile committed.
- Unit tests avoid sockets: the sandbox blocks all listen calls, so the health handler is pure and tested directly. The wired route is proven by the compose healthcheck plus a CI curl.
- docker compose config validates. Local up is blocked: buildx cannot write its cache under the sandbox, and host port 3000 is held by the live routine-machine stack (left untouched). Host port is API_PORT with default 3000; local runs on this machine need API_PORT=3002 (3001 is grafana).
- The adapter interface carries H-04 defaults in types: reasoningEffort is the literal "low", timeoutMs 60000, seed 7. FakeModelAdapter ships per experiments rule 8. The live Baseten adapter waits for H-09.
- npm needed --cache /tmp/npm-cache (home npm cache not writable in sandbox). Project unaffected. CI uses a fresh cache.
- Deps named in README per the rules: express MIT; typescript Apache-2.0; vitest, tsx MIT. README licence line corrected to MIT (D-10 decided).
- Postgres runs idle with no schema. Migrations start in H-07.
Result: scaffold complete except the live compose proof.
Next: open PR, let CI prove `docker compose up` serves /health, then mark H-06 done.

### 2026-10-28: H-06 done, CI proves compose health
Type: verification
Status: done
Context: queue.md H-06. PR 6, CI run 40750952926.
Evidence: CI build job success in 50s. Every step green: npm ci, typecheck, tests, build, docker compose up -d --wait, curl -fsS /health, teardown. The curl step is the acceptance proof.
Result: `docker compose up` serves /health.
Next: H-07 ledger core.

### 2026-10-28: H-07 ledger core built, pg proof pending CI
Type: verification
Status: in progress (memory suite green locally; pg suite needs the CI database)
Context: queue.md H-07. Service layer only, no HTTP yet. Proposal and approval routes come with H-09 and H-10.
Evidence:
- Migration 001: groups, members, commitments, entries, proposals, treasurer tokens, plus a trigger that rejects any UPDATE or DELETE on entries.
- LedgerStore interface with Postgres and memory implementations. One 8-case conformance suite runs on both: create round trip, double approval yields one entry, reject lifecycle, non-entry approve refused, cross-group 403 on five paths, validation rejects, list filters.
- Local: typecheck clean, build emits, 11 tests pass. The 9 pg tests skip without DATABASE_URL (stated skip, not a green result).
- Contract refined: entries gain proposal_id (unique, null for direct entries) for idempotent approval. Logged here; design-decisions.md untouched as stale v2 with a rewrite task proposed.
- Idempotency is transactional: approval locks the proposal row, reuses the existing entry on repeat, and refuses double decisions with 409.
- Access: one treasurer token per group, resolved on every call, cross-group denied 403.
Result: core complete except the live pg proof.
Next: open PR, let CI run the pg suite against real Postgres, then mark H-07 done.

### 2026-10-28: H-07 done, CI proves both suites
Type: verification
Status: done
Context: queue.md H-07. PR 7, CI run 40754353825.
Evidence: CI build success in 59s. Log lines show tests/health.test.ts 3 passed, tests/ledger.memory.test.ts 8 passed, tests/ledger.pg.test.ts 9 passed. Zero skipped. The pg run covers the conformance suite on Postgres plus the trigger test.
Result: create, idempotency, append-only, and access denial pass on both stores.
Next: H-08 Today, reconciliation, fixtures.

### 2026-10-28: H-08 Today core built, pg proof pending CI
Type: verification
Status: in progress (31 pass locally; 12 pg tests need the CI database)
Context: queue.md H-08. Service layer only, no HTTP yet. Routes come with H-09 and H-10.
Evidence:
- Migration 002: findings table. Store gains listMembers, listCommitments, listProposals, saveFinding, listFindings, resolveFinding on both implementations. Conformance suite grows to 11 cases.
- src/ledger/balances.ts: paid sums, per-period balances, overdue scan. Monthly rules evaluate per period. One-date rules emit once with all-time paid for that kind. Overdue means past the due date with an outstanding balance; the due date itself is not overdue.
- src/ledger/today.ts: buildToday assembles overdue, open findings, and pending questions. Order is category rank, then due date plus display name, finding kind, question creation time. asOf and periods are explicit inputs, never the clock.
- src/ledger/reconcile.ts: comparePaper matches paper rows to entries by normalized name or alias plus period, exact amount first, then amount differs, leftovers split only on paper versus only in ledger. Rows sort before matching so input order cannot change the result.
- 12 fixtures under tests/fixtures/today cover clear, overdue, partial, order, loan, questions, findings, mixed, resolved exclusion, alias display, and the due-date boundary. The runner asserts exact sequences, rebuilds twice for equality, and rebuilds reverse-seeded for set equality.
- Local: typecheck clean, build emits, 31 pass. The 12 pg tests skip without DATABASE_URL (stated skip, not a green result).
Result: Today core complete except the live pg proof.
Next: open PR, let CI run the pg suite, then mark H-08 done.

### 2026-10-28: H-09 MCP server and first dev runs
Type: experiment
Status: done
Context: queue.md H-09. Pack v0, seed 7, model meta-models/muse-spark-open-1026 on Baseten, reasoning low. Harness scripts/run-h1-dev.ts. Dev split only; no test ids touched.
Evidence:
- MCP server with 5 tools over stdio plus in-memory transport for runs. Checks live in the handlers: quotes inside the intake with a 3 cap, member resolution with collision refusal, refusal budget forcing a question after 3, feedback free of expected labels. Transcribe and photo tools wait for H-10 and H-11.
- Loop: turn budget 8, tool budget 12, one successful proposal ends the run, traces saved per scenario.
- Run 1 docs/evals/dev-h1-2026-10-28-seed7.json: 18/20. Run 2 seed7-rerun.json: 17/20. Both runs show zero propose/ask confusions. Every failure is an empty completion (no content, no tool call) on different scenarios per run.
- No systematic rule failure occurred, so the conditional rule revision did not trigger. Pack stays v0.
- Two fixes during the runs: the harness creates its output dir, and the system prompt injects today's date after the model dated October to 2025.
Result: annotated dev runs exist. Agent follows the pack on every completed run.
Next: H-10 voice intake via transcribe. Followups for H-12: retry on empty completion, usage capture in the harness, date injection in the production loop path.

### 2026-10-28: H-08 done, CI proves all suites
Type: verification
Status: done
Context: queue.md H-08. PR 8, CI run 40757593802.
Evidence: CI build success in 57s. Log lines show 5 files passed with 43 tests and zero skipped: health 3, memory conformance 11, pg 12 against real Postgres, fixtures 12, reconcile 5.
Result: 12 fixtures pass with the same input giving the same order.
Next: H-09 MCP server and first agent run.

### 2026-10-28: H-10 voice intake and approval
Type: build
Status: done
Context: queue.md H-10. Branch h-10/voice-approval. Voice goes transcribe first per the H-04 audio FAIL.
Evidence:
- Transcribe adapter src/adapters/transcribe.ts posts multipart to https://api.meta.ai/v1/asr/transcribe with model muse-voice-transcribe-1.0. Live curl probe on a 1s 16kHz tone returned HTTP 200 with an empty transcript and audioDurationMs 1040; the /v1/v1/ variant returns 404, settling the URL.
- Routes: POST /groups/:id/intake/note takes {text} or {audio base64 WAV}, runs the loop over in-memory MCP with the pack and date injection, returns runId, modelId, transcript, outcome, proposals, turns. GET /groups/:id/proposals filters by status. POST /proposals/:id/approve is idempotent and returns {entry, already}. POST /proposals/:id/reject rejects. POST /groups/:id/entries records a treasurer-confirmed entry as the model-off manual fallback.
- Tests: 3 transcribe plus 8 intake/proposals/entry tests, all pass. Approve-twice test creates exactly one entry with tier agent_proposed_approved. Full local suite: 54 pass, 12 pg skip for CI.
- Node has no network in the dev sandbox, so the compiled adapter and a live speech-to-approval chain were not run here. The wire shape is proven by curl and the H-04 speech check; the wiring is proven by the maintained tests.
Result: voice note becomes approved entries through the routes; duplicate approval changes nothing.
Next: H-11 photo reading and reconciliation findings. Open: proposal edit and question answer routes are not built.

### 2026-10-28: H-11 photo reading and reconciliation findings
Type: build
Status: done
Context: queue.md H-11. Branch h-11/photo-reconcile. H-04 left handwriting reading untested, deferred to synthetic photos.
Evidence:
- Live read check: stdlib-only script rendered a synthetic printed ledger page (1500x570 PNG, kept in /tmp, outside the repo). First probe clipped the canvas and the model read WANJIKU 500 as 5; after widening the canvas the model read all 3 rows exactly (WANJIKU 500, OTIS 500, AMARA 300) in 5.3s, HTTP 200, seed 7, reasoning low. Verdict: printed text reads exactly; handwriting still untested.
- Photo reader src/adapters/vision.ts posts image_url plus a JSON-only prompt and parses rows strictly (member, positive integer amount, YYYY-MM period). Strict parse means misreads fail loudly, never silently.
- Route POST /groups/:id/intake/page reads rows, resolves member text with first-name tolerance, compares with the untouched H-08 matcher, creates entry proposals for mismatches, files questions for unknown names, and saves findings. Matched rows create nothing. GET /groups/:id/findings lists findings with a status filter. Model-off photo intake answers 503 model_off.
- Tests: 5 vision plus 4 page route tests pass. Full local suite: 63 pass, 12 pg skip for CI.
Result: a page becomes proposed rows and listed findings.
Next: H-12 H1 run on the frozen test split plus fallback mode. Open: proposal edit and question answer routes still not built; handwriting reading still untested.

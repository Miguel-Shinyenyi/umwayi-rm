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

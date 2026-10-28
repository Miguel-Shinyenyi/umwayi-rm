# 2026-10-28: H-04 model checks

Date: 2026-10-28. Source: terminal session with the coding assistant, saved verbatim under the recurrent research rule. Purpose: research data for measurable outcomes. Status: notes, not results. The open questions at the end were resolved later the same day.

## Verbatim record

H-04 is complete and recorded. The branch is current with main.

## Setup verified

Branch `h-04/model-checks` fast-forwarded to main tip `5616a4e` with a clean tree. I will keep it synced the same way throughout, and I will ask before any rebase. Key files verified by size only, values never printed or logged: Baseten 46 bytes, Modal 49 bytes.

## Endpoint and license source

Baseten OpenAI-compatible base `https://inference.baseten.co/v1` with Bearer auth, confirmed from Baseten docs. Plan model id `meta-models/muse-spark-open-1026` works as written. The primary license file on Hugging Face is gated and returns 401, so the terms read stays open; ten secondary sources agree the "Built with Muse Spark Open" display is required, and the README already carries it provisionally.

## Probe verdicts (temperature 0, seed 7, times EAT)

- Tool calling: PASS, 1.2s. Returned `get_member_balance` with `{"member": "Wanjiku"}`.
- Text: PASS, 1.4s. Returned exactly "Sawa".
- Image: PASS for acceptance, 3.1s. Described the test PNG. Handwriting quality not tested; deferred to H-11 synthetic photos.
- Audio: FAIL. The model states it cannot process audio, and audio token counts stayed 0. Direct audio intake is cut under the plan rule. Voice now depends on a Muse Voice Transcribe check, whose Meta key is not provisioned yet.
- Swahili: PASS, author-judged, 2.5s. Fluent formal draft. One reader judged it, not a metric. Stays in stretch scope.
- Latency: 1.2 to 4.7s warm, with 27s, 68s, and 113s outliers plus one 180s timeout. Usable with 60s or longer timeouts, retries, and low reasoning effort.
- Mandatory adapter finding: default reasoning effort burned 20, 400, and 2000 token budgets with empty content. `reasoning_effort: low` is required and returns content in about 1.4s.
- Token spend across all probes is about 4k tokens. Modal key held but unused.

## Recorded

The full outcome with dates and commands is in `docs/hackathon-log.md`, and queue row H-04 is marked done 2026-10-28. Both sit uncommitted on `h-04/model-checks`. H-01 stays open: the Baseten key is verified live, but billing and credit confirmations are still yours to save.

## Open questions

- Commit the log and queue updates, push the branch, and open the review PR?
- Provision a Meta API key file so the Voice Transcribe check can run?

## How this is tested

H-04 acceptance is the log entry with dates and commands. The adapter findings are tested by H-06 scaffold defaults and H-09 agent runs. The audio cut is tested by H-10 transcribe first intake.

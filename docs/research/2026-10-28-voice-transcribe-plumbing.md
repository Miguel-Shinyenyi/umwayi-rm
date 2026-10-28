# 2026-10-28: Voice Transcribe plumbing

Date: 2026-10-28. Source: terminal session with the coding assistant, saved verbatim under the recurrent research rule. Purpose: research data for measurable outcomes. Status: notes, not results. The open questions at the end were resolved later the same day.

## Verbatim record

Transcribe plumbing is verified. Speech quality still needs a real voice sample.

## What the probes showed

- Meta key works. `GET /models` lists 9 models including `muse-voice-transcribe-1.0`. No Muse Spark Open there, so the chat fallback is `muse-spark-1.3`, not the same model.
- The transcriptions endpoint is `POST /v1/asr/transcribe`, not OpenAI style. `/audio/transcriptions` returns 404. The working shape is a multipart `request` JSON with model plus `audioEncoding: "WAV"` and an `audio` part holding mono 16-bit WAV at 16 or 24 kHz. Server errors plus a provider doc gave the shape.
- A 1s 16kHz tone returned HTTP 200 in 5.5s with an empty transcript. Plumbing verified end to end.
- Speech quality is unverified. macOS `say` cannot write files in this sandbox, so I could not synthesize speech.

## Recorded

A followup entry is in `docs/hackathon-log.md` on `h-04/model-checks`, uncommitted. PR 2 stays as is until you say to commit.

## To close the speech gap

Record about 10 seconds on your own device reading a synthetic line, for example "Wanjiku paid five hundred shillings for January." Save it outside the repo, for example `/tmp/voice-test.m4a`, and tell me the path. I will convert if needed and transcribe it.

## Open questions

- Commit the followup entry to update PR 2?
- Will you provide the voice sample, or defer quality to H-10?

## How this is tested

H-10 voice intake acceptance runs through this endpoint shape. The fallback split is tested by adapter fallback runs in H-09.

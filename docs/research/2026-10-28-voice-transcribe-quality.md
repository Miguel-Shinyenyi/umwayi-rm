# 2026-10-28: Voice Transcribe quality

Date: 2026-10-28. Source: terminal session with the coding assistant, saved verbatim under the recurrent research rule. Purpose: research data for measurable outcomes. Status: notes, not results.

## Verbatim record

PR 2 is updated and the voice path is now fully verified.

## What changed

- Commit `8755d1f` pushed `h-04/model-checks` to origin. PR 2 picked it up. Branch reads in sync with a clean tree at that point.
- Voice note: 16KB Ogg Opus, 9 seconds. macOS `afconvert` cannot read Opus, so ffmpeg converted it to 16kHz mono WAV. Transcription returned HTTP 200 in 3.9s with a sensible English payment line end to end.
- A second log entry records the quality verdict. It sits uncommitted on the branch.

## Synthetic data call

I withheld the verbatim transcript from the log because the sample is your personal recording and the repo carries synthetic data only. The audio itself never entered the repo. The log holds the verdict plus duration, latency, and method.

## Open question

Commit the quality entry to update PR 2 again?

## How this is tested

H-10 voice intake acceptance replays this path on synthetic voice. The transcript stays out of the repo under the synthetic data rule.

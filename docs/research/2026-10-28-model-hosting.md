# 2026-10-28: Model hosting and test approach

Date: 2026-10-28. Source: terminal session with the coding assistant, saved verbatim under the recurrent research rule. Purpose: research data for measurable outcomes. Status: notes, not results.

## Verbatim record

Baseten. The plan names it in three places: HACKATHON.md section 6 uses Muse Spark Open on Baseten with id meta-models/muse-spark-open-1026, the fallback is Meta Model API, and the credits table gives Baseten 2M TPM for this event. The Lab trace must show that model id for the Meta tooling score. Modal appears only as a credit line, not as a model host.

Use Modal for our own compute if we need it later: the API service, eval runners, or sandbox jobs. Keep the model on Baseten unless the Day 1 checks fail it. If Baseten fails, the plan fallback is Meta Model API, not a self-hosted model.

Agreed, with one boundary that is already in the design. Everything model facing runs against the deployed Baseten model from the first check, and every run logs date, model id, prompt version, and seed. The deterministic core stays model free on purpose: ledger, balances, Today, and approval must pass with the model off. That is a required guarantee, not a gap.

Concrete shape: H-04 records tool calling, audio, image handwriting, latency, and Swahili before any feature depends on them. Each build task after that ships with its acceptance tests. Null results get reported.

## How this is tested

H-04 checks each named capability on Baseten with date and command. Model off fallback is a contract guarantee with its own tests.

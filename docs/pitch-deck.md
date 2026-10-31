# docs/pitch-deck.md: submission text (plan v3, draft)

Fill figures only from saved run files and interviews. Placeholders in [brackets] must be replaced or removed before submitting.

Project name: Umwayi-RM
Track: Indie Developer. Problem statement: Build for Your World.

One line: An open-source secretary for savings groups that turns voice notes and paper ledger photos into proposed entries, asks when it is unsure, and leaves every decision to the treasurer.

Problem: Small savings groups often keep records on paper and in chat messages, where names collide, months are missing and totals disagree. We believe this is common; we have 0 interviews so far (H-14 open, update before submitting).

What it does:
- Reads a voice note or typed note into proposed ledger entries, each quoting the words behind it.
- Reads a photo of a paper ledger page and lists differences from the stored ledger.
- Asks a question when a note is ambiguous (for example two members with the same name).
- Drafts gentle reminders as proposals with cited entries. Nothing is sent.
- Shows its steps and the model id in a Lab.

What it does not do: move money, advise on lending, score or rate members, or send messages.

How it uses Meta models: Muse Spark Open on Baseten for the agent loop, tool calls, and note and page reading; Meta Model API for voice transcription (muse-voice-transcribe-1.0). The trace shows the model id.

Technical depth: code owns the ledger, balances and reconciliation; the agent only writes proposals; idempotent approval; citation and schema checks; an MCP server with risk-rated tools; an eval suite with a frozen test split.

Measured: H1 restraint, 3 seeds on the frozen split (16 ambiguous, 24 clear each): curated vs generic wrong-proposal rate 0/48 vs 0/48, so the claim is not supported (floor effect, zero-width interval). Clear-scenario control: curated 67/72, generic 24/72. H2 archive, seed 7 (20 questions), rescored per `docs/evals/h2-seed7-analysis.json` (raw archive 17/20): core-plus-archive 19/20 vs plain retrieval 20/20 vs truncation 13/20 vs full context 20/20; the claim is not supported. All runs saved under docs/evals/ with model id, prompt version, and seed.

Not proven: that treasurers prefer it to notebooks or to existing apps such as Chamasoft; that it reduces errors in real groups; security and Data Protection Act compliance; that the rules help beyond this synthetic set and model.

Open source: MIT. Built with Muse Spark Open [if the terms require this wording].

Ask: one pilot group for a month, and feedback from treasurers.

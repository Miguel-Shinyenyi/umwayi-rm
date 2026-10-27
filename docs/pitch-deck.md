# docs/pitch-deck.md: submission text (plan v3, draft)

Fill figures only from saved run files and interviews. Placeholders in [brackets] must be replaced or removed before submitting.

Project name: Umwayi-RM
Track: Indie Developer. Problem statement: Build for Your World.

One line: An open-source secretary for savings groups that turns voice notes and paper ledger photos into proposed entries, asks when it is unsure, and leaves every decision to the treasurer.

Problem: Small savings groups often keep records on paper and in chat messages, where names collide, months are missing and totals disagree. [Add one first-hand example only if an interview supports it. Otherwise: "We believe this is common; we have [N] interviews."]

What it does:
- Reads a voice note or typed note into proposed ledger entries, each quoting the words behind it.
- Reads a photo of a paper ledger page and lists differences from the stored ledger.
- Asks a question when a note is ambiguous (for example two members with the same name).
- Drafts gentle reminders. Nothing is sent.
- Shows its steps and the model id in a Lab.

What it does not do: move money, advise on lending, score or rate members, or send messages.

How it uses Meta models: Muse Spark Open on Baseten for the agent loop, tool calls, note and page reading, and drafting; [Meta Model API for fallback or transcription, if used]. The trace shows the model id.

Technical depth: code owns the ledger, balances and reconciliation; the agent only writes proposals; idempotent approval; citation and schema checks; an MCP server with risk-rated tools; an eval suite with a frozen test split.

Measured: [H1 result, with n, interval and the clear-scenario control, copied from the saved run file. If not supported, say so.] [H2 result if run.]

Not proven: that treasurers prefer it to notebooks or to existing apps such as Chamasoft; that it reduces errors in real groups; security and Data Protection Act compliance; that the rules help beyond this synthetic set and model.

Open source: MIT. Built with Muse Spark Open [if the terms require this wording].

Ask: one pilot group for a month, and feedback from treasurers.

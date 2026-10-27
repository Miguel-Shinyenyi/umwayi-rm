# docs/design-decisions.md — Design Decisions Log

> **Purpose:** Record every deliberate deviation from the HTML design references, plus the
reasoning, so future contributors don't "fix" intentional choices or silently drift from the design
language.
> **Rule 1:** A deviation is only acceptable if it is written here *before* the polish phase (or
immediately after discovery), with the reason and the alternative considered. Silent deviations
are defects.
> **Rule 2:** Never delete an entry. Supersede it with a new entry and mark the old one
`superseded by DD-<nnn>`.
> **Rule 3:** Primary references are the HTML files in `routine-machine/design-reference/`
(open in a browser), plus `docs/design.md`, `docs/frontend.md`, and `PROJECT.md`.
> **Rule 4:** The shepherd analogy is brand and narrative, not metaphor for controls. §3.2 of
`HACKATHON.md` defines the mapping; this log records the UI treatment.

**Status vocabulary:** `proposed`, `accepted`, `rejected`, `superseded`.

---

## How to use this log

Log an entry when:
- A component, token, colour, spacing, radius, or motion choice **deviates** from the reference.
- A reference file is **ambiguous** and a judgement call was made.
- A reference is **missing** a case the product needs (e.g. the intervention queue, the Lab view)
and a new pattern is introduced.
- Accessibility, contrast, or performance forces a change from the visual reference.
- Something in the reference looks wrong for the organisational product and is deliberately *not*
carried forward.

### Entry template
```
### DD-<nnn> — <short title>
**Date:** YYYY-MM-DD
**Status:** proposed | accepted | rejected | superseded by DD-<nnn>
**Area:** tokens | colour | typography | spacing | radius | motion | component | layout | copy |
accessibility | brand | pitch-deck
**Reference:** <file path in routine-machine/design-reference/> and/or docs/design.md section
**Context:** Why the reference didn't fit as-is.
**Decision:** What we did instead (be specific — tokens, values, component names).
**Alternatives considered:** Brief.
**Trade-offs:** What we lose, what we gain.
**Verification:** Where the change was inspected (URL, viewport, theme, screenshot path).
**Owner:** <name>
```

---

## Global decisions (apply to all components)

### DD-001 — Adopt Routine Machine design tokens verbatim as the starting palette
**Date:** 2026-10-24
**Status:** accepted
**Area:** tokens
**Reference:** `docs/design.md`; `routine-machine/design-reference/index.html`
**Context:** Umwayi-RM is an organisational product sharing the Routine Machine visual
language. Rebuilding the palette from scratch would fragment the brand.
**Decision:** Use the amber accent, white-on-quiet-canvas depth, and the light/dark token table
in `HACKATHON.md` §3.4 without modification. Semantic CSS variables only — no raw colour
literals inside components.
**Alternatives considered:** A distinct organisational palette (rejected — fragments identity and
wastes time).
**Trade-offs:** Constrained palette; but predictable and fast.
**Verification:** _To be filled after first component build._
**Owner:** Miguel Shinyenyi

---

### DD-002 — Motion has a purpose; no autoplay or ambient animation
**Date:** 2026-10-24
**Status:** accepted
**Area:** motion
**Reference:** `docs/design.md` motion rules; reference HTML interactions
**Context:** The design language explicitly forbids hype motion. Repeated micro-animations
would also add accessibility and battery cost for staff using the app for hours.
**Decision:** Only brief feedback animations on user action (hover, focus, submit, state
change). No ambient motion, no autoplay, no looping decoration. Respect
`prefers-reduced-motion`.
**Alternatives considered:** Subtle looping motion on the outcome dashboard (rejected — no
purpose).
**Trade-offs:** Feels less "alive" in screenshots; but calmer in daily use.
**Verification:** _To be filled._
**Owner:** Miguel Shinyenyi

---

### DD-003 — Inherit the system font stack; no custom web fonts
**Date:** 2026-10-24
**Status:** accepted
**Area:** typography
**Reference:** `docs/design.md`
**Context:** Custom web fonts add weight, layout shift, and licensing burden — particularly
relevant for low-bandwidth users in the target context.
**Decision:** System font stack only. Sentence case. Restrained scale. No web-font loading.
**Alternatives considered:** A custom display face (rejected — cost > value).
**Trade-offs:** Less distinctive typography; better performance and clarity.
**Verification:** _To be filled._
**Owner:** Miguel Shinyenyi

---

### DD-004 — Amber is the single accent; green is reserved for completed state
**Date:** 2026-10-24
**Status:** accepted
**Area:** colour
**Reference:** `docs/design.md` colour rules
**Context:** Multiple accents would dilute the calm-first visual language and compete with
semantic states.
**Decision:** Amber (`#E9A23B` light / `#F0AE4E` dark) is the only accent colour, used for one
emphasis per view. Success green (`#1B7332` / `#30D158`) is reserved for completed state. No
red for overdue — overdue is communicated via badge text and icon.
**Alternatives considered:** Red for overdue (rejected — alarmism; the queue is a calm surface,
not a crisis screen).
**Trade-offs:** Overdue items are less "urgent-looking"; but the queue is for daily use, not
emergencies.
**Verification:** _To be filled — check badge contrast in both themes._
**Owner:** Miguel Shinyenyi

---
## The shepherd analogy in the UI

### DD-010 — Shepherd motif is brand identity, not control metaphor
**Date:** 2026-10-24
**Status:** accepted
**Area:** brand
**Reference:** `HACKATHON.md` §3.2 (the analogy table); reference HTML logo and sign-in
screen
**Context:** The shepherd analogy is the brand's spine. It must appear in the UI as restrained
identity and in the pitch as the narrative frame. It must not obscure technical concepts or
become a metaphor for controls (e.g. "the staff" as a button label).
**Decision:**
- The motif appears in: the logo, the sign-in screen, empty states, and the pitch deck's title and
closing slides.
- The motif does **not** appear on working surfaces: candidates, timeline, queue, outcomes,
Lab.
- Control labels use plain language, not pastoral metaphor. The queue is "Interventions," not
"The Staff."
- The analogy table in `HACKATHON.md` §3.2 is for the pitch and the README, not for UI
labels.
**Alternatives considered:** Pastoral labels throughout (rejected — obscures technical
concepts); no motif at all (rejected — loses brand identity).
**Trade-offs:** Less visual distinctiveness on working surfaces; clearer for daily use.
**Verification:** _To be filled — inspect sign-in and Overview against reference HTML._
**Owner:** Miguel Shinyenyi

---

### DD-011 — "Demo data" badge uses the Private colour token
**Date:** 2026-10-24
**Status:** accepted
**Area:** colour / component
**Reference:** `docs/design.md` badge patterns; the Private colour token
**Context:** Every demo record must be visibly labelled, but the label must not look like a
product feature or an error. It must be unmistakably meta.
**Decision:** A small pill in the top bar, top-right. Text: "Demo data". Colour: `#2F5A72` /
`#EEF3F7` (light) and `#8EC5E8` / `#12232E` (dark), matching the Private token. Text-only, no
icon. Always visible in demo mode; hidden when `DEMO_SEED_ENABLED=false`.
**Alternatives considered:** Amber badge (rejected — competes with the accent); red (rejected
— signals error).
**Trade-offs:** Slightly less prominent than amber; but unmistakably meta.
**Verification:** _To be filled — check contrast and placement at 1440×900 and 390px._
**Owner:** Miguel Shinyenyi
---

## Product-specific adaptations

> These entries capture where the organisational product genuinely needs a pattern the
personal-routines reference does not provide. Each one must still conform to the visual
discipline above.

### DD-020 — Candidate timeline replaces the personal "routine" view
**Date:** 2026-10-24
**Status:** accepted
**Area:** component / layout
**Reference:** `routine-machine/design-reference/` — personal routine dashboard pattern
**Context:** The reference centres on a person's own routine; Umwayi-RM centres on a
candidate's journey over time, viewed by staff. The information density and direction of reading
(reverse-chronological evidence) are different.
**Decision:** A dedicated **Timeline** view: vertical, reverse-chronological, grouped by day.
Each event carries:
- A provenance badge: `user-confirmed` (Success colour), `agent-reported` (Muted), `unverified`
(Private colour).
- A type label (e.g. "milestone.completed") in muted text.
- Optional evidence reference as a link.
- A 1-line excerpt in body text.

Reuse the reference's card radius (18px), hairline separators, muted-text treatment for
secondary metadata, and amber accent only for the active event or the "next action" marker.
**Alternatives considered:**
- Reuse the routine view verbatim (rejected — metaphor doesn't fit).
- Table-only evidence list (rejected — loses the temporal feel).
**Trade-offs:** New component to build and validate; but the timeline is a core story surface.
**Verification:** _To be filled — compare side-by-side with reference HTML; check light/dark;
desktop + 390px._
**Owner:** Miguel Shinyenyi

---

### DD-021 — Intervention queue as a ranked, explainable list
**Date:** 2026-10-24
**Status:** accepted
**Area:** component
**Reference:** none in `design-reference/` (new pattern)
**Context:** The reference has no notion of "ranked next actions for staff". The intervention
queue is the hero surface of the demo and the pitch.
**Decision:**
- Single-column list; each row shows:
  - Candidate display name (bold).
  - Action type (`commitment.due`, `milestone.overdue`, `check-in.due`, `evidence.gap`).
  - Due-in/overdue-by in human language (e.g. "due in 2 days", "overdue by 3 days").
  - A one-sentence `rationale` in muted text.
  - A provenance marker if the item depends on unverified evidence.
- **`rank_score` is not displayed as a raw number.** Ordering communicates rank.
- Each row exposes a "Why this?" reveal (click or keyboard focus) that shows:
  - The `reason` string.
  - The `days_overdue` value.
  - The ranking factors (e.g. "kind weight: 1.0; overdue weight: 0.14; tie-breaker: older due
date").
- Status badges use the reference palette: amber for due, Private for unverified evidence,
Success-green for completed (which does not appear in the queue — completed items are
removed).
- **No red "alarm" colour.** Overdue is communicated via badge text and icon, not colour alone.
**Alternatives considered:**
- Show `rank_score` as a percentage (rejected — implies false precision).
- Kanban board layout (rejected — implies workflow states the product doesn't model).
- Card grid (rejected — less scannable for a daily-use queue).
**Trade-offs:** Simpler surface; less at-a-glance triage than a board. Acceptable for the
hackathon.
**Verification:** _To be filled — check row density, reveal interaction, keyboard navigation._
**Owner:** Miguel Shinyenyi

---

### DD-022 — Queue rationale is an inset, not inline
**Date:** 2026-10-24
**Status:** accepted
**Area:** component / layout
**Reference:** `docs/design.md` inset surface pattern
**Context:** The AI rationale must be visibly a secondary element, not competing with the
deterministic ranking. If it looks like a first-class decision input, staff will over-trust it.
**Decision:** The `rationale` is rendered as an inset surface within the queue row:
- Background: Secondary surface token (`#F5F5F7` / `#2C2C2E`).
- Border: hairline, 1px.
- Text: muted ink, 12px.
- A small label: "Why this?" as the reveal trigger.
- No icon that suggests AI authorship (no robot, no sparkle). The rationale is a sentence, not an
AI badge.
- When `rationale_source = "fallback"`, the inset shows the fallback string without any error
styling. No "model unavailable" banner; the queue works.
**Alternatives considered:**
- Inline rationale in the row body (rejected — competes with the candidate name and action).
- Streaming rationale (rejected — visual noise, implies the model is "thinking").
- AI badge on every rationale (rejected — draws attention to the model, not the item).
**Trade-offs:** Less visible that AI is involved; the pitch and Q&A can name the model. The UI's
job is the queue, not the AI.
**Verification:** _To be filled — inspect inset contrast and readability at 1440×900 and 390px._
**Owner:** Miguel Shinyenyi

---

### DD-023 — Outcome dashboard: measured, not projected
**Date:** 2026-10-24
**Status:** accepted
**Area:** component / copy
**Reference:** none (new pattern); visual language from `design-reference/` cards
**Context:** Outcome dashboards are easy to overstate. The temptation is to show projections,
risk scores, or forecasts. Those are out of scope and unvalidated. The product must only
present measured state.
**Decision:**
- Only show counts and rates computed from stored records (placements confirmed, retention at
day 30/60/90, overdue vs. on-track).
- Every chart has a table or textual equivalent.
- No projections, no "risk score", no forecasting.
- If a metric has insufficient data (`data_sufficiency = insufficient`), show "not enough data yet"
rather than a misleading zero.
- The phrase "projected" is banned from the outcome dashboard.
**Alternatives considered:**
- Add a simple forecast line (rejected — unvalidated, misleads).
- Risk score column (rejected — out of scope and ethically risky).
**Trade-offs:** Less visually dramatic; honest and defensible.
**Verification:** _To be filled — inspect each metric card for insufficient-data state._
**Owner:** Miguel Shinyenyi

---

### DD-024 — Lab view is a super-admin surface, separate navigation
**Date:** 2026-10-24
**Status:** accepted
**Area:** component / layout
**Reference:** none (new pattern); visual language from `design-reference/` admin patterns if
any
**Context:** The Lab is the experiment log. It is not a staff surface. It must not contain candidate
data. It is where the pitch's slide 12 points.
**Decision:**
- Separate navigation item, visible only to `super_admin` role.
- Contents: experiment records (from `/lab-records`), system observability (health, request rate,
error rate, queue latency), pitch deck slides, and task reminders.
- **No candidate data on the Lab screen.** Only aggregate observability and experiment
records.
- Visual treatment: same design tokens as the rest of the app; no special "admin" colour.
- Task reminders: a list of upcoming tasks from `docs/hackathon-log.md` with due dates;
reminders fire at the date and time.
**Alternatives considered:**
- Merge Lab into the main navigation (rejected — conflates staff and admin surfaces).
- Separate "admin theme" (rejected — fragments the design language).
**Trade-offs:** Another surface to build and validate; but it is the pitch's evidence base.
**Verification:** _To be filled — confirm staff role cannot access Lab; confirm no candidate data
on Lab._
**Owner:** Miguel Shinyenyi

---

### DD-025 — "Prune" proposals require explicit approval and are logged
**Date:** 2026-10-24
**Status:** accepted
**Area:** component / copy / colour semantics
**Reference:** none (new pattern)
**Context:** The model may propose removing context files it deems unnecessary. This is a
destructive action and must be human-approved, with a reason, and logged.
**Decision:**
- The proposal appears as a modal panel styled like the AI proposal panel (DD-026, below).
- Content: "Proposed prune: [file path]. Reason: [model's reason]. This will remove the file from
the active context."
- Actions: **Approve** (amber, primary), **Decline** (muted, secondary).
- On approve: the file is archived (not deleted); the action is logged in `/lab-records` with the
reason and the approver ID.
- On decline: the proposal is logged with `outcome: declined`; the model is not asked again in
the same session.
- The modal is not dismissible by clicking outside; explicit choice is required.
**Alternatives considered:**
- Auto-prune with undo (rejected — destructive actions require explicit approval).
- Notification only, no approval (rejected — violates the human-approval rule).
**Trade-offs:** Slower than auto-prune; but auditable and safe.
**Verification:** _To be filled — test approval flow, decline flow, log entries._
**Owner:** Miguel Shinyenyi

---
### DD-026 — AI proposal panel: visibly a proposal
**Date:** 2026-10-24
**Status:** accepted
**Area:** component / copy / colour semantics
**Reference:** none (new pattern)
**Context:** The reference has no AI-generated-content surface. The product relies on Meta AI
drafting summaries and follow-ups, but the authoritative state must remain the database. The UI
must make the proposal nature of AI output unmistakable.
**Decision:** A dedicated **proposal panel** styled as an *inset* surface (Secondary surface
token, hairline border, Private-colour label "AI draft — not sent"), with:
- A clear **Approve / Edit / Discard** control. "Send" only becomes available after explicit
approve.
- A **"Cited records"** list under the draft, each linking to the event record it references.
- A **"Model unavailable — showing fallback draft"** state when the adapter fails.
- No autoplay, no streaming animation. Content appears when ready or shows a plain
"Generating…" state.
**Alternatives considered:**
- Inline AI suggestions in the timeline (rejected — blurs authoritative vs proposal).
- Chat-style interface (rejected — encourages over-trust; hard to audit).
**Trade-offs:** Slower-feeling than a streaming chat; auditable and honest.
**Verification:** _To be filled — test approve, edit, discard, model-unavailable._
**Owner:** Miguel Shinyenyi

---

## Accessibility and contrast

### DD-030 — Badge contrast in dark theme uses text + icon, not colour alone
**Date:** 2026-10-24
**Status:** accepted
**Area:** accessibility / colour
**Reference:** `docs/design.md` contrast targets; reference HTML badge patterns
**Context:** Semantic badges (`user-confirmed`, `agent-reported`, `unverified`, `due`,
`overdue`) must remain distinguishable under WCAG 2.2 AA and for colour-blind users, in both
themes.
**Decision:** Every badge carries a short text label and an icon (or a distinct shape) in addition
to colour. Contrast verified against the surface colour in both themes. Where the reference uses
colour alone, that instance is *not* carried forward.
**Alternatives considered:** Colour-only badges (rejected — accessibility failure).
**Trade-offs:** Badges are visually busier; legible.
**Verification:** _To be filled — measure contrast ratios per badge × theme._
**Owner:** Miguel Shinyenyi
---

### DD-031 — Focus-visible style inherited and extended
**Date:** 2026-10-24
**Status:** accepted
**Area:** accessibility / interaction
**Reference:** `docs/design.md` focus rules
**Context:** Keyboard navigation across the staff console (timeline, intervention queue,
proposal panel) must be visibly clear.
**Decision:** Keep the reference `:focus-visible` ring; extend the ring to the new components
(timeline rows, queue rows, proposal actions) using the accent token at AA-contrast against the
surface. Never remove the ring; never rely on `:focus` alone.
**Alternatives considered:** Browser default focus (rejected — inconsistent with brand and often
low-contrast).
**Trade-offs:** Slightly stronger visual presence on focus; better keyboard UX.
**Verification:** _To be filled — tab-through test._
**Owner:** Miguel Shinyenyi

---

## Pitch deck design

### DD-040 — Pitch deck uses the same tokens as the UI
**Date:** 2026-10-24
**Status:** accepted
**Area:** pitch-deck / tokens
**Reference:** `docs/pitch-deck.md` §Design specification
**Context:** The deck and the UI must look like the same product. A deck with different
typography, colour, or spacing breaks the illusion and weakens the pitch.
**Decision:**
- Same canvas (`#F5F5F7`), surface (`#FFFFFF`), ink (`#1D1D1F`), muted (`#6E6E73`), accent
(`#E9A23B`), success (`#1B7332`), Private (`#2F5A72`), hairline (`#E5E5EA`) as the UI.
- Same system font stack.
- Same 18px card radius.
- One accent per slide.
- Citation text at 12pt muted; visible on every claim slide.
- Shepherd motif on title (slide 1) and closing (slide 12) slides only. Restrained line illustration,
not a cartoon.
**Alternatives considered:**
- Separate "pitch deck style" with a custom display font (rejected — fragments identity).
- Stock photography (rejected — generic; not honest).
**Trade-offs:** Fewer visual flourishes; coherent with the product.
**Verification:** _To be filled — side-by-side with a UI screenshot._
**Owner:** Miguel Shinyenyi
---

### DD-041 — "Not proven" slide is a feature, not an apology
**Date:** 2026-10-24
**Status:** accepted
**Area:** pitch-deck / copy
**Reference:** `docs/pitch-deck.md` slide 10
**Context:** The temptation is to soften the "not proven" slide, hide it, or relegate it to Q&A. That
would be dishonest and would undermine the pitch's credibility.
**Decision:** Slide 10 is present in the deck, unchanged in tone. It uses the Private colour
(calm, not alarming). The speaker notes explicitly frame honesty as the reason to trust the rest.
The slide is not skipped in the live pitch.
**Alternatives considered:**
- Soften the language (rejected — reads as hedging).
- Move to an appendix slide (rejected — looks like hiding).
**Trade-offs:** The pitch has a slide that lists what it cannot do; this is the price of credibility.
**Verification:** _To be filled — confirm slide 10 present in rehearsal; confirm speaker notes
delivered._
**Owner:** Miguel Shinyenyi

---

## Rejected deviations (recorded so we don't re-propose them)

### DD-050 — Rejected: dark-only theme to match "developer tooling" aesthetic
**Date:** 2026-10-24
**Status:** rejected
**Area:** colour / brand
**Context:** Developer tooling often ships dark-first; a strong temptation to make the staff
console dark-only.
**Decision:** Rejected. The reference ships light-first with a dark theme. Staff in programme
offices use bright environments; light-first respects the reference and the audience. Dark theme
remains available and verified.
**Alternatives considered:** Dark-only (rejected).
**Trade-offs:** Loses a trend signal; gains consistency and accessibility in real working
conditions.
**Verification:** n/a
**Owner:** Miguel Shinyenyi

---

### DD-051 — Rejected: heavy brand illustration across the staff console
**Date:** 2026-10-24
**Status:** rejected
**Area:** brand
**Context:** The shepherd motif is part of the Routine Machine identity; heavy use could tie the
staff console emotionally to the brand.
**Decision:** Rejected for the staff console. Motif restricted to the logo, the sign-in screen,
empty states, and the pitch deck's title and closing slides. Working surfaces stay clear for
candidate data.
**Alternatives considered:** Hero illustrations on the Overview (rejected — competes with
state).
**Trade-offs:** Less visually distinctive; clearer for daily use.
**Verification:** n/a
**Owner:** Miguel Shinyenyi

---

### DD-052 — Rejected: raw `rank_score` displayed in the queue UI
**Date:** 2026-10-24
**Status:** rejected
**Area:** component / copy
**Context:** Debugging and Q&A benefit from exposing the ranking score. But a raw number
invites over-trust in an unvalidated formula.
**Decision:** Rejected. The score is in the API response (for debugging and Q&A) but not
displayed in the queue row. The "Why this?" reveal shows the *factors* in plain language, not a
raw number.
**Alternatives considered:** Show score as a small percentage (rejected — false precision).
**Trade-offs:** Less transparent at a glance; less misleading.
**Verification:** n/a
**Owner:** Miguel Shinyenyi

---

### DD-053 — Rejected: chat interface in the demo
**Date:** 2026-10-24
**Status:** rejected
**Area:** component / scope
**Context:** The Shepherd chat was in earlier drafts as the primary interaction layer. The
council review and time constraints forced a re-scope.
**Decision:** Rejected for the demo. The queue is the hero. The chat is a last-resort experiment
if time permits after the queue, timeline, dashboard, Lab, pitch deck, and submission are
complete. If built, it is not the demo; it is an optional extra in the repo.
**Alternatives considered:** Chat as the primary demo (rejected — the queue is deterministic
and demonstrable; the chat is unvalidated and time-consuming).
**Trade-offs:** Less conversational; more focused.
**Verification:** n/a
**Owner:** Miguel Shinyenyi

---

## Unresolved / open questions

- **U-1:** How should the "Demo data" badge behave on a screen where every item is demo
data? Is a single top-bar badge sufficient, or does each card need a marker? (Proposal: top-bar
badge only; cards inherit the mode.)
- **U-2:** What is the right visual treatment for a candidate in `unverified` evidence state on the
timeline, without implying a judgment about the person? (Proposal: Private-colour badge with
text "unverified"; no icon that suggests failure.)
- **U-3:** Should the queue support bulk selection (multi-select to act on several) — or
single-item triage only for the hackathon? (Proposal: single-item for the hackathon.)
- **U-4:** Do we need a distinct visual treatment for AI-generated *case summaries* vs
*follow-up drafts*, or is the single proposal-panel pattern (DD-026) enough? (Proposal: single
pattern; the content and `requires_human_approval` flag distinguish them.)
- **U-5:** Empty-state copy for a programme with no candidates — brand motif vs pure text?
(Proposal: restrained motif on the empty state; it is a non-working surface.)

---

## What this file is not

- It is not the design reference. That is `routine-machine/design-reference/` (HTML files). This
log records deviations from it.
- It is not the brief. That is `HACKATHON.md`. If they disagree, the brief wins and this log is
corrected by a new entry.
- It is not the pitch deck. That is `docs/pitch-deck.md`. DD-040 and DD-041 record the deck's
design decisions; the deck itself is the artefact.

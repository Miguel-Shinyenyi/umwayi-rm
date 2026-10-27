# docs/pitch-deck.md — Umwayi-RM Pitch Deck

> **This is the deliverable.** The demo supports this deck. The code supports the demo.
> **Rule 1:** No slide ships with an unverified `[VERIFY]` marker still in it.
> **Rule 2:** Every external claim carries a citation (source + date read), recorded in
`docs/research/competitors.md`.
> **Rule 3:** The pivot is stated honestly. What is not proven is labelled "not proven" on the
slide.
> **Rule 4:** Same design tokens as the UI (amber accent, white-on-canvas, system font, 18px
card radius). Shepherd motif appears on the title and closing slides only.

**Total pitch time:** 5:00 target, 6:00 hard stop.
**Slides:** 12.
**Speaker:** Miguel Shinyenyi.
**Live demo:** integrated at slides 5–7 (or run as a separate 3-minute demo immediately after
the deck, per judging format).

---

## Design specification for the deck

- **Canvas:** `#F5F5F7` (light theme only for the live pitch; dark theme available as a variant if
the judging room is dark).
- **Surface:** `#FFFFFF` for content panels.
- **Ink:** `#1D1D1F`.
- **Muted:** `#6E6E73` for citations and secondary text.
- **Accent:** `#E9A23B` (amber) — used for one emphasis per slide, never more.
- **Success:** `#1B7332` for "proven" markers.
- **Private/Not-proven:** `#2F5A72` for "not proven" markers.
- **Hairline:** `#E5E5EA` for separators.
- **Typography:** system font stack; slide title 40pt, body 20pt, citation 12pt muted. Sentence
case.
- **Layout:** one idea per slide; maximum 40 words of on-slide text (excluding citations);
generous whitespace.
- **Shepherd motif:** title slide and closing slide only. A restrained line illustration (staff + path),
never a cartoon.
- **No:** gradients, stock photography of people, fake dashboards, fake testimonials, unverified
numbers.

---

## Slide 1 — Title
**On slide:**
> **Umwayi-RM**
> The shepherd's staff for skills-to-employment programmes
> *Meta Global AI Developer Hackathon — November 2026*
> Miguel Shinyenyi

**Visual:** Restrained shepherd motif (line illustration: a staff, a path, a small flock mark). Amber
accent on the staff only. Canvas background.

**Speaker notes (15s):**
> "Umwayi-RM. We help organisations turn skills training into sustained employment — and
we're honest about what that means as a business. I'll show you what we built, what we learned,
and where the real opportunity is."

**Citation:** none.

---

## Slide 2 — The origin: hype → consistency

**On slide:**
> **Where this came from**
> Hype culture dysregulates people.
> The antidote is consistency.
> We built a consistency tracker for training programmes.
> That led us here.

**Visual:** A simple three-step horizontal timeline with one word per step: *hype* →
*consistency* → *tracker*. Amber accent on "consistency."

**Speaker notes (30s):**
> "This started with an observation: hype culture — the AI wave, the productivity panic —
dysregulates people. The thing that survives hype is consistency. We built a tracker for training
programmes to help staff maintain consistency of follow-up. That tracker is what we submitted. It
is also the foundation for something larger. Let me show you the problem it sits inside."

**Citation:** none (origin story, personal).

---

## Slide 3 — The problem: training → placement → retention failure

**On slide:**
> **The problem**
> Programmes train developers.
> Employers hire them.
> They leave in the first 90 days.
> The employer bears the cost.
> No one captures the early signals.

**Visual:** Simple four-step flow diagram (train → place → churn → cost) with a break marker at
"churn." Amber accent on the break.

**Speaker notes (45s):**
> "Skills programmes — Andela, Generation, the TVET pipeline — produce developers.
Employers hire them. And then, in the first 90 days, a meaningful number leave. The cost lands
on the employer: replacement, ramp-up, lost project time. And the cause is not technical ability
— it is soft-skill adaptation: communication, feedback, workplace norms. The signals that predict
this failure exist early. No one is capturing them as a product."

**Citations:**
- `[VERIFY]` Andela 90-day churn figure — source: _TBD; record in
`docs/research/competitors.md` before this slide ships._
- `[VERIFY]` Soft-skill attribution of retention failure — source: _TBD._
- If either cannot be verified before submission, reword to: "Employers report that early churn is
driven by adaptation, not technical ability" and remove the number.

---

## Slide 4 — The insight

**On slide:**
> **The insight**
> Soft-skill retention risk is predictable from early follow-up signals.
> Those signals are captured when programme staff follow up.
> No one is capturing them as a product.
> **That is the gap.**

**Visual:** A single sentence centred, with "That is the gap" in amber. No diagram.

**Speaker notes (30s):**
> "Here is the bet. Retention risk is not random. It shows up early in small things: a missed
check-in, an unconfirmed milestone, a follow-up that slipped. Programme staff see these signals
every day. What they don't have is a system that captures them as data and turns them into a
signal an employer would pay for. That is the gap."

**Citation:** none (thesis statement; labelled as a bet, not a proven fact).
---

## Slide 5 — What we built (the demo)

**On slide:**
> **What we built**
> A deterministic intervention queue.
> An evidence-backed candidate timeline.
> Every confirmed follow-up is a labeled data point.

**Visual:** Screenshot of the real intervention queue (from the running app, seeded demo data,
"Demo data" badge visible). No mock UI.

**Speaker notes (60s) — transition to live demo:**
> "This is the queue. Three items: an overdue milestone, a due check-in, an evidence gap. Each
is ranked by explicit rules — not by a model. Staff click through, confirm evidence, and the
queue updates. Every confirmation is a labeled data point: what was promised, what happened,
with provenance. Let me show you."
> *[Run live demo for 2–3 minutes: the 7-step path from `docs/demo-script.md` §2, steps 1–6.
Return to the deck at slide 6.]*

**Citation:** none (built artefact).

---

## Slide 6 — How it works: deterministic, explainable, auditable

**On slide:**
> **How it works**
> Records → rules → queue.
> Progress computed from stored state, not from the model.
> AI explains *why* an item is queued. It does not decide.
> If the model is unavailable, the queue still works.

**Visual:** A clean three-box diagram (Records → Rules → Queue) with a small side-branch (AI
rationale) labelled "explanation only." Amber accent on the "Rules" box.

**Speaker notes (45s):**
> "The architecture matters for trust. The database is the system of record. Progress, due dates,
overdue flags — all computed by application logic. The model writes one sentence explaining
*why* an item is queued. It never decides the ranking. If the model is down, the queue still
works; the explanation shows a fallback string. This is not an AI product with a database
attached. It is a deterministic system with an AI explanation layer."
**Citation:** none (architecture description).

---

## Slide 7 — The data foundation

**On slide:**
> **The data foundation**
> Every confirmed follow-up is a labeled example:
> commitment kept / missed · evidence confirmed / unverified · milestone on time / overdue.
> The queue is how the data is collected.
> **The data is the asset.**

**Visual:** A simple pipeline diagram: Follow-up → Confirmed → Labeled data → (future)
retention signal. The last box is dashed, labelled "next step."

**Speaker notes (30s):**
> "Here is why the queue matters beyond the demo. Every confirmed follow-up is a labeled
example of a commitment kept or missed, evidence confirmed or unverified, a milestone on time
or overdue. That is the training data for a retention-risk signal. The queue is not the product.
The queue is how the data gets collected. The data is the asset."

**Citation:** none (design rationale).

---

## Slide 8 — The pivot: retention intelligence for employers

**On slide:**
> **The pivot**
> We sell the signal to the buyer with the cost of failure: the employer.
> *Not proven:* signal accuracy · employer willingness-to-pay.
> *Stated honestly:* this is a thesis, not a product.

**Visual:** Two-column layout. Left: "Demo (built)" — the queue, the timeline. Right: "Business
(pivot)" — retention signal sold to employers. A divider labelled "the pivot." Amber accent on
"the buyer with the cost of failure." "Not proven" label uses the Private colour token.

**Speaker notes (60s):**
> "So where is the business? Not in selling the tracker to training organisations — they have
constrained budgets and high switching costs. The business is selling the signal to the employer
who bears the cost of early churn. The queue collects the data; the signal is what the employer
pays for. I want to be precise: the predictor does not exist yet. Employer willingness-to-pay is
unvalidated. This is a thesis, not a product. What the hackathon proves is the foundation."

**Citations:**
- `[VERIFY]` Employee attrition prediction market size and growth — source: _TBD; record in
`docs/research/competitors.md`._
- `[VERIFY]` Buyer cost of failure (replacement, ramp-up) — source: _TBD._
- If unverified, reword to: "Employers already pay for retention analytics" and omit the number.

---

## Slide 9 — What we have proven

**On slide:**
> **Proven**
> ✓ A deterministic, explainable queue is buildable in 10 days.
> ✓ The data model exists to generate a retention signal.
> ✓ The pivot is coherent and grounded in a real cost of failure.
> ✓ The system is safe on retries, bad input, and model failure.

**Visual:** Four checkmarks in Success green. Clean list, no icons beyond the check.

**Speaker notes (30s):**
> "What the hackathon proves: the foundation is real. The queue is deterministic and
explainable. The data model exists. The pivot is coherent. The system handles retries, bad
input, and model failure. These are not claims — they are demonstrated in the demo and the
tests."

**Citation:** link to `docs/hackathon-log.md` verification entries (on the slide as a small footer
URL or QR code).

---

## Slide 10 — What we have not proven

**On slide:**
> **Not proven**
> · Signal accuracy
> · Employer willingness-to-pay
> · Staff preference over spreadsheets
> · That the queue improves retention
> These are the next experiments. The hackathon is the first one.
**Visual:** Four items in Private colour. Deliberately calm — not red, not alarming. This slide is a
feature, not an apology.

**Speaker notes (30s):**
> "And what we have not proven — I want to be as clear about this as the last slide. We do not
know if the signal is accurate. We do not know if employers will pay. We do not know if staff
prefer this to their spreadsheets. And we do not claim the queue improves retention. These are
the next experiments. The hackathon is the first one. Honesty here is not a weakness; it is the
reason to trust the rest."

**Citation:** none (limitations statement).

---

## Slide 11 — The ask

**On slide:**
> **The ask**
> Partner with one training organisation and one employer.
> Collect queue data for one cohort.
> Test whether early signals correlate with retention outcomes.
> **The hackathon proves the foundation. The next step proves the signal.**

**Visual:** A single sentence in the centre, with the final line in amber. No diagram.

**Speaker notes (30s):**
> "What we are asking for is not funding yet. It is two partners: one training organisation to run
the queue for a cohort, one employer to share retention outcomes. That is enough to test
whether the signals correlate. The hackathon proves the foundation. The next step proves the
signal. If it does, we have a business. If it doesn't, we have learned something honest."

**Citation:** none (the ask).

---

## Slide 12 — The Lab: experiment log

**On slide:**
> **The Lab**
> Every success, failure, and projection is recorded.
> This hackathon is experiment #1.
> *[QR code to the Lab view / repo]*
**Visual:** Screenshot of the Lab view (real UI, "Demo data" badge). Restrained shepherd motif
returns in the footer, closing the loop with slide 1.

**Speaker notes (15s):**
> "One last thing. We keep a Lab — an experiment log. Every success, every failure, every
projection is recorded there, with dates and evidence. This hackathon is experiment number
one. If you want to see how we think, the Lab is open. Thank you."

**Citation:** link to `docs/hackathon-log.md` (or a public read-only view if one exists).

---

## Timing summary

| Slide | Topic | Time |
|---|---|---|
| 1 | Title | 0:15 |
| 2 | Origin | 0:30 |
| 3 | Problem | 0:45 |
| 4 | Insight | 0:30 |
| 5 | What we built + live demo | 3:00 (60s + 120s demo) |
| 6 | How it works | 0:45 |
| 7 | Data foundation | 0:30 |
| 8 | The pivot | 1:00 |
| 9 | Proven | 0:30 |
| 10 | Not proven | 0:30 |
| 11 | The ask | 0:30 |
| 12 | The Lab | 0:15 |
| **Total** | | **~9:00** |

**This exceeds the 5:00 target.** The honest fix is one of:

1. **Run the demo as a separate segment** (judging format permitting), leaving the deck at
~6:00.
2. **Cut slides 2 and 7** in the live pitch (keep them in the submitted deck), bringing the deck to
~7:30.
3. **Compress the demo to 60 seconds** (steps 1–4 only), bringing the total to ~7:00.

**Decision to record in `docs/hackathon-log.md` before rehearsal:** which timing strategy is
used, and why. Do not ship a deck that overruns the format.

---

## Pre-submission checklist for this file
- [ ] Every `[VERIFY]` marker resolved or the claim reworded to remove the number.
- [ ] Every external claim has a citation (source + date read) recorded in
`docs/research/competitors.md`.
- [ ] No fake metrics, fake customers, fake testimonials.
- [ ] "Not proven" slide present and unchanged (do not soften it).
- [ ] Shepherd motif on slides 1 and 12 only.
- [ ] Deck uses the design tokens above; light theme verified.
- [ ] Slides exported to PDF and PPTX; both checked for font substitution.
- [ ] Speaker notes match the spoken script in `docs/demo-script.md` §3 (the submission
voice-over outline).
- [ ] Timing strategy chosen and recorded in `docs/hackathon-log.md`.
- [ ] Deck reviewed against `HACKATHON.md` §7.3 slide table — no slide added, none
removed without a log entry.
- [ ] A rehearsal run is logged with actual timing per slide.

---

## Open items that must be resolved before the deck is final

1. **Andela 90-day churn figure** — read the primary source; record the exact number and date
in `docs/research/competitors.md`. If the number cannot be verified, reword slide 3.
2. **Soft-skill attribution** — same. Do not cite a claim you have not read.
3. **Employee attrition prediction market size and growth** — read the primary source; record in
`docs/research/competitors.md`. If unverified, reword slide 8 to remove the number.
4. **Buyer cost of failure** — a credible source for replacement/ramp-up cost. If not found,
reword to "employers already pay for retention analytics" without a number.
5. **Timing strategy** — decide between separate-demo, cut-slides, or compress-demo. Log
the decision.
6. **Deck build tool** — Google Slides, Keynote, or HTML-to-PDF. Record the choice and the
export path in `docs/hackathon-log.md`.
7. **Lab view availability** — if the Lab view is not built by Day 9, slide 12 shows a screenshot
of `docs/hackathon-log.md` instead. Log the fallback.

---

## What this file is not

- It is not the demo script. That is `docs/demo-script.md`.
- It is not the competitor research. That is `docs/research/competitors.md`; the deck cites it, it
does not replace it.
- It is not the brief. That is `HACKATHON.md`; if the deck and the brief disagree, the brief wins
and the deck is corrected.

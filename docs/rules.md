# docs/rules.md: official rules and how Umwayi-RM meets them (v3)

Source: the Participant Guide (details page) and the Official Rules and Waiver, read on 2026-10-26 while signed in. Meta and Cerebral Valley may change them. Reread the guide on Nov 2.

## Facts

| Item | Rule |
|---|---|
| Problem statements | Build for Your World; Push the Frontier. We choose Build for Your World |
| Models | Must use Meta models: Muse Spark series, Muse Wonder, Muse Image, Muse Voice Transcribe, SAM 3.1 (Meta Model API); Muse Glimmer and Muse Spark Open (open weights); Muse Code coding agent |
| Repo | Must be public |
| Team | Up to 4. Solo allowed. One track only |
| New work | Built during the event. The demo may show only features and code built in the event. Failure to identify original work is immediate disqualification. Startups may build on existing products but must identify the new work |
| Banned | Projects that break legal, ethical or platform policy, or use code, data or assets you have no rights to |
| Building period | Oct 27 to Nov 4. Kickoff Oct 26, 12:00 ET |
| Submission | Nov 4, 9:00 PM ET (Nov 5, 05:00 EAT). Late submissions are not considered. Portal: cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit |
| Video | Three minutes, showing what you built. It is a primary judging artifact |
| Judging | Stage 1 pass or fail: fits the theme, reasonably uses Meta models. Stage 2 rubric 0 to 10: Impact 30%, Meta tooling 25%, Technical depth 20%, Demo 25%. Stage 3: top 5 per track, final judges watch the videos live |
| Credits | Meta $150: claim by form by Nov 4, 9 PM ET, card required. Baseten $100 and 2M TPM: request, reviewed on use case, up to 2,000 people. Modal $100: first 1,000. Fireworks $25: shortlist |
| Baseten model id | Use `meta-models/muse-spark-open-1026`, not the id in the docs |
| IP | You keep ownership. Organizers get a perpetual, irrevocable, worldwide, non-exclusive licence to use the submission, including for marketing. Nothing you share is confidential |
| Winner checks | W-8BEN for non-US residents; winner pays wiring fees and taxes; payment within 30 days of verification |
| Eligibility | 18 or older; not in a sanctioned jurisdiction; not Meta or CV staff or family |

## Sample anti-projects, and where we stand (v3)

The list says it is not exhaustive. We treat these as the generic class to avoid.

| Anti-project | Our position |
|---|---|
| AI medical advice, mental-health advice | None. The product gives no health advice. The gentle tone applies to reminder drafts about contributions only. No reassurance or wellbeing features appear in the product or video |
| Basic RAG applications | The agent works through structured tools over a ledger. The archive recall is a tool the agent uses for old records; it is not the product |
| Simple image analyzers | Photo reading produces structured rows that code reconciles against the ledger and that the treasurer approves. The photo is one intake, not the product |
| Simple "AI for Education" chatbots | No chat interface. No teaching. Not an education product |
| AI job application screener | Not relevant. No candidate scoring |
| AI nutrition coach, sports coach | Not relevant |
| Personality analyzers | No profiling of people. Rule: the system never scores, rates or ranks a member |
| Anything political or about war | Not relevant |

Remaining risks:
- A judge may call a ledger assistant "a basic wrapper". Answer: the agent only proposes; code owns state; there is a restraint layer, an approval flow, reconciliation, evals with a frozen test split, and run traces.
- Reminder drafts could be read as pressure on members. Answer: copy-only, treasurer decides, no judging words, no comparisons between members.
- Financial services: the product records what the group states. It moves no money, gives no lending or investment advice and scores no one.

## Rules that shape the build

1. First code commit is dated Oct 27 or later. Planning docs from Oct 24 to 27 are in the repo and labelled as planning.
2. Nothing is copied from the routine-machine repository. Concepts and design token values are listed as prior work in the README.
3. Everything the demo shows exists in the public repo.
4. Libraries are fine if their licences are followed. Name them in the README.
5. Synthetic data only. No real names, phone numbers, M-Pesa statements or group records in the repo or the video.
6. Your voice in the demo video is covered by the recording consent. Use a synthetic script.
7. Use of the Meta models must be real and visible: the trace in the Lab shows the model id.
8. Press coverage says products built on Muse Spark Open must display "Built with Muse Spark Open". Not yet checked against the model terms. Check on Day 1; if required, show it in the README, console footer and video.
9. Kenya Data Protection Act: group records about identifiable people carry duties (registration, consent, impact assessment for high risk, retention, 72-hour breach notice, per the regulator's published guidance). The demo uses synthetic data only. The README says compliance is not assessed.

## Open questions for the organisers

- Is a ledger agent for savings groups clear of "basic RAG" and "simple image analyzers"? (Discord #questions)
- Does a design-token file copied from your own earlier repo count as prior work that must be identified? We say yes and identify it.
- Is the "Built with Muse Spark Open" display required for open-weight use under the model licence? (Check the model terms first.)

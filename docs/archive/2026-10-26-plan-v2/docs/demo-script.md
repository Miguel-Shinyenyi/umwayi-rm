# docs/demo-script.md: the three minute video

The submission needs a three minute video. It is a primary judging artifact. Judges must see what was built in the window. Plan for 2:50.

## Before recording (15 minutes)

- [ ] Fresh clone runs from the README. Seed loaded. "Demo data" badge visible.
- [ ] Model reachable, or `MODEL_FALLBACK_ONLY` decided for the take. Model id visible in the Lab.
- [ ] Voice note recorded from a synthetic script. No real names or numbers.
- [ ] Browser at 1280 px; one tab; notifications off; no secrets on screen.
- [ ] Eval results saved and visible in the Lab.

## Cast (fictional)

Umwayi Skills Lab, 12 learners. Staff member Wanjiru. Learner Amina. All labelled demo data.

## Path

| Time | Screen | What happens | Say |
|---|---|---|---|
| 0:00 | Title card | Name, one line, repo URL | "Small training programmes lose learners when a follow-up slips. This agent finds the slip and drafts the next step. Staff approve everything." |
| 0:15 | Proposals, voice note | Play 20 seconds. Agent returns 3 events and 1 commitment, each with the quoted words | "A voice note after a session becomes proposals, not records." |
| 0:50 | Proposals | Approve two. Edit one. Reject none. Timeline updates | "State changes only when staff approve." |
| 1:10 | Overview | Press Morning review. Trace scrolls: tool calls, then proposals | "The agent decides which tools to call. It cannot change state." |
| 1:45 | Interventions | Five ranked items, each with a drafted message citing events | "Order comes from code. Words come from the model. Every sentence cites a record." |
| 2:05 | Interventions | Approve a draft, copy. Press approve again: nothing changes | "Nothing is sent. Repeated approval is harmless." |
| 2:20 | Lab | Switch model off. Queue still renders. Show eval table and one run trace | "With the model off the queue still works. Here are the local eval results on synthetic data." |
| 2:40 | Closing card | What is not proven. Repo URL. Licence | "Not proven: that staff prefer this, or that it improves outcomes. Next: one pilot programme." |

## Rules for the video

- Show only features built in the window. If the design token file is prior work, say so on screen in the closing card.
- Say "synthetic data" once, early.
- No claims of security, compliance or accuracy beyond the eval table.
- Cut a feature rather than cut the failure case.

## Reset (under 60 seconds)

```
docker compose down -v
docker compose up -d
npm run migrate
npm run seed
npm run verify-seed
```

Commands are placeholders until the repo has scripts. Record the real ones here on Day 7.

## Fallback if the live path breaks

- Model down: set `MODEL_FALLBACK_ONLY=true` and say so in the video.
- Audio fails: use the typed note path; remove the 0:15 segment and re-time.
- Everything fails: record the last good run from `docs/evals/` traces and say it is a recording.

## After

- [ ] Upload the video; test the link logged out.
- [ ] Repo public, logged out check.
- [ ] Optional: post the demo on X and add the link in the portal (Most Viral Project is judged by engagement until Nov 8).

# 2026-10-28: Repo understanding (stage 1 report)

Date: 2026-10-28. Source: terminal session with the coding assistant, saved verbatim under the recurrent research rule. File links from the original are flattened to paths. Purpose: research data for measurable outcomes. Status: notes, not results. The open questions at the end were resolved later the same day.

## Verbatim record

Stage one is done. I mapped current state and direction. I made no writes yet.

## Where we are

UMWAYI is the context hub. Its hackathon spoke points to `umwayi-rm` and plan v3: a savings-group secretary agent with restraint and archive ideas tested inside it.

`umwayi-rm` is planning only. It has docs only and no code. It has no git repo and no LICENSE file. I read `HACKATHON.md`, `PROJECT.md`, `queue.md`, `README.md`, `CLAUDE.md`, `docs/rules.md`, `docs/api-contract.md`, `docs/agent-design.md`, `docs/experiments.md`, and `docs/hackathon-log.md`. I listed `docs/research/` and `docs/archive/` without reading archive content.

Queue `now` is H-01 credits and H-02 public repo with docs only plus LICENSE. H-02 matches your remote request, but LICENSE is missing and D-10 still waits.

## Where we are going

Next in queue order: H-04 model checks, H-05 scenario sets and frozen test split, H-06 scaffold with `/health`. Then ledger core, Today, MCP and agent, voice, photo, H1 run, console and Lab, video, submit by Nov 4 16:00 EAT.

Open decisions stay open: D-9 stack, D-10 licence, D-11 interviews, D-12 hours.

## Checks run

- `ls -la`: 5 root md files plus `docs/`. No `.git`. No LICENSE.
- `git status`: not a git repository.
- `gh auth status`: logged in as Miguel-Shinyenyi. Scopes include `repo`.
- `gh repo view Miguel-Shinyenyi/umwayi-rm`: not found. Name is free.
- `muse init --dry-run`: Muse Code reads `AGENTS.md` as project rules. Rename target is `AGENTS.md`.

Nothing is built, tested, or manual-verified. Changed files: none.

## Proposed core-upwards order

1. `HACKATHON.md`
2. `PROJECT.md`
3. `queue.md`
4. `README.md`
5. `CLAUDE.md`
6. `docs/rules.md`
7. `docs/api-contract.md`
8. `docs/agent-design.md`
9. `docs/experiments.md`
10. `docs/hackathon-log.md`
11. `docs/research/`
12. `docs/demo-script.md`, `docs/pitch-deck.md`, `docs/design-decisions.md`
13. `docs/archive/`
14. `LICENSE`, only if you confirm it

Later checks will use `git log --oneline`, `git show --stat HEAD`, `git remote -v`, `gh repo view`, and `git status --short`.

## Why I stopped

Your task has four parts. Standing rules say do the first part only, run its checks, then report and wait. I did reads only.

## Open questions

- Confirm remote name `umwayi-rm` and visibility. H-02 says public.
- Confirm feature branch name. I propose `docs/initial-docs`.
- LICENSE is missing and D-10 waits. Add MIT now or leave it out.
- Confirm the order above.
- Confirm final rename `CLAUDE.md` to `AGENTS.md`, left uncommitted.

## How this is tested

The checks listed above were the evidence for H-02. The order was used for the 16 commits and is visible in git history. The open questions were answered the same day and recorded in queue.md and the log.

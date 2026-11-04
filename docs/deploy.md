# Deploy: Vercel plus a free Neon database

Goal: a public URL where a judge can open the console, press "Reset demo data", and use the app with synthetic data.

## What runs where

- `public/` is served by Vercel as static files (console and lab pages).
- `api/index.js` is one Vercel function. It loads the compiled Express app from `dist/` and answers `/groups/*`, `/proposals/*`, `/runs/*`, `/lab/runs`, `/demo/reset` and `/health`.
- Data lives in Neon Postgres. The in-memory store does not survive on serverless, so `DATABASE_URL` is required.
- MCP over stdio (`src/mcp/stdio.ts`) runs locally only. The deployed app uses the same tools in process.

## Limits checked on 2026-11-04 (Vercel docs)

- Hobby functions: 300 s default and maximum. This repo sets 60 s.
- Request and response body: 4.5 MB. Keep voice notes short (a WAV over about 3 MB will fail) and photos under 3 MB.
- Hobby is for non-commercial use. A hackathon demo qualifies.

## Steps

1. In Vercel, import the `umwayi-rm` GitHub repo. Framework preset: Other. Leave build settings; `vercel.json` sets them.
2. In the same Vercel project open Storage, add Neon (the same free path used for Waline). Use the pooled connection string as `DATABASE_URL`.
3. Add environment variables (Production):
   - `DEMO_MODE` = `true`
   - `PG_POOL_MAX` = `1`
   - `MODEL_CALLS_PER_HOUR` = `30`
   - `MODEL_MAX_TOKENS` = `600` (cap per model call; raise only if replies get cut off)
   - `RESETS_PER_HOUR` = `20`
   - `BASETEN_API_KEY` = your Baseten key (you type it in; do not paste it anywhere else)
   - `META_API_KEY` = your Meta Model API key
4. Deploy. Migrations run on the first request.
5. Check: open `/health` (expects `{"status":"ok"}`), open `/`, press "Reset demo data", send "Njeri paid 500 for October." and confirm a proposal with a quote appears.

If you skip the keys the site still works, and the console says "Model is off on this server".

## Why the guards exist

The reset button gives anyone a token, and a token can call the model. So:

- per-IP rate limits (in memory, so per warm instance; treat as a speed bump)
- notes capped at 4000 characters
- the real limit is the spend cap you set in the Baseten and Meta accounts. Set both before going live.
- Reset creates a private group per visitor and only purges demo groups older than 2 hours.

## Pre-launch security gate

Run before the repo is public and before the keys go into Vercel.

- [ ] `npm audit --omit=dev` shows 0 vulnerabilities
- [ ] Secret scan of full git history (for example `gitleaks detect`) is clean
- [ ] No key in `.env`, docs, screenshots or the video
- [ ] Provider spend caps set in Baseten and Meta
- [ ] Open a PR with these changes and read the CodeRabbit review (free on public repos once the app is installed). Fix or answer every security comment
- [ ] Security headers present: `curl -I <url>/health` shows `content-security-policy`
- [ ] Demo data is synthetic only

## Fallback

If Vercel misbehaves, the repo has a `Dockerfile`. Any Docker host (Render, Fly, Railway) runs it with the same environment variables and the same Neon `DATABASE_URL`. Free tiers sleep when idle, so open the site once before the deadline.

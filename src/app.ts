import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { readFile } from "node:fs/promises";
import type { ClaimInput, ClaimVerdict } from "./adapters/claims.js";
import type { ModelAdapter } from "./adapters/model.js";
import type { PhotoReader } from "./adapters/vision.js";
import type { LedgerStore } from "./ledger/store.js";
import { createDemoHandler } from "./routes/demo.js";
import { createEntryHandler } from "./routes/entries.js";
import { createFindingHandler } from "./routes/findings.js";
import { createGroupHandlers } from "./routes/groups.js";
import { healthHandler } from "./routes/health.js";
import { createIntakeHandler, type Transcriber } from "./routes/intake.js";
import { createLabHandler } from "./routes/lab.js";
import { createPageHandler } from "./routes/page.js";
import { createProposalHandlers } from "./routes/proposals.js";
import { createQuestionHandlers } from "./routes/questions.js";
import { createRunHandler } from "./routes/runs.js";

export interface AppDeps {
  store: LedgerStore;
  model: ModelAdapter;
  transcribe: Transcriber;
  reader: PhotoReader;
  demoMode: boolean;
  /** Per-IP limits for the routes that cost model calls or wipe data. Off when absent. */
  limits?: { modelCallsPerHour: number; resetsPerHour: number };
  claimCheck?: (input: ClaimInput) => Promise<ClaimVerdict>;
  loadPack?: () => Promise<{ playbook: string; rules: string }>;
}

async function defaultLoadPack(): Promise<{ playbook: string; rules: string }> {
  const [playbook, rules] = await Promise.all([
    readFile("agent/pack/playbook.md", "utf8"),
    readFile("agent/pack/rules.md", "utf8"),
  ]);
  return { playbook, rules };
}

export function createApp(deps?: AppDeps): express.Express {
  const app = express();
  app.disable("x-powered-by");
  if (deps?.limits) {
    app.set("trust proxy", 1);
  }
  app.use((_req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });
  app.use(express.json({ limit: "10mb" }));
  app.use(express.static("public"));

  app.get("/health", healthHandler);
  app.get("/", (_req, res) => {
    res.redirect("/console.html");
  });

  if (deps?.limits) {
    const tooMany = (what: string) => ({ error: { code: "rate_limited", message: `too many ${what}, try again later` } });
    const modelLimit = rateLimit({ windowMs: 3_600_000, limit: deps.limits.modelCallsPerHour, standardHeaders: true, legacyHeaders: false, message: tooMany("model requests") });
    const resetLimit = rateLimit({ windowMs: 3_600_000, limit: deps.limits.resetsPerHour, standardHeaders: true, legacyHeaders: false, message: tooMany("resets") });
    app.use("/groups/:id/intake", modelLimit);
    app.use("/groups/:id/questions", modelLimit);
    app.use("/demo/reset", resetLimit);
  }

  if (deps) {
    const loadPack = deps.loadPack ?? defaultLoadPack;
    app.post("/groups/:id/intake/note", createIntakeHandler({ ...deps, loadPack }));
    app.post("/groups/:id/intake/page", createPageHandler(deps));
    app.get("/groups/:id/findings", createFindingHandler(deps));
    app.post("/groups/:id/entries", createEntryHandler(deps));
    app.post("/demo/reset", createDemoHandler({ ...deps, isolateVisitors: Boolean(deps.limits) }));
    const groups = createGroupHandlers(deps);
    app.get("/groups/:id", groups.getGroup);
    app.get("/groups/:id/today", groups.getToday);
    app.get("/groups/:id/entries", groups.listEntries);
    app.get("/lab/runs", createLabHandler({ evalsDir: "docs/evals" }));
    app.get("/runs/:id", createRunHandler(deps));
    app.post("/groups/:id/questions/:qid/answer", createQuestionHandlers({ ...deps, loadPack }).answerQuestion);
    const proposals = createProposalHandlers(deps);
    app.get("/groups/:id/proposals", proposals.listProposals);
    app.post("/proposals/:id/approve", proposals.approveProposal);
    app.post("/proposals/:id/edit", proposals.editProposal);
    app.post("/proposals/:id/reject", proposals.rejectProposal);
  }

  app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    if (err.type === "entity.parse.failed" || err.type === "entity.too.large") {
      res.status(err.status ?? 400).json({ error: { code: "invalid", message: "request body is not valid JSON or too large" } });
      return;
    }
    res.status(500).json({ error: { code: "internal", message: "internal error" } });
  });

  return app;
}

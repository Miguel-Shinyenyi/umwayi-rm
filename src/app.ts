import express from "express";
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
  app.use(express.json({ limit: "10mb" }));
  app.use(express.static("public"));

  app.get("/health", healthHandler);
  app.get("/", (_req, res) => {
    res.redirect("/console.html");
  });

  if (deps) {
    const loadPack = deps.loadPack ?? defaultLoadPack;
    app.post("/groups/:id/intake/note", createIntakeHandler({ ...deps, loadPack }));
    app.post("/groups/:id/intake/page", createPageHandler(deps));
    app.get("/groups/:id/findings", createFindingHandler(deps));
    app.post("/groups/:id/entries", createEntryHandler(deps));
    app.post("/demo/reset", createDemoHandler(deps));
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

  return app;
}

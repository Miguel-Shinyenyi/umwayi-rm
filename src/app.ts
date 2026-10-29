import express from "express";
import { readFile } from "node:fs/promises";
import type { ModelAdapter } from "./adapters/model.js";
import type { PhotoReader } from "./adapters/vision.js";
import type { LedgerStore } from "./ledger/store.js";
import { createEntryHandler } from "./routes/entries.js";
import { createFindingHandler } from "./routes/findings.js";
import { healthHandler } from "./routes/health.js";
import { createIntakeHandler, type Transcriber } from "./routes/intake.js";
import { createPageHandler } from "./routes/page.js";
import { createProposalHandlers } from "./routes/proposals.js";

export interface AppDeps {
  store: LedgerStore;
  model: ModelAdapter;
  transcribe: Transcriber;
  reader: PhotoReader;
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

  app.get("/health", healthHandler);

  if (deps) {
    const loadPack = deps.loadPack ?? defaultLoadPack;
    app.post("/groups/:id/intake/note", createIntakeHandler({ ...deps, loadPack }));
    app.post("/groups/:id/intake/page", createPageHandler(deps));
    app.get("/groups/:id/findings", createFindingHandler(deps));
    app.post("/groups/:id/entries", createEntryHandler(deps));
    const proposals = createProposalHandlers(deps);
    app.get("/groups/:id/proposals", proposals.listProposals);
    app.post("/proposals/:id/approve", proposals.approveProposal);
    app.post("/proposals/:id/reject", proposals.rejectProposal);
  }

  return app;
}

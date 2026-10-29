import type { Request, Response } from "express";
import type { LedgerStore } from "../ledger/store.js";
import { requireToken, sendError } from "./auth.js";

export interface RunDeps {
  store: LedgerStore;
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export function lineCoverage(intakeRef: string, quotes: string[]): { lines: number; covered: number; uncovered: string[] } {
  const lines = intakeRef
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const cleaned = quotes.map(normalize).filter((q) => q !== "");
  const uncovered = lines.filter(
    (line) => !cleaned.some((q) => normalize(line).includes(q) || q.includes(normalize(line))),
  );
  return { lines: lines.length, covered: lines.length - uncovered.length, uncovered };
}

export function createRunHandler(deps: RunDeps) {
  return async function getRun(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    try {
      const runId = req.params.id as string;
      const run = await deps.store.getRun(token, runId);
      const proposals = (await deps.store.listProposals(token, run.groupId)).filter((p) => p.runId === run.id);
      const quotes = proposals.flatMap((p) => p.quotes);
      const coverage = lineCoverage(run.intakeRef, quotes);
      res.status(200).json({ run, proposals, coverage });
    } catch (err) {
      sendError(res, err);
    }
  };
}

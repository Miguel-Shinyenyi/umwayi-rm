import type { Request, Response } from "express";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export interface LabDeps {
  evalsDir: string;
}

interface RunSummary {
  file: string;
  modelId: string;
  date: string;
  promptVersion: string;
  condition?: string;
  seed: number;
  split: string;
  passed: number;
  total: number;
}

export function createLabHandler(deps: LabDeps) {
  return async function listRuns(_req: Request, res: Response): Promise<void> {
    try {
      const files = (await readdir(deps.evalsDir)).filter((f) => f.endsWith(".json")).sort();
      const runs: RunSummary[] = [];
      for (const file of files) {
        const raw = JSON.parse(await readFile(join(deps.evalsDir, file), "utf8")) as Record<string, unknown>;
        if (typeof raw.modelId !== "string" || typeof raw.passed !== "number") {
          continue;
        }
        runs.push({
          file,
          modelId: raw.modelId,
          date: typeof raw.date === "string" ? raw.date : "",
          promptVersion: typeof raw.promptVersion === "string" ? raw.promptVersion : "",
          ...(typeof raw.condition === "string" ? { condition: raw.condition } : {}),
          seed: typeof raw.seed === "number" ? raw.seed : 0,
          split: typeof raw.split === "string" ? raw.split : "",
          passed: raw.passed,
          total: typeof raw.total === "number" ? raw.total : 0,
        });
      }
      res.status(200).json({ runs });
    } catch (err) {
      res.status(500).json({ error: { code: "internal", message: "cannot read eval runs" } });
    }
  };
}

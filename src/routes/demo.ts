import type { Request, Response } from "express";
import type { LedgerStore } from "../ledger/store.js";
import { accessDenied } from "../ledger/types.js";
import { seedDemo } from "../seed.js";
import { sendError } from "./auth.js";

export interface DemoDeps {
  store: LedgerStore;
  demoMode: boolean;
  /** Public deploy: keep other visitors' groups and only purge groups older than this. */
  isolateVisitors?: boolean;
}

const VISITOR_GROUP_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export function createDemoHandler(deps: DemoDeps) {
  return async function resetDemo(_req: Request, res: Response): Promise<void> {
    try {
      if (!deps.demoMode) {
        throw accessDenied();
      }
      if (deps.isolateVisitors) {
        await deps.store.purgeDemoOlderThan(VISITOR_GROUP_MAX_AGE_MS);
      } else {
        await deps.store.resetDemo();
      }
      const { group, token } = await seedDemo(deps.store);
      res.status(200).json({ group, token });
    } catch (err) {
      sendError(res, err);
    }
  };
}

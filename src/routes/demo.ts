import type { Request, Response } from "express";
import type { LedgerStore } from "../ledger/store.js";
import { accessDenied } from "../ledger/types.js";
import { seedDemo } from "../seed.js";
import { sendError } from "./auth.js";

export interface DemoDeps {
  store: LedgerStore;
  demoMode: boolean;
}

export function createDemoHandler(deps: DemoDeps) {
  return async function resetDemo(_req: Request, res: Response): Promise<void> {
    try {
      if (!deps.demoMode) {
        throw accessDenied();
      }
      await deps.store.resetDemo();
      const { group, token } = await seedDemo(deps.store);
      res.status(200).json({ group, token });
    } catch (err) {
      sendError(res, err);
    }
  };
}

import type { Request, Response } from "express";
import type { LedgerStore } from "../ledger/store.js";
import type { FindingStatus } from "../ledger/types.js";
import { invalidInput } from "../ledger/types.js";
import { requireToken, sendError } from "./auth.js";

export interface FindingDeps {
  store: LedgerStore;
}

const STATUSES: FindingStatus[] = ["open", "resolved"];

export function createFindingHandler(deps: FindingDeps) {
  return async function listFindings(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    try {
      const groupId = req.params.id as string;
      const status = req.query.status as string | undefined;
      if (status !== undefined && !STATUSES.includes(status as FindingStatus)) {
        throw invalidInput(`unknown status: ${status}`);
      }
      const findings = await deps.store.listFindings(token, groupId, status as FindingStatus | undefined);
      res.status(200).json({ findings });
    } catch (err) {
      sendError(res, err);
    }
  };
}

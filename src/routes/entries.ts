import type { Request, Response } from "express";
import type { LedgerStore } from "../ledger/store.js";
import type { CommitmentKind } from "../ledger/types.js";
import { invalidInput } from "../ledger/types.js";
import { requireToken, sendError } from "./auth.js";

export interface EntryDeps {
  store: LedgerStore;
}

const KINDS: CommitmentKind[] = ["contribution", "loan_repayment"];

export function createEntryHandler(deps: EntryDeps) {
  return async function createEntry(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    try {
      const groupId = req.params.id as string;
      const body = (req.body ?? {}) as Record<string, unknown>;
      if (typeof body.memberId !== "string") throw invalidInput("memberId is required");
      if (!KINDS.includes(body.kind as CommitmentKind)) throw invalidInput("kind must be contribution or loan_repayment");
      if (typeof body.amount !== "number" || body.amount <= 0) throw invalidInput("amount must be a positive number");
      if (typeof body.period !== "string") throw invalidInput("period is required");
      if (typeof body.occurredOn !== "string") throw invalidInput("occurredOn is required");
      const entry = await deps.store.createEntry(token, {
        groupId,
        memberId: body.memberId,
        kind: body.kind as CommitmentKind,
        amount: body.amount,
        period: body.period,
        occurredOn: body.occurredOn,
        evidenceTier: "treasurer_confirmed",
        ...(typeof body.sourceRef === "string" ? { sourceRef: body.sourceRef } : {}),
      });
      res.status(201).json({ entry });
    } catch (err) {
      sendError(res, err);
    }
  };
}

import type { Request, Response } from "express";
import type { LedgerStore } from "../ledger/store.js";
import type { ProposalStatus } from "../ledger/types.js";
import { invalidInput } from "../ledger/types.js";
import { requireToken, sendError } from "./auth.js";

export interface ProposalDeps {
  store: LedgerStore;
}

const STATUSES: ProposalStatus[] = ["pending", "approved", "rejected"];

export function createProposalHandlers(deps: ProposalDeps) {
  async function listProposals(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    try {
      const groupId = req.params.id as string;
      const status = req.query.status as string | undefined;
      if (status !== undefined && !STATUSES.includes(status as ProposalStatus)) {
        throw invalidInput(`unknown status: ${status}`);
      }
      const proposals = await deps.store.listProposals(
        token,
        groupId,
        status as ProposalStatus | undefined,
      );
      res.status(200).json({ proposals });
    } catch (err) {
      sendError(res, err);
    }
  }

  async function approveProposal(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    try {
      const result = await deps.store.approveProposal(token, req.params.id as string);
      res.status(200).json({ entry: result.entry, already: result.already });
    } catch (err) {
      sendError(res, err);
    }
  }

  async function rejectProposal(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    try {
      const proposal = await deps.store.rejectProposal(token, req.params.id as string);
      res.status(200).json({ proposal });
    } catch (err) {
      sendError(res, err);
    }
  }

  return { listProposals, approveProposal, rejectProposal };
}

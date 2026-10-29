import type { Request, Response } from "express";
import type { ClaimInput, ClaimVerdict } from "../adapters/claims.js";
import type { LedgerStore } from "../ledger/store.js";
import type { ProposalStatus } from "../ledger/types.js";
import { invalidInput } from "../ledger/types.js";
import { requireToken, sendError } from "./auth.js";

export interface ProposalDeps {
  store: LedgerStore;
  claimCheck?: (input: ClaimInput) => Promise<ClaimVerdict>;
}

const STATUSES: ProposalStatus[] = ["pending", "approved", "rejected", "answered"];

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
      const proposalId = req.params.id as string;
      const proposal = await deps.store.getProposal(token, proposalId);
      if (proposal.type === "entry" && proposal.status === "pending" && deps.claimCheck) {
        const payload = proposal.payload as {
          memberId?: unknown;
          kind?: unknown;
          amount?: unknown;
          period?: unknown;
        };
        const members = await deps.store.listMembers(token, proposal.groupId);
        const member = members.find((m) => m.id === payload.memberId);
        const verdict = await deps.claimCheck({
          member: member?.displayName ?? String(payload.memberId),
          kind: String(payload.kind),
          amount: typeof payload.amount === "number" ? payload.amount : 0,
          period: String(payload.period),
          quotes: proposal.quotes,
        });
        await deps.store.recordVerification(token, proposalId, {
          checks: [{ name: "claim_supported", passed: verdict.passed, detail: verdict.reason }],
          at: new Date().toISOString(),
        });
        if (!verdict.passed) {
          res.status(422).json({ error: { code: "invalid", message: `claim check failed: ${verdict.reason}` } });
          return;
        }
      }
      const result = await deps.store.approveProposal(token, proposalId);
      res.status(200).json({ entry: result.entry, already: result.already });
    } catch (err) {
      sendError(res, err);
    }
  }

  async function editProposal(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;
      if (typeof body.payload !== "object" || body.payload === null || Array.isArray(body.payload)) {
        throw invalidInput("body needs a payload object");
      }
      const proposal = await deps.store.editProposal(
        token,
        req.params.id as string,
        body.payload as Record<string, unknown>,
      );
      res.status(200).json({ proposal });
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

  return { listProposals, approveProposal, editProposal, rejectProposal };
}

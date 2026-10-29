import type { Request, Response } from "express";
import type { LedgerStore } from "../ledger/store.js";
import { buildToday } from "../ledger/today.js";
import { invalidInput } from "../ledger/types.js";
import { requireToken, sendError } from "./auth.js";

export interface GroupDeps {
  store: LedgerStore;
}

function defaultPeriods(asOf: string): string[] {
  const [year, month] = asOf.slice(0, 7).split("-").map(Number) as [number, number];
  const prev = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, "0")}`;
  return [`${year}-${String(month).padStart(2, "0")}`, prev];
}

export function createGroupHandlers(deps: GroupDeps) {
  async function getGroup(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    try {
      const groupId = req.params.id as string;
      const [group, members, commitments] = await Promise.all([
        deps.store.getGroup(token, groupId),
        deps.store.listMembers(token, groupId),
        deps.store.listCommitments(token, groupId),
      ]);
      res.status(200).json({ group, members, commitments });
    } catch (err) {
      sendError(res, err);
    }
  }

  async function getToday(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    try {
      const groupId = req.params.id as string;
      const asOf = (req.query.asOf as string | undefined) ?? new Date().toISOString().slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) {
        throw invalidInput("asOf must be YYYY-MM-DD");
      }
      const periodsParam = req.query.periods as string | undefined;
      const periods = periodsParam ? periodsParam.split(",") : defaultPeriods(asOf);
      if (periods.some((p) => !/^\d{4}-\d{2}$/.test(p))) {
        throw invalidInput("periods must be comma-separated YYYY-MM");
      }
      const items = await buildToday(deps.store, token, groupId, { asOf, periods });
      res.status(200).json({ asOf, periods, items });
    } catch (err) {
      sendError(res, err);
    }
  }

  async function listEntries(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    try {
      const groupId = req.params.id as string;
      const memberId = req.query.member as string | undefined;
      const period = req.query.period as string | undefined;
      if (period !== undefined && !/^\d{4}-\d{2}$/.test(period)) {
        throw invalidInput("period must be YYYY-MM");
      }
      const entries = await deps.store.listEntries(token, {
        groupId,
        ...(memberId ? { memberId } : {}),
        ...(period ? { period } : {}),
      });
      res.status(200).json({ entries });
    } catch (err) {
      sendError(res, err);
    }
  }

  return { getGroup, getToday, listEntries };
}

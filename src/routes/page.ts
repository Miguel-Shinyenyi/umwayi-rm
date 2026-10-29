import type { Request, Response } from "express";
import type { PhotoReader } from "../adapters/vision.js";
import { comparePaper, type PaperRow } from "../ledger/reconcile.js";
import type { LedgerStore } from "../ledger/store.js";
import { invalidInput, type Member } from "../ledger/types.js";
import { resolveMembers } from "../ledger/resolve.js";
import { requireToken, sendError } from "./auth.js";

export interface PageDeps {
  store: LedgerStore;
  reader: PhotoReader;
}

const ALLOWED_MIME = ["image/png", "image/jpeg"];

export function createPageHandler(deps: PageDeps) {
  return async function intakePage(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    try {
      const groupId = req.params.id as string;
      const body = (req.body ?? {}) as Record<string, unknown>;
      if (typeof body.image !== "string" || body.image === "") {
        throw invalidInput("body needs base64 image");
      }
      const mime = typeof body.mime === "string" ? body.mime : "image/png";
      if (!ALLOWED_MIME.includes(mime)) {
        throw invalidInput(`mime must be one of: ${ALLOWED_MIME.join(", ")}`);
      }
      const rows = await deps.reader.readPage(Buffer.from(body.image, "base64"), mime);
      const [members, entries] = await Promise.all([
        deps.store.listMembers(token, groupId),
        deps.store.listEntries(token, { groupId }),
      ]);
      const normalized: PaperRow[] = [];
      const unknown: PaperRow[] = [];
      for (const row of rows) {
        const matches = resolveMembers(members, row.memberText);
        if (matches.length === 1) {
          normalized.push({ ...row, memberText: (matches[0] as Member).displayName });
        } else {
          unknown.push(row);
        }
      }
      const compared = comparePaper(members, entries, normalized);
      const proposals = [];
      for (const item of [...compared.onlyOnPaper.map((row) => ({ row })), ...compared.amountDiffers]) {
        const member = resolveMembers(members, item.row.memberText)[0] as Member;
        proposals.push(
          await deps.store.createProposal(token, {
            groupId,
            type: "entry",
            payload: {
              memberId: member.id,
              kind: "contribution",
              amount: item.row.amount,
              period: item.row.period,
              occurredOn: `${item.row.period}-01`,
              sourceRef: "page",
            },
          }),
        );
      }
      for (const row of unknown) {
        proposals.push(
          await deps.store.createProposal(token, {
            groupId,
            type: "question",
            payload: { text: `Which member is "${row.memberText}" on the page?` },
          }),
        );
      }
      const findings = [];
      for (const row of [...compared.onlyOnPaper, ...unknown]) {
        findings.push(
          await deps.store.saveFinding(token, { groupId, kind: "only_on_paper", refs: { row } }),
        );
      }
      for (const item of compared.amountDiffers) {
        findings.push(
          await deps.store.saveFinding(token, {
            groupId,
            kind: "amount_differs",
            refs: { row: item.row, entryId: item.entryId, ledgerAmount: item.ledgerAmount },
          }),
        );
      }
      for (const entry of compared.onlyInLedger) {
        findings.push(
          await deps.store.saveFinding(token, { groupId, kind: "only_in_ledger", refs: { entryId: entry.id } }),
        );
      }
      res.status(200).json({ rows, proposals, findings });
    } catch (err) {
      sendError(res, err);
    }
  };
}

import type { Entry, Member } from "./types.js";

export interface PaperRow {
  memberText: string;
  amount: number;
  period: string;
}

export interface MatchedRow {
  row: PaperRow;
  entryId: string;
}

export interface AmountDiffersRow {
  row: PaperRow;
  entryId: string;
  ledgerAmount: number;
}

export interface CompareResult {
  matched: MatchedRow[];
  onlyOnPaper: PaperRow[];
  onlyInLedger: Entry[];
  amountDiffers: AmountDiffersRow[];
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function memberMatches(member: Member, text: string): boolean {
  const want = normalize(text);
  if (normalize(member.displayName) === want) {
    return true;
  }
  return member.aliases.some((alias) => normalize(alias) === want);
}

export function comparePaper(members: Member[], entries: Entry[], rows: PaperRow[]): CompareResult {
  const sortedRows = [...rows].sort(
    (a, b) =>
      normalize(a.memberText).localeCompare(normalize(b.memberText)) ||
      a.period.localeCompare(b.period) ||
      a.amount - b.amount,
  );
  const remaining = new Map(entries.map((e) => [e.id, e]));
  const matched: MatchedRow[] = [];
  const onlyOnPaper: PaperRow[] = [];
  const amountDiffers: AmountDiffersRow[] = [];
  for (const row of sortedRows) {
    const candidates = [...remaining.values()].filter((entry) => {
      const member = members.find((m) => m.id === entry.memberId);
      return member !== undefined && memberMatches(member, row.memberText) && entry.period === row.period;
    });
    const exact = candidates.find((entry) => entry.amount === row.amount);
    if (exact) {
      remaining.delete(exact.id);
      matched.push({ row, entryId: exact.id });
      continue;
    }
    const sameMemberPeriod = candidates
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id))[0];
    if (sameMemberPeriod) {
      remaining.delete(sameMemberPeriod.id);
      amountDiffers.push({ row, entryId: sameMemberPeriod.id, ledgerAmount: sameMemberPeriod.amount });
      continue;
    }
    onlyOnPaper.push(row);
  }
  const onlyInLedger = [...remaining.values()].sort((a, b) => a.id.localeCompare(b.id));
  return { matched, onlyOnPaper, onlyInLedger, amountDiffers };
}

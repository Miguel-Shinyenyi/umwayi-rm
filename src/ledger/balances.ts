import type { Commitment, Entry } from "./types.js";

export interface PeriodBalance {
  memberId: string;
  period: string;
  kind: Commitment["kind"];
  committed: number;
  paid: number;
  outstanding: number;
}

export function sumPaid(entries: Entry[], memberId: string, period: string, kind: Commitment["kind"]): number {
  return entries
    .filter((e) => e.memberId === memberId && e.period === period && e.kind === kind)
    .reduce((total, e) => total + e.amount, 0);
}

export function periodBalance(
  commitment: Commitment,
  entries: Entry[],
  period: string,
): PeriodBalance {
  const paid = sumPaid(entries, commitment.memberId, period, commitment.kind);
  return {
    memberId: commitment.memberId,
    period,
    kind: commitment.kind,
    committed: commitment.amount,
    paid,
    outstanding: Math.max(0, commitment.amount - paid),
  };
}

function monthDay(period: string, day: number): string {
  return `${period}-${String(day).padStart(2, "0")}`;
}

export function dueDateFor(dueRule: string, period: string): string | null {
  const monthly = /^monthly day (\d{1,2})$/.exec(dueRule.trim());
  if (monthly) {
    return monthDay(period, Number(monthly[1]));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dueRule.trim())) {
    return dueRule.trim();
  }
  return null;
}

export interface OverdueItem {
  memberId: string;
  commitmentId: string;
  kind: Commitment["kind"];
  period: string;
  dueDate: string;
  committed: number;
  paid: number;
  outstanding: number;
}

export function overdueCommitments(
  commitments: Commitment[],
  entries: Entry[],
  periods: string[],
  asOf: string,
): OverdueItem[] {
  const items: OverdueItem[] = [];
  for (const commitment of commitments) {
    const oneDate = /^\d{4}-\d{2}-\d{2}$/.test(commitment.dueRule.trim())
      ? commitment.dueRule.trim()
      : null;
    if (oneDate) {
      if (oneDate < asOf) {
        const paid = entries
          .filter((e) => e.memberId === commitment.memberId && e.kind === commitment.kind)
          .reduce((total, e) => total + e.amount, 0);
        if (paid < commitment.amount) {
          items.push({
            memberId: commitment.memberId,
            commitmentId: commitment.id,
            kind: commitment.kind,
            period: oneDate.slice(0, 7),
            dueDate: oneDate,
            committed: commitment.amount,
            paid,
            outstanding: commitment.amount - paid,
          });
        }
      }
      continue;
    }
    for (const period of periods) {
      const dueDate = dueDateFor(commitment.dueRule, period);
      if (!dueDate || dueDate >= asOf) {
        continue;
      }
      const balance = periodBalance(commitment, entries, period);
      if (balance.outstanding > 0) {
        items.push({
          memberId: commitment.memberId,
          commitmentId: commitment.id,
          kind: commitment.kind,
          period,
          dueDate,
          committed: balance.committed,
          paid: balance.paid,
          outstanding: balance.outstanding,
        });
      }
    }
  }
  items.sort(
    (a, b) =>
      a.dueDate.localeCompare(b.dueDate) ||
      a.memberId.localeCompare(b.memberId) ||
      a.commitmentId.localeCompare(b.commitmentId),
  );
  return items;
}

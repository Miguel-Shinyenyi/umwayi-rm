import type { Commitment, Finding, Member } from "./types.js";
import { overdueCommitments, type OverdueItem } from "./balances.js";
import type { LedgerStore } from "./store.js";

export interface TodayOverdue extends OverdueItem {
  category: "overdue";
  displayName: string;
}

export interface TodayFinding {
  category: "finding";
  findingId: string;
  kind: Finding["kind"];
  refs: Record<string, unknown>;
}

export interface TodayQuestion {
  category: "question";
  proposalId: string;
  text: string;
  createdAt: string;
}

export type TodayItem = TodayOverdue | TodayFinding | TodayQuestion;

export interface TodayOptions {
  asOf: string;
  periods: string[];
}

const CATEGORY_RANK: Record<TodayItem["category"], number> = {
  overdue: 0,
  finding: 1,
  question: 2,
};

export async function buildToday(
  store: LedgerStore,
  token: string,
  groupId: string,
  options: TodayOptions,
): Promise<TodayItem[]> {
  const [commitments, entries, findings, proposals, members] = await Promise.all([
    listCommitments(store, token, groupId),
    store.listEntries(token, { groupId }),
    store.listFindings(token, groupId, "open"),
    store.listProposals(token, groupId, "pending"),
    listMembers(store, token, groupId),
  ]);
  const names = new Map(members.map((m) => [m.id, m.displayName]));
  const items: TodayItem[] = [];
  for (const item of overdueCommitments(commitments, entries, options.periods, options.asOf)) {
    items.push({
      category: "overdue",
      displayName: names.get(item.memberId) ?? item.memberId,
      ...item,
    });
  }
  const sortedFindings = [...findings].sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id),
  );
  for (const finding of sortedFindings) {
    items.push({ category: "finding", findingId: finding.id, kind: finding.kind, refs: finding.refs });
  }
  const questions = proposals
    .filter((p) => p.type === "question")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  for (const question of questions) {
    items.push({
      category: "question",
      proposalId: question.id,
      text: typeof question.payload.text === "string" ? question.payload.text : "",
      createdAt: question.createdAt,
    });
  }
  items.sort((a, b) => {
    const rank = CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category];
    if (rank !== 0) {
      return rank;
    }
    return todayKey(a).localeCompare(todayKey(b));
  });
  return items;
}

function todayKey(item: TodayItem): string {
  if (item.category === "overdue") {
    return `${item.dueDate}|${item.displayName}|${item.memberId}|${item.commitmentId}`;
  }
  if (item.category === "finding") {
    return `${item.kind}|${item.findingId}`;
  }
  return `${item.createdAt}|${item.proposalId}`;
}

async function listCommitments(
  store: LedgerStore,
  token: string,
  groupId: string,
): Promise<Commitment[]> {
  return store.listCommitments(token, groupId);
}

async function listMembers(store: LedgerStore, token: string, groupId: string): Promise<Member[]> {
  return store.listMembers(token, groupId);
}

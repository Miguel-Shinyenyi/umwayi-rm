import type { LedgerStore } from "../ledger/store.js";
import type { Member } from "../ledger/types.js";

export interface RunContext {
  intakeText: string;
  refusals: number;
}

export interface ToolDeps {
  store: LedgerStore;
  token: string;
  groupId: string;
  run: RunContext;
}

export const MAX_QUOTES = 3;
export const MAX_REFUSALS = 3;

export interface Refusal {
  refused: true;
  reason: string;
  mustAsk?: boolean;
}

function refuse(deps: ToolDeps, reason: string, count = true): Refusal {
  if (count) {
    deps.run.refusals += 1;
  }
  return { refused: true as const, reason };
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export function resolveMembers(members: Member[], text: string): Member[] {
  const want = normalize(text);
  return members.filter((m) => {
    if (normalize(m.displayName) === want) {
      return true;
    }
    if (m.aliases.some((a) => normalize(a) === want)) {
      return true;
    }
    return normalize(m.displayName).split(/\s+/)[0] === want;
  });
}

export async function handleGetMemberList(
  deps: ToolDeps,
): Promise<{ members: { displayName: string; aliases: string[] }[] }> {
  const members = await deps.store.listMembers(deps.token, deps.groupId);
  return {
    members: members.map((m) => ({ displayName: m.displayName, aliases: m.aliases })),
  };
}

export async function handleGetLedgerPage(
  deps: ToolDeps,
  args: { period?: string; memberText?: string },
): Promise<{
  entries: {
    member: string;
    kind: string;
    amount: number;
    period: string;
    occurredOn: string;
    tier: string;
  }[];
}> {
  const [members, entries] = await Promise.all([
    deps.store.listMembers(deps.token, deps.groupId),
    deps.store.listEntries(deps.token, { groupId: deps.groupId, period: args.period }),
  ]);
  const names = new Map(members.map((m) => [m.id, m.displayName]));
  let filtered = entries;
  if (args.memberText) {
    const matches = new Set(resolveMembers(members, args.memberText).map((m) => m.id));
    filtered = entries.filter((e) => matches.has(e.memberId));
  }
  return {
    entries: filtered.map((e) => ({
      member: names.get(e.memberId) ?? e.memberId,
      kind: e.kind,
      amount: e.amount,
      period: e.period,
      occurredOn: e.occurredOn,
      tier: e.evidenceTier,
    })),
  };
}

export interface ProposeEntryArgs {
  memberText: string;
  kind: string;
  amount: number;
  period: string;
  occurredOn: string;
  quotes: string[];
  sourceRef?: string;
  note?: string;
}

export async function handleProposeEntry(
  deps: ToolDeps,
  args: ProposeEntryArgs,
): Promise<{ proposalId: string; status: string } | Refusal> {
  if (deps.run.refusals >= MAX_REFUSALS) {
    return {
      refused: true,
      reason: "refusal budget spent: file a question instead of proposing again",
      mustAsk: true,
    };
  }
  if (!Array.isArray(args.quotes) || args.quotes.length > MAX_QUOTES) {
    return refuse(deps, `at most ${MAX_QUOTES} quotes per proposal`);
  }
  const source = normalize(deps.run.intakeText);
  for (const [index, quote] of args.quotes.entries()) {
    if (typeof quote !== "string" || !normalize(quote) || !source.includes(normalize(quote))) {
      return refuse(deps, `quote ${index + 1} does not appear in the intake note`);
    }
  }
  const members = await deps.store.listMembers(deps.token, deps.groupId);
  const matches = resolveMembers(members, args.memberText);
  if (matches.length === 0) {
    return refuse(deps, `no member matches "${args.memberText}"`);
  }
  if (matches.length > 1) {
    return refuse(deps, `two members share that name; ask which one is meant`);
  }
  const member = matches[0] as Member;
  if (args.kind !== "contribution" && args.kind !== "loan_repayment") {
    return refuse(deps, `unknown kind: ${String(args.kind)}`);
  }
  if (!Number.isInteger(args.amount) || args.amount <= 0) {
    return refuse(deps, `amount must be a positive integer, got: ${String(args.amount)}`);
  }
  if (!/^\d{4}-\d{2}$/.test(args.period ?? "")) {
    return refuse(deps, `period must be YYYY-MM, got: ${String(args.period)}`);
  }
  if (typeof args.occurredOn !== "string" || !args.occurredOn) {
    return refuse(deps, "occurredOn is required");
  }
  const proposal = await deps.store.createProposal(deps.token, {
    groupId: deps.groupId,
    type: "entry",
    payload: {
      memberId: member.id,
      kind: args.kind,
      amount: args.amount,
      period: args.period,
      occurredOn: args.occurredOn,
      ...(args.sourceRef ? { sourceRef: args.sourceRef } : {}),
      ...(args.note ? { note: args.note } : {}),
    },
    quotes: args.quotes,
  });
  return { proposalId: proposal.id, status: proposal.status };
}

export async function handleProposeQuestion(
  deps: ToolDeps,
  args: { text: string },
): Promise<{ proposalId: string; status: string } | Refusal> {
  if (typeof args.text !== "string" || !args.text.trim()) {
    return { refused: true, reason: "question text is required" };
  }
  const proposal = await deps.store.createProposal(deps.token, {
    groupId: deps.groupId,
    type: "question",
    payload: { text: args.text.trim() },
  });
  return { proposalId: proposal.id, status: proposal.status };
}

export async function handleProposeDraftReminder(
  deps: ToolDeps,
  args: { memberText: string; period: string; text: string },
): Promise<{ proposalId: string; status: string } | Refusal> {
  const members = await deps.store.listMembers(deps.token, deps.groupId);
  const matches = resolveMembers(members, args.memberText);
  if (matches.length !== 1) {
    return { refused: true, reason: "reminder needs exactly one matching member" };
  }
  if (!/^\d{4}-\d{2}$/.test(args.period ?? "")) {
    return { refused: true, reason: `period must be YYYY-MM, got: ${String(args.period)}` };
  }
  if (typeof args.text !== "string" || !args.text.trim()) {
    return { refused: true, reason: "reminder text is required" };
  }
  const proposal = await deps.store.createProposal(deps.token, {
    groupId: deps.groupId,
    type: "draft_reminder",
    payload: {
      memberId: (matches[0] as Member).id,
      period: args.period,
      text: args.text.trim(),
    },
  });
  return { proposalId: proposal.id, status: proposal.status };
}

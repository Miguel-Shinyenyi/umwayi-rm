import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import type { LedgerStore } from "../src/ledger/store.js";
import { buildToday, type TodayItem } from "../src/ledger/today.js";

const here = dirname(fileURLToPath(import.meta.url));

interface Fixture {
  id: string;
  asOf: string;
  periods: string[];
  members: { displayName: string; aliases: string[] }[];
  commitments: { member: number; kind: "contribution" | "loan_repayment"; amount: number; dueRule: string }[];
  entries: {
    member: number;
    kind: "contribution" | "loan_repayment";
    amount: number;
    period: string;
    occurredOn: string;
    tier: "treasurer_confirmed";
  }[];
  findings: { kind: "only_on_paper" | "only_in_ledger" | "amount_differs"; refs: Record<string, unknown> }[];
  questions: { text: string }[];
  entryProposals?: {
    member: number;
    kind: "contribution" | "loan_repayment";
    amount: number;
    period: string;
    occurredOn: string;
  }[];
  decide?: { approveProposals?: number[]; resolveFindings?: number[] };
  expected: {
    overdue: { member: string; period: string; outstanding: number; dueDate: string }[];
    findingKinds: string[];
    questionTexts: string[];
    categories: string[];
  };
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function seed(
  store: LedgerStore,
  fixture: Fixture,
  order: "forward" | "reverse",
): Promise<{ token: string; groupId: string }> {
  const { group, token } = await store.createGroup("Fixture group");
  const pick = <T>(list: T[]): T[] => (order === "forward" ? list : [...list].reverse());
  const memberIds: string[] = [];
  const indexed = fixture.members.map((m, i) => ({ ...m, index: i }));
  for (const member of pick(indexed)) {
    const created = await store.createMember(token, {
      groupId: group.id,
      displayName: member.displayName,
      aliases: member.aliases,
    });
    memberIds[member.index] = created.id;
  }
  for (const commitment of pick(fixture.commitments)) {
    await store.createCommitment(token, {
      groupId: group.id,
      memberId: memberIds[commitment.member] as string,
      kind: commitment.kind,
      amount: commitment.amount,
      dueRule: commitment.dueRule,
    });
  }
  for (const entry of pick(fixture.entries)) {
    await store.createEntry(token, {
      groupId: group.id,
      memberId: memberIds[entry.member] as string,
      kind: entry.kind,
      amount: entry.amount,
      period: entry.period,
      occurredOn: entry.occurredOn,
      evidenceTier: entry.tier,
    });
  }
  for (const finding of pick(fixture.findings)) {
    await sleep(2);
    await store.saveFinding(token, {
      groupId: group.id,
      kind: finding.kind,
      refs: finding.refs,
    });
  }
  for (const question of pick(fixture.questions)) {
    await sleep(2);
    await store.createProposal(token, {
      groupId: group.id,
      type: "question",
      payload: { text: question.text },
    });
  }
  const proposalIds: string[] = [];
  for (const proposal of pick(fixture.entryProposals ?? [])) {
    await sleep(2);
    const created = await store.createProposal(token, {
      groupId: group.id,
      type: "entry",
      payload: {
        memberId: memberIds[proposal.member] as string,
        kind: proposal.kind,
        amount: proposal.amount,
        period: proposal.period,
        occurredOn: proposal.occurredOn,
      },
    });
    proposalIds.push(created.id);
  }
  for (const index of fixture.decide?.approveProposals ?? []) {
    await store.approveProposal(token, proposalIds[index] as string);
  }
  for (const index of fixture.decide?.resolveFindings ?? []) {
    const saved = await store.listFindings(token, group.id, "open");
    const target = saved.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[index];
    if (target) {
      await store.resolveFinding(token, target.id);
    }
  }
  return { token, groupId: group.id };
}

function signature(items: TodayItem[]): string[] {
  return items.map((item) => {
    if (item.category === "overdue") {
      return `overdue|${item.displayName}|${item.period}|${item.outstanding}`;
    }
    if (item.category === "finding") {
      return `finding|${item.kind}`;
    }
    return `question|${item.text}`;
  });
}

const fixtureDir = join(here, "fixtures", "today");
const files = await readdir(fixtureDir).then((names) => names.filter((n) => n.endsWith(".json")).sort());

describe.each(files)("%s", (file) => {
  it("matches the expected Today order", async () => {
    const fixture = JSON.parse(await readFile(join(fixtureDir, file), "utf8")) as Fixture;
    const store = new MemoryLedgerStore();
    const { token, groupId } = await seed(store, fixture, "forward");
    const first = await buildToday(store, token, groupId, {
      asOf: fixture.asOf,
      periods: fixture.periods,
    });
    expect(first.map((i) => i.category)).toEqual(fixture.expected.categories);
    expect(
      first
        .filter((i) => i.category === "overdue")
        .map((i) => ({
          member: (i as { displayName: string }).displayName,
          period: (i as { period: string }).period,
          outstanding: (i as { outstanding: number }).outstanding,
          dueDate: (i as { dueDate: string }).dueDate,
        })),
    ).toEqual(fixture.expected.overdue);
    expect(first.filter((i) => i.category === "finding").map((i) => (i as { kind: string }).kind)).toEqual(
      fixture.expected.findingKinds,
    );
    expect(
      first.filter((i) => i.category === "question").map((i) => (i as { text: string }).text),
    ).toEqual(fixture.expected.questionTexts);
    const second = await buildToday(store, token, groupId, {
      asOf: fixture.asOf,
      periods: fixture.periods,
    });
    expect(second).toEqual(first);
    const reversed = new MemoryLedgerStore();
    const seed2 = await seed(reversed, fixture, "reverse");
    const third = await buildToday(reversed, seed2.token, seed2.groupId, {
      asOf: fixture.asOf,
      periods: fixture.periods,
    });
    expect(third.map((i) => i.category)).toEqual(fixture.expected.categories);
    expect(signature(third).sort()).toEqual(signature(first).sort());
  });
});

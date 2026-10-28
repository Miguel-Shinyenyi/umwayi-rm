import { describe, expect, it } from "vitest";
import type { LedgerStore } from "../src/ledger/store.js";
import { LedgerError } from "../src/ledger/types.js";

export interface StoreHandle {
  store: LedgerStore;
  close: () => Promise<void>;
}

async function expectLedgerError(promise: Promise<unknown>, statusCode: number): Promise<void> {
  try {
    await promise;
  } catch (err) {
    expect(err).toBeInstanceOf(LedgerError);
    expect((err as LedgerError).statusCode).toBe(statusCode);
    return;
  }
  throw new Error(`expected LedgerError ${statusCode}, but the call succeeded`);
}

export function ledgerConformance(name: string, makeStore: () => Promise<StoreHandle>): void {
  describe(`ledger conformance (${name})`, () => {
    it("creates a group with a treasurer token", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        expect(group.id.length).toBeGreaterThan(0);
        expect(group.currency).toBe("KES");
        expect(token.length).toBeGreaterThan(16);
      } finally {
        await close();
      }
    });

    it("creates member, commitment, and entry, then lists the entry", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        const member = await store.createMember(token, {
          groupId: group.id,
          displayName: "Wanjiku Mwangi",
          aliases: ["Shiku"],
        });
        const commitment = await store.createCommitment(token, {
          groupId: group.id,
          memberId: member.id,
          kind: "contribution",
          amount: 500,
          dueRule: "monthly day 5",
        });
        expect(commitment.amount).toBe(500);
        const entry = await store.createEntry(token, {
          groupId: group.id,
          memberId: member.id,
          kind: "contribution",
          amount: 500,
          period: "2026-10",
          occurredOn: "2026-10-05",
          evidenceTier: "treasurer_confirmed",
        });
        const listed = await store.listEntries(token, { groupId: group.id });
        expect(listed.map((e) => e.id)).toEqual([entry.id]);
      } finally {
        await close();
      }
    });

    it("approves twice and creates exactly one entry", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        const member = await store.createMember(token, {
          groupId: group.id,
          displayName: "Kamau Njoroge",
        });
        const proposal = await store.createProposal(token, {
          groupId: group.id,
          type: "entry",
          payload: {
            memberId: member.id,
            kind: "contribution",
            amount: 500,
            period: "2026-10",
            occurredOn: "2026-10-05",
          },
          quotes: ["Kamau paid five hundred"],
        });
        const first = await store.approveProposal(token, proposal.id);
        expect(first.already).toBe(false);
        expect(first.entry.evidenceTier).toBe("agent_proposed_approved");
        expect(first.entry.proposalId).toBe(proposal.id);
        const second = await store.approveProposal(token, proposal.id);
        expect(second.already).toBe(true);
        expect(second.entry.id).toBe(first.entry.id);
        const listed = await store.listEntries(token, { groupId: group.id });
        expect(listed).toHaveLength(1);
      } finally {
        await close();
      }
    });

    it("rejects a pending proposal and refuses later approval", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        const member = await store.createMember(token, {
          groupId: group.id,
          displayName: "Achieng Odhiambo",
        });
        const proposal = await store.createProposal(token, {
          groupId: group.id,
          type: "entry",
          payload: {
            memberId: member.id,
            kind: "contribution",
            amount: 500,
            period: "2026-10",
            occurredOn: "2026-10-05",
          },
        });
        const rejected = await store.rejectProposal(token, proposal.id);
        expect(rejected.status).toBe("rejected");
        await expectLedgerError(store.approveProposal(token, proposal.id), 409);
        await expectLedgerError(store.rejectProposal(token, proposal.id), 409);
        const listed = await store.listEntries(token, { groupId: group.id });
        expect(listed).toHaveLength(0);
      } finally {
        await close();
      }
    });

    it("refuses to approve a question proposal", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        const proposal = await store.createProposal(token, {
          groupId: group.id,
          type: "question",
          payload: { text: "Which Brian paid?" },
        });
        await expectLedgerError(store.approveProposal(token, proposal.id), 422);
      } finally {
        await close();
      }
    });

    it("denies one group token on another group", async () => {
      const { store, close } = await makeStore();
      try {
        const a = await store.createGroup("Group A");
        const b = await store.createGroup("Group B");
        await expectLedgerError(
          store.createMember(a.token, { groupId: b.group.id, displayName: "Intruder" }),
          403,
        );
        await expectLedgerError(store.listEntries(a.token, { groupId: b.group.id }), 403);
        const memberB = await store.createMember(b.token, {
          groupId: b.group.id,
          displayName: "Zawadi Muthoni",
        });
        await expectLedgerError(
          store.createEntry(a.token, {
            groupId: b.group.id,
            memberId: memberB.id,
            kind: "contribution",
            amount: 500,
            period: "2026-10",
            occurredOn: "2026-10-05",
            evidenceTier: "treasurer_confirmed",
          }),
          403,
        );
        const proposalB = await store.createProposal(b.token, {
          groupId: b.group.id,
          type: "entry",
          payload: {
            memberId: memberB.id,
            kind: "contribution",
            amount: 500,
            period: "2026-10",
            occurredOn: "2026-10-05",
          },
        });
        await expectLedgerError(store.approveProposal(a.token, proposalB.id), 403);
      } finally {
        await close();
      }
    });

    it("rejects bad amounts, periods, kinds, and tiers", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        const member = await store.createMember(token, {
          groupId: group.id,
          displayName: "Njeri Wambui",
        });
        const good = {
          groupId: group.id,
          memberId: member.id,
          kind: "contribution" as const,
          amount: 500,
          period: "2026-10",
          occurredOn: "2026-10-05",
          evidenceTier: "treasurer_confirmed" as const,
        };
        await expectLedgerError(store.createEntry(token, { ...good, amount: 0 }), 422);
        await expectLedgerError(store.createEntry(token, { ...good, amount: -5 }), 422);
        await expectLedgerError(store.createEntry(token, { ...good, amount: 1.5 }), 422);
        await expectLedgerError(store.createEntry(token, { ...good, period: "October" }), 422);
        await expectLedgerError(
          store.createEntry(token, { ...good, kind: "gift" as "contribution" }),
          422,
        );
        await expectLedgerError(
          store.createEntry(token, { ...good, evidenceTier: "maybe" as "treasurer_confirmed" }),
          422,
        );
        await expectLedgerError(
          store.createEntry(token, { ...good, memberId: "no-such-member" }),
          422,
        );
      } finally {
        await close();
      }
    });

    it("filters listed entries by member and period", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        const wanjiku = await store.createMember(token, {
          groupId: group.id,
          displayName: "Wanjiku Mwangi",
        });
        const kamau = await store.createMember(token, {
          groupId: group.id,
          displayName: "Kamau Njoroge",
        });
        await store.createEntry(token, {
          groupId: group.id,
          memberId: wanjiku.id,
          kind: "contribution",
          amount: 500,
          period: "2026-09",
          occurredOn: "2026-09-05",
          evidenceTier: "treasurer_confirmed",
        });
        await store.createEntry(token, {
          groupId: group.id,
          memberId: kamau.id,
          kind: "contribution",
          amount: 500,
          period: "2026-10",
          occurredOn: "2026-10-05",
          evidenceTier: "treasurer_confirmed",
        });
        const byMember = await store.listEntries(token, {
          groupId: group.id,
          memberId: kamau.id,
        });
        expect(byMember).toHaveLength(1);
        const byPeriod = await store.listEntries(token, {
          groupId: group.id,
          period: "2026-09",
        });
        expect(byPeriod).toHaveLength(1);
        expect(byPeriod[0]?.memberId).toBe(wanjiku.id);
      } finally {
        await close();
      }
    });
  });
}

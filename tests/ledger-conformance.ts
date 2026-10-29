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
        const fetched = await store.getGroup(token, group.id);
        expect(fetched.name).toBe("Tumaini");
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

    it("saves, lists, and resolves findings", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        const finding = await store.saveFinding(token, {
          groupId: group.id,
          kind: "only_on_paper",
          refs: { memberText: "Brian", amount: 500 },
        });
        expect(finding.status).toBe("open");
        const open = await store.listFindings(token, group.id, "open");
        expect(open.map((f) => f.id)).toEqual([finding.id]);
        const resolved = await store.resolveFinding(token, finding.id);
        expect(resolved.status).toBe("resolved");
        expect(await store.listFindings(token, group.id, "open")).toHaveLength(0);
        await expectLedgerError(store.resolveFinding(token, finding.id), 409);
      } finally {
        await close();
      }
    });

    it("lists proposals with an optional status filter", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        const member = await store.createMember(token, {
          groupId: group.id,
          displayName: "Chebet Lagat",
        });
        const entryProposal = await store.createProposal(token, {
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
        await store.createProposal(token, {
          groupId: group.id,
          type: "question",
          payload: { text: "Which month?" },
        });
        await store.approveProposal(token, entryProposal.id);
        const pending = await store.listProposals(token, group.id, "pending");
        expect(pending.map((p) => p.type)).toEqual(["question"]);
        const all = await store.listProposals(token, group.id);
        expect(all).toHaveLength(2);
      } finally {
        await close();
      }
    });

    it("lists members and commitments, and denies cross-group reads", async () => {
      const { store, close } = await makeStore();
      try {
        const a = await store.createGroup("Group A");
        const b = await store.createGroup("Group B");
        await store.createMember(a.token, { groupId: a.group.id, displayName: "Omondi Juma" });
        expect(await store.listMembers(a.token, a.group.id)).toHaveLength(1);
        expect(await store.listCommitments(a.token, a.group.id)).toHaveLength(0);
        await expectLedgerError(store.listMembers(a.token, b.group.id), 403);
        await expectLedgerError(store.listCommitments(a.token, b.group.id), 403);
        await expectLedgerError(store.listProposals(a.token, b.group.id), 403);
        await expectLedgerError(store.listFindings(a.token, b.group.id), 403);
      } finally {
        await close();
      }
    });

    it("saves and recalls archive items with checksums", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        const item = await store.saveArchiveItem(token, {
          groupId: group.id,
          kind: "meeting",
          verbatim: "Met on Sunday. All paid.",
          gist: "Sunday meeting, all paid",
        });
        expect(item.sha256).toMatch(/^[0-9a-f]{64}$/);
        const fetched = await store.getArchiveItem(token, group.id, item.id);
        expect(fetched.verbatim).toBe("Met on Sunday. All paid.");
        const gists = await store.listArchiveItems(token, group.id);
        expect(gists).toHaveLength(1);
        expect(gists[0]).not.toHaveProperty("verbatim");
        expect(gists[0]?.sha256).toBe(item.sha256);
        await expectLedgerError(store.getArchiveItem(token, group.id, "missing"), 422);
      } finally {
        await close();
      }
    });

    it("reads proposals and records verification trails", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        const member = await store.createMember(token, { groupId: group.id, displayName: "Omondi Juma" });
        const proposal = await store.createProposal(token, {
          groupId: group.id,
          type: "entry",
          payload: { memberId: member.id, kind: "contribution", amount: 500, period: "2026-10", occurredOn: "2026-10-05" },
          quotes: ["Omondi paid 500"],
        });
        expect(proposal.verification).toBeNull();
        const fetched = await store.getProposal(token, proposal.id);
        expect(fetched.id).toBe(proposal.id);
        await expectLedgerError(store.getProposal(token, "missing"), 422);
        const recorded = await store.recordVerification(token, proposal.id, {
          checks: [{ name: "claim_supported", passed: true }],
          at: "2026-10-29T00:00:00.000Z",
        });
        expect(recorded.verification?.checks.map((c) => c.name)).toEqual(["claim_supported"]);
        const result = await store.approveProposal(token, proposal.id);
        expect(result.already).toBe(false);
        const decided = await store.getProposal(token, proposal.id);
        expect(decided.verification?.checks.map((c) => c.name)).toEqual([
          "claim_supported",
          "schema_valid",
          "member_unique",
          "quotes_attached",
        ]);
        expect(decided.verification?.checks.every((c) => c.passed)).toBe(true);
        await expectLedgerError(
          store.recordVerification(token, proposal.id, { checks: [], at: "2026-10-29T00:00:00.000Z" }),
          409,
        );
      } finally {
        await close();
      }
    });

    it("saves and reads runs", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        const run = await store.saveRun(token, {
          id: "run-1",
          groupId: group.id,
          intakeRef: "Omondi paid 500.",
          modelId: "test/model",
          promptVersion: "pack-v0",
          steps: [{ index: 1, content: null, calls: ["propose_entry"] }],
          status: "proposed",
        });
        expect(run.id).toBe("run-1");
        const fetched = await store.getRun(token, "run-1");
        expect(fetched.steps).toHaveLength(1);
        await expectLedgerError(store.getRun(token, "missing"), 422);
        const other = await store.createGroup("Other");
        await expectLedgerError(store.getRun(other.token, "run-1"), 403);
      } finally {
        await close();
      }
    });

    it("resets demo state and invalidates old tokens", async () => {
      const { store, close } = await makeStore();
      try {
        const { group, token } = await store.createGroup("Tumaini");
        await store.createMember(token, { groupId: group.id, displayName: "Omondi Juma" });
        await store.resetDemo();
        await expectLedgerError(store.listMembers(token, group.id), 403);
        const fresh = await store.createGroup("Tumaini");
        expect(await store.listMembers(fresh.token, fresh.group.id)).toHaveLength(0);
      } finally {
        await close();
      }
    });
  });
}

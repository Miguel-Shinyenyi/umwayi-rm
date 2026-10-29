import type { Request, Response } from "express";
import { describe, expect, it } from "vitest";
import { verifyClaim } from "../src/adapters/claims.js";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { handleProposeDraftReminder } from "../src/mcp/tools.js";
import { createIntakeHandler } from "../src/routes/intake.js";
import { createProposalHandlers } from "../src/routes/proposals.js";
import { createRunHandler, lineCoverage } from "../src/routes/runs.js";
import { StubAdapter } from "./stub-adapter.js";

function mockResponse(): { res: Response; seen: { code: number; payload: unknown } } {
  const seen = { code: 0, payload: null as unknown };
  const res = {
    status(code: number) {
      seen.code = code;
      return this;
    },
    json(payload: unknown) {
      seen.payload = payload;
      return this;
    },
  } as unknown as Response;
  return { res, seen };
}

function mockRequest(init: { params?: Record<string, string>; body?: unknown; token?: string }): Request {
  return {
    params: init.params ?? {},
    query: {},
    body: init.body,
    headers: { authorization: `Bearer ${init.token ?? "token"}` },
  } as unknown as Request;
}

async function seedEntry() {
  const store = new MemoryLedgerStore();
  const { group, token } = await store.createGroup("Verify group");
  const member = await store.createMember(token, { groupId: group.id, displayName: "Omondi Juma" });
  const proposal = await store.createProposal(token, {
    groupId: group.id,
    type: "entry",
    payload: { memberId: member.id, kind: "contribution", amount: 500, period: "2026-10", occurredOn: "2026-10-05" },
    quotes: ["Omondi paid 500"],
  });
  return { store, group, token, proposal };
}

describe("verifyClaim", () => {
  const input = { member: "Omondi Juma", kind: "contribution", amount: 500, period: "2026-10", quotes: ["Omondi paid 500"] };

  it("passes supported claims and fails the rest", async () => {
    const yes = new StubAdapter([{ content: '{"supported": true, "reason": "amount matches"}', modelId: "s" }]);
    expect(await verifyClaim(yes, input)).toEqual({ passed: true, reason: "amount matches" });
    const no = new StubAdapter([{ content: '{"supported": false, "reason": "wrong month"}', modelId: "s" }]);
    expect(await verifyClaim(no, input)).toEqual({ passed: false, reason: "wrong month" });
  });

  it("fails closed on garbage and on missing quotes", async () => {
    const garbage = new StubAdapter([{ content: "not json", modelId: "s" }]);
    expect(await verifyClaim(garbage, input)).toEqual({ passed: false, reason: "claim check inconclusive" });
    expect(await verifyClaim(garbage, { ...input, quotes: [] })).toEqual({
      passed: false,
      reason: "no quotes attached to judge",
    });
  });
});

describe("approve with claim check", () => {
  it("approves on a passing verdict and keeps the trail", async () => {
    const { store, token, proposal } = await seedEntry();
    const handlers = createProposalHandlers({
      store,
      claimCheck: async () => ({ passed: true, reason: "quotes match" }),
    });
    const { res, seen } = mockResponse();
    await handlers.approveProposal(mockRequest({ params: { id: proposal.id }, token }), res);
    expect(seen.code).toBe(200);
    const decided = await store.getProposal(token, proposal.id);
    expect(decided.verification?.checks.map((c) => c.name)).toContain("claim_supported");
  });

  it("refuses on a failing verdict and leaves the proposal pending", async () => {
    const { store, token, proposal } = await seedEntry();
    const handlers = createProposalHandlers({
      store,
      claimCheck: async () => ({ passed: false, reason: "amount differs" }),
    });
    const { res, seen } = mockResponse();
    await handlers.approveProposal(mockRequest({ params: { id: proposal.id }, token }), res);
    expect(seen.code).toBe(422);
    expect((seen.payload as { error: { message: string } }).error.message).toContain("amount differs");
    const pending = await store.getProposal(token, proposal.id);
    expect(pending.status).toBe("pending");
    expect(pending.verification?.checks).toMatchObject([{ name: "claim_supported", passed: false }]);
  });

  it("skips the check when no model is configured", async () => {
    const { store, token, proposal } = await seedEntry();
    const handlers = createProposalHandlers({ store });
    const { res, seen } = mockResponse();
    await handlers.approveProposal(mockRequest({ params: { id: proposal.id }, token }), res);
    expect(seen.code).toBe(200);
    const decided = await store.getProposal(token, proposal.id);
    expect(decided.verification?.checks.map((c) => c.name)).not.toContain("claim_supported");
  });
});

describe("run detail and coverage", () => {
  it("serves the trace with line coverage", async () => {
    const store = new MemoryLedgerStore();
    const { group, token } = await store.createGroup("Run group");
    await store.saveRun(token, {
      id: "run-9",
      groupId: group.id,
      intakeRef: "Omondi paid 500.\nNobody mentions November.",
      modelId: "test/model",
      promptVersion: "pack-v0",
      steps: [{ index: 1, content: null, calls: ["propose_entry"] }],
      status: "proposed",
    });
    const member = await store.createMember(token, { groupId: group.id, displayName: "Omondi Juma" });
    await store.createProposal(token, {
      groupId: group.id,
      runId: "run-9",
      type: "entry",
      payload: { memberId: member.id, kind: "contribution", amount: 500, period: "2026-10", occurredOn: "2026-10-05" },
      quotes: ["Omondi paid 500"],
    });
    const handler = createRunHandler({ store });
    const { res, seen } = mockResponse();
    await handler(mockRequest({ params: { id: "run-9" }, token }), res);
    expect(seen.code).toBe(200);
    const payload = seen.payload as {
      run: { status: string };
      proposals: unknown[];
      coverage: { lines: number; covered: number; uncovered: string[] };
    };
    expect(payload.run.status).toBe("proposed");
    expect(payload.proposals).toHaveLength(1);
    expect(payload.coverage).toEqual({ lines: 2, covered: 1, uncovered: ["Nobody mentions November."] });
  });

  it("computes coverage without a store", () => {
    expect(lineCoverage("A paid 5.\nB paid 6.", ["A paid 5"])).toEqual({
      lines: 2,
      covered: 1,
      uncovered: ["B paid 6."],
    });
    expect(lineCoverage("", [])).toEqual({ lines: 0, covered: 0, uncovered: [] });
  });
});

describe("intake run linkage", () => {
  it("saves the run and links proposals to it", async () => {
    const store = new MemoryLedgerStore();
    const { group, token } = await store.createGroup("Link group");
    const member = await store.createMember(token, { groupId: group.id, displayName: "Omondi Juma" });
    await store.createCommitment(token, { groupId: group.id, memberId: member.id, kind: "contribution", amount: 500, dueRule: "monthly:5" });
    const handler = createIntakeHandler({
      store,
      model: new StubAdapter([
        {
          content: null,
          modelId: "stub",
          toolCalls: [
            {
              id: "c1",
              name: "propose_entry",
              arguments: {
                memberText: "Omondi",
                kind: "contribution",
                amount: 500,
                period: "2026-10",
                occurredOn: "2026-10-05",
                quotes: ["Omondi paid 500"],
              },
            },
          ],
        },
      ]),
      transcribe: { transcribe: async () => ({ transcript: "", audioDurationMs: 0 }) },
      loadPack: async () => ({ playbook: "p", rules: "r" }),
    });
    const { res, seen } = mockResponse();
    await handler(mockRequest({ params: { id: group.id }, body: { text: "Omondi paid 500." }, token }), res);
    expect(seen.code).toBe(200);
    const runId = (seen.payload as { runId: string }).runId;
    const run = await store.getRun(token, runId);
    expect(run.status).toBe("proposed");
    expect(run.promptVersion).toBe("pack-v0");
    const proposals = await store.listProposals(token, group.id);
    expect(proposals).toHaveLength(1);
    expect(proposals[0]?.runId).toBe(runId);
  });
});

describe("reminder member check", () => {
  it("refuses text naming another member", async () => {
    const store = new MemoryLedgerStore();
    const { group, token } = await store.createGroup("Reminder group");
    await store.createMember(token, { groupId: group.id, displayName: "Omondi Juma" });
    await store.createMember(token, { groupId: group.id, displayName: "Achieng Odhiambo" });
    const deps = { store, token, groupId: group.id, runId: null, run: { intakeText: "", refusals: 0 } };
    const refused = await handleProposeDraftReminder(deps, {
      memberText: "Omondi",
      period: "2026-10",
      text: "Omondi, unlike Achieng you still owe 500.",
    });
    expect(refused).toMatchObject({ refused: true, reason: "reminder names another member" });
    const ok = await handleProposeDraftReminder(deps, {
      memberText: "Omondi",
      period: "2026-10",
      text: "Omondi, your October contribution of 500 is due.",
    });
    expect(ok).toMatchObject({ status: "pending" });
  });
});

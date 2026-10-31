import type { Request, Response } from "express";
import { describe, expect, it } from "vitest";
import { FakeModelAdapter } from "../src/adapters/fake.js";
import type { ModelResult } from "../src/adapters/model.js";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { createEntryHandler } from "../src/routes/entries.js";
import { createIntakeHandler } from "../src/routes/intake.js";
import { createProposalHandlers } from "../src/routes/proposals.js";
import { StubAdapter } from "./stub-adapter.js";

const TEXT = "Wanjiku paid 500 for October 2026.";
const LOAD_PACK = async () => ({ playbook: "test playbook", rules: "test rules" });

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

function mockRequest(init: {
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  token?: string | null;
}): Request {
  return {
    params: init.params ?? {},
    query: init.query ?? {},
    body: init.body,
    headers: init.token === null ? {} : { authorization: `Bearer ${init.token ?? "token"}` },
  } as unknown as Request;
}

function proposeScript(): ModelResult[] {
  return [
    {
      content: null,
      modelId: "stub/scripted",
      toolCalls: [
        {
          id: "call-1",
          name: "propose_entry",
          arguments: {
            memberText: "Wanjiku",
            kind: "contribution",
            amount: 500,
            period: "2026-10",
            occurredOn: "2026-10-28",
            quotes: ["Wanjiku paid 500"],
          },
        },
      ],
    },
  ];
}

async function seedStore() {
  const store = new MemoryLedgerStore();
  const { group, token } = await store.createGroup("Intake group");
  const member = await store.createMember(token, { groupId: group.id, displayName: "Wanjiku Mwangi" });
  await store.createCommitment(token, {
    groupId: group.id,
    memberId: member.id,
    kind: "contribution",
    amount: 500,
    dueRule: "monthly:5",
  });
  return { store, group, token, member };
}

describe("intake route", () => {
  it("turns typed text into a proposed entry", async () => {
    const { store, group, token } = await seedStore();
    const handler = createIntakeHandler({
      store,
      model: new StubAdapter(proposeScript()),
      transcribe: { transcribe: async () => ({ transcript: "", audioDurationMs: 0 }) },
      loadPack: LOAD_PACK,
    });
    const { res, seen } = mockResponse();
    await handler(mockRequest({ params: { id: group.id }, body: { text: TEXT }, token }), res);
    expect(seen.code).toBe(200);
    const payload = seen.payload as { outcome: { kind: string }; proposals: { id: string }[]; turns: number };
    expect(payload.outcome.kind).toBe("proposed");
    expect(payload.proposals).toHaveLength(1);
    expect(payload.turns).toBe(1);
  });

  it("transcribes audio then proposes from the transcript", async () => {
    const { store, group, token } = await seedStore();
    let seenBytes = 0;
    const handler = createIntakeHandler({
      store,
      model: new StubAdapter(proposeScript()),
      transcribe: {
        transcribe: async (wav: Buffer) => {
          seenBytes = wav.length;
          return { transcript: TEXT, audioDurationMs: 1000 };
        },
      },
      loadPack: LOAD_PACK,
    });
    const { res, seen } = mockResponse();
    await handler(
      mockRequest({ params: { id: group.id }, body: { audio: Buffer.from([7, 7, 7]).toString("base64") }, token }),
      res,
    );
    expect(seen.code).toBe(200);
    const payload = seen.payload as { outcome: { kind: string }; transcript: string };
    expect(seenBytes).toBe(3);
    expect(payload.transcript).toBe(TEXT);
    expect(payload.outcome.kind).toBe("proposed");
  });

  it("returns 401 without a token and 422 for an empty body", async () => {
    const { store, group, token } = await seedStore();
    const handler = createIntakeHandler({
      store,
      model: new StubAdapter(proposeScript()),
      transcribe: { transcribe: async () => ({ transcript: "", audioDurationMs: 0 }) },
      loadPack: LOAD_PACK,
    });
    const first = mockResponse();
    await handler(mockRequest({ params: { id: group.id }, body: { text: TEXT }, token: null }), first.res);
    expect(first.seen.code).toBe(401);
    const second = mockResponse();
    await handler(mockRequest({ params: { id: group.id }, body: {}, token }), second.res);
    expect(second.seen.code).toBe(422);
  });

  it("returns only this run's proposals, not earlier ones", async () => {
    const { store, group, token } = await seedStore();
    await store.createProposal(token, { groupId: group.id, type: "question", payload: { text: "stale" } });
    const handler = createIntakeHandler({
      store,
      model: new StubAdapter(proposeScript()),
      transcribe: { transcribe: async () => ({ transcript: "", audioDurationMs: 0 }) },
      loadPack: LOAD_PACK,
    });
    const { res, seen } = mockResponse();
    await handler(mockRequest({ params: { id: group.id }, body: { text: TEXT }, token }), res);
    expect(seen.code).toBe(200);
    const payload = seen.payload as { runId: string; proposals: { runId: string }[] };
    expect(payload.proposals).toHaveLength(1);
    expect(payload.proposals[0]?.runId).toBe(payload.runId);
  });

  it("denies a token from another group", async () => {
    const { store, group } = await seedStore();
    const other = await store.createGroup("Other group");
    const handler = createIntakeHandler({
      store,
      model: new StubAdapter(proposeScript()),
      transcribe: { transcribe: async () => ({ transcript: "", audioDurationMs: 0 }) },
      loadPack: LOAD_PACK,
    });
    const { res, seen } = mockResponse();
    await handler(mockRequest({ params: { id: group.id }, body: { text: TEXT }, token: other.token }), res);
    expect(seen.code).toBe(403);
  });
});

describe("proposals routes", () => {
  it("approving twice creates one entry", async () => {
    const { store, group, token } = await seedStore();
    const intake = createIntakeHandler({
      store,
      model: new StubAdapter(proposeScript()),
      transcribe: { transcribe: async () => ({ transcript: "", audioDurationMs: 0 }) },
      loadPack: LOAD_PACK,
    });
    const created = mockResponse();
    await intake(mockRequest({ params: { id: group.id }, body: { text: TEXT }, token }), created.res);
    const proposalId = (
      (created.seen.payload as { proposals: { id: string }[] }).proposals[0] as { id: string }
    ).id;
    const handlers = createProposalHandlers({ store });
    const first = mockResponse();
    await handlers.approveProposal(mockRequest({ params: { id: proposalId }, token }), first.res);
    expect(first.seen.code).toBe(200);
    expect((first.seen.payload as { already: boolean }).already).toBe(false);
    const second = mockResponse();
    await handlers.approveProposal(mockRequest({ params: { id: proposalId }, token }), second.res);
    expect(second.seen.code).toBe(200);
    expect((second.seen.payload as { already: boolean }).already).toBe(true);
    const entries = await store.listEntries(token, { groupId: group.id });
    expect(entries).toHaveLength(1);
    expect(entries[0]?.evidenceTier).toBe("agent_proposed_approved");
  });

  it("rejects then refuses approval", async () => {
    const { store, group, token, member } = await seedStore();
    const proposal = await store.createProposal(token, {
      groupId: group.id,
      type: "entry",
      payload: {
        memberId: member.id,
        kind: "contribution",
        amount: 500,
        period: "2026-10",
        occurredOn: "2026-10-28",
      },
    });
    const handlers = createProposalHandlers({ store });
    const rejected = mockResponse();
    await handlers.rejectProposal(mockRequest({ params: { id: proposal.id }, token }), rejected.res);
    expect(rejected.seen.code).toBe(200);
    const approved = mockResponse();
    await handlers.approveProposal(mockRequest({ params: { id: proposal.id }, token }), approved.res);
    expect(approved.seen.code).toBe(409);
  });

  it("lists proposals filtered by status", async () => {
    const { store, group, token } = await seedStore();
    await store.createProposal(token, { groupId: group.id, type: "question", payload: { text: "q1" } });
    const handlers = createProposalHandlers({ store });
    const { res, seen } = mockResponse();
    await handlers.listProposals(
      mockRequest({ params: { id: group.id }, query: { status: "pending" }, token }),
      res,
    );
    expect(seen.code).toBe(200);
    expect((seen.payload as { proposals: unknown[] }).proposals).toHaveLength(1);
  });
});

describe("manual entry fallback", () => {
  it("records a treasurer-confirmed entry when the model is off", async () => {
    const { store, group, token, member } = await seedStore();
    const intake = createIntakeHandler({
      store,
      model: new FakeModelAdapter(),
      transcribe: { transcribe: async () => ({ transcript: "", audioDurationMs: 0 }) },
      loadPack: LOAD_PACK,
    });
    const attempted = mockResponse();
    await intake(mockRequest({ params: { id: group.id }, body: { text: TEXT }, token }), attempted.res);
    expect(seenCode(attempted)).toBe(200);
    expect((attempted.seen.payload as { outcome: { kind: string } }).outcome.kind).toBe("unfinished");
    const createEntry = createEntryHandler({ store });
    const { res, seen } = mockResponse();
    await createEntry(
      mockRequest({
        params: { id: group.id },
        body: { memberId: member.id, kind: "contribution", amount: 500, period: "2026-10", occurredOn: "2026-10-28" },
        token,
      }),
      res,
    );
    expect(seen.code).toBe(201);
    expect((seen.payload as { entry: { evidenceTier: string } }).entry.evidenceTier).toBe("treasurer_confirmed");
  });
});

function seenCode(response: { seen: { code: number } }): number {
  return response.seen.code;
}

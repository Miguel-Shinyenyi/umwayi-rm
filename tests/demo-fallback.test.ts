import type { Request, Response } from "express";
import { describe, expect, it } from "vitest";
import { FakeModelAdapter } from "../src/adapters/fake.js";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { LedgerError } from "../src/ledger/types.js";
import { createEntryHandler } from "../src/routes/entries.js";
import { createIntakeHandler } from "../src/routes/intake.js";
import { createPageHandler } from "../src/routes/page.js";
import { createProposalHandlers } from "../src/routes/proposals.js";

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

function authed(token: string, params: Record<string, string>, body?: unknown): Request {
  return { params, query: {}, body, headers: { authorization: `Bearer ${token}` } } as unknown as Request;
}

describe("model-off demo path", () => {
  it("the treasurer still records and approves with no model", async () => {
    const store = new MemoryLedgerStore();
    const { group, token } = await store.createGroup("Fallback group");
    const member = await store.createMember(token, { groupId: group.id, displayName: "Wanjiku Mwangi" });

    const intake = createIntakeHandler({
      store,
      model: new FakeModelAdapter(),
      transcribe: { transcribe: async () => ({ transcript: "", audioDurationMs: 0 }) },
      loadPack: async () => ({ playbook: "p", rules: "r" }),
    });
    const noted = mockResponse();
    await intake(authed(token, { id: group.id }, { text: "Wanjiku paid 500 for October." }), noted.res);
    expect(noted.seen.code).toBe(200);
    expect((noted.seen.payload as { outcome: { kind: string } }).outcome.kind).toBe("unfinished");
    expect((noted.seen.payload as { proposals: unknown[] }).proposals).toHaveLength(0);

    const createEntry = createEntryHandler({ store });
    const manual = mockResponse();
    await createEntry(
      authed(token, { id: group.id }, {
        memberId: member.id,
        kind: "contribution",
        amount: 500,
        period: "2026-10",
        occurredOn: "2026-10-28",
      }),
      manual.res,
    );
    expect(manual.seen.code).toBe(201);

    const proposal = await store.createProposal(token, {
      groupId: group.id,
      type: "entry",
      payload: {
        memberId: member.id,
        kind: "contribution",
        amount: 500,
        period: "2026-09",
        occurredOn: "2026-09-05",
      },
    });
    const proposals = createProposalHandlers({ store });
    const first = mockResponse();
    await proposals.approveProposal(authed(token, { id: proposal.id }), first.res);
    expect((first.seen.payload as { already: boolean }).already).toBe(false);
    const second = mockResponse();
    await proposals.approveProposal(authed(token, { id: proposal.id }), second.res);
    expect((second.seen.payload as { already: boolean }).already).toBe(true);

    const entries = await store.listEntries(token, { groupId: group.id });
    expect(entries).toHaveLength(2);
  });

  it("photo intake answers model_off with no model", async () => {
    const store = new MemoryLedgerStore();
    const { group, token } = await store.createGroup("Fallback group");
    const page = createPageHandler({
      store,
      reader: {
        readPage: async () => {
          throw new LedgerError("model is off", 503);
        },
      },
    });
    const { res, seen } = mockResponse();
    await page(authed(token, { id: group.id }, { image: "aGk=" }), res);
    expect(seen.code).toBe(503);
    expect((seen.payload as { error: { code: string } }).error.code).toBe("model_off");
  });
});

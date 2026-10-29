import type { Request, Response } from "express";
import { describe, expect, it } from "vitest";
import type { PageRow } from "../src/adapters/vision.js";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { createFindingHandler } from "../src/routes/findings.js";
import { createPageHandler } from "../src/routes/page.js";

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

async function seedStore() {
  const store = new MemoryLedgerStore();
  const { group, token } = await store.createGroup("Page group");
  const wanjiku = await store.createMember(token, { groupId: group.id, displayName: "Wanjiku Mwangi" });
  const otis = await store.createMember(token, { groupId: group.id, displayName: "Otis Kariuki" });
  const amara = await store.createMember(token, { groupId: group.id, displayName: "Amara Njoroge" });
  await store.createEntry(token, {
    groupId: group.id,
    memberId: wanjiku.id,
    kind: "contribution",
    amount: 500,
    period: "2026-10",
    occurredOn: "2026-10-05",
    evidenceTier: "treasurer_confirmed",
  });
  await store.createEntry(token, {
    groupId: group.id,
    memberId: amara.id,
    kind: "contribution",
    amount: 250,
    period: "2026-10",
    occurredOn: "2026-10-06",
    evidenceTier: "treasurer_confirmed",
  });
  return { store, group, token, otis };
}

const PAGE_ROWS: PageRow[] = [
  { memberText: "WANJIKU", amount: 500, period: "2026-10" },
  { memberText: "OTIS", amount: 500, period: "2026-10" },
  { memberText: "AMARA", amount: 300, period: "2026-10" },
];

describe("page intake route", () => {
  it("turns a page into proposed rows and findings", async () => {
    const { store, group, token } = await seedStore();
    const handler = createPageHandler({
      store,
      reader: { readPage: async () => PAGE_ROWS },
    });
    const { res, seen } = mockResponse();
    await handler(
      mockRequest({ params: { id: group.id }, body: { image: Buffer.from([1, 2]).toString("base64") }, token }),
      res,
    );
    expect(seen.code).toBe(200);
    const payload = seen.payload as {
      rows: PageRow[];
      proposals: { type: string; payload: Record<string, unknown> }[];
      findings: { kind: string }[];
    };
    expect(payload.rows).toHaveLength(3);
    expect(payload.proposals).toHaveLength(2);
    expect(payload.proposals.every((p) => p.type === "entry")).toBe(true);
    expect(payload.findings.map((f) => f.kind).sort()).toEqual(["amount_differs", "only_on_paper"]);
  });

  it("files a question when the page names nobody known", async () => {
    const { store, group, token } = await seedStore();
    const handler = createPageHandler({
      store,
      reader: { readPage: async () => [{ memberText: "STRANGER", amount: 100, period: "2026-10" }] },
    });
    const { res, seen } = mockResponse();
    await handler(
      mockRequest({ params: { id: group.id }, body: { image: "aGk=" }, token }),
      res,
    );
    expect(seen.code).toBe(200);
    const payload = seen.payload as { proposals: { type: string; payload: { text: string } }[] };
    expect(payload.proposals).toHaveLength(1);
    expect(payload.proposals[0]?.type).toBe("question");
    expect(payload.proposals[0]?.payload.text).toContain("STRANGER");
  });

  it("returns 401 without a token and 422 for a bad body", async () => {
    const { store, group, token } = await seedStore();
    const handler = createPageHandler({ store, reader: { readPage: async () => [] } });
    const first = mockResponse();
    await handler(mockRequest({ params: { id: group.id }, body: { image: "aGk=" }, token: null }), first.res);
    expect(first.seen.code).toBe(401);
    const second = mockResponse();
    await handler(mockRequest({ params: { id: group.id }, body: {}, token }), second.res);
    expect(second.seen.code).toBe(422);
    const third = mockResponse();
    await handler(
      mockRequest({ params: { id: group.id }, body: { image: "aGk=", mime: "image/gif" }, token }),
      third.res,
    );
    expect(third.seen.code).toBe(422);
  });
});

describe("findings route", () => {
  it("lists findings saved by a page run", async () => {
    const { store, group, token } = await seedStore();
    const page = createPageHandler({ store, reader: { readPage: async () => PAGE_ROWS } });
    const ran = mockResponse();
    await page(
      mockRequest({ params: { id: group.id }, body: { image: "aGk=" }, token }),
      ran.res,
    );
    expect(ran.seen.code).toBe(200);
    const list = createFindingHandler({ store });
    const { res, seen } = mockResponse();
    await list(mockRequest({ params: { id: group.id }, query: { status: "open" }, token }), res);
    expect(seen.code).toBe(200);
    expect((seen.payload as { findings: unknown[] }).findings).toHaveLength(2);
  });
});

import type { Request, Response } from "express";
import { describe, expect, it } from "vitest";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { createGroupHandlers } from "../src/routes/groups.js";
import { createLabHandler } from "../src/routes/lab.js";
import { seedDemo } from "../src/seed.js";

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
  token?: string | null;
}): Request {
  return {
    params: init.params ?? {},
    query: init.query ?? {},
    headers: init.token === null ? {} : { authorization: `Bearer ${init.token ?? "token"}` },
  } as unknown as Request;
}

describe("group read routes", () => {
  it("returns the group with members and commitments", async () => {
    const store = new MemoryLedgerStore();
    const { group, token } = await seedDemo(store);
    const handlers = createGroupHandlers({ store });
    const { res, seen } = mockResponse();
    await handlers.getGroup(mockRequest({ params: { id: group.id }, token }), res);
    expect(seen.code).toBe(200);
    const payload = seen.payload as { group: { name: string }; members: unknown[]; commitments: unknown[] };
    expect(payload.group.name).toBe("Tumaini Savings Group");
    expect(payload.members).toHaveLength(12);
    expect(payload.commitments).toHaveLength(12);
  });

  it("returns the deterministic today list with defaults", async () => {
    const store = new MemoryLedgerStore();
    const { group, token } = await seedDemo(store);
    const handlers = createGroupHandlers({ store });
    const first = mockResponse();
    await handlers.getToday(
      mockRequest({ params: { id: group.id }, query: { asOf: "2026-10-28" }, token }),
      first.res,
    );
    expect(first.seen.code).toBe(200);
    const payload = first.seen.payload as {
      asOf: string;
      periods: string[];
      items: { category: string }[];
    };
    expect(payload.asOf).toBe("2026-10-28");
    expect(payload.periods).toEqual(["2026-10", "2026-09"]);
    expect(payload.items.length).toBeGreaterThan(0);
    expect(payload.items[0]?.category).toBe("overdue");
    const second = mockResponse();
    await handlers.getToday(
      mockRequest({ params: { id: group.id }, query: { asOf: "2026-10-28" }, token }),
      second.res,
    );
    expect(second.seen.payload).toEqual(first.seen.payload);
  });

  it("rejects a bad asOf and denies cross-group reads", async () => {
    const store = new MemoryLedgerStore();
    const { group, token } = await seedDemo(store);
    const other = await store.createGroup("Other");
    const handlers = createGroupHandlers({ store });
    const bad = mockResponse();
    await handlers.getToday(
      mockRequest({ params: { id: group.id }, query: { asOf: "tomorrow" }, token }),
      bad.res,
    );
    expect(bad.seen.code).toBe(422);
    const denied = mockResponse();
    await handlers.getGroup(mockRequest({ params: { id: group.id }, token: other.token }), denied.res);
    expect(denied.seen.code).toBe(403);
  });

  it("lists entries filtered by member and period", async () => {
    const store = new MemoryLedgerStore();
    const { group, token } = await seedDemo(store);
    const members = await store.listMembers(token, group.id);
    const wanjiku = members.find((m) => m.displayName === "Wanjiku Mwangi");
    const handlers = createGroupHandlers({ store });
    const { res, seen } = mockResponse();
    await handlers.listEntries(
      mockRequest({
        params: { id: group.id },
        query: { member: wanjiku?.id ?? "", period: "2026-10" },
        token,
      }),
      res,
    );
    expect(seen.code).toBe(200);
    expect((seen.payload as { entries: unknown[] }).entries).toHaveLength(1);
  });
});

describe("lab runs route", () => {
  it("summarizes saved run files", async () => {
    const handler = createLabHandler({ evalsDir: "docs/evals" });
    const { res, seen } = mockResponse();
    await handler({} as Request, res);
    expect(seen.code).toBe(200);
    const payload = seen.payload as {
      runs: { file: string; modelId: string; passed: number; total: number }[];
    };
    expect(payload.runs.length).toBeGreaterThan(0);
    expect(payload.runs.every((r) => r.modelId.length > 0 && r.total > 0)).toBe(true);
  });
});

import type { Request, Response } from "express";
import { describe, expect, it } from "vitest";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { createDemoHandler } from "../src/routes/demo.js";
import { SEED_MEMBERS, SEED_PERIOD, seedDemo } from "../src/seed.js";

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

describe("seedDemo", () => {
  it("seeds 12 members with commitments and 3 paid entries", async () => {
    const store = new MemoryLedgerStore();
    const { group, token } = await seedDemo(store);
    expect(group.name).toBe("Tumaini Savings Group");
    expect(group.demo).toBe(true);
    const members = await store.listMembers(token, group.id);
    expect(members).toHaveLength(12);
    expect(members.map((m) => m.displayName).sort()).toEqual(
      SEED_MEMBERS.map((m) => m.displayName).sort(),
    );
    const commitments = await store.listCommitments(token, group.id);
    expect(commitments).toHaveLength(12);
    expect(commitments.every((c) => c.amount === 500 && c.kind === "contribution")).toBe(true);
    const entries = await store.listEntries(token, { groupId: group.id });
    expect(entries).toHaveLength(3);
    expect(entries.every((e) => e.period === SEED_PERIOD && e.evidenceTier === "treasurer_confirmed")).toBe(true);
  });
});

describe("demo reset route", () => {
  it("refuses when demo mode is off", async () => {
    const store = new MemoryLedgerStore();
    const handler = createDemoHandler({ store, demoMode: false });
    const { res, seen } = mockResponse();
    await handler({} as Request, res);
    expect(seen.code).toBe(403);
  });

  it("clears and reseeds when demo mode is on", async () => {
    const store = new MemoryLedgerStore();
    const { token: stale } = await store.createGroup("Stale");
    const handler = createDemoHandler({ store, demoMode: true });
    const { res, seen } = mockResponse();
    await handler({} as Request, res);
    expect(seen.code).toBe(200);
    const payload = seen.payload as { group: { id: string; name: string }; token: string };
    expect(payload.group.name).toBe("Tumaini Savings Group");
    expect(payload.token).not.toBe(stale);
    const members = await store.listMembers(payload.token, payload.group.id);
    expect(members).toHaveLength(12);
  });
});

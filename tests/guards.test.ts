import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { FakeModelAdapter } from "../src/adapters/fake.js";
import { createApp } from "../src/app.js";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { LedgerError } from "../src/ledger/types.js";

let base = "";
let close: () => void = () => undefined;

beforeAll(async () => {
  const app = createApp({
    store: new MemoryLedgerStore(),
    model: new FakeModelAdapter(),
    transcribe: { transcribe: async () => { throw new LedgerError("model is off", 503); } },
    reader: { readPage: async () => { throw new LedgerError("model is off", 503); } },
    demoMode: true,
    limits: { modelCallsPerHour: 2, resetsPerHour: 20 },
    loadPack: async () => ({ playbook: "p", rules: "r" }),
  });
  const server = app.listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  close = () => server.close();
});
afterAll(() => close());

async function reset(): Promise<{ group: { id: string }; token: string }> {
  const res = await fetch(`${base}/demo/reset`, { method: "POST" });
  return (await res.json()) as { group: { id: string }; token: string };
}

describe("public deploy guards", () => {
  it("sets security headers and hides the framework", async () => {
    const res = await fetch(`${base}/health`);
    expect(res.headers.get("x-powered-by")).toBeNull();
    expect(res.headers.get("content-security-policy")).toContain("default-src 'self'");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("answers bad JSON with a JSON error, not an HTML page", async () => {
    const { group, token } = await reset();
    const res = await fetch(`${base}/groups/${group.id}/intake/note`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: "{bad",
    });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe("invalid");
  });

  it("refuses a note longer than 4000 characters", async () => {
    const { group, token } = await reset();
    const res = await fetch(`${base}/groups/${group.id}/intake/note`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: "x".repeat(4001) }),
    });
    expect(res.status).toBe(422);
  });

  it("keeps an earlier visitor's group when another visitor resets", async () => {
    const first = await reset();
    await reset();
    const res = await fetch(`${base}/groups/${first.group.id}/today`, {
      headers: { authorization: `Bearer ${first.token}` },
    });
    expect(res.status).toBe(200);
  });

  it("rate limits model routes and resets", async () => {
    const statuses: number[] = [];
    const { group, token } = await reset();
    for (let i = 0; i < 3; i += 1) {
      const res = await fetch(`${base}/groups/${group.id}/intake/note`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: "Wanjiku paid 500." }),
      });
      statuses.push(res.status);
    }
    expect(statuses[2]).toBe(429);
  });
});

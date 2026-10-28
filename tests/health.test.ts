import { describe, expect, it } from "vitest";
import type { Request, Response } from "express";
import { healthBody, healthHandler } from "../src/routes/health.js";
import { FakeModelAdapter } from "../src/adapters/fake.js";
import { DEFAULT_MODEL_OPTIONS } from "../src/adapters/model.js";

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

describe("health", () => {
  it("returns status ok with an ISO timestamp", () => {
    const body = healthBody(new Date("2026-10-28T12:00:00.000Z"));
    expect(body).toEqual({ status: "ok", time: "2026-10-28T12:00:00.000Z" });
  });

  it("answers 200 with the body", () => {
    const { res, seen } = mockResponse();
    healthHandler({} as Request, res);
    expect(seen.code).toBe(200);
    expect(seen.payload).toMatchObject({ status: "ok" });
    expect(typeof (seen.payload as { time: string }).time).toBe("string");
  });
});

describe("FakeModelAdapter", () => {
  it("returns deterministic offline output with no network", async () => {
    const adapter = new FakeModelAdapter();
    const first = await adapter.chat(
      [{ role: "user", content: "hello" }],
      DEFAULT_MODEL_OPTIONS,
    );
    const second = await adapter.chat(
      [{ role: "user", content: "hello" }],
      DEFAULT_MODEL_OPTIONS,
    );
    expect(first.modelId).toBe("fake/offline");
    expect(first.content).toBe(second.content);
    expect(first.content).toContain("hello");
  });
});

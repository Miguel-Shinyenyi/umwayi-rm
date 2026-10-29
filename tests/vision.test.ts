import { describe, expect, it } from "vitest";
import { BasetenPhotoReader, parsePageRows } from "../src/adapters/vision.js";

describe("parsePageRows", () => {
  it("parses a plain JSON array", () => {
    expect(parsePageRows('[{"member":"WANJIKU","amount":500,"period":"2026-10"}]')).toEqual([
      { memberText: "WANJIKU", amount: 500, period: "2026-10" },
    ]);
  });

  it("parses a fenced block with surrounding text", () => {
    const content = 'Here are the rows:\n```json\n[{"member":"OTIS","amount":500,"period":"2026-10"}]\n```';
    expect(parsePageRows(content)).toEqual([{ memberText: "OTIS", amount: 500, period: "2026-10" }]);
  });

  it("rejects rows with a bad amount or period", () => {
    expect(() => parsePageRows('[{"member":"A","amount":0,"period":"2026-10"}]')).toThrow("no positive integer amount");
    expect(() => parsePageRows('[{"member":"A","amount":5,"period":"Oct"}]')).toThrow("no YYYY-MM period");
    expect(() => parsePageRows("no rows here")).toThrow("no JSON array");
  });
});

describe("BasetenPhotoReader", () => {
  it("posts the image and returns parsed rows", async () => {
    let seenUrl = "";
    let seenBody: Record<string, unknown> = {};
    const reader = new BasetenPhotoReader({
      apiKey: "test-key",
      fetchImpl: (async (url, init) => {
        seenUrl = String(url);
        seenBody = JSON.parse(init?.body as string) as Record<string, unknown>;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{ message: { content: '[{"member":"AMARA","amount":300,"period":"2026-10"}]' } }],
          }),
        };
      }) as unknown as typeof fetch,
    });
    const rows = await reader.readPage(Buffer.from([9, 9]), "image/png");
    expect(rows).toEqual([{ memberText: "AMARA", amount: 300, period: "2026-10" }]);
    expect(seenUrl).toBe("https://inference.baseten.co/v1/chat/completions");
    const content = (
      (seenBody.messages as { content: { type: string; image_url?: { url: string } }[] }[])[0] as {
        content: { type: string; image_url?: { url: string } }[];
      }
    ).content;
    expect(content[0]?.type).toBe("text");
    expect(content[1]?.image_url?.url.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("throws on a non-ok response", async () => {
    const reader = new BasetenPhotoReader({
      apiKey: "test-key",
      fetchImpl: (async () => ({ ok: false, status: 500, json: async () => ({}) })) as unknown as typeof fetch,
    });
    await expect(reader.readPage(Buffer.from([1]), "image/png")).rejects.toThrow("photo read http 500");
  });
});

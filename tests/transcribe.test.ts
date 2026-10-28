import { describe, expect, it } from "vitest";
import { MetaTranscribe } from "../src/adapters/transcribe.js";

function stubFetch(body: unknown, status = 200) {
  return async (url: string | URL | Request, init?: RequestInit) => {
    const request = init?.body as FormData;
    const requestPart = request.get("request") as Blob;
    const audioPart = request.get("audio") as Blob;
    return {
      ok: status >= 200 && status < 300,
      status,
      url: String(url),
      requestJson: JSON.parse(await requestPart.text()) as Record<string, unknown>,
      audioType: audioPart.type,
      audioBytes: (await audioPart.arrayBuffer()).byteLength,
      json: async () => body,
    };
  };
}

describe("MetaTranscribe", () => {
  it("posts multipart audio and returns the transcript", async () => {
    let seen: unknown;
    const client = new MetaTranscribe({
      apiKey: "test-key",
      fetchImpl: (async (url, init) => {
        const res = (await stubFetch({ transcript: "Wanjiku paid five hundred", audioDurationMs: 900 })(
          url as string,
          init as RequestInit,
        )) as unknown as Response & { requestJson: unknown; audioType: string; audioBytes: number };
        seen = { url: res.url, requestJson: res.requestJson, audioType: res.audioType, audioBytes: res.audioBytes };
        return res;
      }) as typeof fetch,
    });
    const result = await client.transcribe(Buffer.from([1, 2, 3, 4]));
    expect(result).toEqual({ transcript: "Wanjiku paid five hundred", audioDurationMs: 900 });
    expect(seen).toEqual({
      url: "https://api.meta.ai/v1/asr/transcribe",
      requestJson: { model: "muse-voice-transcribe-1.0", audioEncoding: "WAV" },
      audioType: "audio/wav",
      audioBytes: 4,
    });
  });

  it("throws on a non-ok response", async () => {
    const client = new MetaTranscribe({
      apiKey: "test-key",
      fetchImpl: stubFetch({ error: { message: "bad audio" } }, 400) as unknown as typeof fetch,
    });
    await expect(client.transcribe(Buffer.from([1]))).rejects.toThrow("transcribe http 400");
  });

  it("requires an api key", () => {
    expect(() => new MetaTranscribe({ apiKey: "" })).toThrow("META_API_KEY is not set");
  });
});

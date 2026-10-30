import { LedgerError } from "../ledger/types.js";

export interface TranscribeResult {
  transcript: string;
  audioDurationMs: number;
}

interface TranscribeResponse {
  transcript?: string;
  audioDurationMs?: number;
  error?: { message: string };
}

type FetchImpl = typeof fetch;

export function createTranscriber(apiKey?: string): {
  transcribe(wav: Buffer): Promise<TranscribeResult>;
} {
  if (apiKey) {
    return new MetaTranscribe({ apiKey });
  }
  return {
    transcribe: async () => {
      throw new LedgerError("model is off", 503);
    },
  };
}

export class MetaTranscribe {
  readonly modelId: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: FetchImpl;

  constructor(options?: {
    apiKey?: string;
    baseUrl?: string;
    modelId?: string;
    timeoutMs?: number;
    fetchImpl?: FetchImpl;
  }) {
    const apiKey = options?.apiKey ?? process.env.META_API_KEY;
    if (!apiKey) {
      throw new Error("META_API_KEY is not set");
    }
    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl ?? "https://api.meta.ai/v1";
    this.modelId = options?.modelId ?? "muse-voice-transcribe-1.0";
    this.timeoutMs = options?.timeoutMs ?? 60_000;
    this.fetchImpl = options?.fetchImpl ?? fetch;
  }

  async transcribe(wav: Buffer): Promise<TranscribeResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const form = new FormData();
      form.append(
        "request",
        new Blob([JSON.stringify({ model: this.modelId, audioEncoding: "WAV" })], {
          type: "application/json",
        }),
      );
      form.append("audio", new Blob([new Uint8Array(wav)], { type: "audio/wav" }), "audio.wav");
      const res = await this.fetchImpl(`${this.baseUrl}/asr/transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}` },
        body: form,
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`transcribe http ${res.status}`);
      }
      const data = (await res.json()) as TranscribeResponse;
      if (data.error) {
        throw new Error(`transcribe error: ${data.error.message}`);
      }
      return {
        transcript: data.transcript ?? "",
        audioDurationMs: data.audioDurationMs ?? 0,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

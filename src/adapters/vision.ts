export interface PageRow {
  memberText: string;
  amount: number;
  period: string;
}

export interface PhotoReader {
  readPage(image: Buffer, mime: string): Promise<PageRow[]>;
}

interface ChatChoice {
  message: { content: string | null };
}

interface ChatResponse {
  choices: ChatChoice[];
  error?: { message: string };
}

type FetchImpl = typeof fetch;

const READ_PROMPT =
  "Read each contribution row on this ledger page. Reply with one JSON array only, " +
  'no other text: [{"member": name as written, "amount": number, "period": "YYYY-MM" from the page title}].';

export function parsePageRows(content: string): PageRow[] {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = (fenced ? fenced[1] : content).trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end < 0 || end < start) {
    throw new Error("no JSON array in page reading");
  }
  const parsed = JSON.parse(text.slice(start, end + 1)) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("page reading is not an array");
  }
  return parsed.map((item, index) => {
    const row = item as { member?: unknown; amount?: unknown; period?: unknown };
    if (typeof row.member !== "string" || row.member.trim() === "") {
      throw new Error(`row ${index + 1} has no member name`);
    }
    if (typeof row.amount !== "number" || !Number.isInteger(row.amount) || row.amount <= 0) {
      throw new Error(`row ${index + 1} has no positive integer amount`);
    }
    if (typeof row.period !== "string" || !/^\d{4}-\d{2}$/.test(row.period)) {
      throw new Error(`row ${index + 1} has no YYYY-MM period`);
    }
    return { memberText: row.member.trim(), amount: row.amount, period: row.period };
  });
}

export class BasetenPhotoReader implements PhotoReader {
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
    const apiKey = options?.apiKey ?? process.env.BASENTEN_API_KEY;
    if (!apiKey) {
      throw new Error("BASENTEN_API_KEY is not set");
    }
    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl ?? "https://inference.baseten.co/v1";
    this.modelId = options?.modelId ?? process.env.MODEL_ID ?? "meta-models/muse-spark-open-1026";
    this.timeoutMs = options?.timeoutMs ?? 120_000;
    this.fetchImpl = options?.fetchImpl ?? fetch;
  }

  async readPage(image: Buffer, mime: string): Promise<PageRow[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: READ_PROMPT },
                {
                  type: "image_url",
                  image_url: { url: `data:${mime};base64,${image.toString("base64")}` },
                },
              ],
            },
          ],
          max_tokens: 600,
          temperature: 0,
          seed: 7,
          reasoning_effort: "low",
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`photo read http ${res.status}`);
      }
      const data = (await res.json()) as ChatResponse;
      if (data.error) {
        throw new Error(`photo read error: ${data.error.message}`);
      }
      return parsePageRows(data.choices[0]?.message.content ?? "");
    } finally {
      clearTimeout(timer);
    }
  }
}

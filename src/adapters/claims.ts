import type { ModelAdapter } from "./model.js";
import { DEFAULT_MODEL_OPTIONS } from "./model.js";

export interface ClaimInput {
  member: string;
  kind: string;
  amount: number;
  period: string;
  quotes: string[];
}

export interface ClaimVerdict {
  passed: boolean;
  reason: string;
}

const PROMPT = `You check one proposed ledger entry against the exact words quoted for it.
Decide whether the quotes support the entry as written: the right member, the right amount, the right month.
An entry that goes beyond what its quotes say is unsupported.
Answer only with JSON: {"supported": true or false, "reason": "one sentence"}`;

export async function verifyClaim(model: ModelAdapter, input: ClaimInput): Promise<ClaimVerdict> {
  if (input.quotes.length === 0) {
    return { passed: false, reason: "no quotes attached to judge" };
  }
  const result = await model.chat(
    [
      { role: "system", content: PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          entry: { member: input.member, kind: input.kind, amount: input.amount, period: input.period },
          quotes: input.quotes,
        }),
      },
    ],
    { ...DEFAULT_MODEL_OPTIONS, maxTokens: 200 },
  );
  try {
    const parsed = JSON.parse(result.content ?? "") as { supported?: unknown; reason?: unknown };
    if (typeof parsed.supported !== "boolean") {
      return { passed: false, reason: "claim check inconclusive" };
    }
    return {
      passed: parsed.supported,
      reason: typeof parsed.reason === "string" && parsed.reason ? parsed.reason : "claim judged",
    };
  } catch {
    return { passed: false, reason: "claim check inconclusive" };
  }
}

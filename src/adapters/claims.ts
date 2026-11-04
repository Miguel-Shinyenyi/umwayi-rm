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
Decide whether the quotes support the entry as written: the right person, the right amount, the right month.
The entry gives the member's full name from the group roster. A quote that uses a first name or a short name for that person supports the member.
A quote that names a month such as October supports the entry's period for that month, in the entry's year.
Answer false only when the person, the amount or the month differs from the quote, or the quote does not describe a payment.
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
    // Same cap as every other call: reasoning tokens count, and 200 left empty replies.
    { ...DEFAULT_MODEL_OPTIONS },
  );
  try {
    const text = result.content ?? "";
    // Accept JSON wrapped in a code fence or a sentence: take the first object.
    const body = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(body) as { supported?: unknown; reason?: unknown };
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

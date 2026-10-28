import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type {
  ChatMessage,
  ModelAdapter,
  ModelOptions,
  ToolSpec,
} from "../adapters/model.js";

export interface LoopOptions {
  maxTurns: number;
  maxToolCalls: number;
}

export const DEFAULT_LOOP_OPTIONS: LoopOptions = {
  maxTurns: 8,
  maxToolCalls: 12,
};

export interface LoopToolResult {
  id: string;
  name: string;
  result: unknown;
  isError: boolean;
}

export interface LoopTurn {
  index: number;
  content: string | null;
  toolCalls: { id: string; name: string; arguments: Record<string, unknown> }[];
  toolResults: LoopToolResult[];
}

export type LoopOutcome =
  | { kind: "proposed"; proposalId: string }
  | { kind: "questioned"; proposalId: string }
  | { kind: "other"; detail: string }
  | { kind: "unfinished"; detail: string }
  | { kind: "error"; detail: string };

export interface LoopTrace {
  turns: LoopTurn[];
  outcome: LoopOutcome;
}

interface WireMessage extends ChatMessage {
  tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
}

export async function runLoop(
  adapter: ModelAdapter,
  client: Client,
  systemPrompt: string,
  intakeText: string,
  modelOptions: ModelOptions,
  loopOptions: LoopOptions = DEFAULT_LOOP_OPTIONS,
): Promise<LoopTrace> {
  const listed = await client.listTools();
  const tools: ToolSpec[] = listed.tools.map((t) => ({
    name: t.name,
    description: t.description ?? "",
    parameters: (t.inputSchema as Record<string, unknown>) ?? {},
  }));
  const messages: WireMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: intakeText },
  ];
  const turns: LoopTurn[] = [];
  let toolCallsUsed = 0;

  for (let index = 0; index < loopOptions.maxTurns; index += 1) {
    let result;
    try {
      result = await adapter.chat(messages, modelOptions, tools);
    } catch (err) {
      return { turns, outcome: { kind: "error", detail: `model call failed: ${(err as Error).message}` } };
    }
    const calls = result.toolCalls ?? [];
    const turn: LoopTurn = {
      index,
      content: result.content,
      toolCalls: calls.map((c) => ({ id: c.id, name: c.name, arguments: c.arguments })),
      toolResults: [],
    };
    turns.push(turn);
    if (calls.length === 0) {
      return { turns, outcome: { kind: "unfinished", detail: "model answered without a tool call" } };
    }
    if (toolCallsUsed + calls.length > loopOptions.maxToolCalls) {
      return { turns, outcome: { kind: "unfinished", detail: "tool call budget spent" } };
    }
    toolCallsUsed += calls.length;
    messages.push({
      role: "assistant",
      content: result.content ?? "",
      tool_calls: calls.map((c) => ({
        id: c.id,
        type: "function" as const,
        function: { name: c.name, arguments: JSON.stringify(c.arguments) },
      })),
    });
    for (const call of calls) {
      let toolResult: LoopToolResult;
      try {
        const raw = await client.callTool({ name: call.name, arguments: call.arguments });
        const text = (raw.content as { type: string; text?: string }[]).find((c) => c.type === "text")?.text ?? "{}";
        toolResult = { id: call.id, name: call.name, result: JSON.parse(text) as unknown, isError: false };
      } catch (err) {
        toolResult = { id: call.id, name: call.name, result: { error: (err as Error).message }, isError: true };
      }
      turn.toolResults.push(toolResult);
      messages.push({
        role: "tool",
        content: JSON.stringify(toolResult.result),
        tool_call_id: call.id,
      });
      const outcome = outcomeFrom(call.name, toolResult.result);
      if (outcome) {
        return { turns, outcome };
      }
    }
  }
  return { turns, outcome: { kind: "unfinished", detail: "turn budget spent" } };
}

function outcomeFrom(toolName: string, result: unknown): LoopOutcome | null {
  if (typeof result !== "object" || result === null) {
    return null;
  }
  const record = result as { refused?: boolean; proposalId?: unknown; mustAsk?: boolean };
  if (record.refused === true) {
    return null;
  }
  if (typeof record.proposalId !== "string") {
    return null;
  }
  if (toolName === "propose_entry") {
    return { kind: "proposed", proposalId: record.proposalId };
  }
  if (toolName === "propose_question") {
    return { kind: "questioned", proposalId: record.proposalId };
  }
  return { kind: "other", detail: `${toolName} succeeded with ${record.proposalId}` };
}

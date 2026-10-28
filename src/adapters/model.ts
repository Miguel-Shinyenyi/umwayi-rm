export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
}

export interface ModelOptions {
  maxTokens: number;
  temperature: number;
  seed: number;
  reasoningEffort: "low";
  timeoutMs: number;
}

export interface ModelUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface ToolSpec {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ModelResult {
  content: string | null;
  modelId: string;
  toolCalls?: ToolCall[];
  usage?: ModelUsage;
}

export interface ModelAdapter {
  readonly modelId: string;
  chat(messages: ChatMessage[], options: ModelOptions, tools?: ToolSpec[]): Promise<ModelResult>;
}

export const DEFAULT_MODEL_OPTIONS: ModelOptions = {
  maxTokens: 600,
  temperature: 0,
  seed: 7,
  reasoningEffort: "low",
  timeoutMs: 60000,
};

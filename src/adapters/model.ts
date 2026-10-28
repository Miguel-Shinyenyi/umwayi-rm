export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
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

export interface ModelResult {
  content: string;
  modelId: string;
  usage?: ModelUsage;
}

export interface ModelAdapter {
  readonly modelId: string;
  chat(messages: ChatMessage[], options: ModelOptions): Promise<ModelResult>;
}

export const DEFAULT_MODEL_OPTIONS: ModelOptions = {
  maxTokens: 600,
  temperature: 0,
  seed: 7,
  reasoningEffort: "low",
  timeoutMs: 60000,
};

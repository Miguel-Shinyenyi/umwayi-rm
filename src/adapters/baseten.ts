import type {
  ChatMessage,
  ModelAdapter,
  ModelOptions,
  ModelResult,
  ToolCall,
  ToolSpec,
} from "./model.js";

interface BasetenToolCall {
  id: string;
  type: string;
  function: { name: string; arguments: string };
}

interface BasetenChoice {
  message: {
    content: string | null;
    tool_calls?: BasetenToolCall[];
  };
  finish_reason: string;
}

interface BasetenResponse {
  choices: BasetenChoice[];
  usage?: { prompt_tokens: number; completion_tokens: number };
  error?: { message: string };
}

export class BasetenAdapter implements ModelAdapter {
  readonly modelId: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options?: { apiKey?: string; baseUrl?: string; modelId?: string }) {
    const apiKey = options?.apiKey ?? process.env.BASENTEN_API_KEY;
    if (!apiKey) {
      throw new Error("BASENTEN_API_KEY is not set");
    }
    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl ?? "https://inference.baseten.co/v1";
    this.modelId = options?.modelId ?? process.env.MODEL_ID ?? "meta-models/muse-spark-open-1026";
  }

  async chat(
    messages: ChatMessage[],
    options: ModelOptions,
    tools?: ToolSpec[],
  ): Promise<ModelResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.modelId,
          messages,
          max_tokens: options.maxTokens,
          temperature: options.temperature,
          seed: options.seed,
          reasoning_effort: options.reasoningEffort,
          ...(tools && tools.length > 0
            ? {
                tools: tools.map((t) => ({
                  type: "function",
                  function: { name: t.name, description: t.description, parameters: t.parameters },
                })),
                tool_choice: "auto",
              }
            : {}),
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`baseten http ${res.status}`);
      }
      const data = (await res.json()) as BasetenResponse;
      if (data.error) {
        throw new Error(`baseten error: ${data.error.message}`);
      }
      const message = data.choices[0]?.message;
      const toolCalls: ToolCall[] | undefined = message?.tool_calls?.map((call) => ({
        id: call.id,
        name: call.function.name,
        arguments: JSON.parse(call.function.arguments || "{}") as Record<string, unknown>,
      }));
      return {
        content: message?.content ?? null,
        modelId: this.modelId,
        ...(toolCalls ? { toolCalls } : {}),
        ...(data.usage
          ? {
              usage: {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
              },
            }
          : {}),
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

import type {
  ChatMessage,
  ModelAdapter,
  ModelOptions,
  ModelResult,
  ToolSpec,
} from "../src/adapters/model.js";

export class StubAdapter implements ModelAdapter {
  readonly modelId = "stub/scripted";
  private cursor = 0;

  constructor(private readonly script: ModelResult[]) {}

  async chat(
    _messages: ChatMessage[],
    _options: ModelOptions,
    _tools?: ToolSpec[],
  ): Promise<ModelResult> {
    const next = this.script[Math.min(this.cursor, this.script.length - 1)] as ModelResult;
    this.cursor += 1;
    return structuredClone(next);
  }
}

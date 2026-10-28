import type { ChatMessage, ModelAdapter, ModelOptions, ModelResult } from "./model.js";

export class FakeModelAdapter implements ModelAdapter {
  readonly modelId = "fake/offline";

  async chat(
    messages: ChatMessage[],
    _options: ModelOptions,
    _tools?: import("./model.js").ToolSpec[],
  ): Promise<ModelResult> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    return {
      content: `offline-fake: ${lastUser ? lastUser.content.slice(0, 80) : "(no input)"}`,
      modelId: this.modelId,
      usage: { promptTokens: 0, completionTokens: 0 },
    };
  }
}

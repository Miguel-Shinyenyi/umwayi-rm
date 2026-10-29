import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import type { ModelAdapter } from "../adapters/model.js";
import { DEFAULT_MODEL_OPTIONS } from "../adapters/model.js";
import { runLoop } from "../agent/loop.js";
import type { LedgerStore } from "../ledger/store.js";
import { createMcpServer } from "../mcp/server.js";
import { requireToken, sendError } from "./auth.js";

export interface Transcriber {
  transcribe(wav: Buffer): Promise<{ transcript: string; audioDurationMs: number }>;
}

export interface IntakeDeps {
  store: LedgerStore;
  model: ModelAdapter;
  transcribe: Transcriber;
  loadPack: () => Promise<{ playbook: string; rules: string }>;
  promptVersion?: string;
}

const DEFAULT_PROMPT_VERSION = "pack-v0";

type IntakeBody = { text?: unknown; audio?: unknown };

function bodyOf(req: Request): IntakeBody {
  return (req.body ?? {}) as IntakeBody;
}

export function createIntakeHandler(deps: IntakeDeps) {
  return async function intakeNote(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    const groupId = req.params.id as string;
    const body = bodyOf(req);
    try {
      let transcript: string | null = null;
      let text: string;
      if (typeof body.text === "string" && body.text.trim() !== "") {
        text = body.text;
      } else if (typeof body.audio === "string" && body.audio !== "") {
        const wav = Buffer.from(body.audio, "base64");
        const result = await deps.transcribe.transcribe(wav);
        transcript = result.transcript;
        text = result.transcript;
      } else {
        res.status(422).json({ error: { code: "invalid", message: "body needs text or base64 audio" } });
        return;
      }
      if (text.trim() === "") {
        res.status(422).json({ error: { code: "invalid", message: "intake text is empty" } });
        return;
      }
      const pack = await deps.loadPack();
      const todayLine = `Today is ${new Date().toISOString().slice(0, 10)} (Africa/Nairobi). Resolve month names against this date.`;
      const systemPrompt = `${todayLine}\n\n${pack.playbook}\n\n${pack.rules}`;
      const runId = randomUUID();
      const server = createMcpServer({
        store: deps.store,
        token,
        groupId,
        runId,
        run: { intakeText: text, refusals: 0 },
      });
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      const client = new Client({ name: "intake", version: "0.1.0" });
      try {
        await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
        const trace = await runLoop(deps.model, client, systemPrompt, text, DEFAULT_MODEL_OPTIONS);
        const proposals = await deps.store.listProposals(token, groupId);
        await deps.store.saveRun(token, {
          id: runId,
          groupId,
          intakeRef: text,
          modelId: deps.model.modelId,
          promptVersion: deps.promptVersion ?? DEFAULT_PROMPT_VERSION,
          steps: trace.turns.map((t) => ({
            index: t.index,
            content: typeof t.content === "string" ? t.content.slice(0, 500) : null,
            calls: t.toolCalls.map((c) => c.name),
          })),
          status: trace.outcome.kind,
        });
        res.status(200).json({
          runId,
          modelId: deps.model.modelId,
          transcript,
          outcome: trace.outcome,
          proposals,
          turns: trace.turns.length,
        });
      } finally {
        await client.close().catch(() => undefined);
        await server.close().catch(() => undefined);
      }
    } catch (err) {
      sendError(res, err);
    }
  };
}

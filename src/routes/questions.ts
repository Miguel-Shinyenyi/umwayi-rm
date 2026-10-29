import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import type { ModelAdapter } from "../adapters/model.js";
import { DEFAULT_MODEL_OPTIONS } from "../adapters/model.js";
import { runLoop } from "../agent/loop.js";
import type { LedgerStore } from "../ledger/store.js";
import { invalidInput } from "../ledger/types.js";
import { createMcpServer } from "../mcp/server.js";
import { requireToken, sendError } from "./auth.js";

export interface QuestionDeps {
  store: LedgerStore;
  model: ModelAdapter;
  loadPack: () => Promise<{ playbook: string; rules: string }>;
  promptVersion?: string;
}

export function createQuestionHandlers(deps: QuestionDeps) {
  async function answerQuestion(req: Request, res: Response): Promise<void> {
    const token = requireToken(req, res);
    if (!token) {
      return;
    }
    try {
      const groupId = req.params.id as string;
      const questionId = req.params.qid as string;
      const body = (req.body ?? {}) as Record<string, unknown>;
      if (typeof body.text !== "string" || body.text.trim() === "") {
        throw invalidInput("body needs answer text");
      }
      const answer = body.text.trim();
      const question = await deps.store.getProposal(token, questionId);
      if (question.groupId !== groupId) {
        throw invalidInput(`question is not in group: ${groupId}`);
      }
      if (question.type !== "question" || question.status !== "pending") {
        throw invalidInput("only pending questions can be answered");
      }
      const questionText = (question.payload as { text?: unknown }).text;
      let context = `Open question: "${typeof questionText === "string" ? questionText : ""}"\nTreasurer answer: "${answer}"`;
      if (question.runId) {
        try {
          const run = await deps.store.getRun(token, question.runId);
          context = `Original note: "${run.intakeRef}"\n${context}`;
        } catch {
          context = `${context}`;
        }
      }
      const pack = await deps.loadPack();
      const todayLine = `Today is ${new Date().toISOString().slice(0, 10)} (Africa/Nairobi). Resolve month names against this date.`;
      const systemPrompt = `${todayLine}\n\n${pack.playbook}\n\n${pack.rules}\n\nUse the treasurer answer to resolve the open question. Propose from the combined text or ask again if it is still unclear.`;
      const runId = randomUUID();
      const server = createMcpServer({
        store: deps.store,
        token,
        groupId,
        runId,
        run: { intakeText: context, refusals: 0 },
      });
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      const client = new Client({ name: "answer", version: "0.1.0" });
      try {
        await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
        const trace = await runLoop(deps.model, client, systemPrompt, context, DEFAULT_MODEL_OPTIONS);
        await deps.store.saveRun(token, {
          id: runId,
          groupId,
          intakeRef: context,
          modelId: deps.model.modelId,
          promptVersion: deps.promptVersion ?? "pack-v0",
          steps: trace.turns.map((t) => ({
            index: t.index,
            content: typeof t.content === "string" ? t.content.slice(0, 500) : null,
            calls: t.toolCalls.map((c) => c.name),
          })),
          status: trace.outcome.kind,
        });
        const answered = await deps.store.markQuestionAnswered(token, questionId, answer);
        const proposals = (await deps.store.listProposals(token, groupId)).filter((p) => p.runId === runId);
        res.status(200).json({ question: answered, runId, outcome: trace.outcome, proposals });
      } finally {
        await client.close().catch(() => undefined);
        await server.close().catch(() => undefined);
      }
    } catch (err) {
      sendError(res, err);
    }
  }

  return { answerQuestion };
}

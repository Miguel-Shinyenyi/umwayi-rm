import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL_OPTIONS } from "../src/adapters/model.js";
import { runLoop } from "../src/agent/loop.js";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { createMcpServer } from "../src/mcp/server.js";
import { StubAdapter } from "./stub-adapter.js";

const SYSTEM = "Test playbook. Propose or ask.";
const INTAKE = "Wanjiku Mwangi paid five hundred for October.";

async function setup() {
  const store = new MemoryLedgerStore();
  const { group, token } = await store.createGroup("Tumaini");
  await store.createMember(token, { groupId: group.id, displayName: "Wanjiku Mwangi" });
  const server = createMcpServer({
    store,
    token,
    groupId: group.id,
    run: { intakeText: INTAKE, refusals: 0 },
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "loop-test", version: "0.1.0" });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  return {
    store,
    token,
    groupId: group.id,
    client,
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}

describe("agent loop", () => {
  it("stops at the first successful proposal", async () => {
    const { client, close } = await setup();
    try {
      const adapter = new StubAdapter([
        {
          content: null,
          modelId: "stub/scripted",
          toolCalls: [
            {
              id: "call-1",
              name: "propose_question",
              arguments: { text: "Which month?" },
            },
          ],
        },
      ]);
      const trace = await runLoop(adapter, client, SYSTEM, INTAKE, DEFAULT_MODEL_OPTIONS);
      expect(trace.outcome.kind).toBe("questioned");
      expect(trace.turns).toHaveLength(1);
    } finally {
      await close();
    }
  });

  it("sees a refusal and retries with a question", async () => {
    const { client, close } = await setup();
    try {
      const adapter = new StubAdapter([
        {
          content: null,
          modelId: "stub/scripted",
          toolCalls: [
            {
              id: "call-1",
              name: "propose_entry",
              arguments: {
                memberText: "Nobody",
                kind: "contribution",
                amount: 500,
                period: "2026-10",
                occurredOn: "2026-10-05",
                quotes: ["Wanjiku Mwangi paid five hundred"],
              },
            },
          ],
        },
        {
          content: null,
          modelId: "stub/scripted",
          toolCalls: [{ id: "call-2", name: "propose_question", arguments: { text: "Who paid?" } }],
        },
      ]);
      const trace = await runLoop(adapter, client, SYSTEM, INTAKE, DEFAULT_MODEL_OPTIONS);
      expect(trace.turns).toHaveLength(2);
      expect(trace.turns[0]?.toolResults[0]?.result).toMatchObject({ refused: true });
      expect(trace.outcome.kind).toBe("questioned");
    } finally {
      await close();
    }
  });

  it("ends unfinished when the model answers in text", async () => {
    const { client, close } = await setup();
    try {
      const adapter = new StubAdapter([{ content: "Noted.", modelId: "stub/scripted" }]);
      const trace = await runLoop(adapter, client, SYSTEM, INTAKE, DEFAULT_MODEL_OPTIONS);
      expect(trace.outcome).toMatchObject({ kind: "unfinished" });
    } finally {
      await close();
    }
  });

  it("ends unfinished when the turn budget runs out", async () => {
    const { client, close } = await setup();
    try {
      const failingCall = {
        content: null,
        modelId: "stub/scripted",
        toolCalls: [
          {
            id: "call-x",
            name: "propose_entry",
            arguments: {
              memberText: "Nobody",
              kind: "contribution",
              amount: 500,
              period: "2026-10",
              occurredOn: "2026-10-05",
              quotes: ["Wanjiku Mwangi paid five hundred"],
            },
          },
        ],
      };
      const adapter = new StubAdapter([failingCall, failingCall]);
      const trace = await runLoop(adapter, client, SYSTEM, INTAKE, DEFAULT_MODEL_OPTIONS, {
        maxTurns: 2,
        maxToolCalls: 12,
      });
      expect(trace.turns).toHaveLength(2);
      expect(trace.outcome).toMatchObject({ kind: "unfinished", detail: "turn budget spent" });
    } finally {
      await close();
    }
  });
});

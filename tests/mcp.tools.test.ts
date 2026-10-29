import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { createMcpServer } from "../src/mcp/server.js";
import {
  handleGetLedgerPage,
  handleGetMemberList,
  handleProposeDraftReminder,
  handleProposeEntry,
  handleProposeQuestion,
  type ToolDeps,
} from "../src/mcp/tools.js";

async function setup(intakeText: string): Promise<ToolDeps & { close: () => Promise<void> }> {
  const store = new MemoryLedgerStore();
  const { group, token } = await store.createGroup("Tumaini");
  await store.createMember(token, {
    groupId: group.id,
    displayName: "Brian Otieno",
    aliases: ["Brian O."],
  });
  await store.createMember(token, {
    groupId: group.id,
    displayName: "Brian Kamau",
    aliases: ["Brian K."],
  });
  const wanjiku = await store.createMember(token, {
    groupId: group.id,
    displayName: "Wanjiku Mwangi",
    aliases: ["Shiku"],
  });
  await store.createEntry(token, {
    groupId: group.id,
    memberId: wanjiku.id,
    kind: "contribution",
    amount: 500,
    period: "2026-09",
    occurredOn: "2026-09-05",
    evidenceTier: "treasurer_confirmed",
  });
  return { store, token, groupId: group.id, run: { intakeText, refusals: 0 }, close: async () => undefined };
}

describe("mcp tools", () => {
  it("lists members without internal ids", async () => {
    const deps = await setup("");
    const result = await handleGetMemberList(deps);
    expect(result.members.map((m) => m.displayName).sort()).toEqual([
      "Brian Kamau",
      "Brian Otieno",
      "Wanjiku Mwangi",
    ]);
    expect(JSON.stringify(result)).not.toContain("m-");
    await deps.close();
  });

  it("lists ledger entries with display names and filters", async () => {
    const deps = await setup("");
    const all = await handleGetLedgerPage(deps, {});
    expect(all.entries).toHaveLength(1);
    expect(all.entries[0]?.member).toBe("Wanjiku Mwangi");
    const filtered = await handleGetLedgerPage(deps, { memberText: "shiku" });
    expect(filtered.entries).toHaveLength(1);
    const empty = await handleGetLedgerPage(deps, { memberText: "Nobody" });
    expect(empty.entries).toHaveLength(0);
    await deps.close();
  });

  it("proposes an entry when every check passes", async () => {
    const deps = await setup("Wanjiku Mwangi paid five hundred for October.");
    const result = await handleProposeEntry(deps, {
      memberText: "Wanjiku Mwangi",
      kind: "contribution",
      amount: 500,
      period: "2026-10",
      occurredOn: "2026-10-05",
      quotes: ["Wanjiku Mwangi paid five hundred"],
    });
    expect(result).toMatchObject({ status: "pending" });
    expect("proposalId" in result).toBe(true);
    await deps.close();
  });

  it("refuses quotes outside the intake and counts refusals", async () => {
    const deps = await setup("Wanjiku Mwangi paid five hundred for October.");
    const args = {
      memberText: "Wanjiku Mwangi",
      kind: "contribution",
      amount: 500,
      period: "2026-10",
      occurredOn: "2026-10-05",
      quotes: ["Brian paid one thousand"],
    };
    const first = await handleProposeEntry(deps, args);
    expect(first).toMatchObject({ refused: true });
    expect(deps.run.refusals).toBe(1);
    const second = await handleProposeEntry(deps, { ...args, quotes: ["a", "b", "c", "d"] });
    expect(second).toMatchObject({ refused: true });
    expect(deps.run.refusals).toBe(2);
    await deps.close();
  });

  it("refuses collisions and unknown members without leaking labels", async () => {
    const deps = await setup("Brian paid five hundred for October.");
    const collision = await handleProposeEntry(deps, {
      memberText: "Brian",
      kind: "contribution",
      amount: 500,
      period: "2026-10",
      occurredOn: "2026-10-05",
      quotes: ["Brian paid five hundred"],
    });
    expect(collision).toMatchObject({ refused: true });
    expect((collision as { reason: string }).reason).toContain("ask which");
    const unknown = await handleProposeEntry(deps, {
      memberText: "Zawadi Muthoni",
      kind: "contribution",
      amount: 500,
      period: "2026-10",
      occurredOn: "2026-10-05",
      quotes: ["Brian paid five hundred"],
    });
    expect(unknown).toMatchObject({ refused: true });
    await deps.close();
  });

  it("forces a question after three refusals", async () => {
    const deps = await setup("Brian paid five hundred for October.");
    const args = {
      memberText: "Nobody",
      kind: "contribution",
      amount: 500,
      period: "2026-10",
      occurredOn: "2026-10-05",
      quotes: ["Brian paid five hundred"],
    };
    await handleProposeEntry(deps, args);
    await handleProposeEntry(deps, args);
    await handleProposeEntry(deps, args);
    const fourth = await handleProposeEntry(deps, args);
    expect(fourth).toMatchObject({ refused: true, mustAsk: true });
    expect(deps.run.refusals).toBe(3);
    await deps.close();
  });

  it("creates questions and draft reminders", async () => {
    const deps = await setup("Brian paid five hundred for October.");
    const question = await handleProposeQuestion(deps, { text: "Which Brian paid?" });
    expect(question).toMatchObject({ status: "pending" });
    const draft = await handleProposeDraftReminder(deps, {
      memberText: "Shiku",
      period: "2026-10",
      text: "A gentle reminder.",
    });
    expect(draft).toMatchObject({ status: "pending" });
    const badDraft = await handleProposeDraftReminder(deps, {
      memberText: "Brian",
      period: "2026-10",
      text: "Hello.",
    });
    expect(badDraft).toMatchObject({ refused: true });
    await deps.close();
  });

  it("serves tools over the MCP protocol", async () => {
    const deps = await setup("Wanjiku Mwangi paid five hundred for October.");
    const server = createMcpServer(deps);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test-client", version: "0.1.0" });
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
    try {
      const tools = await client.listTools();
      expect(tools.tools.map((t) => t.name).sort()).toEqual([
        "get_ledger_page",
        "get_member_list",
        "propose_draft_reminder",
        "propose_entry",
        "propose_question",
        "recall",
      ]);
      const result = await client.callTool({
        name: "propose_question",
        arguments: { text: "Which month?" },
      });
      const text = (result.content as { type: string; text: string }[])[0]?.text ?? "{}";
      expect(JSON.parse(text)).toMatchObject({ status: "pending" });
    } finally {
      await client.close();
      await server.close();
      await deps.close();
    }
  });
});

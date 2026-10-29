import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { LedgerError } from "../ledger/types.js";
import {
  handleGetLedgerPage,
  handleGetMemberList,
  handleProposeDraftReminder,
  handleProposeEntry,
  handleProposeQuestion,
  handleRecall,
  type ProposeEntryArgs,
  type ToolDeps,
} from "./tools.js";

interface ToolText {
  [key: string]: unknown;
  content: { type: "text"; text: string }[];
  isError?: boolean;
}

function ok(value: unknown): ToolText {
  return { content: [{ type: "text", text: JSON.stringify(value) }] };
}

function failed(err: unknown): ToolText {
  if (err instanceof LedgerError) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: err.message, statusCode: err.statusCode }) }],
      isError: true,
    };
  }
  throw err;
}

export function createMcpServer(deps: ToolDeps): McpServer {
  const server = new McpServer({ name: "umwayi-rm", version: "0.1.0" });

  server.registerTool(
    "get_member_list",
    { description: "List group members with display names and aliases.", inputSchema: {} },
    async () => {
      try {
        return ok(await handleGetMemberList(deps));
      } catch (err) {
        return failed(err);
      }
    },
  );

  server.registerTool(
    "get_ledger_page",
    {
      description: "List ledger entries, optionally filtered by period or member text.",
      inputSchema: { period: z.string().optional(), memberText: z.string().optional() },
    },
    async (args) => {
      try {
        return ok(await handleGetLedgerPage(deps, args));
      } catch (err) {
        return failed(err);
      }
    },
  );

  server.registerTool(
    "propose_entry",
    {
      description: "Propose a ledger entry. Quotes must come from the intake note. Refusals explain why.",
      inputSchema: {
        memberText: z.string(),
        kind: z.string(),
        amount: z.number(),
        period: z.string(),
        occurredOn: z.string(),
        quotes: z.array(z.string()),
        sourceRef: z.string().optional(),
        note: z.string().optional(),
      },
    },
    async (args) => {
      try {
        return ok(await handleProposeEntry(deps, args as ProposeEntryArgs));
      } catch (err) {
        return failed(err);
      }
    },
  );

  server.registerTool(
    "propose_question",
    { description: "Ask the treasurer a clarifying question.", inputSchema: { text: z.string() } },
    async (args) => {
      try {
        return ok(await handleProposeQuestion(deps, args));
      } catch (err) {
        return failed(err);
      }
    },
  );

  server.registerTool(
    "propose_draft_reminder",
    {
      description: "Draft a reminder for one member. The treasurer sends it, never the agent.",
      inputSchema: { memberText: z.string(), period: z.string(), text: z.string() },
    },
    async (args) => {
      try {
        return ok(await handleProposeDraftReminder(deps, args));
      } catch (err) {
        return failed(err);
      }
    },
  );

  server.registerTool(
    "recall",
    {
      description: "Read one archive item verbatim by pointer. Every recall is logged in the trace.",
      inputSchema: { pointer: z.string() },
    },
    async (args) => {
      try {
        return ok(await handleRecall(deps, args));
      } catch (err) {
        return failed(err);
      }
    },
  );

  return server;
}

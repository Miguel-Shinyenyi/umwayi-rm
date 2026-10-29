import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getPool } from "../db/pool.js";
import { PostgresLedgerStore } from "../ledger/postgres.js";
import { createMcpServer } from "./server.js";

const token = process.env.TREASURER_TOKEN;
const groupId = process.env.GROUP_ID;
if (!token || !groupId) {
  console.error("TREASURER_TOKEN and GROUP_ID are required");
  process.exit(1);
}

const server = createMcpServer({
  store: new PostgresLedgerStore(getPool()),
  token,
  groupId,
  runId: null,
  run: { intakeText: process.env.INTAKE_TEXT ?? "", refusals: 0 },
});

await server.connect(new StdioServerTransport());

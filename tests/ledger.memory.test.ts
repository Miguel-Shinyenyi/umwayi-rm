import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { ledgerConformance } from "./ledger-conformance.js";

ledgerConformance("memory", async () => ({
  store: new MemoryLedgerStore(),
  close: async () => undefined,
}));

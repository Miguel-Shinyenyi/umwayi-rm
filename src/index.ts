import { BasetenAdapter } from "./adapters/baseten.js";
import { FakeModelAdapter } from "./adapters/fake.js";
import type { ModelAdapter } from "./adapters/model.js";
import { MetaTranscribe } from "./adapters/transcribe.js";
import { createApp } from "./app.js";
import { getPool } from "./db/pool.js";
import { MemoryLedgerStore } from "./ledger/memory.js";
import { PostgresLedgerStore } from "./ledger/postgres.js";
import type { LedgerStore } from "./ledger/store.js";

const port = Number(process.env.PORT ?? 3000);

const store: LedgerStore = process.env.DATABASE_URL
  ? new PostgresLedgerStore(getPool())
  : new MemoryLedgerStore();
const model: ModelAdapter = process.env.BASENTEN_API_KEY ? new BasetenAdapter() : new FakeModelAdapter();
const transcribe = new MetaTranscribe({ apiKey: process.env.META_API_KEY ?? "unset" });

const app = createApp({ store, model, transcribe });

app.listen(port, () => {
  console.log(`umwayi-rm listening on :${port}`);
});

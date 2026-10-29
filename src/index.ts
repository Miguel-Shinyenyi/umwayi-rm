import { BasetenAdapter } from "./adapters/baseten.js";
import { verifyClaim } from "./adapters/claims.js";
import { FakeModelAdapter } from "./adapters/fake.js";
import type { ModelAdapter } from "./adapters/model.js";
import { MetaTranscribe } from "./adapters/transcribe.js";
import { BasetenPhotoReader, type PhotoReader } from "./adapters/vision.js";
import { createApp } from "./app.js";
import { migrate } from "./db/migrate.js";
import { getPool } from "./db/pool.js";
import { MemoryLedgerStore } from "./ledger/memory.js";
import { PostgresLedgerStore } from "./ledger/postgres.js";
import type { LedgerStore } from "./ledger/store.js";
import { LedgerError } from "./ledger/types.js";

const port = Number(process.env.PORT ?? 3000);

async function main(): Promise<void> {
  const store: LedgerStore = process.env.DATABASE_URL
    ? new PostgresLedgerStore(getPool())
    : new MemoryLedgerStore();
  if (process.env.DATABASE_URL) {
    const applied = await migrate(getPool());
    if (applied.length > 0) {
      console.log(`migrations applied: ${applied.join(", ")}`);
    }
  }
  const model: ModelAdapter = process.env.BASENTEN_API_KEY ? new BasetenAdapter() : new FakeModelAdapter();
  const transcribe = new MetaTranscribe({ apiKey: process.env.META_API_KEY || "unset" });
  const reader: PhotoReader = process.env.BASENTEN_API_KEY
    ? new BasetenPhotoReader()
    : {
        readPage: async () => {
          throw new LedgerError("model is off", 503);
        },
      };

  const app = createApp({
    store,
    model,
    transcribe,
    reader,
    demoMode: process.env.DEMO_MODE === "true",
    ...(process.env.BASENTEN_API_KEY
      ? { claimCheck: (input: Parameters<typeof verifyClaim>[1]) => verifyClaim(model, input) }
      : {}),
  });
  app.listen(port, () => {
    console.log(`umwayi-rm listening on :${port}`);
  });
}

await main();

import { BasetenAdapter } from "./adapters/baseten.js";
import { basetenKey } from "./adapters/key.js";
import { verifyClaim } from "./adapters/claims.js";
import { FakeModelAdapter } from "./adapters/fake.js";
import type { ModelAdapter } from "./adapters/model.js";
import { createTranscriber } from "./adapters/transcribe.js";
import { BasetenPhotoReader, type PhotoReader } from "./adapters/vision.js";
import { createApp } from "./app.js";
import { migrate } from "./db/migrate.js";
import { getPool } from "./db/pool.js";
import { MemoryLedgerStore } from "./ledger/memory.js";
import { PostgresLedgerStore } from "./ledger/postgres.js";
import type { LedgerStore } from "./ledger/store.js";
import { LedgerError } from "./ledger/types.js";


export async function buildApp(): Promise<ReturnType<typeof createApp>> {
  const store: LedgerStore = process.env.DATABASE_URL
    ? new PostgresLedgerStore(getPool())
    : new MemoryLedgerStore();
  if (process.env.DATABASE_URL) {
    const applied = await migrate(getPool());
    if (applied.length > 0) {
      console.log(`migrations applied: ${applied.join(", ")}`);
    }
  }
  const model: ModelAdapter = basetenKey() ? new BasetenAdapter() : new FakeModelAdapter();
  const transcribe = createTranscriber(process.env.META_API_KEY);
  const reader: PhotoReader = basetenKey()
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
    ...(process.env.DEMO_MODE === "true"
      ? {
          limits: {
            modelCallsPerHour: Number(process.env.MODEL_CALLS_PER_HOUR ?? 30),
            resetsPerHour: Number(process.env.RESETS_PER_HOUR ?? 20),
          },
        }
      : {}),
    ...(basetenKey()
      ? { claimCheck: (input: Parameters<typeof verifyClaim>[1]) => verifyClaim(model, input) }
      : {}),
  });
  return app;
}

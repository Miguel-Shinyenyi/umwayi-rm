import { beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { migrate } from "../src/db/migrate.js";
import { PostgresLedgerStore } from "../src/ledger/postgres.js";
import { ledgerConformance } from "./ledger-conformance.js";

const DATABASE_URL = process.env.DATABASE_URL;

describe.skipIf(!DATABASE_URL)("ledger postgres", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({ connectionString: DATABASE_URL });
    await migrate(pool);
  });

  ledgerConformance("postgres", async () => ({
    store: new PostgresLedgerStore(pool),
    close: async () => undefined,
  }));

  it("refuses to update or delete entries at the database level", async () => {
    const store = new PostgresLedgerStore(pool);
    const { group, token } = await store.createGroup("Trigger check");
    const member = await store.createMember(token, {
      groupId: group.id,
      displayName: "Omondi Juma",
    });
    const entry = await store.createEntry(token, {
      groupId: group.id,
      memberId: member.id,
      kind: "contribution",
      amount: 500,
      period: "2026-10",
      occurredOn: "2026-10-05",
      evidenceTier: "treasurer_confirmed",
    });
    await expect(
      pool.query("UPDATE entries SET amount = 1 WHERE id = $1", [entry.id]),
    ).rejects.toThrow("append only");
    await expect(pool.query("DELETE FROM entries WHERE id = $1", [entry.id])).rejects.toThrow(
      "append only",
    );
  });
});

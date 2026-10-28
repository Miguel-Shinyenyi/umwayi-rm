import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Pool } from "pg";

const here = dirname(fileURLToPath(import.meta.url));

export async function migrate(
  pool: Pool,
  dir: string = join(here, "migrations"),
): Promise<string[]> {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  );
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const existing = await pool.query("SELECT name FROM schema_migrations");
  const done = new Set((existing.rows as { name: string }[]).map((r) => r.name));
  const applied: string[] = [];
  for (const file of files) {
    if (done.has(file)) {
      continue;
    }
    const sql = await readFile(join(dir, file), "utf8");
    await pool.query(sql);
    await pool.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    applied.push(file);
  }
  return applied;
}

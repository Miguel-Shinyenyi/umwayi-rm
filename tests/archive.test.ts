import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { handleRecall, type ToolDeps } from "../src/mcp/tools.js";

const HISTORY_DIR = "evals/h2/history";

function historyFiles(): string[] {
  return readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".md")).sort();
}

describe("h2 corpus", () => {
  it("holds 28 items with gists and unique checksums", () => {
    const files = historyFiles();
    expect(files).toHaveLength(28);
    const hashes = new Set<string>();
    for (const file of files) {
      const text = readFileSync(`${HISTORY_DIR}/${file}`, "utf8");
      expect(text).toMatch(/^Gist: .+/m);
      expect(text.length).toBeGreaterThan(100);
      hashes.add(createHash("sha256").update(text, "utf8").digest("hex"));
    }
    expect(hashes.size).toBe(28);
  });

  it("covers meetings, ledger months, constitution, and amendments", () => {
    const files = historyFiles();
    expect(files.filter((f) => f.startsWith("meeting-"))).toHaveLength(12);
    expect(files.filter((f) => f.startsWith("ledger-"))).toHaveLength(12);
    expect(files).toContain("constitution.md");
    expect(files.filter((f) => f.startsWith("amendment-"))).toHaveLength(3);
  });
});

describe("recall tool", () => {
  async function deps(): Promise<{ deps: ToolDeps; itemId: string }> {
    const store = new MemoryLedgerStore();
    const { group, token } = await store.createGroup("Tumaini");
    const item = await store.saveArchiveItem(token, {
      groupId: group.id,
      kind: "meeting",
      verbatim: "Met on Sunday. All paid.",
      gist: "Sunday meeting, all paid",
    });
    return { deps: { store, token, groupId: group.id, run: { intakeText: "", refusals: 0 } }, itemId: item.id };
  }

  it("returns verbatim text with its checksum", async () => {
    const { deps: d, itemId } = await deps();
    const result = await handleRecall(d, { pointer: itemId });
    expect(result).toMatchObject({ verbatim: "Met on Sunday. All paid." });
    expect((result as { sha256: string }).sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it("refuses an unknown pointer without throwing", async () => {
    const { deps: d } = await deps();
    const result = await handleRecall(d, { pointer: "missing" });
    expect(result).toMatchObject({ refused: true });
  });
});

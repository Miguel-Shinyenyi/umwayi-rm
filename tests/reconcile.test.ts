import { describe, expect, it } from "vitest";
import { comparePaper, type PaperRow } from "../src/ledger/reconcile.js";
import type { Entry, Member } from "../src/ledger/types.js";

function member(id: string, displayName: string, aliases: string[] = []): Member {
  return { id, groupId: "g", displayName, aliases, createdAt: "2026-10-01T00:00:00.000Z" };
}

function entry(id: string, memberId: string, amount: number, period = "2026-10"): Entry {
  return {
    id,
    groupId: "g",
    memberId,
    kind: "contribution",
    amount,
    period,
    occurredOn: "2026-10-05",
    evidenceTier: "treasurer_confirmed",
    sourceRef: null,
    proposalId: null,
    approvedBy: null,
    createdAt: "2026-10-01T00:00:00.000Z",
  };
}

const members = [
  member("m-wanjiku", "Wanjiku Mwangi", ["Shiku"]),
  member("m-kamau", "Kamau Njoroge", []),
];

describe("comparePaper", () => {
  it("matches exact rows, display names, and aliases case-insensitively", () => {
    const rows: PaperRow[] = [
      { memberText: "Wanjiku Mwangi", amount: 500, period: "2026-10" },
      { memberText: "  SHIKU ", amount: 500, period: "2026-09" },
    ];
    const result = comparePaper(
      members,
      [entry("e1", "m-wanjiku", 500, "2026-10"), entry("e2", "m-wanjiku", 500, "2026-09")],
      rows,
    );
    expect(result.matched).toHaveLength(2);
    expect(result.onlyOnPaper).toHaveLength(0);
    expect(result.onlyInLedger).toHaveLength(0);
    expect(result.amountDiffers).toHaveLength(0);
  });

  it("flags amount differences and keeps both sides", () => {
    const result = comparePaper(
      members,
      [entry("e1", "m-kamau", 500)],
      [{ memberText: "Kamau Njoroge", amount: 450, period: "2026-10" }],
    );
    expect(result.matched).toHaveLength(0);
    expect(result.amountDiffers).toHaveLength(1);
    expect(result.amountDiffers[0]?.ledgerAmount).toBe(500);
    expect(result.onlyOnPaper).toHaveLength(0);
    expect(result.onlyInLedger).toHaveLength(0);
  });

  it("reports rows and entries with no counterpart", () => {
    const result = comparePaper(
      members,
      [entry("e1", "m-kamau", 500)],
      [{ memberText: "Nobody Here", amount: 100, period: "2026-10" }],
    );
    expect(result.onlyOnPaper).toHaveLength(1);
    expect(result.onlyInLedger.map((e) => e.id)).toEqual(["e1"]);
  });

  it("consumes each entry once", () => {
    const rows: PaperRow[] = [
      { memberText: "Kamau Njoroge", amount: 500, period: "2026-10" },
      { memberText: "Kamau Njoroge", amount: 500, period: "2026-10" },
    ];
    const result = comparePaper(members, [entry("e1", "m-kamau", 500)], rows);
    expect(result.matched).toHaveLength(1);
    expect(result.onlyOnPaper).toHaveLength(1);
  });

  it("returns the same result regardless of input row order", () => {
    const rows: PaperRow[] = [
      { memberText: "Kamau Njoroge", amount: 500, period: "2026-10" },
      { memberText: "Shiku", amount: 500, period: "2026-10" },
    ];
    const entries = [entry("e1", "m-kamau", 500), entry("e2", "m-wanjiku", 500)];
    const forward = comparePaper(members, entries, rows);
    const backward = comparePaper(members, entries, [...rows].reverse());
    expect(backward).toEqual(forward);
  });
});

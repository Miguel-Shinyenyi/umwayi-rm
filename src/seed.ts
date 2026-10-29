import type { LedgerStore } from "./ledger/store.js";
import type { Group } from "./ledger/types.js";

export interface SeedMember {
  displayName: string;
  aliases: string[];
}

export const SEED_MEMBERS: SeedMember[] = [
  { displayName: "Brian Otieno", aliases: ["Brian O.", "B. Otieno"] },
  { displayName: "Brian Kamau", aliases: ["Brian K.", "B. Kamau"] },
  { displayName: "Wanjiku Mwangi", aliases: ["Wanjiku", "Shiku"] },
  { displayName: "Kamau Njoroge", aliases: ["Kamau"] },
  { displayName: "Achieng Odhiambo", aliases: ["Achieng"] },
  { displayName: "Njeri Wambui", aliases: ["Njeri"] },
  { displayName: "Mwangi Kariuki", aliases: ["Mwangi"] },
  { displayName: "Atieno Auma", aliases: ["Atieno"] },
  { displayName: "Kiptoo Rono", aliases: ["Kiptoo"] },
  { displayName: "Chebet Lagat", aliases: ["Chebet"] },
  { displayName: "Omondi Juma", aliases: ["Omondi"] },
  { displayName: "Zawadi Muthoni", aliases: ["Zawadi"] },
];

export const SEED_PERIOD = "2026-10";
const PAID_ON_TIME = ["Wanjiku Mwangi", "Kamau Njoroge", "Achieng Odhiambo"];

export async function seedDemo(store: LedgerStore): Promise<{ group: Group; token: string }> {
  const { group, token } = await store.createGroup("Tumaini Savings Group");
  for (const member of SEED_MEMBERS) {
    const created = await store.createMember(token, {
      groupId: group.id,
      displayName: member.displayName,
      aliases: member.aliases,
    });
    await store.createCommitment(token, {
      groupId: group.id,
      memberId: created.id,
      kind: "contribution",
      amount: 500,
      dueRule: "monthly day 5",
    });
    if (PAID_ON_TIME.includes(member.displayName)) {
      await store.createEntry(token, {
        groupId: group.id,
        memberId: created.id,
        kind: "contribution",
        amount: 500,
        period: SEED_PERIOD,
        occurredOn: "2026-10-04",
        evidenceTier: "treasurer_confirmed",
        sourceRef: "seed",
      });
    }
  }
  return { group, token };
}

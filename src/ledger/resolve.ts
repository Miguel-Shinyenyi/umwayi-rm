import type { Member } from "./types.js";

export function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export function resolveMembers(members: Member[], text: string): Member[] {
  const want = normalize(text);
  return members.filter((m) => {
    if (normalize(m.displayName) === want) {
      return true;
    }
    if (m.aliases.some((a) => normalize(a) === want)) {
      return true;
    }
    return normalize(m.displayName).split(/\s+/)[0] === want;
  });
}

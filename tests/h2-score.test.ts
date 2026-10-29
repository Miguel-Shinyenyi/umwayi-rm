import { describe, expect, it } from "vitest";
import { scoreAnswer } from "../scripts/run-h2.js";

describe("scoreAnswer", () => {
  it("matches names and numbers", () => {
    expect(scoreAnswer("Atieno Auma", "Atieno Auma kept the minutes.")).toBe(true);
    expect(scoreAnswer("Atieno Auma", "Kamau Njoroge kept them.")).toBe(false);
    expect(scoreAnswer("350 shillings", "The book cost 350 shillings.")).toBe(true);
    expect(scoreAnswer("350 shillings", "The book cost 500 shillings.")).toBe(false);
  });

  it("ignores parenthetical remarks in the label", () => {
    expect(scoreAnswer("500 shillings (raised from 400 in Feb 2026)", "500 shillings.")).toBe(true);
    expect(scoreAnswer("500 shillings (raised from 400 in Feb 2026)", "400 shillings.")).toBe(false);
  });

  it("matches number words against digits", () => {
    expect(scoreAnswer("Yes, up to three times savings", "Yes, up to 3 times savings.")).toBe(true);
    expect(scoreAnswer("Yes, up to three times savings", "Yes, up to two times savings.")).toBe(false);
  });

  it("matches short identity answers", () => {
    expect(scoreAnswer("No. It drafts, the treasurer sends.", "No, it drafts and the treasurer sends.")).toBe(true);
    expect(scoreAnswer("No. It drafts, the treasurer sends.", "Yes, it sends reminders itself.")).toBe(false);
    expect(scoreAnswer("No", "No.")).toBe(true);
  });

  it("matches comma numbers and negation forms", () => {
    expect(scoreAnswer("18400 shillings", "The balance was 18,400 shillings.")).toBe(true);
    expect(scoreAnswer("No.", "The system does not advise on lending.")).toBe(true);
    expect(scoreAnswer("No, never.", "It never scores members.")).toBe(true);
    expect(scoreAnswer("Yes, up to three times savings", "No loans are allowed.")).toBe(false);
  });
});

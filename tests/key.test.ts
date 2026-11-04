import { describe, expect, it } from "vitest";
import { BasetenAdapter } from "../src/adapters/baseten.js";
import { basetenKey } from "../src/adapters/key.js";
import { BasetenPhotoReader } from "../src/adapters/vision.js";

describe("basetenKey", () => {
  it("reads the correct spelling", () => {
    expect(basetenKey({ BASETEN_API_KEY: "a" })).toBe("a");
  });
  it("still reads the old misspelling", () => {
    expect(basetenKey({ BASENTEN_API_KEY: "b" })).toBe("b");
  });
  it("prefers the correct spelling when both are set", () => {
    expect(basetenKey({ BASETEN_API_KEY: "a", BASENTEN_API_KEY: "b" })).toBe("a");
  });
  it("returns undefined when neither is set or the value is empty", () => {
    expect(basetenKey({})).toBeUndefined();
    expect(basetenKey({ BASETEN_API_KEY: "" })).toBeUndefined();
  });
  it("builds both live adapters when only the correct spelling is set", () => {
    const savedCorrect = process.env.BASETEN_API_KEY;
    const savedLegacy = process.env.BASENTEN_API_KEY;
    try {
      process.env.BASETEN_API_KEY = "k-correct";
      delete process.env.BASENTEN_API_KEY;
      expect(() => new BasetenAdapter()).not.toThrow();
      expect(() => new BasetenPhotoReader()).not.toThrow();
    } finally {
      if (savedCorrect === undefined) {
        delete process.env.BASETEN_API_KEY;
      } else {
        process.env.BASETEN_API_KEY = savedCorrect;
      }
      if (savedLegacy === undefined) {
        delete process.env.BASENTEN_API_KEY;
      } else {
        process.env.BASENTEN_API_KEY = savedLegacy;
      }
    }
  });
});

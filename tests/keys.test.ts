import { afterEach, describe, expect, it } from "vitest";
import { BasetenAdapter } from "../src/adapters/baseten.js";
import { basetenApiKey } from "../src/adapters/keys.js";
import { BasetenPhotoReader } from "../src/adapters/vision.js";

const SAVED = { correct: process.env.BASETEN_API_KEY, legacy: process.env.BASENTEN_API_KEY };

afterEach(() => {
  if (SAVED.correct === undefined) {
    delete process.env.BASETEN_API_KEY;
  } else {
    process.env.BASETEN_API_KEY = SAVED.correct;
  }
  if (SAVED.legacy === undefined) {
    delete process.env.BASENTEN_API_KEY;
  } else {
    process.env.BASENTEN_API_KEY = SAVED.legacy;
  }
});

function setEnv(correct?: string, legacy?: string): void {
  if (correct === undefined) {
    delete process.env.BASETEN_API_KEY;
  } else {
    process.env.BASETEN_API_KEY = correct;
  }
  if (legacy === undefined) {
    delete process.env.BASENTEN_API_KEY;
  } else {
    process.env.BASENTEN_API_KEY = legacy;
  }
}

describe("baseten key spellings", () => {
  it("reads the correct spelling", () => {
    setEnv("k-correct");
    expect(basetenApiKey()).toBe("k-correct");
  });

  it("still reads the old spelling", () => {
    setEnv(undefined, "k-legacy");
    expect(basetenApiKey()).toBe("k-legacy");
  });

  it("prefers the correct spelling when both are set", () => {
    setEnv("k-correct", "k-legacy");
    expect(basetenApiKey()).toBe("k-correct");
  });

  it("builds the live adapters with only the correct spelling set", () => {
    setEnv("k-correct");
    expect(() => new BasetenAdapter()).not.toThrow();
    expect(() => new BasetenPhotoReader()).not.toThrow();
  });

  it("builds the live adapters with only the old spelling set", () => {
    setEnv(undefined, "k-legacy");
    expect(() => new BasetenAdapter()).not.toThrow();
    expect(() => new BasetenPhotoReader()).not.toThrow();
  });

  it("reports no key with neither set", () => {
    setEnv();
    expect(basetenApiKey()).toBeUndefined();
    expect(() => new BasetenAdapter()).toThrow(/not set/);
    expect(() => new BasetenPhotoReader()).toThrow(/not set/);
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync("public/console.html", "utf8");
const css = readFileSync("public/console.css", "utf8");
const js = readFileSync("public/console.js", "utf8");

describe("console page", () => {
  it("wires the stylesheet, script, and key sections", () => {
    expect(html).toContain('href="/console.css"');
    expect(html).toContain('src="/console.js"');
    for (const id of ["today-list", "note-text", "proposals-list", "entries-list", "findings-list"]) {
      expect(html).toContain(`id="${id}"`);
    }
  });

  it("labels demo data and the model display line", () => {
    expect(html).toContain("Demo data");
    expect(html).toContain("Built with Muse Spark Open");
    expect(html).toContain("synthetic demo records only");
  });

  it("calls the real API routes", () => {
    for (const path of ["/today", "/intake/note", "/intake/page", "/proposals", "/entries", "/findings", "/demo/reset"]) {
      expect(js).toContain(path);
    }
  });

  it("uses the token palette with no alarm red", () => {
    for (const token of ["--canvas", "--surface", "--ink", "--muted", "--accent", "--success", "--private"]) {
      expect(css).toContain(token);
    }
    expect(css.toLowerCase()).toContain("#e9a23b");
    expect(css).not.toMatch(/#ff0000|#f00\b|red;/i);
  });
});

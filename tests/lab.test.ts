import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync("public/lab.html", "utf8");
const js = readFileSync("public/lab.js", "utf8");

describe("lab page", () => {
  it("wires the stylesheet, script, and chart sections", () => {
    expect(html).toContain('href="/console.css"');
    expect(html).toContain('src="/lab.js"');
    expect(html).toContain('id="chart"');
    expect(html).toContain('id="runs-list"');
    expect(html).toContain("Built with Muse Spark Open");
  });

  it("reads the chart from saved run files", () => {
    expect(js).toContain("/lab/runs");
    expect(js).toContain("c3");
    expect(js).not.toContain("38/40");
  });
});

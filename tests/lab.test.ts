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

  it("keeps the runs table readable on narrow screens", () => {
    expect(js).toContain("table-scroll");
    expect(js).toContain("<caption>");
    expect(js).toContain('scope="col"');
  });

  it("splits H1 and H2 charts with named conditions", () => {
    expect(html).toContain('id="chart-h2"');
    expect(js).toContain("chart-h2");
    expect(js).toContain("A core plus archive");
    expect(js).not.toContain("CONDITION_NAMES[condition] || condition");
  });

  it("reads the chart from saved run files", () => {
    expect(js).toContain("/lab/runs");
    expect(js).toContain("c3");
    expect(js).not.toContain("38/40");
  });
});

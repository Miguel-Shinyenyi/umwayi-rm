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
    for (const path of ["/today", "/intake/note", "/intake/page", "/proposals", "/entries", "/findings", "/demo/reset", "/runs/"]) {
      expect(js).toContain(path);
    }
  });

  it("warns before uploading a non-PNG/JPEG photo", () => {
    expect(js).toContain("image/png");
    expect(js).toContain("image/jpeg");
    expect(js).toContain("Use a PNG or JPEG photo");
  });

  it("disables submit buttons while work runs and re-enables after", () => {
    expect(js).toContain("withButton");
    for (const id of ["send-note-btn", "send-audio-btn", "send-page-btn", "connect-btn"]) {
      expect(js).toContain(`withButton("${id}"`);
    }
    expect(js).toContain("finally");
  });

  it("clears panels when connecting without credentials", () => {
    expect(js).toContain("Not connected");
  });

  it("renders finding refs as words, not JSON", () => {
    expect(js).toContain("findingRefsText");
    expect(js).not.toContain("JSON.stringify(item.refs)");
  });

  it("labels the entries member column as ids", () => {
    expect(js).toContain(">Member id</th>");
    expect(js).not.toContain(">Member</th>");
  });

  it("prefixes verification checks with an overall verdict", () => {
    expect(js).toContain("Checks pass:");
    expect(js).toContain("Checks FAIL:");
  });

  it("renders verification trails and run traces", () => {
    expect(js).toContain("verificationHtml");
    expect(js).toContain("showTrace");
    expect(js).toContain("Trace</button>");
    expect(js).toContain("Coverage");
  });

  it("edits entries and answers questions inline", () => {
    expect(js).toContain("showEditor");
    expect(js).toContain("showAnswerBox");
    expect(js).toContain("editsHtml");
    expect(js).toContain("/edit");
    expect(js).toContain("/questions/");
    expect(js).toContain("/answer");
  });

  it("wraps the topbar and proposal actions on narrow screens", () => {
  for (const selector of [".topbar", ".proposal .actions"]) {
    const start = css.indexOf(`${selector} {`);
    const block = css.slice(start, css.indexOf("}", start));
    expect(block).toContain("flex-wrap");
  }
  expect(css).toContain(".table-scroll");
});

  it("keeps tables readable on narrow screens", () => {
    expect(js).toContain("table-scroll");
    expect(js).toContain("<caption>");
    expect(js).toContain('scope="col"');
  });

  it("announces proposal decisions and saved edits", () => {
    expect(js).toContain("Proposal approved.");
    expect(js).toContain("Proposal rejected.");
    expect(js).toContain("Saved edit.");
  });

  it("uses the token palette with no alarm red", () => {
    for (const token of ["--canvas", "--surface", "--ink", "--muted", "--accent", "--success", "--private"]) {
      expect(css).toContain(token);
    }
    expect(css.toLowerCase()).toContain("#e9a23b");
    expect(css).not.toMatch(/#ff0000|#f00\b|red;/i);
  });
});

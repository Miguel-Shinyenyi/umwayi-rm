"use strict";

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const CONDITION_NAMES = {
  c0: "C0 bare",
  c1: "C1 placebo",
  c2: "C2 generic",
  c3: "C3 curated",
};

async function load() {
  const chart = document.getElementById("chart");
  const list = document.getElementById("runs-list");
  try {
    const res = await fetch("/lab/runs");
    if (!res.ok) {
      throw new Error(`cannot load runs: ${res.status}`);
    }
    const data = await res.json();
    const testRuns = data.runs.filter((r) => r.split === "test" && r.condition);
    if (testRuns.length === 0) {
      chart.innerHTML = '<p class="empty">No counted test runs saved yet.</p>';
    } else {
      const latest = new Map();
      for (const run of testRuns) {
        latest.set(run.condition, run);
      }
      const rows = [...latest.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      chart.innerHTML = rows
        .map(([condition, run]) => {
          const pct = run.total === 0 ? 0 : Math.round((100 * run.passed) / run.total);
          return `<div class="queue-item"><span class="title">${escapeHtml(CONDITION_NAMES[condition] || condition)}</span>
            <div class="muted">${escapeHtml(run.passed)} of ${escapeHtml(run.total)} passed, seed ${escapeHtml(run.seed)}</div>
            <div role="img" aria-label="${escapeHtml(condition)} pass rate ${pct} percent" style="background: var(--inset); border: 1px solid var(--hairline); border-radius: 6px; height: 18px; margin-top: 6px;">
              <div style="width: ${pct}%; height: 100%; background: var(--accent); border-radius: 5px;"></div>
            </div></div>`;
        })
        .join("");
    }
    if (data.runs.length === 0) {
      list.innerHTML = '<p class="empty">No runs saved yet.</p>';
    } else {
      list.innerHTML = `<div class="table-scroll"><table class="entries"><caption>Saved eval runs</caption><thead><tr><th scope="col">File</th><th scope="col">Model</th><th scope="col">Prompt</th><th scope="col">Seed</th><th scope="col">Score</th></tr></thead><tbody>${data.runs
        .map(
          (r) => `<tr><td>${escapeHtml(r.file)}</td><td>${escapeHtml(r.modelId)}</td><td>${escapeHtml(r.promptVersion)}</td><td>${escapeHtml(r.seed)}</td><td>${escapeHtml(r.passed)}/${escapeHtml(r.total)}</td></tr>`,
        )
        .join("")}</tbody></table></div>`;
    }
  } catch (err) {
    chart.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
    list.innerHTML = "";
  }
}

load();

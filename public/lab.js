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

const H2_NAMES = {
  a: "A core plus archive",
  f: "F full context",
  r: "R plain retrieval",
  t: "T truncation",
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
    const renderChart = (el, names, runs) => {
      const latest = new Map();
      for (const run of runs) {
        if (names[run.condition]) {
          latest.set(run.condition, run);
        }
      }
      if (latest.size === 0) {
        el.innerHTML = '<p class="empty">No counted test runs saved yet.</p>';
        return;
      }
      const rows = [...latest.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      el.innerHTML = rows
        .map(([condition, run]) => {
          const pct = run.total === 0 ? 0 : Math.round((100 * run.passed) / run.total);
          return `<div class="queue-item"><span class="title">${escapeHtml(names[condition])}</span>
            <div class="muted">${escapeHtml(run.passed)} of ${escapeHtml(run.total)} passed, seed ${escapeHtml(run.seed)}</div>
            <div role="img" aria-label="${escapeHtml(names[condition])} pass rate ${pct} percent" style="background: var(--inset); border: 1px solid var(--hairline); border-radius: 6px; height: 18px; margin-top: 6px;">
              <div style="width: ${pct}%; height: 100%; background: var(--accent); border-radius: 5px;"></div>
            </div></div>`;
        })
        .join("");
    };
    renderChart(chart, CONDITION_NAMES, testRuns.filter((r) => r.promptVersion !== "h2-core-v0"));
    const h2chart = document.getElementById("chart-h2");
    if (h2chart) {
      renderChart(h2chart, H2_NAMES, testRuns.filter((r) => r.promptVersion === "h2-core-v0"));
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

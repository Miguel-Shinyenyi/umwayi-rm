"use strict";

const store = {
  load() {
    return {
      groupId: localStorage.getItem("umwayi.groupId") || "",
      token: localStorage.getItem("umwayi.token") || "",
    };
  },
  save(groupId, token) {
    localStorage.setItem("umwayi.groupId", groupId);
    localStorage.setItem("umwayi.token", token);
  },
};

function creds() {
  return {
    groupId: document.getElementById("group-id").value.trim(),
    token: document.getElementById("token").value.trim(),
  };
}

async function api(path, options = {}) {
  const { token } = creds();
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data.error && data.error.message) || `request failed: ${res.status}`);
  }
  return data;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function setStatus(id, text, isError = false) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = isError ? "error" : "muted";
}

async function refreshToday() {
  const { groupId } = creds();
  const box = document.getElementById("today-list");
  try {
    const data = await api(`/groups/${encodeURIComponent(groupId)}/today`);
    if (data.items.length === 0) {
      box.innerHTML = '<p class="empty">Nothing due. The list is clear.</p>';
      return;
    }
    box.innerHTML = data.items
      .map((item) => {
        if (item.category === "overdue") {
          return `<div class="queue-item"><span class="badge due">Overdue</span><span class="title">${escapeHtml(item.displayName)}</span><div class="muted">${escapeHtml(item.kind)} ${escapeHtml(item.amount)} KES, due ${escapeHtml(item.dueDate)}, period ${escapeHtml(item.period)}</div></div>`;
        }
        if (item.category === "finding") {
          return `<div class="queue-item"><span class="badge">Finding</span><span class="title">${escapeHtml(item.kind)}</span><div class="muted">${escapeHtml(JSON.stringify(item.refs))}</div></div>`;
        }
        return `<div class="queue-item"><span class="badge">Question</span><span class="title">${escapeHtml(item.text)}</span></div>`;
      })
      .join("");
  } catch (err) {
    box.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

function proposalBody(p) {
  if (p.type === "entry") {
    const q = p.payload;
    return `<div>Propose entry: member ${escapeHtml(q.memberId)}, ${escapeHtml(q.kind)}, ${escapeHtml(q.amount)} KES, ${escapeHtml(q.period)}.</div>`;
  }
  if (p.type === "question") {
    return `<div>Question: ${escapeHtml(p.payload.text || "")}</div>`;
  }
  return `<div>Reminder draft: ${escapeHtml((p.payload.text || "").slice(0, 200))}</div>`;
}

async function refreshProposals() {
  const { groupId } = creds();
  const box = document.getElementById("proposals-list");
  try {
    const data = await api(`/groups/${encodeURIComponent(groupId)}/proposals?status=pending`);
    if (data.proposals.length === 0) {
      box.innerHTML = '<p class="empty">No pending proposals.</p>';
      return;
    }
    box.innerHTML = data.proposals
      .map(
        (p) => `<article class="proposal" data-id="${escapeHtml(p.id)}">
          <span class="draft-label">AI draft, not applied</span>
          ${proposalBody(p)}
          ${(p.quotes || []).map((q) => `<blockquote>${escapeHtml(q)}</blockquote>`).join("")}
          ${verificationHtml(p)}
          <div class="trace" hidden></div>
          <div class="actions">
            <button type="button" class="primary" data-act="approve">Approve</button>
            <button type="button" data-act="reject">Reject</button>
            ${p.runId ? `<button type="button" data-run="${escapeHtml(p.runId)}">Trace</button>` : ""}
          </div>
        </article>`,
      )
      .join("");
    box.querySelectorAll("button[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => decideProposal(btn.closest(".proposal").dataset.id, btn.dataset.act, btn));
    });
    box.querySelectorAll("button[data-run]").forEach((btn) => {
      btn.addEventListener("click", () => showTrace(btn.closest(".proposal"), btn.dataset.run, btn));
    });
  } catch (err) {
    box.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

function verificationHtml(p) {
  if (!p.verification || !p.verification.checks) {
    return "";
  }
  const items = p.verification.checks
    .map((c) => `<li>${c.passed ? "pass" : "FAIL"} ${escapeHtml(c.name)}${c.detail ? ` (${escapeHtml(c.detail)})` : ""}</li>`)
    .join("");
  return `<div class="muted">Checks:<ul>${items}</ul></div>`;
}

async function showTrace(article, runId, btn) {
  const box = article.querySelector(".trace");
  btn.disabled = true;
  try {
    const data = await api(`/runs/${encodeURIComponent(runId)}`);
    const steps = data.run.steps
      .map((s) => `<div class="queue-item"><span class="title">Turn ${escapeHtml(s.index)}</span><div class="muted">${escapeHtml((s.calls || []).join(", ") || "no tool call")}</div></div>`)
      .join("");
    box.innerHTML = `<div class="muted">Model ${escapeHtml(data.run.modelId)}, ${escapeHtml(data.run.promptVersion)}, status ${escapeHtml(data.run.status)}. Coverage ${escapeHtml(data.coverage.covered)}/${escapeHtml(data.coverage.lines)} lines.</div>${steps}`;
    box.hidden = false;
  } catch (err) {
    box.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
    box.hidden = false;
  }
}

async function decideProposal(id, act, btn) {
  btn.disabled = true;
  try {
    await api(`/proposals/${encodeURIComponent(id)}/${act}`, { method: "POST", body: "{}" });
    await refreshProposals();
    await refreshToday();
    await refreshEntries();
  } catch (err) {
    setStatus("connection-status", err.message, true);
    btn.disabled = false;
  }
}

async function refreshEntries() {
  const { groupId } = creds();
  const box = document.getElementById("entries-list");
  try {
    const data = await api(`/groups/${encodeURIComponent(groupId)}/entries`);
    if (data.entries.length === 0) {
      box.innerHTML = '<p class="empty">No entries yet.</p>';
      return;
    }
    box.innerHTML = `<table class="entries"><thead><tr><th>Member</th><th>Kind</th><th>Amount</th><th>Period</th><th>Tier</th></tr></thead><tbody>${data.entries
      .map(
        (e) => `<tr><td>${escapeHtml(e.memberId)}</td><td>${escapeHtml(e.kind)}</td><td>${escapeHtml(e.amount)}</td><td>${escapeHtml(e.period)}</td><td>${escapeHtml(e.evidenceTier)}</td></tr>`,
      )
      .join("")}</tbody></table>`;
  } catch (err) {
    box.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

async function refreshFindings() {
  const { groupId } = creds();
  const box = document.getElementById("findings-list");
  try {
    const data = await api(`/groups/${encodeURIComponent(groupId)}/findings?status=open`);
    box.innerHTML =
      data.findings.length === 0
        ? ""
        : `<h3 class="muted">Open findings</h3>` +
          data.findings.map((f) => `<div class="queue-item"><span class="badge">Finding</span><span class="title">${escapeHtml(f.kind)}</span></div>`).join("");
  } catch (err) {
    box.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("cannot read file"));
    reader.readAsDataURL(file);
  });
}

async function connect() {
  const { groupId, token } = creds();
  if (!groupId || !token) {
    setStatus("connection-status", "Enter the group id and token first.", true);
    return;
  }
  store.save(groupId, token);
  setStatus("connection-status", "Connected.");
  await Promise.all([refreshToday(), refreshProposals(), refreshEntries(), refreshFindings()]);
}

async function resetDemo() {
  setStatus("connection-status", "Resetting…");
  try {
    const res = await fetch("/demo/reset", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data.error && data.error.message) || `reset failed: ${res.status}`);
    }
    document.getElementById("group-id").value = data.group.id;
    document.getElementById("token").value = data.token;
    await connect();
  } catch (err) {
    setStatus("connection-status", err.message, true);
  }
}

async function sendNote() {
  const text = document.getElementById("note-text").value.trim();
  if (!text) {
    setStatus("intake-status", "Write a note first.", true);
    return;
  }
  setStatus("intake-status", "Sending…");
  try {
    const { groupId } = creds();
    const data = await api(`/groups/${encodeURIComponent(groupId)}/intake/note`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    setStatus("intake-status", `Run finished: ${data.outcome.kind}, ${data.proposals.length} proposal(s).`);
    document.getElementById("note-text").value = "";
    await refreshProposals();
    await refreshToday();
  } catch (err) {
    setStatus("intake-status", err.message, true);
  }
}

async function sendAudio() {
  const file = document.getElementById("audio-file").files[0];
  if (!file) {
    setStatus("intake-status", "Choose a WAV file first.", true);
    return;
  }
  setStatus("intake-status", "Transcribing and reading…");
  try {
    const { groupId } = creds();
    const audio = await readFileAsBase64(file);
    const data = await api(`/groups/${encodeURIComponent(groupId)}/intake/note`, {
      method: "POST",
      body: JSON.stringify({ audio }),
    });
    setStatus("intake-status", `Run finished: ${data.outcome.kind}, ${data.proposals.length} proposal(s).`);
    await refreshProposals();
    await refreshToday();
  } catch (err) {
    setStatus("intake-status", err.message, true);
  }
}

async function sendPage() {
  const file = document.getElementById("page-file").files[0];
  if (!file) {
    setStatus("page-status", "Choose a photo first.", true);
    return;
  }
  setStatus("page-status", "Reading page…");
  try {
    const { groupId } = creds();
    const image = await readFileAsBase64(file);
    const data = await api(`/groups/${encodeURIComponent(groupId)}/intake/page`, {
      method: "POST",
      body: JSON.stringify({ image, mime: file.type }),
    });
    setStatus("page-status", `Read ${data.rows.length} row(s): ${data.proposals.length} proposal(s), ${data.findings.length} finding(s).`);
    await refreshProposals();
    await refreshFindings();
  } catch (err) {
    setStatus("page-status", err.message, true);
  }
}

document.getElementById("connect-btn").addEventListener("click", connect);
document.getElementById("reset-btn").addEventListener("click", resetDemo);
document.getElementById("send-note-btn").addEventListener("click", sendNote);
document.getElementById("send-audio-btn").addEventListener("click", sendAudio);
document.getElementById("send-page-btn").addEventListener("click", sendPage);
document.getElementById("refresh-proposals-btn").addEventListener("click", refreshProposals);
document.getElementById("refresh-entries-btn").addEventListener("click", refreshEntries);

(function init() {
  const saved = store.load();
  document.getElementById("group-id").value = saved.groupId;
  document.getElementById("token").value = saved.token;
})();

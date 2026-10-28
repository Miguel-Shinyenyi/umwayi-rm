import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { BasetenAdapter } from "../src/adapters/baseten.js";
import { DEFAULT_MODEL_OPTIONS } from "../src/adapters/model.js";
import { runLoop } from "../src/agent/loop.js";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { createMcpServer } from "../src/mcp/server.js";

const PACK_VERSION = "pack-v0";

interface EvalScenario {
  id: string;
  split: string;
  text: string;
  expected: "propose" | "ask";
  expected_entry: {
    member_id: string;
    kind: string;
    amount: number;
    period: string;
  } | null;
}

interface EvalMember {
  id: string;
  display_name: string;
  aliases: string[];
}

function arg(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? (process.argv[index + 1] as string) : fallback;
}

function trimResult(name: string, result: unknown): unknown {
  if (name === "get_member_list") {
    const members = (result as { members?: unknown[] }).members;
    return { members: Array.isArray(members) ? members.length : 0 };
  }
  if (name === "get_ledger_page") {
    const entries = (result as { entries?: unknown[] }).entries;
    return { entries: Array.isArray(entries) ? entries.length : 0 };
  }
  return result;
}

async function main(): Promise<void> {
  const outPath = arg("--out", "docs/evals/dev-h1.json");
  const split = arg("--split", "dev");
  const seed = Number(arg("--seed", "7"));
  const limit = Number(arg("--limit", "0"));
  const scenariosFile = arg("--scenarios", "evals/h1/scenarios.json");
  const groupFile = arg("--group", "evals/h1/group.json");

  const scenarios = (
    JSON.parse(await readFile(scenariosFile, "utf8")) as { scenarios: EvalScenario[] }
  ).scenarios.filter((s) => s.split === split);
  const members = (
    JSON.parse(await readFile(groupFile, "utf8")) as { members: EvalMember[] }
  ).members;
  const nameById = new Map(members.map((m) => [m.id, m.display_name]));
  const playbook = await readFile("agent/pack/playbook.md", "utf8");
  const rules = await readFile("agent/pack/rules.md", "utf8");
  const todayLine = `Today is ${new Date().toISOString().slice(0, 10)} (Africa/Nairobi). Resolve month names against this date.`;
  const systemPrompt = `${todayLine}\n\n${playbook}\n\n${rules}`;
  const adapter = new BasetenAdapter();
  const options = { ...DEFAULT_MODEL_OPTIONS, seed };

  const picked = limit > 0 ? scenarios.slice(0, limit) : scenarios;
  const results: Record<string, unknown>[] = [];
  const confusion = { proposePropose: 0, proposeAsk: 0, askPropose: 0, askAsk: 0, other: 0 };

  for (const scenario of picked) {
    const store = new MemoryLedgerStore();
    const seeded = await store.createGroup("H1 fixture group");
    const idByName = new Map<string, string>();
    for (const member of members) {
      const created = await store.createMember(seeded.token, {
        groupId: seeded.group.id,
        displayName: member.display_name,
        aliases: member.aliases,
      });
      idByName.set(member.display_name, created.id);
    }
    const server = createMcpServer({
      store,
      token: seeded.token,
      groupId: seeded.group.id,
      run: { intakeText: scenario.text, refusals: 0 },
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "h1-runner", version: "0.1.0" });
    let outcome: { kind: string; proposalId?: string; detail?: string } = {
      kind: "error",
      detail: "not run",
    };
    let turns = 0;
    let traceSummary: unknown[] = [];
    try {
      await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
      const trace = await runLoop(adapter, client, systemPrompt, scenario.text, options);
      outcome = trace.outcome;
      turns = trace.turns.length;
      traceSummary = trace.turns.map((t) => ({
        content: typeof t.content === "string" ? t.content.slice(0, 200) : null,
        calls: t.toolCalls.map((c) => c.name),
        results: t.toolResults.map((r) => trimResult(r.name, r.result)),
      }));
    } catch (err) {
      outcome = { kind: "error", detail: (err as Error).message };
    } finally {
      await client.close().catch(() => undefined);
      await server.close().catch(() => undefined);
    }

    let pass = false;
    let note = "";
    const gotPropose = outcome.kind === "proposed";
    const gotAsk = outcome.kind === "questioned";
    if (scenario.expected === "ask") {
      pass = gotAsk;
      if (gotPropose) {
        confusion.askPropose += 1;
        note = "asked for a question, model proposed";
      } else if (gotAsk) {
        confusion.askAsk += 1;
      } else {
        confusion.other += 1;
        note = `asked for a question, got ${outcome.kind}`;
      }
    } else {
      if (!gotPropose) {
        confusion.proposeAsk += gotAsk ? 1 : 0;
        if (!gotAsk) {
          confusion.other += 1;
        }
        note = `asked for a proposal, got ${outcome.kind}`;
      } else {
        const proposals = await store.listProposals(seeded.token, seeded.group.id);
        const proposal = proposals.find(
          (p) => p.id === (outcome as { proposalId: string }).proposalId,
        );
        const payload = (proposal?.payload ?? {}) as Record<string, unknown>;
        const expected = scenario.expected_entry as unknown as Record<string, unknown>;
        const gotMemberId = payload.memberId as string;
        const gotName = [...idByName.entries()].find(([, id]) => id === gotMemberId)?.[0] ?? gotMemberId;
        const wantName = nameById.get(expected.member_id as string) ?? expected.member_id;
        pass =
          gotName === wantName &&
          payload.kind === expected.kind &&
          payload.amount === expected.amount &&
          payload.period === expected.period;
        if (pass) {
          confusion.proposePropose += 1;
        } else {
          confusion.proposeAsk += 1;
          note = `entry mismatch: want ${wantName} ${String(expected.kind)} ${String(expected.amount)} ${String(expected.period)}, got ${gotName} ${String(payload.kind)} ${String(payload.amount)} ${String(payload.period)}`;
        }
      }
    }
    results.push({
      id: scenario.id,
      expected: scenario.expected,
      outcome: outcome.kind,
      pass,
      turns,
      note,
      trace: traceSummary,
    });
    console.log(`${scenario.id}: expected=${scenario.expected} got=${outcome.kind} pass=${pass} turns=${turns}${note ? ` note=${note}` : ""}`);
  }

  const passed = results.filter((r) => r.pass === true).length;
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(
    outPath,
    JSON.stringify(
      {
        modelId: adapter.modelId,
        date: new Date().toISOString(),
        promptVersion: PACK_VERSION,
        seed,
        split,
        passed,
        total: results.length,
        confusion,
        scenarios: results,
      },
      null,
      2,
    ),
  );
  console.log(`saved ${outPath}: ${passed}/${results.length} passed`);
}

await main();

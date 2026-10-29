import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { BasetenAdapter } from "../src/adapters/baseten.js";
import { DEFAULT_MODEL_OPTIONS, type ModelAdapter } from "../src/adapters/model.js";
import { runLoop } from "../src/agent/loop.js";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import { createMcpServer } from "../src/mcp/server.js";

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

const PROMPT_VERSIONS: Record<string, string> = {
  c0: "c0-bare",
  c1: "c1-placebo",
  c2: "c2-generic",
  c3: "pack-v0",
};

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

export class CountingAdapter implements ModelAdapter {
  promptTokens = 0;
  completionTokens = 0;

  constructor(private readonly inner: ModelAdapter) {}

  get modelId(): string {
    return this.inner.modelId;
  }

  async chat(
    messages: Parameters<ModelAdapter["chat"]>[0],
    options: Parameters<ModelAdapter["chat"]>[1],
    tools?: Parameters<ModelAdapter["chat"]>[2],
  ): Promise<Awaited<ReturnType<ModelAdapter["chat"]>>> {
    const result = await this.inner.chat(messages, options, tools);
    this.promptTokens += result.usage?.promptTokens ?? 0;
    this.completionTokens += result.usage?.completionTokens ?? 0;
    return result;
  }
}

interface AttemptInput {
  scenario: EvalScenario;
  members: EvalMember[];
  systemPrompt: string;
  adapter: CountingAdapter;
  options: typeof DEFAULT_MODEL_OPTIONS;
}

async function runAttempt(input: AttemptInput): Promise<{
  outcome: { kind: string; proposalId?: string; detail?: string };
  turns: number;
  trace: unknown[];
  proposals: { id: string; payload: Record<string, unknown> }[];
  idByName: Map<string, string>;
}> {
  const store = new MemoryLedgerStore();
  const seeded = await store.createGroup("H1 fixture group");
  const idByName = new Map<string, string>();
  for (const member of input.members) {
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
    runId: null,
    run: { intakeText: input.scenario.text, refusals: 0 },
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "h1-runner", version: "0.1.0" });
  try {
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
    const trace = await runLoop(input.adapter, client, input.systemPrompt, input.scenario.text, input.options);
    const proposals = await store.listProposals(seeded.token, seeded.group.id);
    return {
      outcome: trace.outcome,
      turns: trace.turns.length,
      trace: trace.turns.map((t) => ({
        content: typeof t.content === "string" ? t.content.slice(0, 200) : null,
        calls: t.toolCalls.map((c) => c.name),
        results: t.toolResults.map((r) => trimResult(r.name, r.result)),
      })),
      proposals: proposals.map((p) => ({ id: p.id, payload: p.payload })),
      idByName,
    };
  } finally {
    await client.close().catch(() => undefined);
    await server.close().catch(() => undefined);
  }
}

function isEmptyCompletion(outcome: { kind: string; detail?: string }): boolean {
  return outcome.kind === "unfinished" && (outcome.detail ?? "").includes("without a tool call");
}

async function main(): Promise<void> {
  const outPath = arg("--out", "docs/evals/dev-h1.json");
  const split = arg("--split", "dev");
  const seed = Number(arg("--seed", "7"));
  const limit = Number(arg("--limit", "0"));
  const retries = Number(arg("--retries", "2"));
  const condition = arg("--condition", "c3");
  const scenariosFile = arg("--scenarios", "evals/h1/scenarios.json");
  const groupFile = arg("--group", "evals/h1/group.json");
  if (!PROMPT_VERSIONS[condition]) {
    throw new Error(`unknown condition: ${condition}`);
  }

  const scenarios = (
    JSON.parse(await readFile(scenariosFile, "utf8")) as { scenarios: EvalScenario[] }
  ).scenarios.filter((s) => s.split === split);
  const members = (
    JSON.parse(await readFile(groupFile, "utf8")) as { members: EvalMember[] }
  ).members;
  const nameById = new Map(members.map((m) => [m.id, m.display_name]));
  const todayLine = `Today is ${new Date().toISOString().slice(0, 10)} (Africa/Nairobi). Resolve month names against this date.`;
  let body = "";
  if (condition === "c1") {
    body = await readFile("evals/h1/conditions/c1-placebo.md", "utf8");
  } else if (condition === "c2") {
    body = await readFile("evals/h1/conditions/c2-generic.md", "utf8");
  } else if (condition === "c3") {
    const playbook = await readFile("agent/pack/playbook.md", "utf8");
    const rules = await readFile("agent/pack/rules.md", "utf8");
    body = `${playbook}\n\n${rules}`;
  }
  const systemPrompt = body === "" ? todayLine : `${todayLine}\n\n${body}`;
  const adapter = new CountingAdapter(new BasetenAdapter());
  const options = { ...DEFAULT_MODEL_OPTIONS, seed };

  const picked = limit > 0 ? scenarios.slice(0, limit) : scenarios;
  const results: Record<string, unknown>[] = [];
  const confusion = { proposePropose: 0, proposeAsk: 0, askPropose: 0, askAsk: 0, other: 0 };
  let totalPrompt = 0;
  let totalCompletion = 0;
  let totalRetries = 0;

  for (const scenario of picked) {
    const before = { prompt: adapter.promptTokens, completion: adapter.completionTokens };
    let attempt = await runAttempt({ scenario, members, systemPrompt, adapter, options });
    let attempts = 1;
    while (
      (isEmptyCompletion(attempt.outcome) || attempt.outcome.kind === "error") &&
      attempts <= retries
    ) {
      attempts += 1;
      totalRetries += 1;
      attempt = await runAttempt({ scenario, members, systemPrompt, adapter, options });
    }
    const tokens = {
      prompt: adapter.promptTokens - before.prompt,
      completion: adapter.completionTokens - before.completion,
    };
    totalPrompt += tokens.prompt;
    totalCompletion += tokens.completion;
    const outcome = attempt.outcome;

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
        const proposal = attempt.proposals.find((p) => p.id === outcome.proposalId);
        const payload = (proposal?.payload ?? {}) as Record<string, unknown>;
        const expected = scenario.expected_entry as unknown as Record<string, unknown>;
        const gotMemberId = payload.memberId as string;
        const gotName =
          [...attempt.idByName.entries()].find(([, id]) => id === gotMemberId)?.[0] ?? gotMemberId;
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
      detail: outcome.detail ?? "",
      pass,
      turns: attempt.turns,
      attempts,
      tokens,
      note,
      trace: attempt.trace,
    });
    console.log(
      `${scenario.id}: expected=${scenario.expected} got=${outcome.kind} pass=${pass} turns=${attempt.turns} attempts=${attempts} tokens=${tokens.prompt + tokens.completion}${note ? ` note=${note}` : ""}`,
    );
  }

  const passed = results.filter((r) => r.pass === true).length;
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(
    outPath,
    JSON.stringify(
      {
        modelId: adapter.modelId,
        date: new Date().toISOString(),
        promptVersion: PROMPT_VERSIONS[condition],
        condition,
        seed,
        split,
        retries,
        passed,
        total: results.length,
        tokens: { prompt: totalPrompt, completion: totalCompletion },
        confusion,
        scenarios: results,
      },
      null,
      2,
    ),
  );
  console.log(`saved ${outPath}: ${passed}/${results.length} passed`);
}

const isMain = process.argv[1]?.endsWith("run-h1.ts") || process.argv[1]?.endsWith("run-h1.js");
if (isMain) {
  await main();
}

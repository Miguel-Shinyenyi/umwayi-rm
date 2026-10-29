import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { z } from "zod";
import { BasetenAdapter } from "../src/adapters/baseten.js";
import { DEFAULT_MODEL_OPTIONS } from "../src/adapters/model.js";
import { runLoop } from "../src/agent/loop.js";
import { MemoryLedgerStore } from "../src/ledger/memory.js";
import type { ArchiveKind } from "../src/ledger/types.js";
import { handleRecall } from "../src/mcp/tools.js";
import { CountingAdapter } from "./run-h1.js";

const PROMPT_VERSION = "h2-core-v0";
const CONDITIONS = ["t", "r", "a", "f"] as const;
type Condition = (typeof CONDITIONS)[number];

interface EvalQuestion {
  id: string;
  split: string;
  kind: "needle" | "stale" | "identity";
  question: string;
  expected: string;
}

interface HistoryItem {
  slug: string;
  kind: ArchiveKind;
  gist: string;
  verbatim: string;
}

const NUMBER_WORDS: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
};

const STOP = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "by", "of", "to",
  "in", "on", "at", "for", "and", "or", "as", "it", "its", "up", "from", "with",
  "that", "this", "does", "do", "what", "when", "which", "who", "how",
]);

function stem(token: string): string {
  if (/^[0-9]+$/.test(token) || token.length <= 3 || token.endsWith("ss")) {
    return token;
  }
  return token.endsWith("s") ? token.slice(0, -1) : token;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/n't\b/g, " not")
    .replace(/(?<=[0-9]),(?=[0-9])/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 || /^[0-9]+$/.test(t))
    .map((t) => (t === "not" || t === "never" ? "no" : (NUMBER_WORDS[t] ?? t)))
    .filter((t) => !STOP.has(t))
    .map((t) => stem(t));
}

export function scoreAnswer(expected: string, answer: string): boolean {
  const main = expected.replace(/\s*\([^)]*\)/g, "");
  const want = tokenize(main);
  if (want.length === 0) {
    return false;
  }
  const got = new Set(tokenize(answer));
  return want.every((t) => got.has(t));
}

function arg(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? (process.argv[index + 1] as string) : fallback;
}

function kindOf(slug: string): ArchiveKind {
  if (slug.startsWith("meeting-")) return "meeting";
  if (slug.startsWith("ledger-")) return "ledger_month";
  return "constitution";
}

async function loadHistory(dir: string): Promise<HistoryItem[]> {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
  const items: HistoryItem[] = [];
  for (const file of files) {
    const verbatim = await readFile(join(dir, file), "utf8");
    const gistLine = verbatim.split("\n").find((line) => line.startsWith("Gist: "));
    if (!gistLine) {
      throw new Error(`missing gist in ${file}`);
    }
    const slug = file.slice(0, -".md".length);
    items.push({ slug, kind: kindOf(slug), gist: gistLine.slice("Gist: ".length), verbatim });
  }
  return items;
}

function retrieve(question: string, items: HistoryItem[], k: number): HistoryItem[] {
  const want = new Set(tokenize(question));
  const scored = items.map((item) => {
    const got = new Set(tokenize(`${item.gist} ${item.verbatim}`));
    let overlap = 0;
    for (const token of want) {
      if (got.has(token)) {
        overlap += 1;
      }
    }
    return { item, overlap };
  });
  scored.sort((a, b) => b.overlap - a.overlap || a.item.slug.localeCompare(b.item.slug));
  return scored.slice(0, k).map((s) => s.item);
}

function recentItems(items: HistoryItem[], k: number): HistoryItem[] {
  const dated = items.filter((item) => /-\d{4}-\d{2}$/.test(item.slug));
  dated.sort((a, b) => b.slug.localeCompare(a.slug));
  return dated.slice(0, k);
}

function buildPrompt(core: string, context: string, forLoop: boolean): string {
  const task = forLoop
    ? "Read the core and the gist index below. Call recall with a pointer to read any item verbatim. When you have the answer, call answer_question with it in one or two sentences. Do not write the answer as plain text."
    : "Read the core and context below, then answer the question in one or two sentences.";
  return `${core}\n\n${context}\n\n${task}`;
}

function createAnswerServer(
  store: MemoryLedgerStore,
  token: string,
  groupId: string,
): McpServer {
  const server = new McpServer({ name: "h2-runner", version: "0.1.0" });
  const deps = { store, token, groupId, run: { intakeText: "", refusals: 0 } };
  server.registerTool(
    "recall",
    {
      description: "Read one archive item verbatim by pointer.",
      inputSchema: { pointer: z.string() },
    },
    async (args) => ({
      content: [{ type: "text" as const, text: JSON.stringify(await handleRecall(deps, args)) }],
    }),
  );
  server.registerTool(
    "answer_question",
    {
      description: "Give the final answer to the question.",
      inputSchema: { answer: z.string() },
    },
    async (args) => ({
      content: [{ type: "text" as const, text: JSON.stringify({ answer: args.answer }) }],
    }),
  );
  return server;
}

interface AttemptResult {
  answer: string;
  answeredVia: "tool" | "content" | "none";
  recalls: { pointer: string; sha256: string }[];
  turns: number;
  note: string;
}

async function runSingleShot(
  adapter: CountingAdapter,
  systemPrompt: string,
  question: string,
): Promise<AttemptResult> {
  const result = await adapter.chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    DEFAULT_MODEL_OPTIONS,
  );
  if (!result.content || result.content.trim() === "") {
    return { answer: "", answeredVia: "none", recalls: [], turns: 1, note: "empty completion" };
  }
  return { answer: result.content, answeredVia: "content", recalls: [], turns: 1, note: "" };
}

async function runAgentic(
  adapter: CountingAdapter,
  systemPrompt: string,
  question: string,
  items: HistoryItem[],
): Promise<AttemptResult> {
  const store = new MemoryLedgerStore();
  const seeded = await store.createGroup("H2 fixture group");
  const idBySlug = new Map<string, string>();
  for (const item of items) {
    const saved = await store.saveArchiveItem(seeded.token, {
      groupId: seeded.group.id,
      kind: item.kind,
      verbatim: item.verbatim,
      gist: item.gist,
    });
    idBySlug.set(item.slug, saved.id);
  }
  const indexed = systemPrompt
    .split("\n")
    .map((line) => {
      const match = line.match(/^pointer:([a-z0-9-]+) \| /);
      if (match) {
        return line.replace(match[1] as string, idBySlug.get(match[1] as string) ?? (match[1] as string));
      }
      return line;
    })
    .join("\n");
  const server = createAnswerServer(store, seeded.token, seeded.group.id);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "h2-runner", version: "0.1.0" });
  try {
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
    const trace = await runLoop(adapter, client, indexed, question, DEFAULT_MODEL_OPTIONS);
    const recalls: { pointer: string; sha256: string; gist: string }[] = [];
    for (const turn of trace.turns) {
      for (const result of turn.toolResults) {
        if (result.name === "recall" && !result.isError) {
          const payload = result.result as { sha256?: unknown; gist?: unknown };
          const call = turn.toolCalls.find((c) => c.id === result.id);
          recalls.push({
            pointer: String((call?.arguments as { pointer?: unknown })?.pointer ?? ""),
            sha256: typeof payload.sha256 === "string" ? payload.sha256 : "",
            gist: typeof payload.gist === "string" ? payload.gist : "",
          });
        }
      }
    }
    if (trace.outcome.kind === "answered") {
      return { answer: trace.outcome.text, answeredVia: "tool", recalls, turns: trace.turns.length, note: "" };
    }
    const lastContent = trace.turns.length > 0 ? (trace.turns[trace.turns.length - 1]?.content ?? "") : "";
    if (lastContent.trim() !== "") {
      return {
        answer: lastContent,
        answeredVia: "content",
        recalls,
        turns: trace.turns.length,
        note: `answered in content after ${trace.outcome.kind}`,
      };
    }
    const detail = trace.outcome.kind === "error" || trace.outcome.kind === "unfinished" || trace.outcome.kind === "other"
      ? ` ${trace.outcome.detail}`
      : "";
    return { answer: "", answeredVia: "none", recalls, turns: trace.turns.length, note: `no answer: ${trace.outcome.kind}${detail}` };
  } finally {
    await client.close().catch(() => undefined);
    await server.close().catch(() => undefined);
  }
}

async function main(): Promise<void> {
  const outPath = arg("--out", "docs/evals/dev-h2.json");
  const split = arg("--split", "dev");
  const seed = Number(arg("--seed", "7"));
  const limit = Number(arg("--limit", "0"));
  const retries = Number(arg("--retries", "2"));
  const condition = arg("--condition", "a") as Condition;
  const questionsFile = arg("--questions", "evals/h2/questions.json");
  const historyDir = arg("--history", "evals/h2/history");
  const coreFile = arg("--core", "evals/h2/core.md");
  if (!CONDITIONS.includes(condition)) {
    throw new Error(`unknown condition: ${condition}`);
  }

  const questions = (
    JSON.parse(await readFile(questionsFile, "utf8")) as { questions: EvalQuestion[] }
  ).questions.filter((q) => q.split === split);
  const items = await loadHistory(historyDir);
  const core = await readFile(coreFile, "utf8");
  const constitution = items.find((i) => i.slug === "constitution");
  const adapter = new CountingAdapter(new BasetenAdapter());
  const options = { ...DEFAULT_MODEL_OPTIONS, seed };

  const picked = limit > 0 ? questions.slice(0, limit) : questions;
  const results: Record<string, unknown>[] = [];
  const byKind: Record<string, { pass: number; total: number }> = {
    needle: { pass: 0, total: 0 },
    stale: { pass: 0, total: 0 },
    identity: { pass: 0, total: 0 },
  };
  let totalPrompt = 0;
  let totalCompletion = 0;
  let totalRecalls = 0;

  for (const question of picked) {
    let systemPrompt: string;
    if (condition === "t") {
      const recent = recentItems(items, 4);
      systemPrompt = buildPrompt(
        core,
        [constitution, ...recent].map((i) => `# ${i?.slug}\n${i?.verbatim}`).join("\n\n"),
        false,
      );
    } else if (condition === "r") {
      const found = retrieve(question.question, items, 4);
      systemPrompt = buildPrompt(
        core,
        found.map((i) => `# ${i.slug}\n${i.verbatim}`).join("\n\n"),
        false,
      );
    } else if (condition === "f") {
      systemPrompt = buildPrompt(
        core,
        items.map((i) => `# ${i.slug}\n${i.verbatim}`).join("\n\n"),
        false,
      );
    } else {
      const index = items.map((i) => `pointer:${i.slug} | ${i.kind} | ${i.gist}`).join("\n");
      systemPrompt = buildPrompt(core, `Gist index (use the pointer with recall):\n${index}`, true);
    }

    const before = { prompt: adapter.promptTokens, completion: adapter.completionTokens };
    const runOnce =
      condition === "a"
        ? () => runAgentic(adapter, systemPrompt, question.question, items)
        : () => runSingleShot(adapter, systemPrompt, question.question);
    const safeOnce = async (): Promise<AttemptResult> => {
      try {
        return await runOnce();
      } catch (err) {
        return {
          answer: "",
          answeredVia: "none",
          recalls: [],
          turns: 0,
          note: `request failed: ${(err as Error).message}`,
        };
      }
    };
    let attempt = await safeOnce();
    let attempts = 1;
    while (attempt.answer === "" && attempts <= retries) {
      attempts += 1;
      attempt = await safeOnce();
    }
    const tokens = {
      prompt: adapter.promptTokens - before.prompt,
      completion: adapter.completionTokens - before.completion,
    };
    totalPrompt += tokens.prompt;
    totalCompletion += tokens.completion;
    totalRecalls += attempt.recalls.length;

    const pass = attempt.answer !== "" && scoreAnswer(question.expected, attempt.answer);
    const bucket = byKind[question.kind] as { pass: number; total: number };
    bucket.total += 1;
    if (pass) {
      bucket.pass += 1;
    }
    results.push({
      id: question.id,
      kind: question.kind,
      expected: question.expected,
      answer: attempt.answer.slice(0, 500),
      answeredVia: attempt.answeredVia,
      pass,
      turns: attempt.turns,
      attempts,
      recalls: attempt.recalls,
      tokens,
      note: attempt.note,
    });
    console.log(`${question.id}: pass=${pass} via=${attempt.answeredVia} turns=${attempt.turns} attempts=${attempts} recalls=${attempt.recalls.length}`);
  }

  const passed = results.filter((r) => r.pass === true).length;
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(
    outPath,
    JSON.stringify(
      {
        modelId: adapter.modelId,
        date: new Date().toISOString(),
        promptVersion: PROMPT_VERSION,
        condition,
        seed,
        split,
        retries,
        passed,
        total: results.length,
        byKind,
        tokens: { prompt: totalPrompt, completion: totalCompletion },
        recalls: totalRecalls,
        options: { maxTokens: options.maxTokens, temperature: options.temperature },
        questions: results,
      },
      null,
      2,
    ),
  );
  console.log(`saved ${outPath}: ${passed}/${results.length} passed`);
}

const isMain = process.argv[1]?.endsWith("run-h2.ts") || process.argv[1]?.endsWith("run-h2.js");
if (isMain) {
  await main();
}

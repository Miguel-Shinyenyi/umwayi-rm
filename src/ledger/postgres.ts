import { randomBytes, randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import type {
  ApproveResult,
  CreateCommitmentInput,
  CreateEntryInput,
  CreateMemberInput,
  CreateProposalInput,
  LedgerStore,
  ListEntriesFilter,
} from "./store.js";
import {
  accessDenied,
  conflict,
  invalidInput,
  type Commitment,
  type Entry,
  type Finding,
  type Group,
  type Member,
  type Proposal,
} from "./types.js";

function iso(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

function dateOnly(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

export class PostgresLedgerStore implements LedgerStore {
  constructor(private readonly pool: Pool) {}

  async createGroup(name: string): Promise<{ group: Group; token: string }> {
    if (!name || name.trim().length === 0) {
      throw invalidInput("group name is required");
    }
    const groupId = randomUUID();
    const tokenId = randomUUID();
    const token = randomBytes(32).toString("hex");
    const { rows } = await this.pool.query(
      "INSERT INTO groups (id, name) VALUES ($1, $2) RETURNING id, name, currency, demo, created_at",
      [groupId, name.trim()],
    );
    await this.pool.query("INSERT INTO treasurer_tokens (id, group_id, token) VALUES ($1, $2, $3)", [
      tokenId,
      groupId,
      token,
    ]);
    const row = rows[0] as { id: string; name: string; currency: string; demo: boolean; created_at: unknown };
    return {
      group: {
        id: row.id,
        name: row.name,
        currency: row.currency,
        demo: row.demo,
        createdAt: iso(row.created_at),
      },
      token,
    };
  }

  private async mustOwn(client: Pool | PoolClient, token: string, groupId: string): Promise<string> {
    const { rows } = await client.query("SELECT id, group_id FROM treasurer_tokens WHERE token = $1", [
      token,
    ]);
    const record = rows[0] as { id: string; group_id: string } | undefined;
    if (!record || record.group_id !== groupId) {
      throw accessDenied();
    }
    return record.id;
  }

  private async mustMember(
    client: Pool | PoolClient,
    groupId: string,
    memberId: string,
  ): Promise<void> {
    const { rows } = await client.query("SELECT id FROM members WHERE id = $1 AND group_id = $2", [
      memberId,
      groupId,
    ]);
    if (rows.length === 0) {
      throw invalidInput(`unknown member in group: ${memberId}`);
    }
  }

  async getGroup(token: string, groupId: string): Promise<Group> {
    await this.mustOwn(this.pool, token, groupId);
    const { rows } = await this.pool.query(
      "SELECT id, name, currency, demo, created_at FROM groups WHERE id = $1",
      [groupId],
    );
    const row = rows[0] as
      | { id: string; name: string; currency: string; demo: boolean; created_at: unknown }
      | undefined;
    if (!row) {
      throw invalidInput(`unknown group: ${groupId}`);
    }
    return {
      id: row.id,
      name: row.name,
      currency: row.currency,
      demo: row.demo,
      createdAt: iso(row.created_at),
    };
  }

  async listMembers(token: string, groupId: string): Promise<Member[]> {
    await this.mustOwn(this.pool, token, groupId);
    const { rows } = await this.pool.query(
      "SELECT id, group_id, display_name, aliases, created_at FROM members WHERE group_id = $1 ORDER BY id ASC",
      [groupId],
    );
    return (rows as { id: string; group_id: string; display_name: string; aliases: unknown; created_at: unknown }[]).map(
      (row) => ({
        id: row.id,
        groupId: row.group_id,
        displayName: row.display_name,
        aliases: Array.isArray(row.aliases) ? (row.aliases as string[]) : [],
        createdAt: iso(row.created_at),
      }),
    );
  }

  async listCommitments(token: string, groupId: string): Promise<Commitment[]> {
    await this.mustOwn(this.pool, token, groupId);
    const { rows } = await this.pool.query(
      "SELECT id, group_id, member_id, kind, amount, due_rule, created_at FROM commitments WHERE group_id = $1 ORDER BY id ASC",
      [groupId],
    );
    return (
      rows as {
        id: string;
        group_id: string;
        member_id: string;
        kind: Commitment["kind"];
        amount: number;
        due_rule: string;
        created_at: unknown;
      }[]
    ).map((row) => ({
      id: row.id,
      groupId: row.group_id,
      memberId: row.member_id,
      kind: row.kind,
      amount: row.amount,
      dueRule: row.due_rule,
      createdAt: iso(row.created_at),
    }));
  }

  async createMember(token: string, input: CreateMemberInput): Promise<Member> {
    await this.mustOwn(this.pool, token, input.groupId);
    if (!input.displayName || input.displayName.trim().length === 0) {
      throw invalidInput("display name is required");
    }
    try {
      const { rows } = await this.pool.query(
        "INSERT INTO members (id, group_id, display_name, aliases) VALUES ($1, $2, $3, $4) RETURNING id, group_id, display_name, aliases, created_at",
        [randomUUID(), input.groupId, input.displayName.trim(), JSON.stringify(input.aliases ?? [])],
      );
      const row = rows[0] as {
        id: string;
        group_id: string;
        display_name: string;
        aliases: unknown;
        created_at: unknown;
      };
      return {
        id: row.id,
        groupId: row.group_id,
        displayName: row.display_name,
        aliases: Array.isArray(row.aliases) ? (row.aliases as string[]) : [],
        createdAt: iso(row.created_at),
      };
    } catch (err) {
      throw this.asLedgerError(err, `unknown group: ${input.groupId}`);
    }
  }

  async createCommitment(token: string, input: CreateCommitmentInput): Promise<Commitment> {
    await this.mustOwn(this.pool, token, input.groupId);
    await this.mustMember(this.pool, input.groupId, input.memberId);
    this.checkLedgerInput(input.kind, input.amount, input.dueRule);
    const { rows } = await this.pool.query(
      "INSERT INTO commitments (id, group_id, member_id, kind, amount, due_rule) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, group_id, member_id, kind, amount, due_rule, created_at",
      [randomUUID(), input.groupId, input.memberId, input.kind, input.amount, input.dueRule],
    );
    const row = rows[0] as {
      id: string;
      group_id: string;
      member_id: string;
      kind: Commitment["kind"];
      amount: number;
      due_rule: string;
      created_at: unknown;
    };
    return {
      id: row.id,
      groupId: row.group_id,
      memberId: row.member_id,
      kind: row.kind,
      amount: row.amount,
      dueRule: row.due_rule,
      createdAt: iso(row.created_at),
    };
  }

  private checkLedgerInput(kind: string, amount: number, dueRule: string): void {
    if (kind !== "contribution" && kind !== "loan_repayment") {
      throw invalidInput(`unknown kind: ${kind}`);
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      throw invalidInput(`amount must be a positive integer, got: ${String(amount)}`);
    }
    if (!dueRule || dueRule.trim().length === 0) {
      throw invalidInput("due rule is required");
    }
  }

  async createEntry(token: string, input: CreateEntryInput): Promise<Entry> {
    await this.mustOwn(this.pool, token, input.groupId);
    await this.mustMember(this.pool, input.groupId, input.memberId);
    this.checkEntryInput(input.kind, input.amount, input.period, input.evidenceTier);
    const { rows } = await this.pool.query(
      `INSERT INTO entries (id, group_id, member_id, kind, amount, period, occurred_on, evidence_tier, source_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, group_id, member_id, kind, amount, period, occurred_on, evidence_tier, source_ref, proposal_id, approved_by, created_at`,
      [
        randomUUID(),
        input.groupId,
        input.memberId,
        input.kind,
        input.amount,
        input.period,
        input.occurredOn,
        input.evidenceTier,
        input.sourceRef ?? null,
      ],
    );
    return this.toEntry(rows[0]);
  }

  private checkEntryInput(kind: string, amount: number, period: string, tier: string): void {
    if (kind !== "contribution" && kind !== "loan_repayment") {
      throw invalidInput(`unknown kind: ${kind}`);
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      throw invalidInput(`amount must be a positive integer, got: ${String(amount)}`);
    }
    if (!/^\d{4}-\d{2}$/.test(period)) {
      throw invalidInput(`period must be YYYY-MM, got: ${period}`);
    }
    const tiers = ["statement_confirmed", "treasurer_confirmed", "agent_proposed_approved", "self_reported"];
    if (!tiers.includes(tier)) {
      throw invalidInput(`unknown evidence tier: ${tier}`);
    }
  }

  private toEntry(row: Record<string, unknown>): Entry {
    return {
      id: row.id as string,
      groupId: row.group_id as string,
      memberId: row.member_id as string,
      kind: row.kind as Entry["kind"],
      amount: row.amount as number,
      period: row.period as string,
      occurredOn: dateOnly(row.occurred_on),
      evidenceTier: row.evidence_tier as Entry["evidenceTier"],
      sourceRef: (row.source_ref as string | null) ?? null,
      proposalId: (row.proposal_id as string | null) ?? null,
      approvedBy: (row.approved_by as string | null) ?? null,
      createdAt: iso(row.created_at),
    };
  }

  private toProposal(row: Record<string, unknown>): Proposal {
    return {
      id: row.id as string,
      groupId: row.group_id as string,
      runId: (row.run_id as string | null) ?? null,
      type: row.type as Proposal["type"],
      payload: (row.payload as Record<string, unknown>) ?? {},
      quotes: Array.isArray(row.quotes) ? (row.quotes as string[]) : [],
      status: row.status as Proposal["status"],
      decidedBy: (row.decided_by as string | null) ?? null,
      decidedAt: row.decided_at == null ? null : iso(row.decided_at),
      createdAt: iso(row.created_at),
    };
  }

  private asLedgerError(err: unknown, fallbackMessage: string): Error {
    if (err && typeof err === "object" && "code" in err) {
      const code = (err as { code: string }).code;
      if (code === "23503") {
        return invalidInput(fallbackMessage);
      }
      if (code === "23514") {
        return invalidInput(`value rejected by the ledger: ${fallbackMessage}`);
      }
    }
    throw err;
  }

  async createProposal(token: string, input: CreateProposalInput): Promise<Proposal> {
    await this.mustOwn(this.pool, token, input.groupId);
    if (input.type !== "entry" && input.type !== "question" && input.type !== "draft_reminder") {
      throw invalidInput(`unknown proposal type: ${String(input.type)}`);
    }
    try {
      const { rows } = await this.pool.query(
        `INSERT INTO proposals (id, group_id, run_id, type, payload, quotes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, group_id, run_id, type, payload, quotes, status, decided_by, decided_at, created_at`,
        [
          randomUUID(),
          input.groupId,
          input.runId ?? null,
          input.type,
          JSON.stringify(input.payload),
          JSON.stringify(input.quotes ?? []),
        ],
      );
      return this.toProposal(rows[0] as Record<string, unknown>);
    } catch (err) {
      throw this.asLedgerError(err, `unknown group: ${input.groupId}`);
    }
  }

  async approveProposal(token: string, proposalId: string): Promise<ApproveResult> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const found = await client.query(
        "SELECT id, group_id, type, payload, status FROM proposals WHERE id = $1 FOR UPDATE",
        [proposalId],
      );
      const proposal = found.rows[0] as
        | { id: string; group_id: string; type: string; payload: Record<string, unknown>; status: string }
        | undefined;
      if (!proposal) {
        throw invalidInput(`unknown proposal: ${proposalId}`);
      }
      const approverId = await this.mustOwn(client, token, proposal.group_id);
      if (proposal.type !== "entry") {
        throw invalidInput(`only entry proposals can be approved, got: ${proposal.type}`);
      }
      if (proposal.status === "approved") {
        const existing = await client.query(
          "SELECT id, group_id, member_id, kind, amount, period, occurred_on, evidence_tier, source_ref, proposal_id, approved_by, created_at FROM entries WHERE proposal_id = $1",
          [proposal.id],
        );
        if (existing.rows.length === 0) {
          throw new Error(`approved proposal has no entry: ${proposal.id}`);
        }
        await client.query("COMMIT");
        return { entry: this.toEntry(existing.rows[0] as Record<string, unknown>), already: true };
      }
      if (proposal.status === "rejected") {
        throw conflict(`proposal already rejected: ${proposal.id}`);
      }
      const payload = proposal.payload as {
        memberId?: unknown;
        kind?: unknown;
        amount?: unknown;
        period?: unknown;
        occurredOn?: unknown;
        sourceRef?: unknown;
      };
      if (typeof payload.memberId !== "string") {
        throw invalidInput("entry proposal payload needs memberId");
      }
      await this.mustMember(client, proposal.group_id, payload.memberId);
      if (payload.kind !== "contribution" && payload.kind !== "loan_repayment") {
        throw invalidInput(`unknown kind: ${String(payload.kind)}`);
      }
      if (typeof payload.amount !== "number" || !Number.isInteger(payload.amount) || payload.amount <= 0) {
        throw invalidInput(`amount must be a positive integer, got: ${String(payload.amount)}`);
      }
      if (typeof payload.period !== "string" || !/^\d{4}-\d{2}$/.test(payload.period)) {
        throw invalidInput(`period must be YYYY-MM, got: ${String(payload.period)}`);
      }
      if (typeof payload.occurredOn !== "string") {
        throw invalidInput("entry proposal payload needs occurredOn");
      }
      const inserted = await client.query(
        `INSERT INTO entries (id, group_id, member_id, kind, amount, period, occurred_on, evidence_tier, source_ref, proposal_id, approved_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'agent_proposed_approved', $8, $9, $10)
         RETURNING id, group_id, member_id, kind, amount, period, occurred_on, evidence_tier, source_ref, proposal_id, approved_by, created_at`,
        [
          randomUUID(),
          proposal.group_id,
          payload.memberId,
          payload.kind,
          payload.amount,
          payload.period,
          payload.occurredOn,
          typeof payload.sourceRef === "string" ? payload.sourceRef : null,
          proposal.id,
          approverId,
        ],
      );
      await client.query("UPDATE proposals SET status = 'approved', decided_by = $1, decided_at = now() WHERE id = $2", [
        approverId,
        proposal.id,
      ]);
      await client.query("COMMIT");
      return { entry: this.toEntry(inserted.rows[0] as Record<string, unknown>), already: false };
    } catch (err) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

  async rejectProposal(token: string, proposalId: string): Promise<Proposal> {
    const { rows } = await this.pool.query("SELECT id, group_id, status FROM proposals WHERE id = $1", [
      proposalId,
    ]);
    const proposal = rows[0] as { id: string; group_id: string; status: string } | undefined;
    if (!proposal) {
      throw invalidInput(`unknown proposal: ${proposalId}`);
    }
    const approverId = await this.mustOwn(this.pool, token, proposal.group_id);
    if (proposal.status !== "pending") {
      throw conflict(`proposal already decided: ${proposal.id}`);
    }
    const updated = await this.pool.query(
      `UPDATE proposals SET status = 'rejected', decided_by = $1, decided_at = now() WHERE id = $2
       RETURNING id, group_id, run_id, type, payload, quotes, status, decided_by, decided_at, created_at`,
      [approverId, proposal.id],
    );
    return this.toProposal(updated.rows[0] as Record<string, unknown>);
  }

  async listEntries(token: string, filter: ListEntriesFilter): Promise<Entry[]> {
    await this.mustOwn(this.pool, token, filter.groupId);
    const conditions = ["group_id = $1"];
    const params: string[] = [filter.groupId];
    if (filter.memberId) {
      params.push(filter.memberId);
      conditions.push(`member_id = $${params.length}`);
    }
    if (filter.period) {
      params.push(filter.period);
      conditions.push(`period = $${params.length}`);
    }
    const { rows } = await this.pool.query(
      `SELECT id, group_id, member_id, kind, amount, period, occurred_on, evidence_tier, source_ref, proposal_id, approved_by, created_at
       FROM entries WHERE ${conditions.join(" AND ")} ORDER BY created_at ASC`,
      params,
    );
    return (rows as Record<string, unknown>[]).map((r) => this.toEntry(r));
  }

  async listProposals(
    token: string,
    groupId: string,
    status?: Proposal["status"],
  ): Promise<Proposal[]> {
    await this.mustOwn(this.pool, token, groupId);
    const params: string[] = [groupId];
    let sql = `SELECT id, group_id, run_id, type, payload, quotes, status, decided_by, decided_at, created_at
       FROM proposals WHERE group_id = $1`;
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    sql += " ORDER BY created_at ASC, id ASC";
    const { rows } = await this.pool.query(sql, params);
    return (rows as Record<string, unknown>[]).map((r) => this.toProposal(r));
  }

  async saveFinding(
    token: string,
    input: { groupId: string; kind: Finding["kind"]; refs?: Record<string, unknown> },
  ): Promise<Finding> {
    await this.mustOwn(this.pool, token, input.groupId);
    if (input.kind !== "only_on_paper" && input.kind !== "only_in_ledger" && input.kind !== "amount_differs") {
      throw invalidInput(`unknown finding kind: ${String(input.kind)}`);
    }
    try {
      const { rows } = await this.pool.query(
        `INSERT INTO findings (id, group_id, kind, refs)
         VALUES ($1, $2, $3, $4)
         RETURNING id, group_id, kind, refs, status, created_at`,
        [randomUUID(), input.groupId, input.kind, JSON.stringify(input.refs ?? {})],
      );
      return this.toFinding(rows[0] as Record<string, unknown>);
    } catch (err) {
      throw this.asLedgerError(err, `unknown group: ${input.groupId}`);
    }
  }

  async listFindings(
    token: string,
    groupId: string,
    status?: Finding["status"],
  ): Promise<Finding[]> {
    await this.mustOwn(this.pool, token, groupId);
    const params: string[] = [groupId];
    let sql = "SELECT id, group_id, kind, refs, status, created_at FROM findings WHERE group_id = $1";
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    sql += " ORDER BY created_at ASC, id ASC";
    const { rows } = await this.pool.query(sql, params);
    return (rows as Record<string, unknown>[]).map((r) => this.toFinding(r));
  }

  async resolveFinding(token: string, findingId: string): Promise<Finding> {
    const { rows } = await this.pool.query("SELECT id, group_id, status FROM findings WHERE id = $1", [
      findingId,
    ]);
    const finding = rows[0] as { id: string; group_id: string; status: string } | undefined;
    if (!finding) {
      throw invalidInput(`unknown finding: ${findingId}`);
    }
    await this.mustOwn(this.pool, token, finding.group_id);
    if (finding.status === "resolved") {
      throw conflict(`finding already resolved: ${finding.id}`);
    }
    const updated = await this.pool.query(
      `UPDATE findings SET status = 'resolved' WHERE id = $1
       RETURNING id, group_id, kind, refs, status, created_at`,
      [finding.id],
    );
    return this.toFinding(updated.rows[0] as Record<string, unknown>);
  }

  async resetDemo(): Promise<void> {
    await this.pool.query(
      "TRUNCATE groups, members, commitments, entries, proposals, treasurer_tokens, findings RESTART IDENTITY CASCADE",
    );
  }

  private toFinding(row: Record<string, unknown>): Finding {
    return {
      id: row.id as string,
      groupId: row.group_id as string,
      kind: row.kind as Finding["kind"],
      refs: (row.refs as Record<string, unknown>) ?? {},
      status: row.status as Finding["status"],
      createdAt: iso(row.created_at),
    };
  }
}

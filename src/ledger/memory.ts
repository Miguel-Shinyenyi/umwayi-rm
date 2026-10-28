import { randomBytes, randomUUID } from "node:crypto";
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
  type CommitmentKind,
  type Entry,
  type EvidenceTier,
  type Group,
  type Member,
  type Proposal,
  type ProposalType,
} from "./types.js";

const KINDS: CommitmentKind[] = ["contribution", "loan_repayment"];
const TIERS: EvidenceTier[] = [
  "statement_confirmed",
  "treasurer_confirmed",
  "agent_proposed_approved",
  "self_reported",
];
const PROPOSAL_TYPES: ProposalType[] = ["entry", "question", "draft_reminder"];

function now(): string {
  return new Date().toISOString();
}

function checkKind(kind: unknown): asserts kind is CommitmentKind {
  if (!KINDS.includes(kind as CommitmentKind)) {
    throw invalidInput(`unknown kind: ${String(kind)}`);
  }
}

function checkTier(tier: unknown): asserts tier is EvidenceTier {
  if (!TIERS.includes(tier as EvidenceTier)) {
    throw invalidInput(`unknown evidence tier: ${String(tier)}`);
  }
}

function checkAmount(amount: unknown): asserts amount is number {
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
    throw invalidInput(`amount must be a positive integer, got: ${String(amount)}`);
  }
}

function checkPeriod(period: unknown): asserts period is string {
  if (typeof period !== "string" || !/^\d{4}-\d{2}$/.test(period)) {
    throw invalidInput(`period must be YYYY-MM, got: ${String(period)}`);
  }
}

export class MemoryLedgerStore implements LedgerStore {
  private groups = new Map<string, Group>();
  private members = new Map<string, Member>();
  private commitments = new Map<string, Commitment>();
  private entries = new Map<string, Entry>();
  private entriesByProposal = new Map<string, Entry>();
  private proposals = new Map<string, Proposal>();
  private tokens = new Map<string, { id: string; groupId: string }>();

  async createGroup(name: string): Promise<{ group: Group; token: string }> {
    if (!name || name.trim().length === 0) {
      throw invalidInput("group name is required");
    }
    const group: Group = {
      id: randomUUID(),
      name: name.trim(),
      currency: "KES",
      demo: true,
      createdAt: now(),
    };
    const token = randomBytes(32).toString("hex");
    this.groups.set(group.id, group);
    this.tokens.set(token, { id: randomUUID(), groupId: group.id });
    return { group, token };
  }

  private mustOwn(token: string, groupId: string): string {
    const record = this.tokens.get(token);
    if (!record || record.groupId !== groupId) {
      throw accessDenied();
    }
    return record.id;
  }

  private mustMember(groupId: string, memberId: string): Member {
    const member = this.members.get(memberId);
    if (!member || member.groupId !== groupId) {
      throw invalidInput(`unknown member in group: ${memberId}`);
    }
    return member;
  }

  async createMember(token: string, input: CreateMemberInput): Promise<Member> {
    this.mustOwn(token, input.groupId);
    if (!this.groups.has(input.groupId)) {
      throw invalidInput(`unknown group: ${input.groupId}`);
    }
    if (!input.displayName || input.displayName.trim().length === 0) {
      throw invalidInput("display name is required");
    }
    const member: Member = {
      id: randomUUID(),
      groupId: input.groupId,
      displayName: input.displayName.trim(),
      aliases: input.aliases ?? [],
      createdAt: now(),
    };
    this.members.set(member.id, member);
    return member;
  }

  async createCommitment(token: string, input: CreateCommitmentInput): Promise<Commitment> {
    this.mustOwn(token, input.groupId);
    this.mustMember(input.groupId, input.memberId);
    checkKind(input.kind);
    checkAmount(input.amount);
    if (!input.dueRule || input.dueRule.trim().length === 0) {
      throw invalidInput("due rule is required");
    }
    const commitment: Commitment = {
      id: randomUUID(),
      groupId: input.groupId,
      memberId: input.memberId,
      kind: input.kind,
      amount: input.amount,
      dueRule: input.dueRule,
      createdAt: now(),
    };
    this.commitments.set(commitment.id, commitment);
    return commitment;
  }

  async createEntry(token: string, input: CreateEntryInput): Promise<Entry> {
    this.mustOwn(token, input.groupId);
    this.mustMember(input.groupId, input.memberId);
    checkKind(input.kind);
    checkAmount(input.amount);
    checkPeriod(input.period);
    checkTier(input.evidenceTier);
    const entry: Entry = {
      id: randomUUID(),
      groupId: input.groupId,
      memberId: input.memberId,
      kind: input.kind,
      amount: input.amount,
      period: input.period,
      occurredOn: input.occurredOn,
      evidenceTier: input.evidenceTier,
      sourceRef: input.sourceRef ?? null,
      proposalId: null,
      approvedBy: null,
      createdAt: now(),
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  async createProposal(token: string, input: CreateProposalInput): Promise<Proposal> {
    this.mustOwn(token, input.groupId);
    if (!this.groups.has(input.groupId)) {
      throw invalidInput(`unknown group: ${input.groupId}`);
    }
    if (!PROPOSAL_TYPES.includes(input.type)) {
      throw invalidInput(`unknown proposal type: ${String(input.type)}`);
    }
    const proposal: Proposal = {
      id: randomUUID(),
      groupId: input.groupId,
      runId: input.runId ?? null,
      type: input.type,
      payload: input.payload,
      quotes: input.quotes ?? [],
      status: "pending",
      decidedBy: null,
      decidedAt: null,
      createdAt: now(),
    };
    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  async approveProposal(token: string, proposalId: string): Promise<ApproveResult> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw invalidInput(`unknown proposal: ${proposalId}`);
    }
    const approverId = this.mustOwn(token, proposal.groupId);
    if (proposal.type !== "entry") {
      throw invalidInput(`only entry proposals can be approved, got: ${proposal.type}`);
    }
    if (proposal.status === "approved") {
      const entry = this.entriesByProposal.get(proposal.id);
      if (!entry) {
        throw new Error(`approved proposal has no entry: ${proposal.id}`);
      }
      return { entry, already: true };
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
    this.mustMember(proposal.groupId, payload.memberId);
    checkKind(payload.kind);
    checkAmount(payload.amount);
    checkPeriod(payload.period);
    if (typeof payload.occurredOn !== "string") {
      throw invalidInput("entry proposal payload needs occurredOn");
    }
    const entry: Entry = {
      id: randomUUID(),
      groupId: proposal.groupId,
      memberId: payload.memberId,
      kind: payload.kind,
      amount: payload.amount,
      period: payload.period,
      occurredOn: payload.occurredOn,
      evidenceTier: "agent_proposed_approved",
      sourceRef: typeof payload.sourceRef === "string" ? payload.sourceRef : null,
      proposalId: proposal.id,
      approvedBy: approverId,
      createdAt: now(),
    };
    this.entries.set(entry.id, entry);
    this.entriesByProposal.set(proposal.id, entry);
    proposal.status = "approved";
    proposal.decidedBy = approverId;
    proposal.decidedAt = now();
    return { entry, already: false };
  }

  async rejectProposal(token: string, proposalId: string): Promise<Proposal> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw invalidInput(`unknown proposal: ${proposalId}`);
    }
    const approverId = this.mustOwn(token, proposal.groupId);
    if (proposal.status !== "pending") {
      throw conflict(`proposal already decided: ${proposal.id}`);
    }
    proposal.status = "rejected";
    proposal.decidedBy = approverId;
    proposal.decidedAt = now();
    return proposal;
  }

  async listEntries(token: string, filter: ListEntriesFilter): Promise<Entry[]> {
    this.mustOwn(token, filter.groupId);
    return [...this.entries.values()]
      .filter((e) => e.groupId === filter.groupId)
      .filter((e) => !filter.memberId || e.memberId === filter.memberId)
      .filter((e) => !filter.period || e.period === filter.period)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}

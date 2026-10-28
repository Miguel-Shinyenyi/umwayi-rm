import type {
  Commitment,
  CommitmentKind,
  Entry,
  EvidenceTier,
  Group,
  Member,
  Proposal,
  ProposalType,
} from "./types.js";

export interface CreateMemberInput {
  groupId: string;
  displayName: string;
  aliases?: string[];
}

export interface CreateCommitmentInput {
  groupId: string;
  memberId: string;
  kind: CommitmentKind;
  amount: number;
  dueRule: string;
}

export interface CreateEntryInput {
  groupId: string;
  memberId: string;
  kind: CommitmentKind;
  amount: number;
  period: string;
  occurredOn: string;
  evidenceTier: EvidenceTier;
  sourceRef?: string;
}

export interface CreateProposalInput {
  groupId: string;
  runId?: string;
  type: ProposalType;
  payload: Record<string, unknown>;
  quotes?: string[];
}

export interface ApproveResult {
  entry: Entry;
  already: boolean;
}

export interface ListEntriesFilter {
  groupId: string;
  memberId?: string;
  period?: string;
}

export interface LedgerStore {
  createGroup(name: string): Promise<{ group: Group; token: string }>;
  createMember(token: string, input: CreateMemberInput): Promise<Member>;
  createCommitment(token: string, input: CreateCommitmentInput): Promise<Commitment>;
  createEntry(token: string, input: CreateEntryInput): Promise<Entry>;
  createProposal(token: string, input: CreateProposalInput): Promise<Proposal>;
  approveProposal(token: string, proposalId: string): Promise<ApproveResult>;
  rejectProposal(token: string, proposalId: string): Promise<Proposal>;
  listEntries(token: string, filter: ListEntriesFilter): Promise<Entry[]>;
}

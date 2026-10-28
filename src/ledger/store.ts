import type {
  Commitment,
  CommitmentKind,
  Entry,
  EvidenceTier,
  Finding,
  FindingStatus,
  Group,
  Member,
  Proposal,
  ProposalStatus,
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
  listMembers(token: string, groupId: string): Promise<Member[]>;
  listCommitments(token: string, groupId: string): Promise<Commitment[]>;
  createMember(token: string, input: CreateMemberInput): Promise<Member>;
  createCommitment(token: string, input: CreateCommitmentInput): Promise<Commitment>;
  createEntry(token: string, input: CreateEntryInput): Promise<Entry>;
  createProposal(token: string, input: CreateProposalInput): Promise<Proposal>;
  approveProposal(token: string, proposalId: string): Promise<ApproveResult>;
  rejectProposal(token: string, proposalId: string): Promise<Proposal>;
  listEntries(token: string, filter: ListEntriesFilter): Promise<Entry[]>;
  listProposals(token: string, groupId: string, status?: ProposalStatus): Promise<Proposal[]>;
  saveFinding(
    token: string,
    input: { groupId: string; kind: Finding["kind"]; refs?: Record<string, unknown> },
  ): Promise<Finding>;
  listFindings(token: string, groupId: string, status?: FindingStatus): Promise<Finding[]>;
  resolveFinding(token: string, findingId: string): Promise<Finding>;
}

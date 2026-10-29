export type CommitmentKind = "contribution" | "loan_repayment";
export type EvidenceTier =
  | "statement_confirmed"
  | "treasurer_confirmed"
  | "agent_proposed_approved"
  | "self_reported";
export type ProposalType = "entry" | "question" | "draft_reminder";
export type ProposalStatus = "pending" | "approved" | "rejected";

export interface Group {
  id: string;
  name: string;
  currency: string;
  demo: boolean;
  createdAt: string;
}

export interface Member {
  id: string;
  groupId: string;
  displayName: string;
  aliases: string[];
  createdAt: string;
}

export interface Commitment {
  id: string;
  groupId: string;
  memberId: string;
  kind: CommitmentKind;
  amount: number;
  dueRule: string;
  createdAt: string;
}

export interface Entry {
  id: string;
  groupId: string;
  memberId: string;
  kind: CommitmentKind;
  amount: number;
  period: string;
  occurredOn: string;
  evidenceTier: EvidenceTier;
  sourceRef: string | null;
  proposalId: string | null;
  approvedBy: string | null;
  createdAt: string;
}

export interface EntryProposalPayload {
  memberId: string;
  kind: CommitmentKind;
  amount: number;
  period: string;
  occurredOn: string;
  sourceRef?: string;
}

export interface Proposal {
  id: string;
  groupId: string;
  runId: string | null;
  type: ProposalType;
  payload: Record<string, unknown>;
  quotes: string[];
  status: ProposalStatus;
  decidedBy: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export type FindingKind = "only_on_paper" | "only_in_ledger" | "amount_differs";
export type FindingStatus = "open" | "resolved";
export type ArchiveKind = "meeting" | "ledger_month" | "constitution";

export interface ArchiveItem {
  id: string;
  groupId: string;
  kind: ArchiveKind;
  verbatim: string;
  sha256: string;
  gist: string;
  createdAt: string;
}

export interface ArchiveGist {
  id: string;
  kind: ArchiveKind;
  gist: string;
  sha256: string;
}

export interface Finding {
  id: string;
  groupId: string;
  kind: FindingKind;
  refs: Record<string, unknown>;
  status: FindingStatus;
  createdAt: string;
}

export class LedgerError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "LedgerError";
  }
}

export function accessDenied(): LedgerError {
  return new LedgerError("access denied for this group", 403);
}

export function invalidInput(message: string): LedgerError {
  return new LedgerError(message, 422);
}

export function conflict(message: string): LedgerError {
  return new LedgerError(message, 409);
}

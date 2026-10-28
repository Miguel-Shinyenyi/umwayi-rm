CREATE TABLE IF NOT EXISTS schema_migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  demo BOOLEAN NOT NULL DEFAULT true,
  constitution_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  aliases JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commitments (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('contribution', 'loan_repayment')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  due_rule TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('contribution', 'loan_repayment')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  period TEXT NOT NULL,
  occurred_on DATE NOT NULL,
  evidence_tier TEXT NOT NULL CHECK (evidence_tier IN ('statement_confirmed', 'treasurer_confirmed', 'agent_proposed_approved', 'self_reported')),
  source_ref TEXT,
  proposal_id TEXT UNIQUE,
  approved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  run_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('entry', 'question', 'draft_reminder')),
  payload JSONB NOT NULL,
  quotes JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS treasurer_tokens (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION entries_no_change() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'entries are append only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS entries_no_change_trigger ON entries;
CREATE TRIGGER entries_no_change_trigger
  BEFORE UPDATE OR DELETE ON entries
  FOR EACH ROW EXECUTE FUNCTION entries_no_change();

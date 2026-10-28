CREATE TABLE IF NOT EXISTS findings (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('only_on_paper', 'only_in_ledger', 'amount_differs')),
  refs JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

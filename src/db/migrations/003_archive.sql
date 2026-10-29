CREATE TABLE IF NOT EXISTS archive_items (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('meeting', 'ledger_month', 'constitution')),
  verbatim TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  gist TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS verification JSONB;

CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  intake_ref TEXT NOT NULL,
  model_id TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

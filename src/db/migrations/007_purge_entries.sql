-- Entries stay append only: no update, and no delete while the group exists.
-- A delete is allowed only when the group is already gone (the cascade from
-- deleting a group). The demo purge needs this; member deletes stay blocked.
CREATE OR REPLACE FUNCTION entries_no_change() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' AND NOT EXISTS (SELECT 1 FROM groups WHERE id = OLD.group_id) THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'entries are append only';
END;
$$ LANGUAGE plpgsql;

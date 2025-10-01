-- Drop old themes table (unused and empty)
DROP TABLE IF EXISTS themes CASCADE;

-- Drop patches table that references themes
DROP TABLE IF EXISTS patches CASCADE;

-- Drop projects table (not used in current architecture)
DROP TABLE IF EXISTS projects CASCADE;

-- Ensure user_themes has correct structure
-- Table already exists, just verify constraints
DO $$ 
BEGIN
  -- Add unique constraint on user_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_themes_user_id_key'
  ) THEN
    ALTER TABLE user_themes ADD CONSTRAINT user_themes_user_id_key UNIQUE (user_id);
  END IF;
END $$;
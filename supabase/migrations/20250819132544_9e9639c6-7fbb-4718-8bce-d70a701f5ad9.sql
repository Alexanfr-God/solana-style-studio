
-- Add missing columns to presets table
ALTER TABLE presets ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE presets ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Convert tags to jsonb for better flexibility
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='presets' AND column_name='tags' AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE presets ALTER COLUMN tags TYPE jsonb USING to_jsonb(tags);
  END IF;
END$$;

-- Migrate existing sample_context and sample_patch to payload (if any data exists)
UPDATE presets 
SET payload = COALESCE(payload, '{}'::jsonb) || jsonb_build_object(
  'sample_context', COALESCE(sample_context, ''),
  'patch', COALESCE(sample_patch, '[]'::jsonb)
)
WHERE sample_context IS NOT NULL OR sample_patch IS NOT NULL;

-- Set up RLS for public read access to presets
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Allow public read access to presets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='presets' AND policyname='presets read public'
  ) THEN
    CREATE POLICY "presets read public" ON presets FOR SELECT USING (true);
  END IF;
END$$;

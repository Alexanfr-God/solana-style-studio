
-- Check if columns exist and add them if missing
DO $$
BEGIN
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'presets' AND column_name = 'slug'
    ) THEN
        ALTER TABLE presets ADD COLUMN slug text UNIQUE;
        RAISE NOTICE 'Added slug column to presets table';
    END IF;

    -- Add payload column if it doesn't exist  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'presets' AND column_name = 'payload'
    ) THEN
        ALTER TABLE presets ADD COLUMN payload jsonb NOT NULL DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added payload column to presets table';
    END IF;

    -- Convert tags to jsonb if it's not already jsonb
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presets' AND column_name = 'tags' AND data_type != 'jsonb'
    ) THEN
        ALTER TABLE presets ALTER COLUMN tags TYPE jsonb USING 
            CASE 
                WHEN tags IS NULL THEN '[]'::jsonb
                ELSE to_jsonb(tags)
            END;
        RAISE NOTICE 'Converted tags column to jsonb';
    END IF;
END$$;

-- Migrate existing data to new structure
UPDATE presets 
SET 
    slug = COALESCE(slug, id::text),
    payload = COALESCE(payload, '{}'::jsonb) || jsonb_build_object(
        'patch', COALESCE(sample_patch, '[]'::jsonb),
        'sample_context', COALESCE(sample_context, title || ' preset styling')
    )
WHERE payload IS NULL OR payload = '{}'::jsonb;

-- Ensure RLS is enabled with proper policies
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "presets read public" ON presets;
CREATE POLICY "presets read public" ON presets FOR SELECT USING (true);

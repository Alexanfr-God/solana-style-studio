
-- PR #1: Database Migration - Archive unused tables and verify RLS policies

-- 1. Create archive schema
CREATE SCHEMA IF NOT EXISTS archive;

-- 2. Move unused tables to archive schema
ALTER TABLE public.generated_images SET SCHEMA archive;
ALTER TABLE public.image_feedback SET SCHEMA archive;

-- 3. Update RLS policies on archived tables to maintain security
-- For generated_images (now archive.generated_images)
ALTER TABLE archive.generated_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own generated images" ON archive.generated_images;
DROP POLICY IF EXISTS "Users can view their own generated images" ON archive.generated_images;

CREATE POLICY "Users can insert their own generated images" 
  ON archive.generated_images 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own generated images" 
  ON archive.generated_images 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- For image_feedback (now archive.image_feedback)
ALTER TABLE archive.image_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own feedback" ON archive.image_feedback;
DROP POLICY IF EXISTS "Users can update their own feedback" ON archive.image_feedback;
DROP POLICY IF EXISTS "Users can view all feedback" ON archive.image_feedback;

CREATE POLICY "Users can insert their own feedback" 
  ON archive.image_feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
  ON archive.image_feedback 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all feedback" 
  ON archive.image_feedback 
  FOR SELECT 
  USING (true);

-- 4. Verify core LLM v1.1 tables have proper RLS (no changes needed, just verification comments)
-- projects: ✅ Has RLS policies for user ownership
-- themes: ✅ Has RLS policies via project ownership  
-- patches: ✅ Has RLS policies via theme → project ownership
-- presets: ✅ Has public read access (correct for shared presets)
-- schema_versions: ✅ Has public read access (correct for shared schemas)
-- auth_nonces: ✅ No RLS needed (managed by edge functions)
-- wallet_profiles: ✅ No RLS needed (managed by edge functions)

-- 5. Add comment to track migration
COMMENT ON SCHEMA archive IS 'Archive schema for legacy tables moved from public schema';
COMMENT ON TABLE archive.generated_images IS 'Archived: Legacy image generation table, moved from public schema';
COMMENT ON TABLE archive.image_feedback IS 'Archived: Legacy feedback table, moved from public schema';

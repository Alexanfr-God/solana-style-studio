
-- Migration for ai_requests telemetry fields
-- Add new columns for llm-patch logging without breaking existing records

-- Add new columns for llm-patch telemetry
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS request_type text;
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS theme_id uuid;
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS page_id text;
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS prompt_len integer;
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS patch_len integer;
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS duration_ms integer;
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS status text 
  CHECK (status IN ('ok', 'error')) DEFAULT 'ok';
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS patch_preview text;

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS ai_requests_user_created_idx 
  ON ai_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_requests_theme_created_idx 
  ON ai_requests (theme_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_requests_type_status_idx 
  ON ai_requests (request_type, status, created_at DESC);

-- Update RLS policies to handle new fields
-- Keep existing policies and add specific ones for llm-patch logs

-- Policy for inserting llm-patch logs (ensures user_id is set)
DO $$
BEGIN
  -- Check if policy already exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'ai_requests' 
    AND policyname = 'Users can create llm-patch logs'
  ) THEN
    CREATE POLICY "Users can create llm-patch logs" 
      ON ai_requests 
      FOR INSERT 
      WITH CHECK (
        request_type = 'llm-patch' AND auth.uid() = user_id
      );
  END IF;
END$$;

-- Add comment for field semantics
COMMENT ON COLUMN ai_requests.prompt_len IS 'Length of userPrompt string in characters';
COMMENT ON COLUMN ai_requests.patch_len IS 'Number of operations in JSON Patch array';
COMMENT ON COLUMN ai_requests.duration_ms IS 'Total processing duration in milliseconds (rounded)';
COMMENT ON COLUMN ai_requests.patch_preview IS 'First 2000 characters of JSON.stringify(patch)';
COMMENT ON COLUMN ai_requests.request_type IS 'Type of AI request: llm-patch, style-analysis, etc.';

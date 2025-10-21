-- Remove unused autofill preview view
-- This view was created for testing SQL heuristics but is not used in production
-- All autofill functionality works through:
-- 1. public.upsert_ai_vision_mappings() RPC (with SECURITY DEFINER, correct usage)
-- 2. Direct queries to wallet_elements (with RLS policies applied)

DROP VIEW IF EXISTS public.wallet_elements_autofill_preview;

-- Note: Helper functions strip_screen_prefix() and compute_json_path() are kept
-- as they may be useful for future migrations or admin queries
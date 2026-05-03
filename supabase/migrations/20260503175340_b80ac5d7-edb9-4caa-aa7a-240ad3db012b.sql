
ALTER FUNCTION public.strip_screen_prefix(text, text) SET search_path = public;
ALTER FUNCTION public.update_nft_rating_stats(text) SET search_path = public;
ALTER FUNCTION public.compute_json_path(text, text, text, text, text) SET search_path = public;
ALTER FUNCTION public.upsert_ai_vision_mappings(text[], text[]) SET search_path = public;
ALTER FUNCTION public.cleanup_expired_nonces() SET search_path = public;

-- Revoke EXECUTE from anon/authenticated on internal SECURITY DEFINER functions.
-- They will still be callable by service_role used by edge functions and triggers.
REVOKE EXECUTE ON FUNCTION public.update_nft_rating_stats(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.upsert_ai_vision_mappings(text[], text[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_nonces() FROM PUBLIC, anon, authenticated;

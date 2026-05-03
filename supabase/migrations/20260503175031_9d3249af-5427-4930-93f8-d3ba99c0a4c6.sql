
-- 1. Lock down user_themes read access (was: public read all rows)
DROP POLICY IF EXISTS "Temporary public read access to user_themes" ON public.user_themes;

CREATE POLICY "Users can view their own themes"
ON public.user_themes
FOR SELECT
USING (user_id = COALESCE((auth.uid())::text, 'anonymous'::text));

-- 2. nft_listings: writes happen via edge functions using service role (bypasses RLS).
-- Remove permissive public INSERT/UPDATE.
DROP POLICY IF EXISTS "Anyone can create listings" ON public.nft_listings;
DROP POLICY IF EXISTS "Sellers can update their listings" ON public.nft_listings;

-- 3. nft_auctions: same — writes go through `auction` edge function with service role.
DROP POLICY IF EXISTS "Anyone can create auctions" ON public.nft_auctions;
DROP POLICY IF EXISTS "Anyone can update auctions" ON public.nft_auctions;

-- 4. nft_bids: writes go through `auction` edge function (place_bid).
DROP POLICY IF EXISTS "Anyone can place bids" ON public.nft_bids;

-- 5. nft_ratings: writes go through `rate_nft` edge function with service role.
DROP POLICY IF EXISTS "Anyone can rate" ON public.nft_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.nft_ratings;

-- 6. Set search_path on functions that lacked it (prevents search_path hijacking).
ALTER FUNCTION public.validate_rating_range() SET search_path = public;
ALTER FUNCTION public.trigger_update_rating_stats() SET search_path = public;
ALTER FUNCTION public.validate_listing_price() SET search_path = public;
ALTER FUNCTION public.validate_listing_status() SET search_path = public;
ALTER FUNCTION public.cleanup_old_bridge_snapshots() SET search_path = public;
ALTER FUNCTION public.update_auction_updated_at() SET search_path = public;
ALTER FUNCTION public.prevent_json_path_overwrite() SET search_path = public;
ALTER FUNCTION public.trigger_refresh_feedback_analytics() SET search_path = public;
ALTER FUNCTION public.validate_auth_nonce_expiry() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_user_themes_updated_at() SET search_path = public;
ALTER FUNCTION public.update_style_like_count() SET search_path = public;
ALTER FUNCTION public.refresh_feedback_analytics() SET search_path = public;
ALTER FUNCTION public.trigger_cleanup_expired_nonces() SET search_path = public;
ALTER FUNCTION public.update_wallet_layout_layers_updated_at() SET search_path = public;
ALTER FUNCTION public.update_themes_updated_at() SET search_path = public;
ALTER FUNCTION public.get_final_icon_path(text, uuid) SET search_path = public;

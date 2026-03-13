
-- Add finalize_error column for debugging failed finalizations
ALTER TABLE public.nft_auctions ADD COLUMN IF NOT EXISTS finalize_error text;

-- Add RLS policy for service role to update bids (for refund marking)
-- The service role bypasses RLS, but we need authenticated/anon to not update bids
-- Current state: no UPDATE policy on nft_bids, which is correct for client-side
-- Service role already bypasses RLS, so no changes needed for refunds

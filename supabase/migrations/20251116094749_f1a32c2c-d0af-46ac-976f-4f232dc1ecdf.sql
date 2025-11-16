-- Create unique index for nft_ratings to enable upsert
-- This ensures one user can rate one NFT only once
CREATE UNIQUE INDEX IF NOT EXISTS nft_ratings_nft_user_unique 
ON public.nft_ratings (nft_mint, user_wallet);

-- Add comment for documentation
COMMENT ON INDEX nft_ratings_nft_user_unique IS 'Ensures one user can only rate an NFT once. Enables upsert via Prefer: resolution=merge-duplicates';
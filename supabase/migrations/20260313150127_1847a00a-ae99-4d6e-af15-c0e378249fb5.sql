ALTER TABLE public.nft_auctions ADD COLUMN IF NOT EXISTS platform_fee_signature text;
ALTER TABLE public.nft_auctions ADD COLUMN IF NOT EXISTS royalty_fee_signature text;
-- ============================================
-- NFT Auctions Tables Migration
-- ============================================

-- 1. Create nft_auctions table
CREATE TABLE IF NOT EXISTS public.nft_auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_mint TEXT NOT NULL,
  seller_wallet TEXT NOT NULL,
  start_price_lamports BIGINT NOT NULL,
  current_price_lamports BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SOL',
  status TEXT NOT NULL DEFAULT 'active',
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  winner_wallet TEXT,
  tx_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Create nft_bids table
CREATE TABLE IF NOT EXISTS public.nft_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.nft_auctions(id) ON DELETE CASCADE,
  bidder_wallet TEXT NOT NULL,
  bid_price_lamports BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auctions_nft_mint ON public.nft_auctions(nft_mint);
CREATE INDEX IF NOT EXISTS idx_auctions_seller ON public.nft_auctions(seller_wallet);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON public.nft_auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_end_at ON public.nft_auctions(end_at);
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON public.nft_bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON public.nft_bids(bidder_wallet);

-- 4. Enable Row Level Security
ALTER TABLE public.nft_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_bids ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for nft_auctions
CREATE POLICY "Anyone can view auctions"
  ON public.nft_auctions
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create auctions"
  ON public.nft_auctions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update auctions"
  ON public.nft_auctions
  FOR UPDATE
  USING (true);

-- 6. Create RLS policies for nft_bids
CREATE POLICY "Anyone can view bids"
  ON public.nft_bids
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can place bids"
  ON public.nft_bids
  FOR INSERT
  WITH CHECK (true);

-- 7. Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_auction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_auction_updated_at
  BEFORE UPDATE ON public.nft_auctions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_auction_updated_at();
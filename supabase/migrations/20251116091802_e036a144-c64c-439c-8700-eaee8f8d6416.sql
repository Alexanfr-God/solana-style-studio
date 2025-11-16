-- ============================================
-- Step 3: Fixed-Price Marketplace
-- ============================================

-- 1. Create nft_listings table
CREATE TABLE public.nft_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_mint text NOT NULL,
  seller_wallet text NOT NULL,
  price_lamports bigint NOT NULL,
  currency text NOT NULL DEFAULT 'SOL',
  status text NOT NULL DEFAULT 'active',
  buyer_wallet text,
  tx_signature text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Platform fee (10%) - calculated columns
  fee_lamports bigint GENERATED ALWAYS AS (price_lamports / 10) STORED,
  seller_receives_lamports bigint GENERATED ALWAYS AS (price_lamports - (price_lamports / 10)) STORED
);

-- Validation trigger for price
CREATE OR REPLACE FUNCTION public.validate_listing_price()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.price_lamports <= 0 THEN
    RAISE EXCEPTION 'Price must be greater than 0';
  END IF;
  
  IF NEW.price_lamports < 100000000 THEN
    RAISE EXCEPTION 'Price must be at least 0.1 SOL (100000000 lamports)';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_listing_price_trigger
  BEFORE INSERT OR UPDATE ON public.nft_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_listing_price();

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_listing_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'sold', 'cancelled') THEN
    RAISE EXCEPTION 'Status must be active, sold, or cancelled';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_listing_status_trigger
  BEFORE INSERT OR UPDATE ON public.nft_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_listing_status();

-- Indexes for performance
CREATE INDEX idx_nft_listings_mint ON public.nft_listings(nft_mint);
CREATE INDEX idx_nft_listings_seller ON public.nft_listings(seller_wallet);
CREATE INDEX idx_nft_listings_status ON public.nft_listings(status);
CREATE INDEX idx_nft_listings_active ON public.nft_listings(status, created_at DESC) WHERE status = 'active';

-- RLS Policies
ALTER TABLE public.nft_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view listings
CREATE POLICY "Anyone can view listings"
  ON public.nft_listings FOR SELECT
  USING (true);

-- Anyone can create listings (wallet-based)
CREATE POLICY "Anyone can create listings"
  ON public.nft_listings FOR INSERT
  WITH CHECK (true);

-- Sellers can update their own listings
CREATE POLICY "Sellers can update their listings"
  ON public.nft_listings FOR UPDATE
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_nft_listings_updated_at
  BEFORE UPDATE ON public.nft_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add listing fields to minted_themes
ALTER TABLE public.minted_themes
  ADD COLUMN price_lamports bigint,
  ADD COLUMN is_listed boolean DEFAULT false,
  ADD COLUMN listing_id uuid REFERENCES public.nft_listings(id) ON DELETE SET NULL;

-- Index for filtering listed NFTs
CREATE INDEX idx_minted_themes_listed ON public.minted_themes(is_listed, price_lamports) WHERE is_listed = true;
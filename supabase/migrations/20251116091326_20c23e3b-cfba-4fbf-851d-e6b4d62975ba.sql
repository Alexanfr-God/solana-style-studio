-- ============================================
-- Step 2: Rating System (5-star ratings)
-- ============================================

-- 1. Create nft_ratings table
CREATE TABLE public.nft_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_mint text NOT NULL,
  user_wallet text NOT NULL,
  rating integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_rating UNIQUE (nft_mint, user_wallet)
);

-- Validation trigger for rating range (1-5)
CREATE OR REPLACE FUNCTION public.validate_rating_range()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_rating_range_trigger
  BEFORE INSERT OR UPDATE ON public.nft_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_rating_range();

-- Index for fast queries
CREATE INDEX idx_nft_ratings_mint ON public.nft_ratings(nft_mint);
CREATE INDEX idx_nft_ratings_user ON public.nft_ratings(user_wallet);

-- RLS Policies
ALTER TABLE public.nft_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view ratings
CREATE POLICY "Anyone can view ratings"
  ON public.nft_ratings FOR SELECT
  USING (true);

-- Anyone can create/update ratings (wallet-based auth)
CREATE POLICY "Anyone can rate"
  ON public.nft_ratings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own ratings"
  ON public.nft_ratings FOR UPDATE
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_nft_ratings_updated_at
  BEFORE UPDATE ON public.nft_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add rating fields to minted_themes
ALTER TABLE public.minted_themes
  ADD COLUMN rating_avg numeric(3,2) DEFAULT 0.0,
  ADD COLUMN rating_count integer DEFAULT 0;

-- Index for sorting by rating
CREATE INDEX idx_minted_themes_rating ON public.minted_themes(rating_avg DESC);

-- 3. Function to calculate and update rating stats
CREATE OR REPLACE FUNCTION public.update_nft_rating_stats(p_nft_mint text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_avg numeric;
  v_count integer;
BEGIN
  -- Calculate average rating and count
  SELECT 
    COALESCE(AVG(rating), 0)::numeric(3,2),
    COUNT(*)
  INTO v_avg, v_count
  FROM public.nft_ratings
  WHERE nft_mint = p_nft_mint;
  
  -- Update minted_themes
  UPDATE public.minted_themes
  SET 
    rating_avg = v_avg,
    rating_count = v_count
  WHERE mint_address = p_nft_mint;
END;
$$;

-- 4. Trigger to auto-update rating stats
CREATE OR REPLACE FUNCTION public.trigger_update_rating_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM public.update_nft_rating_stats(NEW.nft_mint);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.update_nft_rating_stats(OLD.nft_mint);
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER nft_ratings_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.nft_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_rating_stats();
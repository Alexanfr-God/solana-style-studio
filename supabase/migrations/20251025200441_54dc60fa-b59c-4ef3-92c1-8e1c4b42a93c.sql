-- Add blockchain column to minted_themes table
ALTER TABLE public.minted_themes 
ADD COLUMN IF NOT EXISTS blockchain text NOT NULL DEFAULT 'solana';

-- Add index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_minted_themes_blockchain 
ON public.minted_themes (blockchain);

-- Add index for network filtering (if not exists)
CREATE INDEX IF NOT EXISTS idx_minted_themes_network 
ON public.minted_themes (network);
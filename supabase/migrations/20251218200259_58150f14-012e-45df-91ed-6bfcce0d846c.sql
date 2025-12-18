-- Add is_verified column to minted_themes table
-- This tracks whether the NFT transaction was confirmed on blockchain

ALTER TABLE public.minted_themes 
ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- Mark all existing records as verified (backward compatibility)
UPDATE public.minted_themes SET is_verified = true;

-- Delete duplicate mint_addresses, keeping only the oldest record
DELETE FROM public.minted_themes a USING public.minted_themes b
WHERE a.id > b.id AND a.mint_address = b.mint_address;

-- Add unique constraint to prevent duplicate mints
ALTER TABLE public.minted_themes 
ADD CONSTRAINT unique_mint_address UNIQUE (mint_address);
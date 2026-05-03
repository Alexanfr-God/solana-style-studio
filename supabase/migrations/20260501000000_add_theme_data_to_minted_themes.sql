-- Add theme_data column to store WCCOverlayV3 JSON alongside the NFT
-- This is the key column that links an NFT to its overlay theme

ALTER TABLE minted_themes
  ADD COLUMN IF NOT EXISTS theme_data jsonb,
  ADD COLUMN IF NOT EXISTS collection_name text DEFAULT 'WCC';

-- Fast ownership lookup (walletAddress → themes)
CREATE INDEX IF NOT EXISTS idx_minted_themes_owner
  ON minted_themes(owner_address);

-- Fast mint lookup (mintAddress → theme)
CREATE INDEX IF NOT EXISTS idx_minted_themes_mint
  ON minted_themes(mint_address);

COMMENT ON COLUMN minted_themes.theme_data IS
  'WCCOverlayV3 JSON — the overlay theme unlocked by owning this NFT';

COMMENT ON COLUMN minted_themes.collection_name IS
  'Collection identifier, default WCC (Wallet Coast Customs)';

-- Add SOL escrow tracking columns to nft_bids table
ALTER TABLE nft_bids 
ADD COLUMN IF NOT EXISTS tx_signature TEXT,
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS refund_tx_signature TEXT;

-- Add comment explaining the columns
COMMENT ON COLUMN nft_bids.tx_signature IS 'Solana transaction signature confirming SOL transfer to escrow';
COMMENT ON COLUMN nft_bids.refunded IS 'Flag indicating if SOL was refunded to losing bidder';
COMMENT ON COLUMN nft_bids.refund_tx_signature IS 'Solana transaction signature for refund to losing bidder';
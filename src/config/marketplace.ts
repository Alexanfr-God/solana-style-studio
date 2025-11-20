/**
 * Marketplace Configuration
 * 
 * Contains all marketplace-related constants and helper functions
 */

export const MARKETPLACE_CONFIG = {
  // Platform fee in basis points (1000 = 10%)
  PLATFORM_FEE_BPS: 1000,
  
  // Royalty fee in basis points (500 = 5%)
  ROYALTY_FEE_BPS: 500,
  
  // Platform wallet address (Solana) - loaded from environment/secrets
  // This will be set dynamically from escrow_wallet secret
  PLATFORM_FEE_WALLET: '', // Set dynamically in edge functions
  
  // Escrow wallet for holding NFTs during auctions (same as platform wallet for MVP)
  ESCROW_WALLET: '', // Set dynamically from escrow_wallet secret
  
  // Escrow wallet PUBLIC key (safe to expose, used for client-side transfers)
  // This should be set to match your escrow_wallet secret's public key
  // Get it by running: solana-keygen pubkey <path-to-keypair.json>
  ESCROW_WALLET_PUBLIC_KEY: 'HzVB3L8hRALUq37WRNbj3RDjfm2fYRBVJQvxMYCQ6Qfx', // TODO: Update with actual escrow public key
  
  // Price limits (in lamports)
  MIN_LISTING_PRICE_LAMPORTS: 100_000_000, // 0.1 SOL
  MAX_LISTING_PRICE_LAMPORTS: 1_000_000_000_000, // 1000 SOL
  
  // Conversion constant
  LAMPORTS_PER_SOL: 1_000_000_000,
  
  // Solana network
  SOLANA_RPC_URL: 'https://api.devnet.solana.com',
  
  // Helper functions
  lamportsToSol: (lamports: number): number => {
    return lamports / 1_000_000_000;
  },
  
  solToLamports: (sol: number): number => {
    return Math.floor(sol * 1_000_000_000);
  },
  
  calculateFee: (priceLamports: number): number => {
    return Math.floor(priceLamports * 0.1);
  },
  
  calculateSellerReceives: (priceLamports: number): number => {
    return priceLamports - Math.floor(priceLamports * 0.1);
  },
  
  formatPrice: (lamports: number): string => {
    const sol = lamports / 1_000_000_000;
    return sol.toFixed(2);
  }
} as const;

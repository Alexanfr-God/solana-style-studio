/**
 * Marketplace Configuration
 * 
 * Contains all marketplace-related constants and helper functions
 */

export const MARKETPLACE_CONFIG = {
  // Platform fee in basis points (1000 = 10%)
  PLATFORM_FEE_BPS: 1000,
  
  // Platform wallet address (Solana)
  // TODO: Replace with actual platform wallet
  PLATFORM_FEE_WALLET: 'PLATFORM_WALLET_ADDRESS_PLACEHOLDER',
  
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

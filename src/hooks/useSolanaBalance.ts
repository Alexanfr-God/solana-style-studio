/**
 * Solana Balance Hook
 * Check user's SOL balance for auction operations
 */

import { useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { MARKETPLACE_CONFIG } from '@/config/marketplace';

const SOLANA_RPC_URL = MARKETPLACE_CONFIG.SOLANA_RPC_URL;

export interface SolanaBalanceInfo {
  balance: number; // in lamports
  balanceSOL: number; // in SOL
  isLoading: boolean;
  error: string | null;
  hasEnoughFor: (amountLamports: number) => boolean;
}

/**
 * Hook to check Solana balance for a wallet address
 */
export function useSolanaBalance(walletAddress: string | null): SolanaBalanceInfo {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const publicKey = new PublicKey(walletAddress);
        const balanceLamports = await connection.getBalance(publicKey);

        if (isMounted) {
          setBalance(balanceLamports);
        }
      } catch (err) {
        console.error('[useSolanaBalance] Error fetching balance:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch balance');
          setBalance(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBalance();

    // Poll balance every 30 seconds
    const intervalId = setInterval(fetchBalance, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [walletAddress]);

  const hasEnoughFor = (amountLamports: number): boolean => {
    // Add ~0.01 SOL for transaction fees
    const TRANSACTION_FEE = 0.01 * LAMPORTS_PER_SOL;
    return balance >= amountLamports + TRANSACTION_FEE;
  };

  return {
    balance,
    balanceSOL: balance / LAMPORTS_PER_SOL,
    isLoading,
    error,
    hasEnoughFor
  };
}

/**
 * Format balance for display
 */
export function formatBalanceSOL(lamports: number, decimals: number = 4): string {
  const sol = lamports / LAMPORTS_PER_SOL;
  return sol.toFixed(decimals);
}

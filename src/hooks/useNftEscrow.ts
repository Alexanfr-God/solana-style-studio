/**
 * Hook for NFT Escrow Operations
 * Handles transferring NFT to/from escrow during auction lifecycle
 */

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  Transaction, 
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import { toast } from 'sonner';
import { MARKETPLACE_CONFIG } from '@/config/marketplace';

export interface EscrowNftParams {
  nftMint: string;
  fromWallet: string;
}

export interface ReleaseNftParams {
  nftMint: string;
  toWallet: string;
}

export function useNftEscrow() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [isEscrowing, setIsEscrowing] = useState(false);

  /**
   * Transfer NFT to escrow wallet
   * Returns transaction signature on success
   */
  const escrowNft = async ({ nftMint, fromWallet }: EscrowNftParams): Promise<string> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    if (publicKey.toString() !== fromWallet) {
      throw new Error('Wallet mismatch');
    }

    setIsEscrowing(true);

    try {
      console.log('[escrow] 🔒 Starting NFT escrow...');
      console.log('[escrow] NFT Mint:', nftMint);
      console.log('[escrow] From:', fromWallet);
      console.log('[escrow] To Escrow:', MARKETPLACE_CONFIG.ESCROW_WALLET);

      const mintPubkey = new PublicKey(nftMint);
      const fromPubkey = new PublicKey(fromWallet);
      const escrowPubkey = new PublicKey(MARKETPLACE_CONFIG.ESCROW_WALLET);

      // Get token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        fromPubkey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const toTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        escrowPubkey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      console.log('[escrow] From Token Account:', fromTokenAccount.toString());
      console.log('[escrow] To Token Account:', toTokenAccount.toString());

      // Create transaction
      const transaction = new Transaction();

      // Check if escrow token account exists
      const toAccountInfo = await connection.getAccountInfo(toTokenAccount);
      
      if (!toAccountInfo) {
        console.log('[escrow] Creating escrow token account...');
        // Create associated token account for escrow
        transaction.add(
          createAssociatedTokenAccountInstruction(
            fromPubkey,
            toTokenAccount,
            escrowPubkey,
            mintPubkey,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Add transfer instruction (NFT amount = 1)
      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          fromPubkey,
          1,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      console.log('[escrow] Signing transaction...');
      const signed = await signTransaction(transaction);

      console.log('[escrow] Sending transaction...');
      const signature = await connection.sendRawTransaction(signed.serialize());

      console.log('[escrow] Confirming transaction...', signature);
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      console.log('[escrow] ✅ NFT escrowed successfully!');
      toast.success('NFT transferred to escrow');

      return signature;
    } catch (error: any) {
      console.error('[escrow] ❌ Error:', error);
      toast.error(`Escrow failed: ${error.message}`);
      throw error;
    } finally {
      setIsEscrowing(false);
    }
  };

  /**
   * Release NFT from escrow to winner
   * This should be called by the backend after auction finalization
   */
  const releaseNft = async ({ nftMint, toWallet }: ReleaseNftParams): Promise<string> => {
    // This will be implemented in Phase 4 (Finalization)
    // For now, just a placeholder
    throw new Error('Release NFT not yet implemented - will be done in Phase 4');
  };

  return {
    escrowNft,
    releaseNft,
    isEscrowing
  };
}

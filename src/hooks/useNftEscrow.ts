/**
 * Hook for NFT Escrow Operations
 * Uses AppKit provider (consistent with rest of app)
 */

import { useState } from 'react';
import { 
  Transaction, 
  PublicKey,
  SystemProgram,
  Connection
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
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
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('solana');
  const [isEscrowing, setIsEscrowing] = useState(false);

  /**
   * Transfer NFT to escrow wallet
   * Returns transaction signature on success
   */
  const escrowNft = async ({ nftMint, fromWallet }: EscrowNftParams): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (address !== fromWallet) {
      throw new Error('Wallet mismatch');
    }

    if (!walletProvider) {
      throw new Error('Wallet provider not available');
    }

    setIsEscrowing(true);

    try {
      console.log('[escrow] 🔒 Starting NFT escrow...');
      console.log('[escrow] NFT Mint:', nftMint);
      console.log('[escrow] From:', fromWallet);
      console.log('[escrow] To Escrow:', MARKETPLACE_CONFIG.ESCROW_WALLET_PUBLIC_KEY);

      const provider = walletProvider as any;
      const connection = new Connection(MARKETPLACE_CONFIG.SOLANA_RPC_URL, 'confirmed');

      const mintPubkey = new PublicKey(nftMint);
      const fromPubkey = new PublicKey(fromWallet);
      const escrowPubkey = new PublicKey(MARKETPLACE_CONFIG.ESCROW_WALLET_PUBLIC_KEY);

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
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      console.log('[escrow] Signing transaction via AppKit...');
      const signed = await provider.signTransaction(transaction);

      console.log('[escrow] Sending transaction...');
      const signature = await connection.sendRawTransaction(signed.serialize());

      console.log('[escrow] Confirming transaction...', signature);
      await connection.confirmTransaction(signature, 'confirmed');

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
   * This is handled server-side during finalization
   */
  const releaseNft = async ({ nftMint, toWallet }: ReleaseNftParams): Promise<string> => {
    throw new Error('Release NFT is handled server-side during finalization');
  };

  return {
    escrowNft,
    releaseNft,
    isEscrowing
  };
}

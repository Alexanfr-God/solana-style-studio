/**
 * Auction Payment Hook
 * Handles SOL payment from winner to complete auction finalization
 */

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { toast } from 'sonner';

interface PaymentFees {
  platformFee: number;
  royaltyFee: number;
  sellerReceives: number;
}

interface PayAuctionParams {
  sellerAddress: string;
  priceLamports: number;
  platformWallet: string;
}

export function useAuctionPayment() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [isPaying, setIsPaying] = useState(false);

  /**
   * Calculate fees (10% platform + 5% royalty)
   */
  const calculateFees = (priceLamports: number): PaymentFees => {
    const platformFee = Math.floor((priceLamports * 1000) / 10000); // 10%
    const royaltyFee = Math.floor((priceLamports * 500) / 10000); // 5%
    const sellerReceives = priceLamports - platformFee - royaltyFee;

    return {
      platformFee,
      royaltyFee,
      sellerReceives,
    };
  };

  /**
   * Execute payment transaction
   */
  const payForAuction = async ({
    sellerAddress,
    priceLamports,
    platformWallet,
  }: PayAuctionParams): Promise<string> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!signTransaction) {
      throw new Error('Wallet does not support transaction signing');
    }

    setIsPaying(true);

    try {
      console.log('[payment] Creating payment transaction...');
      console.log('[payment] Buyer:', publicKey.toString());
      console.log('[payment] Seller:', sellerAddress);
      console.log('[payment] Price:', priceLamports, 'lamports');

      const sellerPubkey = new PublicKey(sellerAddress);
      const platformPubkey = new PublicKey(platformWallet);

      // Calculate fees
      const fees = calculateFees(priceLamports);
      console.log('[payment] Platform fee:', fees.platformFee, 'lamports');
      console.log('[payment] Royalty fee:', fees.royaltyFee, 'lamports');
      console.log('[payment] Seller receives:', fees.sellerReceives, 'lamports');

      // Build transaction
      const transaction = new Transaction();

      // Transfer to seller (minus fees)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: sellerPubkey,
          lamports: fees.sellerReceives,
        })
      );

      // Transfer platform fee
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: platformPubkey,
          lamports: fees.platformFee,
        })
      );

      // Transfer royalty fee
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: platformPubkey,
          lamports: fees.royaltyFee,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      console.log('[payment] Requesting wallet signature...');
      
      // Sign transaction
      const signedTransaction = await signTransaction(transaction);

      console.log('[payment] Sending transaction...');

      // Send transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      console.log('[payment] Confirming transaction...');

      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('[payment] ✅ Payment successful!');
      console.log('[payment] Signature:', signature);

      toast.success('Payment completed successfully!');

      return signature;
    } catch (error) {
      console.error('[payment] ❌ Payment failed:', error);
      toast.error(`Payment failed: ${error.message}`);
      throw error;
    } finally {
      setIsPaying(false);
    }
  };

  return {
    payForAuction,
    isPaying,
    calculateFees,
  };
}

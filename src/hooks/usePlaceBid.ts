/**
 * Place Bid Hook with SOL Escrow
 */

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MARKETPLACE_CONFIG } from '@/config/marketplace';

interface PlaceBidParams {
  auction_id: string;
  bid_price_lamports: number;
}

export function usePlaceBid() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [isPlacing, setIsPlacing] = useState(false);

  const placeBid = async ({ auction_id, bid_price_lamports }: PlaceBidParams) => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet');
      throw new Error('Wallet not connected');
    }

    setIsPlacing(true);

    try {
      const escrowPublicKey = new PublicKey(MARKETPLACE_CONFIG.ESCROW_WALLET_PUBLIC_KEY);

      toast.info('Transferring SOL to escrow...');

      // 1. Create SOL transfer transaction to escrow
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: escrowPublicKey,
          lamports: bid_price_lamports,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // 2. Sign and send transaction
      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());

      toast.info('Confirming transaction...');

      // 3. Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      toast.success('SOL transferred to escrow!');
      toast.info('Creating bid...');

      // 4. Call edge function with transaction signature
      const { data, error } = await supabase.functions.invoke('auction', {
        body: {
          action: 'place_bid',
          auction_id,
          bidder_wallet: publicKey.toString(),
          bid_price_lamports,
          tx_signature: signature,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to place bid');

      toast.success('Bid placed successfully!');
      
      return data;
    } catch (error: any) {
      console.error('Place bid error:', error);
      toast.error(error.message || 'Failed to place bid');
      throw error;
    } finally {
      setIsPlacing(false);
    }
  };

  return {
    placeBid,
    isPlacing,
  };
}

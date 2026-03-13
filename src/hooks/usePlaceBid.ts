/**
 * Place Bid Hook with SOL Escrow (AppKit Integration)
 * Supports STUB_MODE via VITE_AUCTION_STUB_MODE env var for testing without real SOL transfers.
 */

import { useState } from 'react';
import { Transaction, SystemProgram, PublicKey, Connection } from '@solana/web3.js';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MARKETPLACE_CONFIG } from '@/config/marketplace';

const STUB_MODE = import.meta.env.VITE_AUCTION_STUB_MODE === 'true';

interface PlaceBidParams {
  auction_id: string;
  bid_price_lamports: number;
}

export function usePlaceBid() {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('solana');
  const [isPlacing, setIsPlacing] = useState(false);

  const placeBid = async ({ auction_id, bid_price_lamports }: PlaceBidParams) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      throw new Error('Wallet not connected');
    }

    setIsPlacing(true);

    try {
      let signature: string;

      if (STUB_MODE) {
        // STUB: skip real SOL transfer, use placeholder signature
        console.log('[usePlaceBid] STUB_MODE: skipping real SOL transfer');
        toast.info('STUB MODE: Simulating bid...');
        signature = `stub_client_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else {
        if (!walletProvider) {
          toast.error('Please connect your wallet');
          throw new Error('Wallet provider not available');
        }

        const provider = walletProvider as any;
        const connection = new Connection(MARKETPLACE_CONFIG.SOLANA_RPC_URL, 'confirmed');
        const escrowPublicKey = new PublicKey(MARKETPLACE_CONFIG.ESCROW_WALLET_PUBLIC_KEY);

        toast.info('Transferring SOL to escrow...');

        const publicKey = new PublicKey(address);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: escrowPublicKey,
            lamports: bid_price_lamports,
          })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const signedTx = await provider.signTransaction(transaction);
        signature = await connection.sendRawTransaction(signedTx.serialize());

        toast.info('Confirming transaction...');
        await connection.confirmTransaction(signature, 'confirmed');
        toast.success('SOL transferred to escrow!');
      }

      toast.info('Creating bid...');

      const { data, error } = await supabase.functions.invoke('auction', {
        body: {
          action: 'bid',
          auction_id,
          bidder_wallet: address,
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

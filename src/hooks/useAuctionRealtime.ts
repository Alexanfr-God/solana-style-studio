/**
 * Hook for real-time auction updates via Supabase
 */

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Subscribe to real-time auction updates for a specific NFT
 */
export function useAuctionRealtimeByNft(nftMint: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!nftMint) return;

    const channel = supabase
      .channel(`auction-nft-${nftMint}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nft_auctions',
          filter: `nft_mint=eq.${nftMint}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[Auction Realtime] NFT auction update:', payload);
          
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['auction', 'nft', nftMint] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nftMint, queryClient]);
}

/**
 * Subscribe to real-time auction updates for a specific auction ID
 */
export function useAuctionRealtime(auctionId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!auctionId) return;

    const channel = supabase
      .channel(`auction-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nft_auctions',
          filter: `id=eq.${auctionId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[Auction Realtime] Auction update:', payload);
          
          // Invalidate auction query
          queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId, queryClient]);
}

/**
 * Subscribe to real-time bid updates for a specific auction
 */
export function useBidsRealtime(auctionId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!auctionId) return;

    const channel = supabase
      .channel(`bids-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'nft_bids',
          filter: `auction_id=eq.${auctionId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[Bids Realtime] New bid:', payload);
          
          // Invalidate bids and auction queries (auction updates current_price)
          queryClient.invalidateQueries({ queryKey: ['auction', 'bids', auctionId] });
          queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId, queryClient]);
}

/**
 * Combined hook for auction + bids real-time updates
 */
export function useAuctionWithBidsRealtime(auctionId: string | undefined) {
  useAuctionRealtime(auctionId);
  useBidsRealtime(auctionId);
}

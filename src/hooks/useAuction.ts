/**
 * Hook for fetching and managing auction data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Auction, Bid, CreateAuctionParams, PlaceBidParams } from '@/types/auction';
import { toast } from 'sonner';

/**
 * Fetch auction by NFT mint address
 */
export function useAuctionByNft(nftMint: string | undefined) {
  return useQuery({
    queryKey: ['auction', 'nft', nftMint],
    queryFn: async () => {
      if (!nftMint) return null;

      const { data, error } = await supabase
        .from('nft_auctions')
        .select('*')
        .eq('nft_mint', nftMint)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data as Auction | null;
    },
    enabled: !!nftMint
  });
}

/**
 * Fetch auction by ID
 */
export function useAuction(auctionId: string | undefined) {
  return useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      if (!auctionId) return null;

      const { data, error } = await supabase
        .from('nft_auctions')
        .select('*')
        .eq('id', auctionId)
        .single();

      if (error) throw error;
      return data as Auction;
    },
    enabled: !!auctionId
  });
}

/**
 * Fetch bids for an auction
 */
export function useAuctionBids(auctionId: string | undefined) {
  return useQuery({
    queryKey: ['auction', 'bids', auctionId],
    queryFn: async () => {
      if (!auctionId) return [];

      const { data, error } = await supabase
        .from('nft_bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Bid[];
    },
    enabled: !!auctionId
  });
}

/**
 * Create auction mutation
 */
export function useCreateAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateAuctionParams) => {
      const { data, error } = await supabase.functions.invoke('auction', {
        body: {
          action: 'create',
          ...params
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to create auction');

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auction', 'nft', variables.nft_mint] });
      queryClient.invalidateQueries({ queryKey: ['minted-themes'] });
      toast.success('Auction created successfully! 🎉');
    },
    onError: (error: Error) => {
      console.error('Create auction error:', error);
      toast.error(`Failed to create auction: ${error.message}`);
    }
  });
}

/**
 * Place bid mutation
 */
export function usePlaceBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: PlaceBidParams) => {
      const { data, error } = await supabase.functions.invoke('auction', {
        body: {
          action: 'bid',
          ...params
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to place bid');

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auction', variables.auction_id] });
      queryClient.invalidateQueries({ queryKey: ['auction', 'bids', variables.auction_id] });
      toast.success('Bid placed successfully! 🎉');
    },
    onError: (error: Error) => {
      console.error('Place bid error:', error);
      toast.error(`Failed to place bid: ${error.message}`);
    }
  });
}

/**
 * Cancel auction mutation
 */
export function useCancelAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { auction_id: string; seller_wallet: string }) => {
      const { data, error } = await supabase.functions.invoke('auction', {
        body: {
          action: 'cancel',
          ...params
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to cancel auction');

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auction', variables.auction_id] });
      toast.success('Auction cancelled successfully');
    },
    onError: (error: Error) => {
      console.error('Cancel auction error:', error);
      toast.error(`Failed to cancel auction: ${error.message}`);
    }
  });
}

/**
 * Finalize auction mutation (for testing)
 */
export function useFinalizeAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { auction_id: string }) => {
      const { data, error } = await supabase.functions.invoke('auction', {
        body: {
          action: 'finalize',
          ...params
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to finalize auction');

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auction', variables.auction_id] });
      queryClient.invalidateQueries({ queryKey: ['minted-themes'] });
      toast.success('Auction finalized successfully');
    },
    onError: (error: Error) => {
      console.error('Finalize auction error:', error);
      toast.error(`Failed to finalize auction: ${error.message}`);
    }
  });
}

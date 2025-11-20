/**
 * Auction System Types
 */

export type AuctionStatus = 'active' | 'finished' | 'cancelled';

export interface Auction {
  id: string;
  nft_mint: string;
  seller_wallet: string;
  start_price_lamports: number;
  current_price_lamports: number;
  currency: string;
  status: AuctionStatus;
  end_at: string;
  winner_wallet: string | null;
  tx_signature: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  auction_id: string;
  bidder_wallet: string;
  bid_price_lamports: number;
  created_at: string;
  tx_signature?: string | null;
  refunded?: boolean;
  refund_tx_signature?: string | null;
}

export interface AuctionWithBids extends Auction {
  bids?: Bid[];
  bidCount?: number;
}

export interface CreateAuctionParams {
  nft_mint: string;
  seller_wallet: string;
  start_price_lamports: number;
  duration_hours: number;
}

export interface PlaceBidParams {
  auction_id: string;
  bidder_wallet: string;
  bid_price_lamports: number;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

/**
 * Auction Module Types
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

export interface NFT {
  mint_address: string;
  owner_address: string;
  is_listed: boolean;
  price_lamports: number | null;
}

export interface CreateAuctionRequest {
  nft_mint: string;
  seller_wallet: string;
  start_price_lamports: number;
  duration_hours: number;
}

export interface PlaceBidRequest {
  auction_id: string;
  bidder_wallet: string;
  bid_price_lamports: number;
  tx_signature: string;
}

export interface CancelAuctionRequest {
  auction_id: string;
  seller_wallet: string;
}

export interface FinalizeAuctionRequest {
  auction_id: string;
}

export interface SuccessResponse {
  success: true;
  data?: any;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse = SuccessResponse | ErrorResponse;

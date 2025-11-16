/**
 * Validation Utilities
 */

import {
  MIN_START_PRICE_LAMPORTS,
  MIN_BID_INCREMENT_LAMPORTS,
  MIN_DURATION_HOURS,
  MAX_DURATION_HOURS
} from './constants.ts';
import type { Auction } from '../types.ts';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate auction creation parameters
 */
export function validateCreateAuction(params: {
  nft_mint?: string;
  seller_wallet?: string;
  start_price_lamports?: number;
  duration_hours?: number;
}): void {
  const { nft_mint, seller_wallet, start_price_lamports, duration_hours } = params;

  if (!nft_mint || typeof nft_mint !== 'string') {
    throw new ValidationError('Invalid or missing nft_mint');
  }

  if (!seller_wallet || typeof seller_wallet !== 'string') {
    throw new ValidationError('Invalid or missing seller_wallet');
  }

  if (typeof start_price_lamports !== 'number' || start_price_lamports < MIN_START_PRICE_LAMPORTS) {
    throw new ValidationError(
      `Start price must be at least ${MIN_START_PRICE_LAMPORTS} lamports (0.1 SOL)`
    );
  }

  if (typeof duration_hours !== 'number' || 
      duration_hours < MIN_DURATION_HOURS || 
      duration_hours > MAX_DURATION_HOURS) {
    throw new ValidationError(
      `Duration must be between ${MIN_DURATION_HOURS} hours (1 day) and ${MAX_DURATION_HOURS} hours (1 year)`
    );
  }
}

/**
 * Validate bid parameters
 */
export function validatePlaceBid(params: {
  auction_id?: string;
  bidder_wallet?: string;
  bid_price_lamports?: number;
}): void {
  const { auction_id, bidder_wallet, bid_price_lamports } = params;

  if (!auction_id || typeof auction_id !== 'string') {
    throw new ValidationError('Invalid or missing auction_id');
  }

  if (!bidder_wallet || typeof bidder_wallet !== 'string') {
    throw new ValidationError('Invalid or missing bidder_wallet');
  }

  if (typeof bid_price_lamports !== 'number' || bid_price_lamports <= 0) {
    throw new ValidationError('Invalid bid price');
  }
}

/**
 * Validate bid amount against auction
 */
export function validateBidAmount(
  auction: Auction,
  bidPrice: number,
  bidderWallet: string
): void {
  // Check if auction is active
  if (auction.status !== 'active') {
    throw new ValidationError('Auction is not active');
  }

  // Check if auction has ended
  if (new Date(auction.end_at) < new Date()) {
    throw new ValidationError('Auction has ended');
  }

  // Bidder cannot be seller
  if (auction.seller_wallet === bidderWallet) {
    throw new ValidationError('Cannot bid on your own auction');
  }

  // Check bid is higher than current price
  const minBidPrice = auction.current_price_lamports + MIN_BID_INCREMENT_LAMPORTS;
  if (bidPrice < minBidPrice) {
    throw new ValidationError(
      `Bid must be at least ${minBidPrice} lamports (current price + 0.01 SOL)`
    );
  }
}

/**
 * Validate cancel auction parameters
 */
export function validateCancelAuction(params: {
  auction_id?: string;
  seller_wallet?: string;
}): void {
  const { auction_id, seller_wallet } = params;

  if (!auction_id || typeof auction_id !== 'string') {
    throw new ValidationError('Invalid or missing auction_id');
  }

  if (!seller_wallet || typeof seller_wallet !== 'string') {
    throw new ValidationError('Invalid or missing seller_wallet');
  }
}

/**
 * Validate finalize auction parameters
 */
export function validateFinalizeAuction(params: {
  auction_id?: string;
}): void {
  const { auction_id } = params;

  if (!auction_id || typeof auction_id !== 'string') {
    throw new ValidationError('Invalid or missing auction_id');
  }
}

/**
 * Check if auction can be cancelled
 */
export function canCancelAuction(auction: Auction, sellerWallet: string, hasBids: boolean): void {
  if (auction.status !== 'active') {
    throw new ValidationError('Auction is not active');
  }

  if (auction.seller_wallet !== sellerWallet) {
    throw new ValidationError('Only the seller can cancel this auction');
  }

  if (hasBids) {
    throw new ValidationError('Cannot cancel auction with existing bids');
  }
}

/**
 * Check if auction can be finalized
 */
export function canFinalizeAuction(auction: Auction): void {
  if (auction.status !== 'active') {
    throw new ValidationError('Auction is not active or already finalized');
  }

  if (new Date(auction.end_at) > new Date()) {
    throw new ValidationError('Auction has not ended yet');
  }
}

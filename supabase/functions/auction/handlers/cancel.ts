/**
 * Cancel Auction Handler
 */

import type { CancelAuctionRequest, ApiResponse } from '../types.ts';
import { validateCancelAuction, canCancelAuction } from '../utils/validation.ts';
import {
  fetchAuction,
  hasBids,
  updateAuction,
  updateNFT
} from '../utils/database.ts';

export async function handleCancelAuction(
  request: CancelAuctionRequest
): Promise<ApiResponse> {
  console.log('[cancel-auction] 🎯 Request:', request);

  try {
    // Validate input
    validateCancelAuction(request);

    const { auction_id, seller_wallet } = request;

    console.log('[cancel-auction] 📡 Fetching auction...');

    // Fetch auction
    const auction = await fetchAuction(auction_id, 'active');
    if (!auction) {
      throw new Error('Auction not found or inactive');
    }

    // Check if auction has bids
    const hasBidsOnAuction = await hasBids(auction_id);

    // Validate cancellation
    canCancelAuction(auction, seller_wallet, hasBidsOnAuction);

    console.log('[cancel-auction] ✅ Auction can be cancelled');
    console.log('[cancel-auction] 🔄 Cancelling auction...');

    // Update auction
    await updateAuction(auction_id, {
      status: 'cancelled'
    });

    console.log('[cancel-auction] ✅ Auction cancelled');
    console.log('[cancel-auction] 🔄 Updating NFT status...');

    // Update NFT
    await updateNFT(auction.nft_mint, {
      is_listed: false,
      price_lamports: null
    });

    console.log('[cancel-auction] ✅ Success');

    return {
      success: true,
      message: 'Auction cancelled successfully'
    };
  } catch (error) {
    console.error('[cancel-auction] ❌ Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

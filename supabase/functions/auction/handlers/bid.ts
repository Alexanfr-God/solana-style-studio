/**
 * Place Bid Handler
 */

import type { PlaceBidRequest, ApiResponse } from '../types.ts';
import { validatePlaceBid, validateBidAmount } from '../utils/validation.ts';
import {
  fetchAuction,
  createBid,
  updateAuction,
  updateNFT
} from '../utils/database.ts';

export async function handlePlaceBid(
  request: PlaceBidRequest
): Promise<ApiResponse> {
  console.log('[place-bid] 🎯 Request:', request);

  try {
    // Validate input
    validatePlaceBid(request);

    const { auction_id, bidder_wallet, bid_price_lamports } = request;

    console.log('[place-bid] 📡 Fetching auction...');

    // Fetch auction
    const auction = await fetchAuction(auction_id, 'active');
    if (!auction) {
      throw new Error('Auction not found or inactive');
    }

    // Validate bid amount
    validateBidAmount(auction, bid_price_lamports, bidder_wallet);

    console.log('[place-bid] ✅ Auction valid');
    console.log('[place-bid] 💾 Saving bid...');

    // Create bid
    const bid = await createBid({
      auction_id,
      bidder_wallet,
      bid_price_lamports
    });

    console.log('[place-bid] ✅ Bid saved:', bid.id);
    console.log('[place-bid] 🔄 Updating auction...');

    // Update auction
    await updateAuction(auction_id, {
      current_price_lamports: bid_price_lamports,
      winner_wallet: bidder_wallet
    });

    // Update NFT price display
    await updateNFT(auction.nft_mint, {
      price_lamports: bid_price_lamports
    });

    console.log('[place-bid] ✅ Success');

    return {
      success: true,
      data: {
        bid,
        new_current_price: bid_price_lamports
      }
    };
  } catch (error) {
    console.error('[place-bid] ❌ Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

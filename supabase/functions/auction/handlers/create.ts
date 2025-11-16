/**
 * Create Auction Handler
 */

import type { CreateAuctionRequest, ApiResponse } from '../types.ts';
import { validateCreateAuction } from '../utils/validation.ts';
import {
  fetchNFT,
  hasActiveAuction,
  createAuction,
  updateNFT
} from '../utils/database.ts';

export async function handleCreateAuction(
  request: CreateAuctionRequest
): Promise<ApiResponse> {
  console.log('[create-auction] 🎯 Request:', request);

  try {
    // Validate input
    validateCreateAuction(request);

    const { nft_mint, seller_wallet, start_price_lamports, duration_hours } = request;

    console.log('[create-auction] 📡 Checking NFT ownership...');

    // Fetch NFT
    const nft = await fetchNFT(nft_mint);
    if (!nft) {
      throw new Error('NFT not found');
    }

    // Verify ownership
    if (nft.owner_address !== seller_wallet) {
      throw new Error('You do not own this NFT');
    }

    // Check if already listed
    if (nft.is_listed) {
      throw new Error('NFT is already listed for sale');
    }

    // Check for active auction
    const hasActive = await hasActiveAuction(nft_mint);
    if (hasActive) {
      throw new Error('NFT already has an active auction');
    }

    console.log('[create-auction] ✅ Ownership verified');

    // Calculate end time
    const endAt = new Date();
    endAt.setHours(endAt.getHours() + duration_hours);

    console.log('[create-auction] 💾 Creating auction...');

    // Create auction
    const auction = await createAuction({
      nft_mint,
      seller_wallet,
      start_price_lamports,
      end_at: endAt.toISOString()
    });

    console.log('[create-auction] ✅ Auction created:', auction.id);
    console.log('[create-auction] 🔄 Updating NFT status...');

    // Update NFT (mark as in auction)
    await updateNFT(nft_mint, {
      is_listed: true,
      price_lamports: start_price_lamports
    });

    console.log('[create-auction] ✅ Success');

    return {
      success: true,
      data: {
        auction: {
          ...auction,
          time_remaining_hours: duration_hours,
          time_remaining_seconds: duration_hours * 3600
        }
      }
    };
  } catch (error) {
    console.error('[create-auction] ❌ Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

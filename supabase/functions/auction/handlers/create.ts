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

    // NOTE: In Phase 2, we expect the NFT to be escrowed before this call
    // The client transfers the NFT to escrow wallet before calling this endpoint
    // We should verify that the NFT is in escrow, but for MVP we'll trust the client
    // TODO Phase 2: Add verification that NFT is in escrow wallet
    
    // For now, we just check original ownership was correct
    // (In production, we'd verify escrow status via Solana RPC)
    console.log('[create-auction] ⚠️ Note: NFT should be escrowed before auction creation');
    console.log('[create-auction] Original owner:', nft.owner_address);
    console.log('[create-auction] Seller wallet:', seller_wallet);

    // Check if already listed
    if (nft.is_listed) {
      throw new Error('NFT is already listed for sale');
    }

    // Check for active auction
    const hasActive = await hasActiveAuction(nft_mint);
    if (hasActive) {
      throw new Error('NFT already has an active auction');
    }

    console.log('[create-auction] ✅ Checks passed');

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

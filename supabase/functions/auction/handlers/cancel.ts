/**
 * Cancel Auction Handler
 * Returns NFT from escrow back to seller on cancellation.
 */

import type { CancelAuctionRequest, ApiResponse } from '../types.ts';
import { validateCancelAuction, canCancelAuction } from '../utils/validation.ts';
import {
  fetchAuction,
  hasBids,
  updateAuction,
  updateNFT
} from '../utils/database.ts';
import { STUB_MODE } from '../utils/constants.ts';
import { transferNFTFromEscrow } from '../utils/solana.ts';

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

    // Return NFT from escrow to seller
    let nftReturnSignature: string | null = null;
    if (STUB_MODE) {
      nftReturnSignature = `stub_nft_return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('[cancel-auction] 🧪 STUB NFT return:', nftReturnSignature);
    } else {
      try {
        console.log('[cancel-auction] 🔄 Returning NFT from escrow to seller...');
        nftReturnSignature = await transferNFTFromEscrow(auction.nft_mint, seller_wallet);
        console.log('[cancel-auction] ✅ NFT returned to seller:', nftReturnSignature);
      } catch (error) {
        console.error('[cancel-auction] ❌ Failed to return NFT:', error);
        throw new Error(`Failed to return NFT from escrow: ${error.message}`);
      }
    }

    console.log('[cancel-auction] 🔄 Cancelling auction...');

    // Update auction with return signature
    await updateAuction(auction_id, {
      status: 'cancelled',
      tx_signature: nftReturnSignature
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
      message: 'Auction cancelled successfully',
      data: {
        nft_return_signature: nftReturnSignature,
        ...(STUB_MODE && { warning: 'STUB MODE: No real NFT return' })
      }
    };
  } catch (error) {
    console.error('[cancel-auction] ❌ Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

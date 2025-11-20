/**
 * Finalize Auction Handler
 */

import type { FinalizeAuctionRequest, ApiResponse } from '../types.ts';
import { validateFinalizeAuction, canFinalizeAuction } from '../utils/validation.ts';
import { fetchAuction, updateAuction, updateNFT } from '../utils/database.ts';
import { STUB_MODE } from '../utils/constants.ts';
import { finalizeAuctionOnChain, calculateFees } from '../utils/solana.ts';

export async function handleFinalizeAuction(
  request: FinalizeAuctionRequest
): Promise<ApiResponse> {
  console.log('[finalize-auction] 🎯 Request:', request);

  try {
    // Validate input
    validateFinalizeAuction(request);

    const { auction_id } = request;

    console.log('[finalize-auction] 📡 Fetching auction...');

    // Fetch auction
    const auction = await fetchAuction(auction_id, 'active');
    if (!auction) {
      throw new Error('Auction not found or already finalized');
    }

    // Validate finalization
    canFinalizeAuction(auction);

    // Check if there's a winner
    if (!auction.winner_wallet) {
      console.log('[finalize-auction] ⚠️ No bids, cancelling auction');

      // No winner, cancel auction
      await updateAuction(auction_id, {
        status: 'cancelled'
      });

      // Update NFT
      await updateNFT(auction.nft_mint, {
        is_listed: false,
        price_lamports: null
      });

      return {
        success: true,
        data: {
          result: 'cancelled',
          message: 'No bids received, auction cancelled'
        }
      };
    }

    console.log('[finalize-auction] ✅ Winner found:', auction.winner_wallet);

    let nftTransferSignature: string;
    let solPaymentSignature: string;

    if (STUB_MODE) {
      console.log('[finalize-auction] 💰 Processing payment (STUB MODE)...');
      
      // Stub mode: generate fake signatures
      nftTransferSignature = `stub_nft_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      solPaymentSignature = `stub_sol_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate fees for logging
      const fees = calculateFees(auction.current_price_lamports);
      console.log('[finalize-auction] Platform fee:', fees.platformFee, 'lamports');
      console.log('[finalize-auction] Royalty fee:', fees.royaltyFee, 'lamports');
      console.log('[finalize-auction] Seller receives:', fees.sellerReceives, 'lamports');
    } else {
      console.log('[finalize-auction] 💰 Processing Solana blockchain transactions...');
      
      try {
        // Execute blockchain transactions
        const result = await finalizeAuctionOnChain(
          auction.nft_mint,
          auction.winner_wallet,
          auction.seller_wallet,
          auction.current_price_lamports
        );
        
        nftTransferSignature = result.nftTransferSignature;
        solPaymentSignature = result.solPaymentSignature;
        
        console.log('[finalize-auction] ✅ Blockchain transactions completed');
        console.log('[finalize-auction] NFT transfer:', nftTransferSignature);
        console.log('[finalize-auction] SOL payment:', solPaymentSignature);
      } catch (error) {
        console.error('[finalize-auction] ❌ Blockchain transaction failed:', error);
        throw new Error(`Blockchain transaction failed: ${error.message}`);
      }
    }

    console.log('[finalize-auction] 🔄 Finalizing auction...');

    // Update auction as finished
    await updateAuction(auction_id, {
      status: 'finished',
      tx_signature: nftTransferSignature // Store NFT transfer signature as main tx
    });

    console.log('[finalize-auction] ✅ Auction finalized');
    console.log('[finalize-auction] 🔄 Transferring NFT to winner...');

    // Update NFT (transfer to winner)
    await updateNFT(auction.nft_mint, {
      owner_address: auction.winner_wallet,
      is_listed: false,
      price_lamports: null
    });

    console.log('[finalize-auction] ✅ Success' + (STUB_MODE ? ' (STUB MODE)' : ''));

    const fees = calculateFees(auction.current_price_lamports);

    return {
      success: true,
      data: {
        result: 'sold',
        winner: auction.winner_wallet,
        final_price: auction.current_price_lamports,
        nft_transfer_signature: nftTransferSignature,
        sol_payment_signature: solPaymentSignature,
        fees: {
          platform_fee: fees.platformFee,
          royalty_fee: fees.royaltyFee,
          seller_receives: fees.sellerReceives
        },
        ...(STUB_MODE && {
          warning: 'STUB MODE: No real blockchain transaction'
        })
      }
    };
  } catch (error) {
    console.error('[finalize-auction] ❌ Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Auto-finalize expired auctions (called by cron)
 */
export async function autoFinalizeExpiredAuctions(): Promise<ApiResponse> {
  console.log('[auto-finalize] 🔄 Starting auto-finalize...');

  try {
    const { fetchExpiredAuctions } = await import('../utils/database.ts');
    const expiredAuctions = await fetchExpiredAuctions();

    console.log(`[auto-finalize] Found ${expiredAuctions.length} expired auctions`);

    const results = {
      total: expiredAuctions.length,
      finalized: 0,
      cancelled: 0,
      errors: 0
    };

    for (const auction of expiredAuctions) {
      try {
        const result = await handleFinalizeAuction({ auction_id: auction.id });
        
        if (result.success) {
          if (result.data?.result === 'sold') {
            results.finalized++;
          } else if (result.data?.result === 'cancelled') {
            results.cancelled++;
          }
        } else {
          results.errors++;
        }
      } catch (error) {
        console.error(`[auto-finalize] Failed to finalize ${auction.id}:`, error);
        results.errors++;
      }
    }

    console.log('[auto-finalize] ✅ Completed:', results);

    return {
      success: true,
      data: results
    };
  } catch (error) {
    console.error('[auto-finalize] ❌ Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

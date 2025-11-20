/**
 * Finalize Auction Handler
 */

import type { FinalizeAuctionRequest, ApiResponse, Bid } from '../types.ts';
import { validateFinalizeAuction, canFinalizeAuction } from '../utils/validation.ts';
import { fetchAuction, updateAuction, updateNFT } from '../utils/database.ts';
import { STUB_MODE } from '../utils/constants.ts';
import { finalizeAuctionOnChain, calculateFees, getConnection, getEscrowKeypair } from '../utils/solana.ts';
import { PublicKey, Transaction, SystemProgram } from 'https://esm.sh/@solana/web3.js@1.98.2';

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

    console.log('[finalize-auction] 🔄 Processing refunds for losing bidders...');

    // Refund SOL to all losing bidders
    const refundResults = await refundLosingBidders(auction_id, auction.winner_wallet);

    console.log('[finalize-auction] ✅ Success' + (STUB_MODE ? ' (STUB MODE)' : ''));
    console.log(`[finalize-auction] Refunded ${refundResults.refunded} losing bids`);

    const fees = calculateFees(auction.current_price_lamports);

    return {
      success: true,
      data: {
        result: 'sold',
        winner: auction.winner_wallet,
        final_price: auction.current_price_lamports,
        nft_transfer_signature: nftTransferSignature,
        sol_payment_signature: solPaymentSignature,
        refunds: refundResults,
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
 * Refund SOL to all losing bidders
 */
async function refundLosingBidders(
  auctionId: string, 
  winnerWallet: string
): Promise<{ refunded: number; failed: number; errors: string[] }> {
  const results = {
    refunded: 0,
    failed: 0,
    errors: [] as string[]
  };

  try {
    // Import Supabase utilities
    const { fetchWithHeaders } = await import('../utils/database.ts');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    
    // Fetch all non-refunded bids except winner's
    const response = await fetchWithHeaders(
      `${SUPABASE_URL}/rest/v1/nft_bids?auction_id=eq.${auctionId}&bidder_wallet=neq.${winnerWallet}&refunded=eq.false&select=*`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch losing bids: ${response.statusText}`);
    }

    const losingBids: Bid[] = await response.json();
    
    console.log(`[refund] Found ${losingBids.length} bids to refund`);

    if (losingBids.length === 0) {
      return results;
    }

    // Get connection and escrow keypair
    const connection = getConnection();
    const escrowKeypair = getEscrowKeypair();

    // Process each refund
    for (const bid of losingBids) {
      try {
        console.log(`[refund] Processing refund for ${bid.bidder_wallet}: ${bid.bid_price_lamports} lamports`);

        // Create refund transaction
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: escrowKeypair.publicKey,
            toPubkey: new PublicKey(bid.bidder_wallet),
            lamports: bid.bid_price_lamports,
          })
        );

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = escrowKeypair.publicKey;

        // Sign and send
        transaction.sign(escrowKeypair);
        const signature = await connection.sendRawTransaction(transaction.serialize());
        
        // Confirm transaction
        await connection.confirmTransaction(signature, 'confirmed');

        // Update bid record
        const updateResponse = await fetchWithHeaders(
          `${SUPABASE_URL}/rest/v1/nft_bids?id=eq.${bid.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              refunded: true,
              refund_tx_signature: signature
            })
          }
        );

        if (!updateResponse.ok) {
          throw new Error(`Failed to update bid ${bid.id}: ${updateResponse.statusText}`);
        }

        console.log(`[refund] ✅ Refunded to ${bid.bidder_wallet}: ${signature}`);
        results.refunded++;
      } catch (error) {
        console.error(`[refund] ❌ Failed to refund bid ${bid.id}:`, error);
        results.failed++;
        results.errors.push(`${bid.bidder_wallet}: ${error.message}`);
      }
    }

    console.log('[refund] Complete:', results);
    return results;
  } catch (error) {
    console.error('[refund] ❌ Error processing refunds:', error);
    results.errors.push(error.message);
    return results;
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

/**
 * Finalize Auction Handler
 */

import type { FinalizeAuctionRequest, ApiResponse, Bid } from '../types.ts';
import { validateFinalizeAuction, canFinalizeAuction } from '../utils/validation.ts';
import { fetchAuction, updateAuction, updateNFT, fetchWithHeaders } from '../utils/database.ts';
import { STUB_MODE } from '../utils/constants.ts';
import { finalizeAuctionOnChain, calculateFees, getConnection, getEscrowKeypair } from '../utils/solana.ts';

export async function handleFinalizeAuction(
  request: FinalizeAuctionRequest
): Promise<ApiResponse> {
  console.log('[finalize-auction] 🎯 Request:', request);

  try {
    validateFinalizeAuction(request);
    const { auction_id } = request;

    // Fetch auction — accept 'active' only (not already finalizing/finished)
    const auction = await fetchAuction(auction_id);
    if (!auction) throw new Error('Auction not found');

    // Idempotency: already done
    if (auction.status === 'finished') {
      return { success: true, data: { result: 'already_finalized', message: 'Auction already finalized' } };
    }
    if (auction.status === 'finalizing') {
      return { success: false, error: 'Auction is currently being finalized. Please wait.' };
    }
    if (auction.status !== 'active' && auction.status !== 'finalize_failed') {
      throw new Error(`Cannot finalize auction with status: ${auction.status}`);
    }

    canFinalizeAuction(auction);

    if (!auction.winner_wallet) {
      console.log('[finalize-auction] ⚠️ No bids, cancelling auction');
      await updateAuction(auction_id, { status: 'cancelled' });
      await updateNFT(auction.nft_mint, { is_listed: false, price_lamports: null });
      return { success: true, data: { result: 'cancelled', message: 'No bids received, auction cancelled' } };
    }

    console.log('[finalize-auction] ✅ Winner found:', auction.winner_wallet);

    // === IDEMPOTENCY GUARD: set status to 'finalizing' ===
    await updateAuction(auction_id, { status: 'finalizing', finalize_error: null });

  let nftTransferSignature: string;
  let solPaymentSignature: string;
  let platformFeeSignature: string;
  let royaltyFeeSignature: string;

    try {
      if (STUB_MODE) {
        console.log('[finalize-auction] 💰 Processing payment (STUB MODE)...');
        nftTransferSignature = `stub_nft_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        solPaymentSignature = `stub_sol_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        platformFeeSignature = `stub_platform_fee_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        royaltyFeeSignature = `stub_royalty_fee_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fees = calculateFees(auction.current_price_lamports);
        console.log('[finalize-auction] Fees (stub):', fees);
      } else {
        console.log('[finalize-auction] 💰 Processing Solana blockchain transactions...');
        const result = await finalizeAuctionOnChain(
          auction.nft_mint, auction.winner_wallet, auction.seller_wallet, auction.current_price_lamports
        );
        nftTransferSignature = result.nftTransferSignature;
        solPaymentSignature = result.solPaymentSignature;
        platformFeeSignature = result.platformFeeSignature;
        royaltyFeeSignature = result.royaltyFeeSignature;
      }
    } catch (chainError) {
      // On-chain failure: mark as finalize_failed so it can be retried
      console.error('[finalize-auction] ❌ On-chain finalize failed:', chainError);
      await updateAuction(auction_id, { status: 'finalize_failed', finalize_error: chainError.message });
      throw new Error(`On-chain finalization failed: ${chainError.message}`);
    }

    // Store all signatures and mark finished
    await updateAuction(auction_id, {
      status: 'finished',
      tx_signature: nftTransferSignature,
      seller_payment_signature: solPaymentSignature,
      platform_fee_signature: platformFeeSignature,
      royalty_fee_signature: royaltyFeeSignature,
      finalize_error: null,
    });
    await updateNFT(auction.nft_mint, { owner_address: auction.winner_wallet, is_listed: false, price_lamports: null });

    console.log('[finalize-auction] 🔄 Processing refunds for losing bidders...');
    const refundResults = await refundLosingBidders(auction_id, auction.winner_wallet);

    const fees = calculateFees(auction.current_price_lamports);
    return {
      success: true,
      data: {
        result: 'sold',
        winner: auction.winner_wallet,
        final_price: auction.current_price_lamports,
        nft_transfer_signature: nftTransferSignature,
        sol_payment_signature: solPaymentSignature,
        platform_fee_signature: platformFeeSignature,
        royalty_fee_signature: royaltyFeeSignature,
        refunds: refundResults,
        fees: { platform_fee: fees.platformFee, royalty_fee: fees.royaltyFee, seller_receives: fees.sellerReceives },
        ...(STUB_MODE && { warning: 'STUB MODE: No real blockchain transaction' })
      }
    };
  } catch (error) {
    console.error('[finalize-auction] ❌ Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Refund SOL to all losing bidders
 */
async function refundLosingBidders(
  auctionId: string, winnerWallet: string
): Promise<{ refunded: number; failed: number; errors: string[] }> {
  const results = { refunded: 0, failed: 0, errors: [] as string[] };

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const response = await fetchWithHeaders(
      `${SUPABASE_URL}/rest/v1/nft_bids?auction_id=eq.${auctionId}&bidder_wallet=neq.${winnerWallet}&refunded=eq.false&select=*`
    );

    if (!response.ok) throw new Error(`Failed to fetch losing bids: ${response.statusText}`);

    const losingBids: Bid[] = await response.json();
    console.log(`[refund] Found ${losingBids.length} bids to refund`);
    if (losingBids.length === 0) return results;

    if (STUB_MODE) {
      for (const bid of losingBids) {
        const stubSig = `stub_refund_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await fetchWithHeaders(`${SUPABASE_URL}/rest/v1/nft_bids?id=eq.${bid.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ refunded: true, refund_tx_signature: stubSig })
        });
        console.log(`[refund] 🧪 STUB refund for ${bid.bidder_wallet}: ${stubSig}`);
        results.refunded++;
      }
      return results;
    }

    const { PublicKey, Transaction, SystemProgram } = await import('npm:@solana/web3.js@1.98.2');
    const connection = await getConnection();
    const escrowKeypair = await getEscrowKeypair();

    for (const bid of losingBids) {
      try {
        console.log(`[refund] Refunding ${bid.bidder_wallet}: ${bid.bid_price_lamports} lamports`);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: escrowKeypair.publicKey,
            toPubkey: new PublicKey(bid.bidder_wallet),
            lamports: bid.bid_price_lamports,
          })
        );
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = escrowKeypair.publicKey;
        transaction.sign(escrowKeypair);
        const signature = await connection.sendRawTransaction(transaction.serialize());
        await connection.confirmTransaction(signature, 'confirmed');

        await fetchWithHeaders(`${SUPABASE_URL}/rest/v1/nft_bids?id=eq.${bid.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ refunded: true, refund_tx_signature: signature })
        });
        console.log(`[refund] ✅ Refunded to ${bid.bidder_wallet}: ${signature}`);
        results.refunded++;
      } catch (error) {
        console.error(`[refund] ❌ Failed to refund bid ${bid.id}:`, error);
        results.failed++;
        results.errors.push(`${bid.bidder_wallet}: ${error.message}`);
      }
    }
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

    const results = { total: expiredAuctions.length, finalized: 0, cancelled: 0, errors: 0 };

    for (const auction of expiredAuctions) {
      try {
        const result = await handleFinalizeAuction({ auction_id: auction.id });
        if (result.success) {
          if (result.data?.result === 'sold') results.finalized++;
          else if (result.data?.result === 'cancelled') results.cancelled++;
        } else results.errors++;
      } catch { results.errors++; }
    }

    console.log('[auto-finalize] ✅ Completed:', results);
    return { success: true, data: results };
  } catch (error) {
    console.error('[auto-finalize] ❌ Error:', error);
    return { success: false, error: error.message };
  }
}

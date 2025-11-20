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
import { getConnection, getEscrowKeypair } from '../utils/solana.ts';

export async function handlePlaceBid(
  request: PlaceBidRequest
): Promise<ApiResponse> {
  console.log('[place-bid] 🎯 Request:', request);

  try {
    // Validate input
    validatePlaceBid(request);

    const { auction_id, bidder_wallet, bid_price_lamports, tx_signature } = request;

    // Validate transaction signature
    if (!tx_signature) {
      throw new Error('Transaction signature is required');
    }

    console.log('[place-bid] 🔍 Verifying SOL transfer...');

    // Verify transaction on-chain
    const connection = getConnection();
    const txInfo = await connection.getTransaction(tx_signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    if (!txInfo) {
      throw new Error('Transaction not found on blockchain');
    }

    // Get escrow wallet address
    const escrowKeypair = getEscrowKeypair();
    const escrowPublicKey = escrowKeypair.publicKey.toString();

    // Verify transaction details
    let validTransfer = false;
    const postBalances = txInfo.meta?.postBalances || [];
    const preBalances = txInfo.meta?.preBalances || [];
    const accountKeys = txInfo.transaction.message.staticAccountKeys || [];

    // Find escrow account index
    const escrowIndex = accountKeys.findIndex(key => key.toString() === escrowPublicKey);
    
    if (escrowIndex !== -1) {
      const balanceChange = postBalances[escrowIndex] - preBalances[escrowIndex];
      
      // Check if the balance change matches the bid amount (allow small variance for fees)
      if (Math.abs(balanceChange - bid_price_lamports) < 1000) {
        validTransfer = true;
        console.log('[place-bid] ✅ Valid transfer verified:', balanceChange, 'lamports');
      } else {
        console.error('[place-bid] ❌ Balance mismatch:', {
          expected: bid_price_lamports,
          actual: balanceChange
        });
      }
    }

    if (!validTransfer) {
      throw new Error('Invalid SOL transfer to escrow. Amount does not match bid.');
    }

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

    // Create bid with transaction signature
    const bid = await createBid({
      auction_id,
      bidder_wallet,
      bid_price_lamports,
      tx_signature
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

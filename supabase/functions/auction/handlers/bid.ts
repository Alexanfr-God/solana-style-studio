/**
 * Place Bid Handler
 */

import type { PlaceBidRequest, ApiResponse } from '../types.ts';
import { validatePlaceBid, validateBidAmount } from '../utils/validation.ts';
import { fetchAuction, createBid, updateAuction, updateNFT } from '../utils/database.ts';
import { getConnection, getEscrowKeypair } from '../utils/solana.ts';

export async function handlePlaceBid(
  request: PlaceBidRequest
): Promise<ApiResponse> {
  console.log('[place-bid] 🎯 Request:', request);

  try {
    validatePlaceBid(request);
    const { auction_id, bidder_wallet, bid_price_lamports, tx_signature } = request;

    if (!tx_signature) throw new Error('Transaction signature is required');

    console.log('[place-bid] 🔍 Verifying SOL transfer...');

    const connection = await getConnection();
    const txInfo = await connection.getTransaction(tx_signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    if (!txInfo) throw new Error('Transaction not found on blockchain');

    const escrowKeypair = await getEscrowKeypair();
    const escrowPublicKey = escrowKeypair.publicKey.toString();

    let validTransfer = false;
    const postBalances = txInfo.meta?.postBalances || [];
    const preBalances = txInfo.meta?.preBalances || [];
    const accountKeys = txInfo.transaction.message.staticAccountKeys || [];

    const escrowIndex = accountKeys.findIndex((key: any) => key.toString() === escrowPublicKey);
    if (escrowIndex !== -1) {
      const balanceChange = postBalances[escrowIndex] - preBalances[escrowIndex];
      if (Math.abs(balanceChange - bid_price_lamports) < 1000) {
        validTransfer = true;
        console.log('[place-bid] ✅ Valid transfer verified:', balanceChange, 'lamports');
      }
    }

    if (!validTransfer) throw new Error('Invalid SOL transfer to escrow. Amount does not match bid.');

    const auction = await fetchAuction(auction_id, 'active');
    if (!auction) throw new Error('Auction not found or inactive');

    validateBidAmount(auction, bid_price_lamports, bidder_wallet);

    const bid = await createBid({ auction_id, bidder_wallet, bid_price_lamports, tx_signature });
    console.log('[place-bid] ✅ Bid saved:', bid.id);

    await updateAuction(auction_id, { current_price_lamports: bid_price_lamports, winner_wallet: bidder_wallet });
    await updateNFT(auction.nft_mint, { price_lamports: bid_price_lamports });

    return { success: true, data: { bid, new_current_price: bid_price_lamports } };
  } catch (error) {
    console.error('[place-bid] ❌ Error:', error);
    return { success: false, error: error.message };
  }
}

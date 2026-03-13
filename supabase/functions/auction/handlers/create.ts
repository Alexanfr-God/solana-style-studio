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
import { getConnection, getEscrowKeypair } from '../utils/solana.ts';
import { STUB_MODE } from '../utils/constants.ts';

/**
 * Verify that the NFT is actually held by the escrow wallet on-chain
 */
async function verifyNftInEscrow(nftMint: string): Promise<boolean> {
  console.log('[create-auction] 🔍 Verifying NFT is in escrow on-chain...');
  
  try {
    const web3 = await import('npm:@solana/web3.js@1.98.2');
    const connection = await getConnection();
    const escrowKeypair = await getEscrowKeypair();
    
    const mintPubkey = new web3.PublicKey(nftMint);
    const escrowPubkey = escrowKeypair.publicKey;

    // Derive the escrow's associated token account for this NFT
    const TOKEN_PROGRAM_ID = new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    const ASSOCIATED_TOKEN_PROGRAM_ID = new web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
    
    const [ata] = web3.PublicKey.findProgramAddressSync(
      [escrowPubkey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintPubkey.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log('[create-auction] Escrow ATA:', ata.toString());

    // Check the token account balance
    const accountInfo = await connection.getAccountInfo(ata);
    if (!accountInfo) {
      console.log('[create-auction] ❌ Escrow token account does not exist');
      return false;
    }

    // Parse SPL token account data: amount is at offset 64, 8 bytes LE
    const data = accountInfo.data;
    if (data.length < 72) {
      console.log('[create-auction] ❌ Invalid token account data');
      return false;
    }

    // Read u64 amount at offset 64
    const amount = data.readBigUInt64LE(64);
    console.log('[create-auction] Escrow token balance:', amount.toString());

    if (amount < 1n) {
      console.log('[create-auction] ❌ Escrow does not hold this NFT (balance = 0)');
      return false;
    }

    console.log('[create-auction] ✅ NFT confirmed in escrow');
    return true;
  } catch (error) {
    console.error('[create-auction] ❌ Escrow verification error:', error);
    return false;
  }
}

export async function handleCreateAuction(
  request: CreateAuctionRequest
): Promise<ApiResponse> {
  console.log('[create-auction] 🎯 Request:', request);

  try {
    // Validate input
    validateCreateAuction(request);

    const { nft_mint, seller_wallet, start_price_lamports, duration_hours } = request;

    console.log('[create-auction] 📡 Checking NFT...');

    // Fetch NFT
    const nft = await fetchNFT(nft_mint);
    if (!nft) {
      throw new Error('NFT not found');
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

    // On-chain escrow verification
    if (STUB_MODE) {
      console.log('[create-auction] 🧪 STUB_MODE: skipping on-chain escrow verification');
    } else {
      const isInEscrow = await verifyNftInEscrow(nft_mint);
      if (!isInEscrow) {
        throw new Error('NFT is not in escrow. Please transfer the NFT to escrow before creating an auction.');
      }
    }

    console.log('[create-auction] ✅ All checks passed');

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

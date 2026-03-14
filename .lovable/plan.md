

# Stage 4 Hardening Implementation Plan

## Summary
Two files to patch. No DB migration needed.

---

## File 1: `supabase/functions/auction/utils/solana.ts`

**Add `validateSettlementPreconditions` function** (append after `getAssociatedTokenAddress`, before `transferNFTFromEscrow`):

```typescript
export async function validateSettlementPreconditions(
  nftMint: string, winnerAddress: string, sellerAddress: string, priceLamports: number
): Promise<void> {
  const { PublicKey } = await getWeb3();
  
  // Validate all destination addresses
  const addressChecks = [
    { name: 'winner_wallet', value: winnerAddress },
    { name: 'seller_wallet', value: sellerAddress },
    { name: 'TREASURY_WALLET', value: Deno.env.get('TREASURY_WALLET') },
    { name: 'ROYALTY_WALLET', value: Deno.env.get('ROYALTY_WALLET') },
  ];
  for (const { name, value } of addressChecks) {
    if (!value) throw new Error(`Pre-validation failed: ${name} is not configured`);
    try { new PublicKey(value); } 
    catch { throw new Error(`Pre-validation failed: ${name} is not a valid Solana public key: ${value}`); }
  }

  // Validate escrow keypair
  const escrowKeypair = await getEscrowKeypair();

  // Validate price
  if (!priceLamports || priceLamports <= 0) {
    throw new Error('Pre-validation failed: price_lamports must be > 0');
  }

  // Check escrow holds NFT
  const connection = await getConnection();
  const mintPubkey = new PublicKey(nftMint);
  const escrowATA = await getAssociatedTokenAddress(mintPubkey, escrowKeypair.publicKey);
  const ataInfo = await connection.getAccountInfo(escrowATA);
  let nftBalance = 0;
  if (ataInfo && ataInfo.data.length >= 72) {
    nftBalance = Number(new DataView(ataInfo.data.buffer, ataInfo.data.byteOffset).getBigUint64(64, true));
  }
  if (nftBalance < 1) {
    throw new Error(`Pre-validation failed: escrow does not hold NFT ${nftMint}`);
  }

  // Check escrow SOL balance covers all payouts + buffer
  const fees = calculateFees(priceLamports);
  const totalNeeded = fees.sellerReceives + fees.platformFee + fees.royaltyFee + 15_000_000;
  const escrowBalance = await connection.getBalance(escrowKeypair.publicKey);
  if (escrowBalance < totalNeeded) {
    throw new Error(
      `Pre-validation failed: escrow SOL balance ${escrowBalance} < required ${totalNeeded} ` +
      `(seller: ${fees.sellerReceives}, platform: ${fees.platformFee}, royalty: ${fees.royaltyFee}, buffer: 15000000)`
    );
  }
}
```

No other changes to solana.ts. The existing `finalizeAuctionOnChain` function will no longer be called from finalize.ts (but kept for backward compatibility).

---

## File 2: `supabase/functions/auction/handlers/finalize.ts`

**Changes to imports** (line 9): Add individual transfer functions and `validateSettlementPreconditions`:

```typescript
import { 
  calculateFees, validateSettlementPreconditions,
  transferNFTFromEscrow, transferSOLPayment, transferPlatformFee, transferRoyaltyFee,
  getConnection, getEscrowKeypair 
} from '../utils/solana.ts';
```

**Add partial settlement detection** after line 33 (after status checks, before `canFinalizeAuction`):

```typescript
// Block retry if partial settlement already occurred
const hasPartialSettlement = auction.tx_signature || auction.seller_payment_signature || 
  auction.platform_fee_signature || auction.royalty_fee_signature;
if (hasPartialSettlement) {
  return { success: false, error: 'partial_settlement_detected: manual_resolution_required' };
}
```

**Replace the on-chain block** (lines 54-78 non-stub path and lines 80-89 post-settlement DB write):

The non-stub `else` branch (lines 63-72) becomes step-by-step with checkpoints. The catch block and post-settlement write are restructured:

```typescript
try {
  if (STUB_MODE) {
    // ... existing stub logic unchanged ...
  } else {
    // Pre-validate all addresses and balances before any transfer
    await validateSettlementPreconditions(
      auction.nft_mint, auction.winner_wallet, auction.seller_wallet, auction.current_price_lamports
    );

    const completedSteps: string[] = [];

    try {
      // Step 1: NFT transfer
      nftTransferSignature = await transferNFTFromEscrow(auction.nft_mint, auction.winner_wallet);
      await updateAuction(auction_id, { tx_signature: nftTransferSignature });
      await updateNFT(auction.nft_mint, { owner_address: auction.winner_wallet, is_listed: false, price_lamports: null });
      completedSteps.push('NFT transfer');

      // Step 2: Seller payout
      solPaymentSignature = await transferSOLPayment(auction.winner_wallet, auction.seller_wallet, auction.current_price_lamports);
      await updateAuction(auction_id, { seller_payment_signature: solPaymentSignature });
      completedSteps.push('seller payout');

      // Step 3: Platform fee
      platformFeeSignature = await transferPlatformFee(auction.current_price_lamports);
      await updateAuction(auction_id, { platform_fee_signature: platformFeeSignature });
      completedSteps.push('platform fee');

      // Step 4: Royalty fee
      royaltyFeeSignature = await transferRoyaltyFee(auction.current_price_lamports);
      await updateAuction(auction_id, { royalty_fee_signature: royaltyFeeSignature });
      completedSteps.push('royalty fee');
    } catch (stepError) {
      const partialMsg = completedSteps.length > 0
        ? `Partial settlement: ${completedSteps.join(', ')} completed. Failed at next step: ${stepError.message}`
        : `Settlement failed before any transfer: ${stepError.message}`;
      console.error('[finalize-auction] ❌ ' + partialMsg);
      await updateAuction(auction_id, { status: 'finalize_failed', finalize_error: partialMsg });
      throw new Error(partialMsg);
    }
  }
} catch (chainError) {
  console.error('[finalize-auction] ❌ On-chain finalize failed:', chainError);
  // Only update status if not already set by the step-level catch
  if (!chainError.message.startsWith('Partial settlement:') && !chainError.message.startsWith('Settlement failed')) {
    await updateAuction(auction_id, { status: 'finalize_failed', finalize_error: chainError.message });
  }
  throw new Error(`On-chain finalization failed: ${chainError.message}`);
}

// All steps succeeded — mark finished
await updateAuction(auction_id, { status: 'finished', finalize_error: null });
```

The `await updateNFT(...)` call on line 89 is removed since it now happens at step 1.

The rest of the handler (refunds + response) stays unchanged.

---

## Verification After Deploy

1. Call finalize on auction `445d571b` — must return `partial_settlement_detected: manual_resolution_required`
2. Manually reconcile that auction via SQL
3. Create a new clean auction and run the full happy-path settlement test


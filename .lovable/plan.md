

# Stage 4 Plan — Clarification Responses + Implementation Spec

## 1. DB Columns — Already Exist

From the schema provided in context, `nft_auctions` has all four columns:

- `seller_payment_signature` — text, nullable
- `platform_fee_signature` — text, nullable  
- `royalty_fee_signature` — text, nullable
- `finalize_error` — text, nullable

No migration required.

## 2. Settlement Model — Explicit Statement

Yes. The auction is marked `finished` after **core settlement only** (4 transfers):
1. NFT → winner
2. SOL → seller (net)
3. SOL → treasury (platform fee)
4. SOL → royalty wallet

Refunds are processed **after** the status is set to `finished`. A refund failure does not change the auction status. This is by design — the auction result is final once the winner receives the NFT and the seller receives payment. Refunds are a separate post-settlement operation.

## 3. Multiple Bids from the Same Winner

Current bid handler behavior (line 68 of `bid.ts`):
```
await updateAuction(auction_id, { current_price_lamports: bid_price_lamports, winner_wallet: bidder_wallet });
```

Each bid creates a separate `nft_bids` row with `bid_price_lamports` = the amount of SOL transferred in that specific bid transaction. The winner is always the last highest bidder.

**Refund query** (line 127 of `finalize.ts`):
```
bidder_wallet=neq.${winnerWallet}&refunded=eq.false
```

This filters by `bidder_wallet != winnerWallet`. So if the winner placed 2 bids (e.g., 0.11 SOL then 0.15 SOL), **both bids are excluded from refunds** — neither the winning bid nor their earlier bid gets refunded.

**This is correct behavior for this escrow model**: the winner sent 0.11 + 0.15 = 0.26 SOL to escrow, but only pays `current_price_lamports` (0.15 SOL, the winning amount). The earlier 0.11 SOL bid is stuck in escrow.

**Required fix**: The winner's **non-winning bids** must also be refunded. The refund query should exclude only the winning bid row, not all bids from the winner's wallet.

Fix: change the refund query to exclude bids by the winner that match the winning price, or better — refund all bids from the winner except the one matching `current_price_lamports` (the highest). Simplest correct approach: refund all bids where `bidder_wallet = winnerWallet AND bid_price_lamports != current_price_lamports`, plus all bids where `bidder_wallet != winnerWallet`.

## 4. Retry Rule — Exact Logic

Current code rejects `finalizing` with a hard error (line 28-29). The plan:

- `active` → allowed (normal finalize)
- `finalize_failed` → allowed (retry after known failure)
- `finalizing` → **reject with error** (no stale timeout for MVP). The operator must manually set status to `finalize_failed` via SQL if a `finalizing` auction is truly stuck. This avoids any risk of double-execution.
- `finished` → idempotent success (already done)
- `cancelled` → reject

**No automatic stale timeout**. If `finalizing` gets stuck (edge function crash), manual DB update to `finalize_failed` is the recovery path. This is safest for MVP.

**NFT idempotency on retry**: Before transferring the NFT, check if the escrow ATA still holds it. If escrow balance = 0 and winner ATA balance >= 1, skip NFT transfer. This makes `finalize_failed` retries safe even after partial on-chain success.

## 5. Refund Failure — Observability

Current behavior is already good:
- Each bid is processed independently in a try/catch (line 153-180)
- Failed refunds: `results.failed++`, error message pushed to `results.errors[]`
- The bid row keeps `refunded=false` and `refund_tx_signature=null`
- Successful refunds: bid row updated to `refunded=true` with signature

**How to detect failed refunds later**: Query `nft_bids` where `auction_id` belongs to a `finished` auction, `bidder_wallet != winner_wallet`, and `refunded = false`. These are unrefunded losing bids.

**How to retry**: Call finalize again — but refunds only run for `refunded=false` bids, so re-running would require a separate retry mechanism. For MVP, the simplest approach: add a dedicated `retry_refunds` action that re-runs `refundLosingBidders` for a given auction_id (only if status = `finished`).

No — per the rules, we should not add new actions before proving the core cycle. Instead: the finalize response already returns the refund results with exact error details. For MVP, failed refunds are detectable via:
1. The finalize API response (`refunds.failed > 0`, `refunds.errors`)
2. DB query: `SELECT * FROM nft_bids WHERE auction_id = X AND refunded = false AND bidder_wallet != winner_wallet`
3. Edge function logs

Manual retry: re-run the refund SOL transfer manually or via a future `retry_refunds` action (post-MVP).

---

## Implementation Plan — Exact Changes

### File 1: `supabase/functions/auction/utils/solana.ts`

**Change A**: Add NFT idempotency check to `transferNFTFromEscrow`
- Before building the transfer transaction, check escrow ATA balance
- If balance = 0, check winner ATA balance. If >= 1, log and return `"already_transferred"` string
- If both are 0, throw error (NFT is lost)

**Change B**: Make `transferPlatformFee` throw if `TREASURY_WALLET` is missing (not silently skip)

**Change C**: Make `transferRoyaltyFee` throw if `ROYALTY_WALLET` is missing (not silently skip)

**Change D**: Update `finalizeAuctionOnChain` to handle the `"already_transferred"` return from NFT transfer

### File 2: `supabase/functions/auction/handlers/finalize.ts`

**Change E**: Fix refund query to also refund the winner's non-winning bids
- Change from: `bidder_wallet=neq.${winnerWallet}`
- Change to: fetch all bids for the auction, then filter out only the single winning bid row (the one matching `winner_wallet` + `current_price_lamports`), refund everything else

**Change F**: Keep `finalizing` status as hard rejection (no stale timeout). Document that manual DB recovery is needed if stuck.

No other files change. No migration. No frontend changes.

### Deployment
- Deploy updated `auction` edge function
- Test with real finalize call on the existing auction with verified bid


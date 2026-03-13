

# STAGE 4 VERIFICATION PLAN

## 1. Preconditions

Before triggering finalize, ALL of the following must be true:

| # | Check | Current Value | Required | Status |
|---|---|---|---|---|
| 1 | `nft_auctions.status` | `active` | `active` or `finalize_failed` | OK |
| 2 | `nft_auctions.end_at` | `2026-03-16 16:25:38` (future) | Must be in the past | NEEDS UPDATE |
| 3 | `nft_auctions.winner_wallet` | `3ni66gLWZjSppB6vBSZxAMpJWV6PqLypznECKD5wFHhD` | Not null | OK |
| 4 | `nft_auctions.current_price_lamports` | `110000000` | Matches winning bid | OK |
| 5 | NFT location | Must be in escrow ATA for mint `54FBsA8vTjW2QqG8HtjqmEAnQDfxNvy677dDwMou56DS` | Verify on Explorer | VERIFY |
| 6 | Escrow SOL balance | Must have >= 0.11 SOL + tx fees (~0.01 SOL buffer for 4 transactions + ATA rent ~0.002 SOL) | Verify on Explorer | VERIFY |
| 7 | `AUCTION_STUB_MODE` secret | Must be `false` | If not set or any other value, code runs in STUB mode and produces fake signatures | CRITICAL — VERIFY |
| 8 | `TREASURY_WALLET` secret | Must be a valid Solana public address | Code throws if missing (post Stage 4 patch) | VERIFY |
| 9 | `ROYALTY_WALLET` secret | Must be a valid Solana public address | Code throws if missing (post Stage 4 patch) | VERIFY |
| 10 | `escrow_wallet` secret | Must be 64-byte keypair matching `84Wp2wrc...` | Already verified in Stage 2/3 | OK |

### Pre-flight verification commands

**Check escrow SOL balance** (Solana Explorer):
```
https://explorer.solana.com/address/84Wp2wrcJofvYP4ovWy39KtkmoYrrtWLtrVgBW6BT9K3?cluster=devnet
```
Need at least ~0.125 SOL (0.11 for payouts + fees + ATA rent).

**Check NFT is in escrow** (Solana Explorer):
```
https://explorer.solana.com/address/84Wp2wrcJofvYP4ovWy39KtkmoYrrtWLtrVgBW6BT9K3/tokens?cluster=devnet
```
Confirm token `54FBsA8vTjW2QqG8HtjqmEAnQDfxNvy677dDwMou56DS` appears with amount = 1.

**Check AUCTION_STUB_MODE**: In Supabase Dashboard > Settings > Edge Functions > Secrets, confirm `AUCTION_STUB_MODE` = `false`. If this is not set, the finalize will succeed but produce `stub_*` signatures — no real on-chain transfers will happen.

---

## 2. Finalize Trigger Steps

### Step 1: Backdate the auction

Run in Supabase SQL Editor:
```sql
UPDATE nft_auctions 
SET end_at = now() - interval '1 minute' 
WHERE id = '445d571b-2389-49b4-91a8-ec5758412bc4';
```

### Step 2: Confirm the update

Run immediately after:
```sql
SELECT id, status, end_at, winner_wallet, current_price_lamports 
FROM nft_auctions 
WHERE id = '445d571b-2389-49b4-91a8-ec5758412bc4';
```

Expected:
- `status` = `active`
- `end_at` = a timestamp in the past (a few seconds ago)
- `winner_wallet` = `3ni66gLWZjSppB6vBSZxAMpJWV6PqLypznECKD5wFHhD`
- `current_price_lamports` = `110000000`

### Step 3: Trigger finalize

```bash
curl -X POST https://opxordptvpvzmhakvdde.supabase.co/functions/v1/auction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9weG9yZHB0dnB2em1oYWt2ZGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTY2NjgsImV4cCI6MjA2MjI5MjY2OH0.uHDqEycZqhQ02zMvmikDjMXsqeVU792Ei61ceavk6iw" \
  -d '{"action":"finalize","auction_id":"445d571b-2389-49b4-91a8-ec5758412bc4"}'
```

### Step 4: Expected success response

```json
{
  "success": true,
  "data": {
    "result": "sold",
    "winner": "3ni66gLWZjSppB6vBSZxAMpJWV6PqLypznECKD5wFHhD",
    "final_price": 110000000,
    "nft_transfer_signature": "<real solana tx signature ~88 chars>",
    "sol_payment_signature": "<real solana tx signature>",
    "platform_fee_signature": "<real solana tx signature>",
    "royalty_fee_signature": "<real solana tx signature>",
    "refunds": { "refunded": 0, "failed": 0, "errors": [] },
    "fees": {
      "platform_fee": 11000000,
      "royalty_fee": 5500000,
      "seller_receives": 93500000
    }
  }
}
```

**Key observations about the response:**
- All 4 signatures must be real Solana base58 strings (not starting with `stub_`)
- If any signature starts with `stub_`, STUB_MODE is still active — stop and fix the secret
- `refunds.refunded` should be `0` because this auction has only 1 bid and it IS the winning bid — there are no losing bids to refund
- If you see `"warning": "STUB MODE: No real blockchain transaction"` in the response, STUB_MODE is on

### Possible failure responses

| Response | Meaning |
|---|---|
| `{"success":false,"error":"Auction has not ended yet"}` | `end_at` is still in the future — Step 1 failed |
| `{"success":false,"error":"Auction is currently being finalized. Please wait."}` | A previous attempt set status to `finalizing` and got stuck |
| `{"success":false,"error":"On-chain finalization failed: ..."}` | Solana transaction failed — check edge function logs |
| `{"success":false,"error":"TREASURY_WALLET secret not configured..."}` | Secret missing |
| `{"success":false,"error":"ROYALTY_WALLET secret not configured..."}` | Secret missing |
| `{"success":false,"error":"escrow_wallet secret not configured..."}` | Secret missing |

---

## 3. Expected Settlement Result

For this specific auction (1 bid, winner = only bidder):

| Transfer | From | To | Amount | Type |
|---|---|---|---|---|
| 1. NFT | Escrow ATA | Winner ATA | 1 token (mint `54FBs...`) | SPL Token Transfer |
| 2. Seller payout | `84Wp2wrc...` | `42HcHa8H...` | 93,500,000 lamports (0.0935 SOL) | SystemProgram.transfer |
| 3. Platform fee | `84Wp2wrc...` | `BGX97VV6...` | 11,000,000 lamports (0.011 SOL) | SystemProgram.transfer |
| 4. Royalty fee | `84Wp2wrc...` | `4sCSyGm4...` | 5,500,000 lamports (0.0055 SOL) | SystemProgram.transfer |

**Refunds**: 0 refunds expected. There is only 1 bid in this auction (`945386a2-270d-4272-a934-3d6f36151f58`), and it belongs to the winner at the winning price. The filter will exclude it as the winning bid. No other bids exist.

---

## 4. Explorer Verification Checklist

After receiving a success response, verify each address on Solana Explorer (devnet).

### A. Escrow wallet: `84Wp2wrcJofvYP4ovWy39KtkmoYrrtWLtrVgBW6BT9K3`
```
https://explorer.solana.com/address/84Wp2wrcJofvYP4ovWy39KtkmoYrrtWLtrVgBW6BT9K3?cluster=devnet
```
- Should show 4 recent outgoing transactions (in reverse chronological order: royalty, platform fee, seller payout, NFT transfer)
- Token tab: NFT `54FBsA8v...` should NO LONGER appear (transferred to winner)
- SOL balance should have decreased by approximately 0.11 SOL + transaction fees (~0.00002 SOL per tx)

### B. Winner wallet: `3ni66gLWZjSppB6vBSZxAMpJWV6PqLypznECKD5wFHhD`
```
https://explorer.solana.com/address/3ni66gLWZjSppB6vBSZxAMpJWV6PqLypznECKD5wFHhD/tokens?cluster=devnet
```
- Token tab: NFT `54FBsA8vTjW2QqG8HtjqmEAnQDfxNvy677dDwMou56DS` should appear with amount = 1
- Recent transactions should show an incoming SPL Token transfer

### C. Seller wallet: `42HcHa8HNWcTKGpC7ywW8u7nRKHpFXfByUMVMr9AKhY9`
```
https://explorer.solana.com/address/42HcHa8HNWcTKGpC7ywW8u7nRKHpFXfByUMVMr9AKhY9?cluster=devnet
```
- Recent transactions should show an incoming SOL transfer of exactly 0.0935 SOL (93,500,000 lamports)
- The sender should be `84Wp2wrc...` (escrow)

### D. Treasury wallet: `BGX97VV6XoPZoXR2PvxeYDk4YR9AzUgCkXXasYqNurRT`
```
https://explorer.solana.com/address/BGX97VV6XoPZoXR2PvxeYDk4YR9AzUgCkXXasYqNurRT?cluster=devnet
```
- Recent transactions should show an incoming SOL transfer of exactly 0.011 SOL (11,000,000 lamports)
- The sender should be `84Wp2wrc...` (escrow)

### E. Royalty wallet: `4sCSyGm4yNFAVP92cg6JruoweEeaXSTD7ctPDMU9gtq5`
```
https://explorer.solana.com/address/4sCSyGm4yNFAVP92cg6JruoweEeaXSTD7ctPDMU9gtq5?cluster=devnet
```
- Recent transactions should show an incoming SOL transfer of exactly 0.0055 SOL (5,500,000 lamports)
- The sender should be `84Wp2wrc...` (escrow)

### F. Signature verification
For each of the 4 signatures returned in the response, verify on:
```
https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
```
- Each should show status "Success"
- Each should show the correct from/to addresses and amounts listed above

---

## 5. Database Verification Checklist

After receiving a success response, run this SQL:

```sql
-- Auction record
SELECT 
  id, status, winner_wallet, current_price_lamports,
  tx_signature, seller_payment_signature, 
  platform_fee_signature, royalty_fee_signature,
  finalize_error
FROM nft_auctions 
WHERE id = '445d571b-2389-49b4-91a8-ec5758412bc4';

-- NFT ownership
SELECT mint_address, owner_address, is_listed, price_lamports
FROM minted_themes 
WHERE mint_address = '54FBsA8vTjW2QqG8HtjqmEAnQDfxNvy677dDwMou56DS';

-- Bid refund status
SELECT id, bidder_wallet, bid_price_lamports, refunded, refund_tx_signature
FROM nft_bids 
WHERE auction_id = '445d571b-2389-49b4-91a8-ec5758412bc4';
```

Expected values:

| Table | Field | Expected Value |
|---|---|---|
| `nft_auctions` | `status` | `finished` |
| `nft_auctions` | `winner_wallet` | `3ni66gLWZjSppB6vBSZxAMpJWV6PqLypznECKD5wFHhD` |
| `nft_auctions` | `current_price_lamports` | `110000000` |
| `nft_auctions` | `tx_signature` | Real Solana signature (NFT transfer) — NOT `stub_*` |
| `nft_auctions` | `seller_payment_signature` | Real Solana signature — NOT `stub_*` |
| `nft_auctions` | `platform_fee_signature` | Real Solana signature — NOT `stub_*` |
| `nft_auctions` | `royalty_fee_signature` | Real Solana signature — NOT `stub_*` |
| `nft_auctions` | `finalize_error` | `null` |
| `minted_themes` | `owner_address` | `3ni66gLWZjSppB6vBSZxAMpJWV6PqLypznECKD5wFHhD` (changed from seller) |
| `minted_themes` | `is_listed` | `false` |
| `minted_themes` | `price_lamports` | `null` |
| `nft_bids` (id `945386a2...`) | `refunded` | `false` (this is the winning bid — not refunded) |
| `nft_bids` (id `945386a2...`) | `refund_tx_signature` | `null` |

---

## 6. Failure Diagnosis Guide

### 6a. Response says success but signatures start with `stub_`
**Cause**: `AUCTION_STUB_MODE` is not set to `false`.
**Fix**: Set the secret `AUCTION_STUB_MODE` = `false` in Supabase Dashboard > Settings > Edge Functions. Then reset auction status to `active` and retry:
```sql
UPDATE nft_auctions SET status = 'active', tx_signature = null, 
  seller_payment_signature = null, platform_fee_signature = null, 
  royalty_fee_signature = null, finalize_error = null
WHERE id = '445d571b-2389-49b4-91a8-ec5758412bc4';
```

### 6b. Response says success but Explorer shows no transactions
**Cause**: Likely stub mode (see 6a). Or RPC propagation delay.
**Diagnosis**: Wait 30 seconds and refresh Explorer. Check edge function logs for `STUB MODE` in output.

### 6c. NFT transferred but seller payout missing
**Cause**: `transferSOLPayment` failed after NFT transfer succeeded. Escrow may have insufficient SOL.
**Diagnosis**: Check edge function logs for the error. Check escrow SOL balance. Auction status should be `finalize_failed` with `finalize_error` populated.
**Recovery**: Fund escrow with more SOL, then retry finalize (status is `finalize_failed`, NFT idempotency check will skip NFT transfer).

### 6d. Seller payout happened but treasury or royalty missing
**Cause**: `transferPlatformFee` or `transferRoyaltyFee` failed. The `TREASURY_WALLET` or `ROYALTY_WALLET` secret contains an invalid public key.
**Diagnosis**: Check edge function logs. Error will say which secret is invalid. Auction status = `finalize_failed`.
**Recovery**: Fix the secret, retry finalize.

### 6e. Auction status stuck at `finalizing`
**Cause**: Edge function crashed or timed out mid-execution.
**Diagnosis**: Check Explorer for partial transactions. Check edge function logs.
**Recovery**: Manually update status:
```sql
UPDATE nft_auctions SET status = 'finalize_failed' 
WHERE id = '445d571b-2389-49b4-91a8-ec5758412bc4';
```
Then retry finalize. The NFT idempotency check handles partial completion.

### 6f. Error: `TREASURY_WALLET secret not configured` or `ROYALTY_WALLET secret not configured`
**Cause**: Secret not set in Supabase.
**Fix**: Add the secret in Dashboard > Settings > Edge Functions > Secrets.
**Recovery**: Auction status is `finalize_failed`. Set secret and retry.

### 6g. Error: `escrow_wallet secret key must be exactly 64 bytes`
**Cause**: The secret contains a public address (32 bytes) instead of a keypair.
**Fix**: Replace with the full 64-byte keypair. This requires regenerating if lost.

### 6h. Partial transfer — some SOL sent but not all
**Diagnosis**: Check each signature on Explorer. Identify which step failed. Check edge function logs for the specific error.
**Recovery**: Status will be `finalize_failed`. Retry finalize — the NFT transfer is idempotent (skips if already done). SOL transfers are NOT idempotent — if seller was already paid, retrying will pay them again. This is an accepted MVP risk for devnet. Verify manually before retrying.

---

## 7. Pass / Fail Criteria

### Stage 4 is ACCEPTED only if ALL of the following are true:

1. The finalize API returns `{"success": true, "data": {"result": "sold", ...}}`
2. All 4 returned signatures are real Solana signatures (NOT `stub_*` prefixed)
3. Each of the 4 signatures shows "Success" on Solana Explorer (devnet)
4. NFT `54FBsA8v...` is visible in the winner wallet's token list on Explorer
5. NFT `54FBsA8v...` is NOT visible in the escrow wallet's token list on Explorer
6. Seller wallet received exactly 93,500,000 lamports from escrow (visible on Explorer)
7. Treasury wallet received exactly 11,000,000 lamports from escrow (visible on Explorer)
8. Royalty wallet received exactly 5,500,000 lamports from escrow (visible on Explorer)
9. `nft_auctions.status` = `finished`
10. `nft_auctions.finalize_error` = `null`
11. All 4 signature fields in `nft_auctions` contain the same signatures as the API response
12. `minted_themes.owner_address` = winner wallet
13. `minted_themes.is_listed` = `false`
14. The single bid row has `refunded` = `false` (it is the winning bid, correctly excluded from refunds)

### Stage 4 is NOT ACCEPTED if any of the following are true:

1. Any signature in the response starts with `stub_`
2. Any of the 4 on-chain transfers cannot be found or shows "Failed" on Explorer
3. The NFT remains in the escrow wallet after finalize
4. The seller, treasury, or royalty wallet did not receive the correct amount
5. `nft_auctions.status` is anything other than `finished` after a success response
6. `finalize_error` is non-null after a success response
7. `minted_themes.owner_address` still shows the seller wallet
8. The winning bid was incorrectly refunded


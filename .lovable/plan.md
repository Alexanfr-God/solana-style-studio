

# Auction System MVP — 6-Stage Implementation Plan

## Current State
The auction system is ~80% built. The main blocker is an invalid `escrow_wallet` secret (public address instead of 64-byte keypair). Secondary issues: `bid.ts` ignores STUB_MODE, cancel doesn't return NFT, finalize doesn't send fees to treasury/royalty wallets, no idempotency guard.

## Architecture Decision
Keep the current **custodial escrow** design. No Anchor/PDA rewrite. Minimal patches only.

---

## STAGE 1 — Escrow Foundation + Config Consistency

**New file**: `supabase/functions/generate-escrow-keypair/index.ts`
- One-time admin utility edge function
- Generates a Solana `Keypair` using dynamic `import('npm:@solana/web3.js@1.98.2')`
- Returns `{ publicKey, secretKeyArray: [...64 bytes...] }`
- Does NOT store anything — user manually copies the JSON array into `escrow_wallet` secret

**Patch**: `supabase/functions/auction/utils/solana.ts`
- Improve error message in `getEscrowKeypair` to show expected format and actual length when secret is invalid

**Patch**: `src/config/marketplace.ts`
- Add comment: "After generating a new escrow keypair, update this value to match"
- No functional change until user actually generates and saves a new key

**Note on `buy_nft/index.ts`**: Line 44 hardcodes `ESCROW_PUBLIC_KEY = 'HzVB3L8hRALUq37WRNbj3RDjfm2fYRBVJQvxMYCQ6Qfx'`. When user updates the escrow keypair, this must also be updated. Will add a comment but not restructure the buy flow.

**Manual steps after Stage 1**:
1. Call `generate-escrow-keypair` edge function
2. Copy the JSON array → save as `escrow_wallet` secret in Supabase dashboard
3. Copy the public key → update `ESCROW_WALLET_PUBLIC_KEY` in `src/config/marketplace.ts` and `ESCROW_PUBLIC_KEY` in `buy_nft/index.ts`
4. Fund the new escrow wallet on devnet: `solana airdrop 2 <PUBLIC_KEY> --url devnet`

---

## STAGE 2 — STUB_MODE for Full Flow Testing

**Patch**: `supabase/functions/auction/handlers/bid.ts`
- Import `STUB_MODE` from constants
- When `STUB_MODE === true`: skip on-chain tx verification, accept any `tx_signature` (or generate placeholder), proceed with DB insert + auction update as normal

**Patch**: `src/hooks/usePlaceBid.ts`
- Add optional STUB_MODE check: if `VITE_AUCTION_STUB_MODE` env var is set, skip real SOL transfer and call edge function with a fake signature
- Keep real flow as default — stub is opt-in only

**No change to `useNftEscrow.ts`**: Creating auction with real NFT escrow is already working. For stub testing, user can create auction via direct edge function call without NFT transfer.

**Finalize stub**: Already works — no change needed.

---

## STAGE 3 — Real Devnet Finalize (NFT + Seller Payout + Refunds)

**DB migration**: Add `seller_payment_signature` column to `nft_auctions` table (text, nullable)

**Patch**: `supabase/functions/auction/handlers/finalize.ts`
- After `transferSOLPayment`, store `solPaymentSignature` in `nft_auctions.seller_payment_signature`
- Improve error logging for partial failures — log which step failed
- Keep auto-refund model as-is (already implemented)

**Patch**: `supabase/functions/auction/utils/solana.ts`
- No functional changes needed — `transferNFTFromEscrow`, `transferSOLPayment`, and refund logic already exist

**Patch**: `supabase/functions/auction/types.ts`
- Add `seller_payment_signature` to `Auction` interface

---

## STAGE 4 — Commissions / Treasury / Royalty Payouts

**Patch**: `supabase/functions/auction/utils/solana.ts`
- Rename/extend `transferSOLPayment` to also send platform fee to `TREASURY_WALLET` and royalty fee to `ROYALTY_WALLET`
- Or add two new small functions: `transferPlatformFee`, `transferRoyaltyFee`
- Read `TREASURY_WALLET` from `Deno.env.get('TREASURY_WALLET')` — this secret already exists
- Add new secret `ROYALTY_WALLET` for royalty recipient (or default to treasury for MVP)

**Patch**: `supabase/functions/auction/handlers/finalize.ts`
- After seller payout, call platform fee transfer and royalty fee transfer
- Store all 4 tx signatures (NFT, seller, platform, royalty) in response
- In STUB_MODE, generate fake signatures for all 4
- If treasury or royalty wallet is not configured, log warning and skip (don't block finalize)

**DB migration**: Add `platform_fee_signature` and `royalty_fee_signature` columns to `nft_auctions` (text, nullable)

**Secret needed**: `ROYALTY_WALLET` — will prompt user to add it. For MVP, can be same as treasury.

---

## STAGE 5 — Cancel NFT Return + Idempotency Guard

**Patch**: `supabase/functions/auction/handlers/cancel.ts`
- Import `transferNFTFromEscrow` from solana utils
- Import `STUB_MODE` from constants
- Before DB update: transfer NFT from escrow back to seller on-chain (skip in STUB_MODE)

**Patch**: `supabase/functions/auction/handlers/finalize.ts`
- Before chain operations: update auction status to `'finalizing'`
- Use conditional update: `PATCH nft_auctions?id=eq.X&status=eq.active` — if no rows affected, another finalize is already running → abort
- On success: update to `'finished'`
- On failure: update to `'finalize_failed'` with error info

**Patch**: `supabase/functions/auction/utils/validation.ts`
- Update `canFinalizeAuction` to also accept `status === 'finalize_failed'` for retry

**Patch**: `supabase/functions/auction/types.ts`
- Extend `AuctionStatus` to include `'finalizing'` and `'finalize_failed'`

**DB migration**: Add `finalize_error` column to `nft_auctions` (text, nullable)

---

## STAGE 6 — Runbook + Test Matrix + Final Verification

No code changes. Deliverables:
- STUB_MODE test runbook (step-by-step)
- Real devnet test runbook (step-by-step)
- Required secrets checklist
- Complete file change manifest
- Risk classification (MVP-acceptable vs production-later)

---

## Files Modified Across All Stages

| File | Stages |
|------|--------|
| `supabase/functions/generate-escrow-keypair/index.ts` | 1 (new) |
| `supabase/functions/auction/utils/solana.ts` | 1, 4 |
| `supabase/functions/auction/handlers/bid.ts` | 2 |
| `supabase/functions/auction/handlers/finalize.ts` | 3, 4, 5 |
| `supabase/functions/auction/handlers/cancel.ts` | 5 |
| `supabase/functions/auction/utils/validation.ts` | 5 |
| `supabase/functions/auction/utils/constants.ts` | no change |
| `supabase/functions/auction/types.ts` | 3, 5 |
| `src/hooks/usePlaceBid.ts` | 2 |
| `src/config/marketplace.ts` | 1 (comment only) |
| `supabase/functions/buy_nft/index.ts` | 1 (comment only) |
| DB migrations | 3, 4, 5 |

## Secrets Required
- `escrow_wallet` — valid 64-byte keypair JSON array (user must regenerate)
- `TREASURY_WALLET` — already exists
- `ROYALTY_WALLET` — new, needed for Stage 4
- `AUCTION_STUB_MODE` — set to `'false'` to disable stub mode (defaults to `true`)


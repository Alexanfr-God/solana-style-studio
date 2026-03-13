
# STAGE 2 REPORT — Real Create Flow: NFT Must Really Reach Escrow

## 1. Goal

Make auction creation only succeed when the NFT is actually escrowed on-chain.

## 2. Inputs Required

- Seller connects wallet via AppKit
- Seller owns an NFT (minted via the app)
- Escrow wallet is funded with devnet SOL
- `AUCTION_STUB_MODE` = `false` in Supabase secrets

## 3. What I Changed

### File 1: `src/hooks/useNftEscrow.ts`
- **Migrated** from `@solana/wallet-adapter-react` (`useConnection`, `useWallet`) to `@reown/appkit` (`useAppKitAccount`, `useAppKitProvider('solana')`)
- Now uses same pattern as `usePlaceBid.ts` — consistent wallet stack
- Creates own `Connection` using `MARKETPLACE_CONFIG.SOLANA_RPC_URL`
- Signs via `provider.signTransaction()` from AppKit

### File 2: `supabase/functions/auction/handlers/create.ts`
- **Added** `verifyNftInEscrow()` function that:
  - Derives escrow's Associated Token Account for the NFT mint
  - Reads the token account data from Solana RPC
  - Parses SPL token amount (u64 at offset 64)
  - Returns `true` only if balance ≥ 1
- **Added** STUB_MODE bypass: skips verification when `STUB_MODE = true`
- Auction creation now **fails** if NFT is not actually in escrow

### File 3: `supabase/functions/auction/utils/constants.ts`
- **Lowered** `MIN_DURATION_HOURS` from `24` to `1` for devnet testing

### File 4: `supabase/functions/auction/utils/validation.ts`
- **Updated** error message to reflect new minimum duration

## 4. Exact Files Modified

| File | Change |
|------|--------|
| `src/hooks/useNftEscrow.ts` | Migrated to AppKit provider |
| `supabase/functions/auction/handlers/create.ts` | Added on-chain escrow verification |
| `supabase/functions/auction/utils/constants.ts` | MIN_DURATION_HOURS = 1 |
| `supabase/functions/auction/utils/validation.ts` | Updated error message |

## 5. Data Flow Now

```
1. User clicks "Create Auction"
2. Frontend: useNftEscrow.escrowNft() sends NFT to escrow via AppKit
3. AppKit signs the SPL token transfer
4. NFT physically moves to escrow wallet's ATA on devnet
5. Frontend calls supabase.functions.invoke('auction', { action: 'create', ... })
6. Backend: verifyNftInEscrow() checks escrow's ATA balance via RPC
7. If balance >= 1 → create auction row in DB
8. If balance = 0 → return error "NFT is not in escrow"
```

## 6. How to Test This Stage

1. Ensure `AUCTION_STUB_MODE` is set to `false`
2. Ensure escrow wallet is funded with devnet SOL
3. Connect wallet via AppKit
4. Navigate to a minted NFT you own
5. Click "Create Auction"
6. Set price (≥ 0.1 SOL) and duration (1 hour for testing)
7. Approve the NFT transfer in your wallet
8. Wait for confirmation
9. Auction should be created in DB

## 7. Expected Result

- NFT moves from seller to escrow on-chain ✅
- Backend verifies NFT is in escrow before creating auction ✅
- Auction record created with correct end_at time ✅
- If NFT transfer is skipped, create fails with clear error ✅

## 8. Remaining Risks Before Stage 3

- If the NFT transfer succeeds but the backend create call fails, the NFT is stuck in escrow with no auction record (edge case — needs manual recovery)
- Frontend duration options include 1h, 6h, 12h which are now valid (MIN_DURATION_HOURS=1)
- Bid flow (`usePlaceBid`) already uses AppKit and is ready for Stage 3

## Next: Stage 3 — Real Bid Flow

Stage 3 will verify that real SOL bids work on devnet. The bid handler already has on-chain verification logic. Need to confirm it works end-to-end with real transactions.

**Confirm Stage 2 is working, then I will proceed to Stage 3.**

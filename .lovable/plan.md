

# STAGE 1 REPORT — Wallet / Secret / Config Foundation

## 1. Goal

Eliminate all ambiguity about which secrets and config values exist, what format they must be in, and where they are read.

## 2. Wallet / Secret / Config Mapping Table

```text
┌─────────────────────────────┬────────────────┬──────────────────────────┬─────────────────────────────────────────────────┬─────────────────────────────────┐
│ Name                        │ Content Type   │ Example Shape            │ Where Read                                      │ What Breaks If Invalid          │
├─────────────────────────────┼────────────────┼──────────────────────────┼─────────────────────────────────────────────────┼─────────────────────────────────┤
│ escrow_wallet               │ PRIVATE KEY    │ Base58 ~88 chars OR      │ auction/utils/solana.ts (getEscrowKeypair)      │ All finalize, cancel, refund    │
│ (Supabase secret)           │ (64-byte       │ JSON array [n,n,...×64]   │ get-escrow-pubkey/index.ts                      │ operations fail                 │
│                             │ keypair)       │                          │ auction/handlers/bid.ts (verification)          │                                 │
├─────────────────────────────┼────────────────┼──────────────────────────┼─────────────────────────────────────────────────┼─────────────────────────────────┤
│ ESCROW_WALLET_PUBLIC_KEY    │ PUBLIC ADDRESS │ "84Wp2wrc..."            │ src/config/marketplace.ts                       │ Client sends NFT/SOL to         │
│ (hardcoded in frontend)     │ (base58 ~44ch) │                          │ src/hooks/usePlaceBid.ts                        │ wrong address                   │
│                             │                │                          │ src/hooks/useNftEscrow.ts                       │                                 │
├─────────────────────────────┼────────────────┼──────────────────────────┼─────────────────────────────────────────────────┼─────────────────────────────────┤
│ ESCROW_PUBLIC_KEY           │ PUBLIC ADDRESS │ "84Wp2wrc..."            │ supabase/functions/buy_nft/index.ts (hardcoded) │ buy_nft verification fails      │
│ (hardcoded in buy_nft)      │ (must match    │                          │                                                 │                                 │
│                             │ escrow_wallet) │                          │                                                 │                                 │
├─────────────────────────────┼────────────────┼──────────────────────────┼─────────────────────────────────────────────────┼─────────────────────────────────┤
│ TREASURY_WALLET             │ PUBLIC ADDRESS │ "AbC123...xyz" (~44ch)   │ auction/utils/solana.ts (transferPlatformFee)   │ Platform fee transfer skipped   │
│ (Supabase secret)           │               │                          │ mint-nft-build/index.ts                         │ (warning logged, not fatal)     │
├─────────────────────────────┼────────────────┼──────────────────────────┼─────────────────────────────────────────────────┼─────────────────────────────────┤
│ ROYALTY_WALLET              │ PUBLIC ADDRESS │ "DeF456...xyz" (~44ch)   │ auction/utils/solana.ts (transferRoyaltyFee)    │ Royalty fee transfer skipped    │
│ (Supabase secret)           │               │                          │                                                 │ (warning logged, not fatal)     │
└─────────────────────────────┴────────────────┴──────────────────────────┴─────────────────────────────────────────────────┴─────────────────────────────────┘
```

## 3. Key Confirmations

| Question | Answer |
|---|---|
| Escrow private key secret name? | `escrow_wallet` — already exists in Supabase secrets |
| Escrow public key config field? | `MARKETPLACE_CONFIG.ESCROW_WALLET_PUBLIC_KEY` in `src/config/marketplace.ts` (currently `84Wp2wrcJofvYP4ovWy39KtkmoYrrtWLtrVgBW6BT9K3`) |
| Treasury — private or public? | **PUBLIC ADDRESS only**. Code does `new PublicKey(treasuryWallet)` and sends SOL *to* it. No signing needed. |
| Royalty — private or public? | **PUBLIC ADDRESS only**. Same pattern as treasury. |
| Must ESCROW_WALLET_PUBLIC_KEY match escrow_wallet? | **YES**. The frontend sends NFTs/SOL to this address. The backend signs outgoing transfers with the private key. If they don't match, funds go to wrong address. |

## 4. Identified Issues (Minimal Patches Needed)

### Issue A: `useNftEscrow.ts` uses wrong wallet provider
- Uses `@solana/wallet-adapter-react` (`useConnection`, `useWallet`)
- Rest of app uses `@reown/appkit` (`useAppKitProvider('solana')`)
- **Impact**: NFT escrow step will fail at runtime — wallet-adapter has no connected wallet
- **Fix**: Rewrite to use AppKit provider (same pattern as `usePlaceBid.ts`)

### Issue B: `useAuctionPayment.ts` uses wrong wallet provider
- Same problem. Uses `wallet-adapter-react`.
- **Impact**: Not used in current auction flow (settlement is server-side), so not blocking. But should be fixed for consistency.
- **Decision**: Fix in Stage 2 alongside useNftEscrow. Low priority since finalize is server-side.

### Issue C: `MIN_DURATION_HOURS = 24` too long for devnet testing
- Frontend `CreateAuctionModal` needs to offer a short duration for testing
- **Fix in Stage 2**: Add a 1-hour or 5-minute testing option (lower MIN_DURATION_HOURS for devnet)

### Issue D: No on-chain escrow verification in create handler
- `handlers/create.ts` trusts the client that NFT was escrowed
- **Fix in Stage 2**: Add RPC check

**No code changes in Stage 1** — these are documented for Stage 2+.

## 5. Operator Checklist (What You Must Do Before Stage 2)

You need to do these steps manually:

### Step 1: Verify escrow_wallet secret
The `escrow_wallet` secret already exists. Verify it contains a **64-byte private key** (NOT a public address). You can verify by calling the `get-escrow-pubkey` edge function — if it returns the public key `84Wp2wrcJofvYP4ovWy39KtkmoYrrtWLtrVgBW6BT9K3`, the secret is correct.

### Step 2: Verify TREASURY_WALLET secret
Must contain a **Solana public address** (~44 characters, base58). This is where platform fees (10%) will be sent. If you don't have a dedicated treasury wallet, you can use any devnet wallet address you control.

### Step 3: Verify ROYALTY_WALLET secret  
Same as treasury — a **Solana public address**. This receives royalty fees (5%).

### Step 4: Fund the escrow wallet
Go to https://faucet.solana.com and request 2-5 SOL for address `84Wp2wrcJofvYP4ovWy39KtkmoYrrtWLtrVgBW6BT9K3`. The escrow wallet needs SOL to pay transaction fees when sending NFTs/SOL/refunds.

### Step 5: Set AUCTION_STUB_MODE to false
In Supabase Dashboard > Settings > Edge Functions > Secrets, add/update `AUCTION_STUB_MODE` with value `false`.

### Step 6: Frontend stub mode
The frontend checks `VITE_AUCTION_STUB_MODE`. This is currently set via env. Once you confirm the backend is working on real devnet, we will remove the stub check from the frontend code.

## 6. Remaining Risks Before Stage 2

- If `TREASURY_WALLET` or `ROYALTY_WALLET` contain private keys instead of public addresses, the code will fail (it calls `new PublicKey(value)`)
- If escrow wallet is not funded, all server-side transactions will fail with insufficient balance
- `useNftEscrow` will not work until patched to use AppKit (Stage 2 fix)

## 7. Next Stage Preview

Stage 2 will:
1. Fix `useNftEscrow.ts` to use AppKit provider
2. Add on-chain escrow verification to `handlers/create.ts`
3. Lower `MIN_DURATION_HOURS` for devnet testing
4. Test the real NFT escrow + auction creation flow

**Please complete the operator checklist above and confirm, then I will proceed to Stage 2.**


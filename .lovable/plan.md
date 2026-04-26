## NFT Marketplace: Wallet Filter, Wallet Badge & 50/page Pagination

All changes live in `src/components/wallet/MintedGallerySection.tsx` plus two new SVG assets. Fully client-side. No DB changes.

### Wallet mapping (single source of truth)

A small helper inside the component:
- `solana` → **Phantom**
- `ethereum` / `mantle` / any EVM → **MetaMask**

Used by both the filter bar and the per-card badge so they stay in sync.

### 1. New filter bar above the grid

A new toggle bar rendered **above the existing controls row** (kept alongside the current Blockchain dropdown — the user explicitly chose "Add new filter alongside"):

```text
[ All ] [ 👻 Phantom ] [ 🦊 MetaMask ]
```

- New state: `walletFilter: 'all' | 'phantom' | 'metamask'` (default `all`).
- Implemented as three buttons styled like the existing pill toggles in the gallery (matching `bg-white/5 border-white/10` look, with active state using `bg-purple-500/20 border-purple-500/50`).
- Phantom button shows the Phantom ghost SVG; MetaMask button shows the MetaMask fox SVG (16×16 inside the button).
- Selecting a filter calls `setPage(1)` like the other filters.
- Filter is **applied client-side** after `fetchMints()` returns, in the same place as `auctionFilter`:
  - `phantom` → keep items where `blockchain === 'solana'`
  - `metamask` → keep items where `blockchain !== 'solana'` (covers ethereum + mantle + any future EVM)
  - `all` → no filter

Note: total count for pagination is taken from the filtered list length when `walletFilter !== 'all'` (so "Page X of Y" reflects what the user actually sees). When `walletFilter === 'all'`, the existing server-side `count` is used.

### 2. Wallet badge on each NFT card (bottom-left)

In the card preview block (around lines 845–852), **replace the existing WCC logo** at the bottom-left with a wallet badge:

- 20×20 circular container, `rounded-full bg-black/40 backdrop-blur-sm` with a 1px white/10 border.
- Inside: the Phantom or MetaMask SVG, sized 14×14, centered.
- Tooltip via `title` attribute: `"Designed for Phantom"` or `"Designed for MetaMask"`.
- The Legacy badge offset (currently `left-9`) stays the same since the badge dimensions match.

The WCC logo is removed from the card (per user's decision).

### 3. Pagination: 50 per page

- Change `const pageSize = 24` → `const pageSize = 50`.
- Existing pagination block (lines 1053–1075) already provides:
  - `Previous` button (disabled at page 1)
  - `Page X of Y` indicator
  - `Next` button (disabled at last page)
- No structural change needed there — only the page size constant.
- When `walletFilter !== 'all'`, `totalPages` is recomputed from filtered length so the indicator stays correct.

### 4. New SVG assets

Two small brand SVGs added under `src/assets/`:
- `src/assets/phantom-logo.svg` — Phantom's ghost mark on its purple gradient background.
- `src/assets/metamask-logo.svg` — MetaMask's fox mark.

Both authored as compact inline SVGs (no external fetches), imported into `MintedGallerySection.tsx` as URL strings via Vite's default SVG import.

### Files touched

- `src/components/wallet/MintedGallerySection.tsx` — add `walletFilter` state, render filter bar, swap WCC logo for wallet badge, change `pageSize` to 50, recompute `totalPages` when filter active.
- `src/assets/phantom-logo.svg` *(new)*
- `src/assets/metamask-logo.svg` *(new)*

### Out of scope

- No changes to DB schema or edge functions.
- No changes to the existing Solana/Ethereum dropdown, search, sort, rating, listed/auction filters, or card body/info section.
- No changes to detail page, modals, or auction logic.

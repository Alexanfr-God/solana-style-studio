## Phantom Presets — Reorder & Update Covers

Reorder the Phantom preset list and refresh the "Original" cover with the uploaded screenshot.

### New order in `PHANTOM_PRESETS`
1. **Original** — use the uploaded Phantom lock screen image as cover
2. **Gold BTC** — keep existing (mint `GzS4v8H6…`)
3. **Phantom 2** — new entry, last minted NFT (mint `4dGLLUTX…`, theme name "Ethereum / Cosmic Futuristic")
4. 17 × "Coming Soon" placeholders (to keep total = 20)

### Steps

1. **Save uploaded image as new Original cover**
   - Copy `user-uploads://Снимок_экрана_2026-04-12_в_10.40.27.png` → `src/assets/phantom-original-cover.png`
   - Update import in `src/data/phantomBuiltInThemes.ts` (replaces current `phantom-original-cover.jpg`)
   - Delete the old generated `phantom-original-cover.jpg`

2. **Add Phantom 2 preset**
   - Inline its `themeData` (WCCOverlayV3 from DB row, mint `4dGLLUTX5GvQcefqZehN6N5qE3Q57uYqY9XSLdMq8wy2`) as `PHANTOM_BUILTIN_PHANTOM_2`
   - Cover: `https://gateway.lighthouse.storage/ipfs/QmXJYdj93o5p94nbhkDMqyfuUkjdN3ynC8UqD7iPxUzuCM`
   - Name: `Phantom 2`, description: `Recently minted Phantom skin`

3. **Reorder `PHANTOM_PRESETS` array**
   ```
   [Original, Gold BTC, Phantom 2, ...17 placeholders]
   ```

4. **Verify** the carousel in `ThemeSelectorCoverflow` renders new order with correct covers (no other code changes required — it reads from `PHANTOM_PRESETS`).

### Files touched
- `src/assets/phantom-original-cover.png` (new, from upload)
- `src/assets/phantom-original-cover.jpg` (delete)
- `src/data/phantomBuiltInThemes.ts` (reorder + add Phantom 2 + new import)

No DB changes required (Phantom 2 is already `is_verified=true`).
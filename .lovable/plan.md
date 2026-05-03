## Goal

В `MintedGallerySection` кнопка **Apply** сейчас работает только для WCC-NFT (вызывает `setTheme` для WCC-макета). Для Phantom-NFT (`skin_kind === 'phantom'`) нужно реализовать аналогичное поведение: при клике на Apply тема накидывается на **Phantom-макет** через `usePhantomThemeStore.setPhantomTheme(...)`, а превью переключается в Phantom режим — точно так же, как это делает `NftThemeApplier` и `ThemeChat`.

## Что меняем

Только presentation-слой — один файл: `src/components/wallet/MintedGallerySection.tsx`.

### 1. Разветвление `handleApplyTheme` по `skin_kind`

Сейчас функция:
- грузит `metadata` из IPFS
- ищет `themeData` через `properties.theme` / `theme` / `wcc_theme_uri`
- валидирует наличие `homeLayer` + `lockLayer` (WCC-структура)
- вызывает `setTheme(themeData)` из `useThemeStore`

Меняем сигнатуру на `handleApplyTheme(item)` и внутри:

- **Если `item.skin_kind === 'phantom'`** → ветка Phantom:
  1. Сначала пробуем взять тему из БД-колонки `item.theme_data` (она уже сохраняется при минте — видно в `ExportToIpfsButton.tsx:302`). Это убирает лишний IPFS-роунд-трип.
  2. Если `theme_data` пустой (легаси Phantom-NFT без поля) — фоллбек на IPFS: грузим `metadata`, ищем `metadata.properties.theme` (там тоже WCCOverlayV3 для Phantom).
  3. Валидируем как Phantom: `theme.version === 3 && theme.wallet === 'phantom' && theme.global && theme.elements`. Если структура невалидна — toast.error с понятным текстом.
  4. Применяем: `usePhantomThemeStore.getState().setPhantomTheme(theme)`. `WalletPreviewContainer` сам подхватит — у него уже есть `useEffect`, который переключает `previewMode` на `'phantom'` при появлении `phantomTheme`.
  5. `window.scrollTo({ top: 0, behavior: 'smooth' })` — как и в WCC-ветке.
  6. Toast: `"✨ Phantom skin '<name>' applied — see preview above"`.

- **Иначе** (`skin_kind === 'wcc'` или legacy без поля) → существующая WCC-логика без изменений.

### 2. Передача `item` в обработчик

Обновить вызов на строке ~1094:
```tsx
onClick={() => handleApplyTheme(item)}
```
вместо текущего `handleApplyTheme(item.metadata_uri, item.theme_name || ...)`.

### 3. Импорт

Добавить импорт `usePhantomThemeStore` из `@/stores/phantomThemeStore` (тип `WCCOverlayV3` уже есть в стора).

## Что НЕ трогаем

- БД, RLS, edge-функции — без изменений.
- Минт-флоу (`ExportToIpfsButton.tsx`) — без изменений, он уже сохраняет `theme_data` и `skin_kind`.
- WCC-ветка `handleApplyTheme` — без изменений.
- `NftThemeApplier`, `ThemeChat`, `WalletPreviewContainer` — без изменений (переиспользуем существующий механизм).

## Edge cases

- Если у Phantom-NFT нет ни `theme_data`, ни `properties.theme` в IPFS — показываем toast с инструкцией пересоздать NFT (как сейчас для WCC).
- Если пользователь применяет Phantom-NFT, а до этого был активен WCC-preview — `WalletPreviewContainer.useEffect` переключит режим автоматически.

## Verification

1. Открыть `/` (gallery), найти существующий Phantom-NFT (с зелёным фоном) — кликнуть Apply → проверить что превью переключилось на Phantom-макет с правильным фоном/цветами.
2. Кликнуть Apply на WCC-NFT → убедиться что WCC-превью применилось как раньше (регрессия).
